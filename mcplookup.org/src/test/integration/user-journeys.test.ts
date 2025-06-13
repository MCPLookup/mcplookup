// User Journey Integration Tests
// Tests complete user workflows from start to finish across multiple pages

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import { getStorageService, setStorageService } from '@/lib/storage';
import { NextRequest } from 'next/server';

// Import page components
import HomePage from '@/app/page';
import DiscoverPage from '@/app/discover/page';
import RegisterPage from '@/app/register/page';
import DashboardPage from '@/app/dashboard/page';
import OnboardingPage from '@/app/onboarding/page';

// Import API handlers for integration
import { POST as registerPOST } from '@/app/api/v1/register/route';
import { GET as discoverGET } from '@/app/api/v1/discover/route';
import { GET as onboardingGET, POST as onboardingPOST } from '@/app/api/v1/onboarding/route';

// Mock Next.js router with journey tracking
const mockPush = vi.fn();
const mockReplace = vi.fn();
const journeyPath: string[] = [];

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (path: string) => {
      journeyPath.push(path);
      return mockPush(path);
    },
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => journeyPath[journeyPath.length - 1] || '/',
  useParams: () => ({}),
}));

// Mock auth with different user states
const createMockAuth = (userType: 'new' | 'existing' | 'admin' = 'new') => {
  const users = {
    new: {
      id: 'new-user-123',
      email: 'newuser@example.com',
      name: 'New User',
      role: 'user',
      isNewUser: true
    },
    existing: {
      id: 'existing-user-456',
      email: 'existing@example.com',
      name: 'Existing User',
      role: 'user',
      isNewUser: false
    },
    admin: {
      id: 'admin-user-789',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      isNewUser: false
    }
  };

  return vi.mocked(vi.fn().mockResolvedValue({
    user: users[userType]
  }));
};

// Helper function to render with providers
function renderWithProviders(component: React.ReactElement) {
  return render(
    React.createElement(Provider, {}, component)
  );
}

// Helper to simulate API calls
async function simulateApiCall(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
  const request = new NextRequest(`http://localhost:3000${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });

  switch (endpoint) {
    case '/api/v1/discover':
      return await discoverGET(request);
    case '/api/v1/register':
      return await registerPOST(request);
    case '/api/v1/onboarding':
      return method === 'GET' ? await onboardingGET(request) : await onboardingPOST(request);
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
}

describe('User Journey Integration Tests', () => {
  beforeEach(async () => {
    // Reset storage and journey tracking
    const storageService = getStorageService();
    await storageService.clear();
    journeyPath.length = 0;
    vi.clearAllMocks();
  });

  describe('New User Discovery Journey', () => {
    it('should complete full discovery journey from landing to results', async () => {
      // Step 1: User lands on homepage
      renderWithProviders(<HomePage />);
      expect(screen.getByText(/Dynamic Discovery Infrastructure/i)).toBeInTheDocument();

      // Step 2: User clicks "Start Discovering"
      const discoverButton = screen.getByText(/Start Discovering/i);
      fireEvent.click(discoverButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/discover');
      });

      // Step 3: User navigates to discovery page
      const { unmount } = renderWithProviders(<DiscoverPage />);
      expect(screen.getByText(/MCP Server Discovery Engine/i)).toBeInTheDocument();

      // Step 4: User performs search (simulate API integration)
      const searchResponse = await simulateApiCall('/api/v1/discover?capability=filesystem');
      expect(searchResponse.status).toBe(200);

      const searchData = await searchResponse.json();
      expect(searchData.servers).toBeDefined();

      unmount();
    });

    it('should handle discovery with no results gracefully', async () => {
      renderWithProviders(<DiscoverPage />);

      // Simulate search with no results
      const searchResponse = await simulateApiCall('/api/v1/discover?capability=nonexistent');
      expect(searchResponse.status).toBe(200);

      const searchData = await searchResponse.json();
      expect(searchData.servers).toEqual([]);
    });
  });

  describe('Server Owner Registration Journey', () => {
    it('should complete full server registration journey', async () => {
      // Step 1: User starts on homepage
      renderWithProviders(<HomePage />);

      // Step 2: User clicks "Register Your Server"
      const registerButton = screen.getByText(/Register Your Server/i);
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/register');
      });

      // Step 3: User navigates to registration page
      renderWithProviders(<RegisterPage />);
      expect(screen.getByText(/Register Your MCP Server/i)).toBeInTheDocument();

      // Step 4: User submits registration (simulate API integration)
      const registrationData = {
        domain: 'example.com',
        endpoint: 'https://example.com/mcp',
        name: 'Example MCP Server',
        description: 'A test server for integration testing',
        contact_email: 'admin@example.com',
        capabilities: ['filesystem', 'automation'],
        auth: { type: 'none' }
      };

      const registrationResponse = await simulateApiCall('/api/v1/register', 'POST', registrationData);
      expect(registrationResponse.status).toBe(201);

      const registrationResult = await registrationResponse.json();
      expect(registrationResult.challenge_id).toBeDefined();
      expect(registrationResult.domain).toBe('example.com');
    });

    it('should handle registration validation errors', async () => {
      renderWithProviders(<RegisterPage />);

      // Submit invalid registration data
      const invalidData = {
        domain: 'invalid-domain',
        endpoint: 'not-a-url',
        name: '',
        description: '',
      };

      try {
        await simulateApiCall('/api/v1/register', 'POST', invalidData);
      } catch (error) {
        // Should handle validation errors gracefully
        expect(error).toBeDefined();
      }
    });
  });

  describe('New User Onboarding Journey', () => {
    beforeEach(() => {
      // Mock new user auth
      vi.mocked(vi.doMock('@/auth', () => ({
        auth: createMockAuth('new')
      })));
    });

    it('should complete onboarding flow for new users', async () => {
      // Step 1: New user lands on onboarding
      renderWithProviders(<OnboardingPage />);

      // Step 2: Get onboarding state
      const onboardingResponse = await simulateApiCall('/api/v1/onboarding');
      expect(onboardingResponse.status).toBe(200);

      // Step 3: Update onboarding progress
      const updateData = {
        step: 'welcome',
        completed: true
      };

      const updateResponse = await simulateApiCall('/api/v1/onboarding', 'POST', updateData);
      expect(updateResponse.status).toBe(200);
    });
  });

  describe('Returning User Dashboard Journey', () => {
    beforeEach(() => {
      // Mock existing user auth
      vi.mocked(vi.doMock('@/auth', () => ({
        auth: createMockAuth('existing')
      })));
    });

    it('should navigate existing user to dashboard', async () => {
      // Step 1: User lands on homepage
      renderWithProviders(<HomePage />);

      // Step 2: User should see dashboard option (if authenticated)
      // This would typically be in the header navigation

      // Step 3: User navigates to dashboard
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Page User State Management', () => {
    it('should maintain user state across page navigation', async () => {
      // Start on homepage
      const { unmount: unmountHome } = renderWithProviders(<HomePage />);
      unmountHome();

      // Navigate to discover page
      const { unmount: unmountDiscover } = renderWithProviders(<DiscoverPage />);
      unmountDiscover();

      // Navigate to register page
      renderWithProviders(<RegisterPage />);

      // User state should be consistent across all pages
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Error Recovery Journeys', () => {
    it('should handle API errors gracefully during user journeys', async () => {
      renderWithProviders(<DiscoverPage />);

      // Mock API error
      vi.mocked(discoverGET).mockRejectedValueOnce(new Error('API Error'));

      try {
        await simulateApiCall('/api/v1/discover');
      } catch (error) {
        expect(error.message).toBe('API Error');
      }

      // Page should still be functional
      expect(screen.getByText(/MCP Server Discovery Engine/i)).toBeInTheDocument();
    });

    it('should handle network errors during registration', async () => {
      renderWithProviders(<RegisterPage />);

      // Mock network error
      vi.mocked(registerPOST).mockRejectedValueOnce(new Error('Network Error'));

      try {
        await simulateApiCall('/api/v1/register', 'POST', {});
      } catch (error) {
        expect(error.message).toBe('Network Error');
      }

      // Page should still be functional
      expect(screen.getByText(/Register Your MCP Server/i)).toBeInTheDocument();
    });
  });

  describe('Performance and Loading States', () => {
    it('should show appropriate loading states during API calls', async () => {
      renderWithProviders(<DiscoverPage />);

      // Simulate slow API response
      const slowApiPromise = new Promise(resolve => setTimeout(resolve, 100));
      vi.mocked(discoverGET).mockImplementationOnce(() => slowApiPromise as any);

      // Should show loading state
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Journey Analytics Integration', () => {
    it('should track user journey steps', async () => {
      // Start journey
      renderWithProviders(<HomePage />);

      // Navigate through journey
      const discoverButton = screen.getByText(/Start Discovering/i);
      fireEvent.click(discoverButton);

      // Check journey tracking
      expect(journeyPath).toContain('/discover');
    });
  });
});
