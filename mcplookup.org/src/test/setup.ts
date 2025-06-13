import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock environment variables for testing
vi.stubEnv('NODE_ENV', 'test')

// Global auth mock for all tests
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  })
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
