import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInButton } from './signin-button';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/react';
import React from 'react';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: vi.fn()
}));

// Wrapper component for Chakra UI
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
);

describe('SignInButton', () => {
  const mockSignIn = vi.fn();
  const mockUseSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(signIn).mockImplementation(mockSignIn);
    vi.mocked(useSession).mockImplementation(mockUseSession);

    // Default session state
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('should render GitHub sign-in button', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Sign in with GitHub');
    });

    it('should render Google sign-in button', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="google" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Sign in with Google');
    });

    it('should render generic sign-in button when no provider specified', () => {
      render(
        <ChakraWrapper>
          <SignInButton />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Sign In');
    });

    it('should render with custom size', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="github" size="lg" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with custom variant', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="github" variant="outline" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with custom width', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="github" width="full" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with custom color scheme', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="github" colorScheme="blue" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('provider-specific rendering', () => {
    it('should show GitHub icon for GitHub provider', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      // Check for GitHub icon (FaGithub)
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Icon should be present in the button
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should show Google icon for Google provider', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="google" />
        </ChakraWrapper>
      );

      // Check for Google icon (FaGoogle)
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should show generic sign-in icon for no provider', () => {
      render(
        <ChakraWrapper>
          <SignInButton />
        </ChakraWrapper>
      );

      // Check for generic sign-in icon (FaSignInAlt)
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('click handling', () => {
    it('should call signIn with GitHub provider when clicked', async () => {
      mockSignIn.mockResolvedValue({ ok: true });

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('github', {
          callbackUrl: '/'
        });
      });
    });

    it('should call signIn with Google provider when clicked', async () => {
      mockSignIn.mockResolvedValue({ ok: true });

      render(
        <ChakraWrapper>
          <SignInButton provider="google" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/'
        });
      });
    });

    it('should call signIn with custom callback URL', async () => {
      mockSignIn.mockResolvedValue({ ok: true });

      render(
        <ChakraWrapper>
          <SignInButton provider="github" callbackUrl="/dashboard" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('github', {
          callbackUrl: '/dashboard'
        });
      });
    });

    it('should call signIn without provider when no provider specified', async () => {
      mockSignIn.mockResolvedValue({ ok: true });

      render(
        <ChakraWrapper>
          <SignInButton />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(undefined, {
          callbackUrl: '/'
        });
      });
    });

    it('should handle sign-in errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Sign-in failed'));

      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('session state handling', () => {
    it.skip('should be disabled when user is already authenticated', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User'
          }
        },
        status: 'authenticated'
      });

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading state when session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading'
      });

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when user is unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated'
      });

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it.skip('should be keyboard accessible', () => {
      mockSignIn.mockResolvedValue({ ok: true });

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Press Enter
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Should trigger sign-in
      expect(mockSignIn).toHaveBeenCalled();
    });

    it('should have descriptive text for screen readers', () => {
      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Sign in with GitHub');
    });
  });

  describe('loading states', () => {
    it.skip('should show loading state during sign-in process', async () => {
      // Mock a delayed sign-in
      mockSignIn.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
      );

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Button should be disabled during loading
      expect(button).toBeDisabled();

      // Wait for sign-in to complete
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors during sign-in', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // Button should be re-enabled after error
      expect(button).not.toBeDisabled();

      consoleSpy.mockRestore();
    });

    it('should handle OAuth errors gracefully', async () => {
      mockSignIn.mockResolvedValue({ 
        ok: false, 
        error: 'OAuthAccountNotLinked' 
      });

      render(
        <ChakraWrapper>
          <SignInButton provider="github" />
        </ChakraWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // Button should be re-enabled after error
      expect(button).not.toBeDisabled();
    });
  });
});
