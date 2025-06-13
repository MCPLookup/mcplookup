// Mock auth module for testing
// This file provides a test-compatible version of the auth module

import { vi } from 'vitest';

// Mock auth function for testing with admin permissions
export const auth = vi.fn().mockResolvedValue({
  user: {
    id: 'test-admin-123',
    email: 'admin@example.com',
    name: 'Test Admin',
    role: 'admin'
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
