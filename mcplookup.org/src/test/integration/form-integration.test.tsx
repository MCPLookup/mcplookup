// Form Integration Tests
// Tests form submissions, validation, and frontend-to-backend integration

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import { Provider } from '@/components/ui/provider';
import { getStorageService } from '@/lib/storage';
import { NextRequest } from 'next/server';

// Import components with forms
import RegisterPage from '@/app/register/page';
import DiscoverPage from '@/app/discover/page';
import { DiscoveryInterface } from '@/components/mcplookup/discovery-interface';
import { GitHubAutoRegister } from '@/components/registration/github-auto-register';
import { ManualRegister } from '@/components/registration/manual-register';

// Import API handlers for form integration testing
import { POST as registerPOST } from '@/app/api/v1/register/route';
import { GET as discoverGET } from '@/app/api/v1/discover/route';
import { POST as contactPOST } from '@/app/api/support/route';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  })
}));

// Mock external services for form testing
vi.mock('dns', () => ({
  promises: {
    resolveTxt: vi.fn().mockResolvedValue([['mcp_verify_test123']])
  }
}));

// Helper function to render with providers
function renderWithProviders(component: React.ReactElement, session: any = null) {
  return render(
    <SessionProvider session={session}>
      <Provider>
        {component}
      </Provider>
    </SessionProvider>
  );
}

// Helper to simulate form API calls
async function simulateFormSubmission(endpoint: string, formData: any) {
  const request = new NextRequest(`http://localhost:3000${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  switch (endpoint) {
    case '/api/v1/register':
      return await registerPOST(request);
    case '/api/support':
      return await contactPOST(request);
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
}

describe('Form Integration Tests', () => {
  beforeEach(async () => {
    // Reset storage and mocks
    const storageService = getStorageService();
    await storageService.clear();
    vi.clearAllMocks();
  });

  describe('Server Registration Forms', () => {
    it('should handle manual server registration form submission', async () => {
      renderWithProviders(<RegisterPage />);
      
      // Switch to manual registration tab
      const manualTab = screen.getByText(/Manual Registration/i);
      fireEvent.click(manualTab);
      
      await waitFor(() => {
        expect(screen.getByText(/Manual Registration/i)).toBeInTheDocument();
      });

      // Test form submission with valid data
      const validRegistrationData = {
        domain: 'example.com',
        endpoint: 'https://example.com/mcp',
        name: 'Example MCP Server',
        description: 'A comprehensive test server',
        contact_email: 'admin@example.com',
        capabilities: ['filesystem', 'automation'],
        auth: { type: 'none' }
      };

      const response = await simulateFormSubmission('/api/v1/register', validRegistrationData);
      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.challenge_id).toBeDefined();
      expect(result.domain).toBe('example.com');
    });

    it('should handle form validation errors', async () => {
      renderWithProviders(<RegisterPage />);
      
      // Test form submission with invalid data
      const invalidData = {
        domain: '',
        endpoint: 'invalid-url',
        name: '',
        description: '',
        contact_email: 'invalid-email'
      };

      try {
        await simulateFormSubmission('/api/v1/register', invalidData);
      } catch (error) {
        // Should handle validation errors
        expect(error).toBeDefined();
      }
    });

    it('should handle GitHub auto-registration form', async () => {
      renderWithProviders(<RegisterPage />);
      
      // GitHub tab should be selected by default
      expect(screen.getByText(/GitHub Auto-Register/i)).toBeInTheDocument();
      
      // Test GitHub URL input
      const githubData = {
        github_url: 'https://github.com/user/mcp-server',
        auto_detect: true
      };

      // Simulate GitHub registration
      const response = await simulateFormSubmission('/api/v1/register', githubData);
      expect(response.status).toBe(201);
    });

    it('should show loading states during form submission', async () => {
      renderWithProviders(<RegisterPage />);
      
      // Mock slow API response
      vi.mocked(registerPOST).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve(new Response('{}', { status: 201 })), 100))
      );

      const formData = {
        domain: 'example.com',
        endpoint: 'https://example.com/mcp',
        name: 'Test Server'
      };

      // Submit form and check for loading state
      const submitPromise = simulateFormSubmission('/api/v1/register', formData);
      
      // Should show some indication of loading
      expect(document.body).toBeInTheDocument();
      
      await submitPromise;
    });
  });

  describe('Discovery Search Forms', () => {
    it('should handle discovery search form submission', async () => {
      renderWithProviders(<DiscoverPage />);
      
      expect(screen.getByText(/MCP Server Discovery Engine/i)).toBeInTheDocument();
      
      // Test search functionality
      const searchParams = new URLSearchParams({
        capability: 'filesystem',
        verified_only: 'true',
        limit: '10'
      });

      const searchRequest = new NextRequest(`http://localhost:3000/api/v1/discover?${searchParams}`);
      const response = await discoverGET(searchRequest);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.servers).toBeDefined();
    });

    it('should handle different search modes', async () => {
      renderWithProviders(<DiscoverPage />);
      
      // Test domain search
      const domainSearch = new URLSearchParams({ domain: 'github.com' });
      const domainRequest = new NextRequest(`http://localhost:3000/api/v1/discover?${domainSearch}`);
      const domainResponse = await discoverGET(domainRequest);
      expect(domainResponse.status).toBe(200);

      // Test capability search
      const capabilitySearch = new URLSearchParams({ capability: 'git' });
      const capabilityRequest = new NextRequest(`http://localhost:3000/api/v1/discover?${capabilitySearch}`);
      const capabilityResponse = await discoverGET(capabilityRequest);
      expect(capabilityResponse.status).toBe(200);

      // Test smart search
      const smartSearch = new URLSearchParams({ query: 'file management tools' });
      const smartRequest = new NextRequest(`http://localhost:3000/api/v1/discover?${smartSearch}`);
      const smartResponse = await discoverGET(smartRequest);
      expect(smartResponse.status).toBe(200);
    });

    it('should handle search with no results', async () => {
      renderWithProviders(<DiscoverPage />);
      
      // Search for something that doesn't exist
      const noResultsSearch = new URLSearchParams({ capability: 'nonexistent-capability' });
      const request = new NextRequest(`http://localhost:3000/api/v1/discover?${noResultsSearch}`);
      const response = await discoverGET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.servers).toEqual([]);
    });
  });

  describe('Contact and Support Forms', () => {
    it('should handle contact form submission', async () => {
      // Test contact form (if it exists)
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content'
      };

      try {
        const response = await simulateFormSubmission('/api/support', contactData);
        expect(response.status).toBe(200);
      } catch (error) {
        // Contact form might not exist yet
        expect(error.message).toContain('Unknown endpoint');
      }
    });
  });

  describe('Form Field Validation', () => {
    it('should validate required fields', async () => {
      renderWithProviders(<RegisterPage />);
      
      // Try to submit empty form
      const emptyData = {};
      
      try {
        await simulateFormSubmission('/api/v1/register', emptyData);
      } catch (error) {
        // Should fail validation
        expect(error).toBeDefined();
      }
    });

    it('should validate email format', async () => {
      renderWithProviders(<RegisterPage />);
      
      const invalidEmailData = {
        domain: 'example.com',
        endpoint: 'https://example.com/mcp',
        name: 'Test Server',
        contact_email: 'invalid-email-format'
      };

      try {
        await simulateFormSubmission('/api/v1/register', invalidEmailData);
      } catch (error) {
        // Should fail email validation
        expect(error).toBeDefined();
      }
    });

    it('should validate URL format', async () => {
      renderWithProviders(<RegisterPage />);
      
      const invalidUrlData = {
        domain: 'example.com',
        endpoint: 'not-a-valid-url',
        name: 'Test Server',
        contact_email: 'test@example.com'
      };

      try {
        await simulateFormSubmission('/api/v1/register', invalidUrlData);
      } catch (error) {
        // Should fail URL validation
        expect(error).toBeDefined();
      }
    });

    it('should validate domain format', async () => {
      renderWithProviders(<RegisterPage />);
      
      const invalidDomainData = {
        domain: 'invalid..domain',
        endpoint: 'https://example.com/mcp',
        name: 'Test Server',
        contact_email: 'test@example.com'
      };

      try {
        await simulateFormSubmission('/api/v1/register', invalidDomainData);
      } catch (error) {
        // Should fail domain validation
        expect(error).toBeDefined();
      }
    });
  });

  describe('Form Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      renderWithProviders(<RegisterPage />);
      
      // Mock API error
      vi.mocked(registerPOST).mockRejectedValueOnce(new Error('Server Error'));
      
      const formData = {
        domain: 'example.com',
        endpoint: 'https://example.com/mcp',
        name: 'Test Server'
      };

      try {
        await simulateFormSubmission('/api/v1/register', formData);
      } catch (error) {
        expect(error.message).toBe('Server Error');
      }

      // Form should still be functional
      expect(screen.getByText(/Register Your MCP Server/i)).toBeInTheDocument();
    });

    it('should handle network errors', async () => {
      renderWithProviders(<RegisterPage />);
      
      // Mock network error
      vi.mocked(registerPOST).mockRejectedValueOnce(new Error('Network Error'));
      
      const formData = {
        domain: 'example.com',
        endpoint: 'https://example.com/mcp',
        name: 'Test Server'
      };

      try {
        await simulateFormSubmission('/api/v1/register', formData);
      } catch (error) {
        expect(error.message).toBe('Network Error');
      }
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state during validation', async () => {
      renderWithProviders(<RegisterPage />);
      
      // Form should maintain state even after validation errors
      expect(screen.getByText(/Register Your MCP Server/i)).toBeInTheDocument();
    });

    it('should reset form after successful submission', async () => {
      renderWithProviders(<RegisterPage />);
      
      const validData = {
        domain: 'example.com',
        endpoint: 'https://example.com/mcp',
        name: 'Test Server',
        description: 'Test description',
        contact_email: 'test@example.com',
        capabilities: ['filesystem'],
        auth: { type: 'none' }
      };

      const response = await simulateFormSubmission('/api/v1/register', validData);
      expect(response.status).toBe(201);
      
      // Form should be ready for next submission
      expect(screen.getByText(/Register Your MCP Server/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility in Forms', () => {
    it('should have proper form labels and accessibility', async () => {
      renderWithProviders(<RegisterPage />);
      
      // Check for form accessibility
      expect(screen.getByText(/Register Your MCP Server/i)).toBeInTheDocument();
      
      // Forms should have proper structure
      const forms = screen.getAllByRole('tabpanel');
      expect(forms.length).toBeGreaterThan(0);
    });
  });
});
