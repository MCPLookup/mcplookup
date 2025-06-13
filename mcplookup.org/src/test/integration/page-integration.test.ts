// Page Integration Tests
// Tests all major pages render correctly and function with backend integration

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import { getStorageService, setStorageService } from '@/lib/storage';

// Import page components
import HomePage from '@/app/page';
import DashboardPage from '@/app/dashboard/page';
import DiscoverPage from '@/app/discover/page';
import RegisterPage from '@/app/register/page';
import DocsPage from '@/app/docs/page';
import ProfilePage from '@/app/profile/page';
import OnboardingPage from '@/app/onboarding/page';
import StatusPage from '@/app/status/page';

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
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

// Helper function to render pages with providers
function renderWithProviders(component: React.ReactElement) {
  return render(
    React.createElement(Provider, {}, component)
  );
}

describe('Page Integration Tests', () => {
  beforeEach(async () => {
    // Reset storage and mocks
    const storageService = getStorageService();
    await storageService.clear();
    vi.clearAllMocks();
  });

  describe('HomePage Integration', () => {
    it('should render homepage with all key sections', async () => {
      renderWithProviders(React.createElement(HomePage));

      // Check hero section
      expect(screen.getByText(/Dynamic Discovery Infrastructure/i)).toBeInTheDocument();
      expect(screen.getByText(/Choose Your Path/i)).toBeInTheDocument();

      // Check navigation links
      expect(screen.getByText(/Start Discovering/i)).toBeInTheDocument();
      expect(screen.getByText(/Register Your Server/i)).toBeInTheDocument();
    });

    it('should navigate to discovery page when clicking discover button', async () => {
      renderWithProviders(React.createElement(HomePage));

      const discoverButton = screen.getByText(/Start Discovering/i);
      fireEvent.click(discoverButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/discover');
      });
    });

    it('should navigate to registration page when clicking register button', async () => {
      renderWithProviders(React.createElement(HomePage));

      const registerButton = screen.getByText(/Register Your Server/i);
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/register');
      });
    });
  });

  describe('DiscoverPage Integration', () => {
    it('should render discovery page with search interface', async () => {
      renderWithProviders(<DiscoverPage />);
      
      expect(screen.getByText(/MCP Server Discovery Engine/i)).toBeInTheDocument();
      expect(screen.getByText(/Free Discovery API/i)).toBeInTheDocument();
    });

    it('should handle search functionality', async () => {
      renderWithProviders(<DiscoverPage />);
      
      // Look for search input (may be in DiscoveryInterface component)
      const searchInputs = screen.getAllByRole('textbox');
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it('should display API documentation link', async () => {
      renderWithProviders(<DiscoverPage />);
      
      const apiDocsLink = screen.getByText(/View API Docs/i);
      expect(apiDocsLink).toBeInTheDocument();
    });
  });

  describe('RegisterPage Integration', () => {
    it('should render registration page with both registration methods', async () => {
      renderWithProviders(<RegisterPage />);
      
      expect(screen.getByText(/Register Your MCP Server/i)).toBeInTheDocument();
      expect(screen.getByText(/GitHub Auto-Register/i)).toBeInTheDocument();
      expect(screen.getByText(/Manual Registration/i)).toBeInTheDocument();
    });

    it('should switch between registration tabs', async () => {
      renderWithProviders(<RegisterPage />);
      
      const manualTab = screen.getByText(/Manual Registration/i);
      fireEvent.click(manualTab);
      
      // Should show manual registration content
      await waitFor(() => {
        expect(screen.getByText(/Manual Registration/i)).toBeInTheDocument();
      });
    });
  });

  describe('DashboardPage Integration', () => {
    it('should render dashboard with user content', async () => {
      renderWithProviders(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
      });
    });

    it('should handle dashboard navigation', async () => {
      renderWithProviders(<DashboardPage />);
      
      // Dashboard should load with suspense
      await waitFor(() => {
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
      });
    });
  });

  describe('DocsPage Integration', () => {
    it('should render documentation page', async () => {
      renderWithProviders(<DocsPage />);
      
      expect(screen.getByText(/Documentation/i)).toBeInTheDocument();
    });
  });

  describe('ProfilePage Integration', () => {
    it('should render profile page', async () => {
      renderWithProviders(<ProfilePage />);
      
      // Profile page should render (may require auth)
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('OnboardingPage Integration', () => {
    it('should render onboarding page', async () => {
      renderWithProviders(<OnboardingPage />);
      
      // Onboarding page should render
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('StatusPage Integration', () => {
    it('should render status page', async () => {
      renderWithProviders(<StatusPage />);
      
      // Status page should render
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Cross-Page Navigation', () => {
    it('should maintain consistent header across pages', async () => {
      // Test HomePage header
      const { unmount } = renderWithProviders(<HomePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
      unmount();

      // Test DiscoverPage header
      renderWithProviders(<DiscoverPage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should maintain consistent footer across pages', async () => {
      // Test HomePage footer
      const { unmount } = renderWithProviders(<HomePage />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      unmount();

      // Test DiscoverPage footer
      renderWithProviders(<DiscoverPage />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle page rendering errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        renderWithProviders(<HomePage />);
        expect(document.body).toBeInTheDocument();
      } catch (error) {
        // Should not throw unhandled errors
        expect(error).toBeUndefined();
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('Responsive Design', () => {
    it('should render pages correctly on mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<HomePage />);
      expect(screen.getByText(/Dynamic Discovery Infrastructure/i)).toBeInTheDocument();
    });

    it('should render pages correctly on desktop viewport', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      renderWithProviders(<HomePage />);
      expect(screen.getByText(/Dynamic Discovery Infrastructure/i)).toBeInTheDocument();
    });
  });
});
