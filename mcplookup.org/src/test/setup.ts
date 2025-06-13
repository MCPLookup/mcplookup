import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock environment variables for testing
vi.stubEnv('NODE_ENV', 'test')

// Global auth mock for all tests - comprehensive NextAuth v5 mocking
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  }),
  handlers: {
    GET: vi.fn(),
    POST: vi.fn()
  },
  signIn: vi.fn(),
  signOut: vi.fn()
}))

// Also mock the auth module at root level for direct imports
vi.mock('../../auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  }),
  handlers: {
    GET: vi.fn(),
    POST: vi.fn()
  },
  signIn: vi.fn(),
  signOut: vi.fn()
}))

// Mock auth.ts at root level with comprehensive NextAuth mocking
vi.mock('../../auth.ts', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  }),
  handlers: {
    GET: vi.fn(),
    POST: vi.fn()
  },
  signIn: vi.fn(),
  signOut: vi.fn(),
  config: {}
}))

// Mock NextAuth module
vi.mock('next-auth', () => ({
  default: vi.fn().mockImplementation(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn().mockResolvedValue({
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      }
    }),
    signIn: vi.fn(),
    signOut: vi.fn()
  }))
}))

// Mock auth storage adapter
vi.mock('@/lib/auth/storage-adapter', () => ({
  createUserWithPassword: vi.fn().mockResolvedValue({
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: false
  }),
  createEmailVerificationToken: vi.fn().mockResolvedValue(true),
  getUserByEmail: vi.fn().mockResolvedValue(null),
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  generateSecureToken: vi.fn().mockReturnValue('secure-token-123'),
  hashToken: vi.fn().mockResolvedValue('hashed-token'),
  getEmailVerificationToken: vi.fn().mockResolvedValue({
    id: 'token-id',
    email: 'test@example.com',
    hashedToken: 'hashed-token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  }),
  deleteEmailVerificationToken: vi.fn().mockResolvedValue(true),
  updateUserPassword: vi.fn().mockResolvedValue(true),
  verifyPassword: vi.fn().mockResolvedValue(true)
}))

// Mock email service
vi.mock('@/lib/services/resend-email', () => ({
  sendEmailVerification: vi.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true })
}))

// Mock MCP adapter for tests
vi.mock('@vercel/mcp-adapter', () => ({
  createMcpHandler: vi.fn().mockImplementation((callback) => {
    const mockServer = {
      tool: vi.fn(),
      resource: vi.fn(),
      prompt: vi.fn()
    };
    callback(mockServer);
    return {
      GET: vi.fn().mockResolvedValue(new Response('MCP GET')),
      POST: vi.fn().mockResolvedValue(new Response(JSON.stringify({
        content: [{
          type: 'text',
          text: JSON.stringify({ servers: [], total_results: 0 })
        }]
      }), { status: 200 }))
    };
  })
}))

// Mock the entire MCP route module
vi.mock('@/app/api/mcp/route', () => ({
  POST: vi.fn().mockResolvedValue(new Response(JSON.stringify({
    content: [{
      type: 'text',
      text: JSON.stringify({ servers: [], total_results: 0 })
    }]
  }), { status: 200 }))
}))

// Mock MCP auth wrapper
vi.mock('@/lib/mcp/auth-wrapper', () => ({
  validateMCPToolAuth: vi.fn().mockResolvedValue({
    success: true,
    context: {
      userId: 'test-user-123',
      apiKeyId: 'test-api-key',
      permissions: ['servers:read', 'servers:write'],
      isAuthenticated: true,
      hasPermission: vi.fn().mockReturnValue(true)
    }
  })
}))

// Mock DNS verification service
vi.mock('@/lib/services/dns-verification', () => ({
  isUserDomainVerified: vi.fn().mockResolvedValue(true)
}))

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
})

// Global test utilities
declare global {
  var __TEST_MODE__: boolean
}

globalThis.__TEST_MODE__ = true
