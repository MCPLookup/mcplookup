// Comprehensive auth mock for all test scenarios
// This module provides consistent auth mocking across all tests

import { vi } from 'vitest';

// Create a comprehensive auth mock that works for all scenarios
export const createAuthMock = (userRole: string = 'admin') => {
  const mockUser = {
    id: `test-${userRole}-123`,
    email: `${userRole}@example.com`,
    name: `Test ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
    role: userRole
  };

  const mockAuth = vi.fn().mockResolvedValue({
    user: mockUser
  });

  return {
    auth: mockAuth,
    handlers: {
      GET: vi.fn().mockResolvedValue(new Response('Mock GET')),
      POST: vi.fn().mockResolvedValue(new Response('Mock POST'))
    },
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    default: mockAuth
  };
};

// Default admin auth mock
export const adminAuthMock = createAuthMock('admin');

// Export individual functions for direct use
export const auth = adminAuthMock.auth;
export const handlers = adminAuthMock.handlers;
export const signIn = adminAuthMock.signIn;
export const signOut = adminAuthMock.signOut;
export default adminAuthMock.auth;
