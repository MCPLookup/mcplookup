// Mock auth module for testing
// This file provides a test-compatible version of the auth module

import { vi } from 'vitest';

// Mock auth function for testing
export const auth = vi.fn().mockResolvedValue({
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user'
  }
});

// Mock handlers for NextAuth
export const handlers = {
  GET: vi.fn(),
  POST: vi.fn()
};

// Mock sign in/out functions
export const signIn = vi.fn();
export const signOut = vi.fn();

// Default export for compatibility
export default {
  auth,
  handlers,
  signIn,
  signOut
};
