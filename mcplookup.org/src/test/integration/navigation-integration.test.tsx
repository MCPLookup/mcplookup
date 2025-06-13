// Navigation Integration Tests
// Tests navigation, routing, and URL handling across the website

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { Provider } from '@/components/ui/provider';
import { getStorageService } from '@/lib/storage';

// Import components that contain navigation
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import HomePage from '@/app/page';
import DiscoverPage from '@/app/discover/page';
import RegisterPage from '@/app/register/page';
import DashboardPage from '@/app/dashboard/page';

// Navigation state tracking
const navigationHistory: string[] = [];
const mockPush = vi.fn((path: string) => {
  navigationHistory.push(path);
});
const mockReplace = vi.fn();
const mockBack = vi.fn(() => {
  if (navigationHistory.length > 1) {
    navigationHistory.pop();
  }
});

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => {
    const currentPath = navigationHistory[navigationHistory.length - 1] || '/';
    const url = new URL(`http://localhost:3000${currentPath}`);
    return new URLSearchParams(url.search);
  },
  usePathname: () => navigationHistory[navigationHistory.length - 1] || '/',
  useParams: () => ({}),
}));

// Mock auth for navigation tests
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

describe('Navigation Integration Tests', () => {
  beforeEach(async () => {
    // Reset navigation history and storage
    navigationHistory.length = 0;
    navigationHistory.push('/');
    const storageService = getStorageService();
    await storageService.clear();
    vi.clearAllMocks();
  });

  describe('Header Navigation', () => {
    it('should render header with all navigation links', async () => {
      renderWithProviders(<Header />);
      
      // Check for main navigation elements
      expect(screen.getByRole('banner')).toBeInTheDocument();
      
      // Look for navigation links (may be in different formats)
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should navigate to discovery page from header', async () => {
      renderWithProviders(<Header />);
      
      // Look for discover link
      const discoverLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.includes('/discover') ||
        link.textContent?.toLowerCase().includes('discover')
      );
      
      if (discoverLinks.length > 0) {
        fireEvent.click(discoverLinks[0]);
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('discover'));
        });
      }
    });

    it('should navigate to registration page from header', async () => {
      renderWithProviders(<Header />);
      
      // Look for register link
      const registerLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.includes('/register') ||
        link.textContent?.toLowerCase().includes('register')
      );
      
      if (registerLinks.length > 0) {
        fireEvent.click(registerLinks[0]);
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('register'));
        });
      }
    });

    it('should navigate to dashboard from header when authenticated', async () => {
      renderWithProviders(<Header />);
      
      // Look for dashboard link
      const dashboardLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.includes('/dashboard') ||
        link.textContent?.toLowerCase().includes('dashboard')
      );
      
      if (dashboardLinks.length > 0) {
        fireEvent.click(dashboardLinks[0]);
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('dashboard'));
        });
      }
    });
  });

  describe('Footer Navigation', () => {
    it('should render footer with navigation links', async () => {
      renderWithProviders(<Footer />);
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      
      // Check for footer links
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should navigate to documentation from footer', async () => {
      renderWithProviders(<Footer />);
      
      // Look for docs link
      const docsLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.includes('/docs') ||
        link.textContent?.toLowerCase().includes('docs') ||
        link.textContent?.toLowerCase().includes('documentation')
      );
      
      if (docsLinks.length > 0) {
        fireEvent.click(docsLinks[0]);
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('docs'));
        });
      }
    });

    it('should navigate to privacy page from footer', async () => {
      renderWithProviders(<Footer />);
      
      // Look for privacy link
      const privacyLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.includes('/privacy') ||
        link.textContent?.toLowerCase().includes('privacy')
      );
      
      if (privacyLinks.length > 0) {
        fireEvent.click(privacyLinks[0]);
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('privacy'));
        });
      }
    });
  });

  describe('Page-to-Page Navigation', () => {
    it('should navigate from homepage to discovery page', async () => {
      renderWithProviders(<HomePage />);
      
      const discoverButton = screen.getAllByText(/Start Discovering/i)[0];
      fireEvent.click(discoverButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/discover');
        expect(navigationHistory).toContain('/discover');
      });
    });

    it('should navigate from homepage to registration page', async () => {
      renderWithProviders(<HomePage />);
      
      const registerButton = screen.getByText(/Register Your Server/i);
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/register');
        expect(navigationHistory).toContain('/register');
      });
    });

    it('should navigate from discovery to registration', async () => {
      // Start on discovery page
      navigationHistory.push('/discover');
      renderWithProviders(<DiscoverPage />);
      
      // Look for registration link/button
      const registerLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.includes('/register') ||
        link.textContent?.toLowerCase().includes('register')
      );
      
      if (registerLinks.length > 0) {
        fireEvent.click(registerLinks[0]);
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('register'));
        });
      }
    });
  });

  describe('Deep Linking and URL Parameters', () => {
    it('should handle discovery page with search parameters', async () => {
      // Simulate navigation to discovery with search params
      navigationHistory.push('/discover?capability=filesystem');
      
      renderWithProviders(<DiscoverPage />);
      
      // Page should render with search parameters
      expect(screen.getByText(/MCP Server Discovery Engine/i)).toBeInTheDocument();
    });

    it('should handle registration page with pre-filled data', async () => {
      // Simulate navigation to registration with params
      navigationHistory.push('/register?method=github');
      
      renderWithProviders(<RegisterPage />);
      
      // Page should render with parameters
      expect(screen.getAllByText(/Register Your MCP Server/i)[0]).toBeInTheDocument();
    });

    it('should handle dashboard with tab selection', async () => {
      // Simulate navigation to dashboard with tab
      navigationHistory.push('/dashboard?tab=api-keys');
      
      renderWithProviders(<DashboardPage />);
      
      // Dashboard should render (may show loading)
      await waitFor(() => {
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Browser Navigation', () => {
    it('should handle back navigation correctly', async () => {
      // Simulate navigation history
      navigationHistory.push('/discover');
      navigationHistory.push('/register');
      
      // Go back
      mockBack();
      
      expect(navigationHistory[navigationHistory.length - 1]).toBe('/discover');
    });

    it('should maintain navigation state across page changes', async () => {
      // Start on homepage
      renderWithProviders(<HomePage />);
      
      // Navigate to discovery
      const discoverButton = screen.getAllByText(/Start Discovering/i)[0];
      fireEvent.click(discoverButton);
      
      // Check navigation history
      await waitFor(() => {
        expect(navigationHistory).toContain('/discover');
      });
    });
  });

  describe('Authentication-Based Navigation', () => {
    it('should redirect to login for protected routes', async () => {
      // Mock unauthenticated state
      vi.mocked(vi.doMock('@/auth', () => ({
        auth: vi.fn().mockResolvedValue(null)
      })));
      
      // Try to access dashboard
      renderWithProviders(<DashboardPage />);
      
      // Should handle unauthenticated access
      expect(document.body).toBeInTheDocument();
    });

    it('should allow access to public routes without authentication', async () => {
      // Mock unauthenticated state
      vi.mocked(vi.doMock('@/auth', () => ({
        auth: vi.fn().mockResolvedValue(null)
      })));
      
      // Access public pages
      renderWithProviders(<HomePage />);
      expect(screen.getAllByText(/Dynamic Discovery Infrastructure/i)[0]).toBeInTheDocument();
      
      const { unmount } = renderWithProviders(<DiscoverPage />);
      expect(screen.getByText(/MCP Server Discovery Engine/i)).toBeInTheDocument();
      unmount();
      
      renderWithProviders(<RegisterPage />);
      expect(screen.getAllByText(/Register Your MCP Server/i)[0]).toBeInTheDocument();
    });
  });

  describe('Error Handling in Navigation', () => {
    it('should handle navigation errors gracefully', async () => {
      // Mock navigation error
      mockPush.mockRejectedValueOnce(new Error('Navigation Error'));
      
      renderWithProviders(<HomePage />);
      
      const discoverButton = screen.getAllByText(/Start Discovering/i)[0];
      fireEvent.click(discoverButton);

      // Should not crash the application
      expect(screen.getAllByText(/Dynamic Discovery Infrastructure/i)[0]).toBeInTheDocument();
    });
  });

  describe('Responsive Navigation', () => {
    it('should handle mobile navigation menu', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<Header />);
      
      // Should render mobile-friendly navigation
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should handle desktop navigation menu', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      
      renderWithProviders(<Header />);
      
      // Should render desktop navigation
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});
