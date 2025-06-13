import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock environment variables for testing
vi.stubEnv('NODE_ENV', 'test')

// Global auth mock for all tests - using dedicated mock module
import { adminAuthMock, createAuthMock } from '@/test/mocks/auth';

// Mock all possible import paths to use our dedicated auth mock
vi.mock('@/auth', () => adminAuthMock);
vi.mock('../../auth', () => adminAuthMock);
vi.mock('../../../../../auth', () => adminAuthMock);
vi.mock('../../../../auth', () => adminAuthMock);
vi.mock('../../../auth', () => adminAuthMock);

// Also mock the auth.ts file directly
vi.mock('/mnt/persist/workspace/mcplookup.org/auth.ts', () => adminAuthMock);
vi.mock('/mnt/persist/workspace/mcplookup.org/auth', () => adminAuthMock);

// Export the auth mock creator for test-specific configuration
export { createAuthMock };

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

// Mock Registry Service
vi.mock('@/lib/services/registry', () => ({
  RegistryService: vi.fn().mockImplementation(() => ({
    registerServer: vi.fn().mockResolvedValue({
      success: true,
      server: {
        id: 'test-server-123',
        domain: 'example.com',
        verified: true,
        created_at: new Date().toISOString()
      }
    }),
    getServerByDomain: vi.fn().mockResolvedValue({
      domain: 'example.com',
      contact_email: 'admin@example.com',
      verified: true,
      created_at: new Date().toISOString()
    }),
    getServersByDomain: vi.fn().mockResolvedValue([{
      domain: 'example.com',
      contact_email: 'admin@example.com',
      verified: true,
      created_at: new Date().toISOString()
    }]),
    getAllServers: vi.fn().mockResolvedValue([
      {
        domain: 'example.com',
        verified: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        verification: {
          verified_at: new Date().toISOString(),
          last_verification: new Date().toISOString()
        }
      }
    ]),
    unregisterServer: vi.fn().mockResolvedValue({ success: true }),
    updateServer: vi.fn().mockResolvedValue({ success: true }),
    searchServers: vi.fn().mockResolvedValue([])
  }))
}))

// Mock Discovery Service
vi.mock('@/lib/services/discovery', () => ({
  DiscoveryService: vi.fn().mockImplementation(() => ({
    discoverByDomain: vi.fn().mockResolvedValue({
      servers: [{
        domain: 'example.com',
        verified: true,
        capabilities: {
          category: 'productivity',
          tools: ['email', 'calendar']
        }
      }]
    }),
    discoverByCapability: vi.fn().mockResolvedValue({
      servers: [{
        domain: 'example.com',
        verified: true,
        capabilities: {
          category: 'productivity',
          tools: ['email', 'calendar']
        }
      }]
    }),
    discoverByCategory: vi.fn().mockResolvedValue({
      servers: [{
        domain: 'example.com',
        verified: true,
        capabilities: {
          category: 'productivity',
          tools: ['email', 'calendar']
        }
      }]
    }),
    discoverByIntent: vi.fn().mockResolvedValue({
      servers: [{
        domain: 'example.com',
        verified: true,
        capabilities: {
          category: 'productivity',
          tools: ['email', 'calendar']
        }
      }],
      intent_analysis: { confidence: 0.9 },
      recommendations: ['Use email server for communication']
    }),
    searchServers: vi.fn().mockResolvedValue({
      servers: []
    })
  }))
}))

// Mock Analytics Service with comprehensive method coverage
const mockAnalyticsInstance = {
  // Metrics methods
  getAnalyticsMetrics: vi.fn().mockImplementation(async (startDate, endDate, filters = {}) => {
    try {
      const { getStorageService } = await import('@/lib/storage');
      const storage = getStorageService();
      const eventsResult = await storage.getAll('analytics_events');

      if (!eventsResult.success) {
        return {
          totalEvents: 0,
          uniqueUsers: 0,
          uniqueSessions: 0,
          topActions: [],
          topCategories: [],
          timeSeriesData: [],
          conversionFunnels: {}
        };
      }

      const events = eventsResult.data || [];
      const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
      const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size;

      return {
        totalEvents: events.length,
        uniqueUsers,
        uniqueSessions,
        topActions: [{ action: 'page_view', count: events.filter(e => e.action === 'page_view').length }],
        topCategories: [{ category: 'navigation', count: events.filter(e => e.category === 'navigation').length }],
        timeSeriesData: [],
        conversionFunnels: {}
      };
    } catch (error) {
      console.error('Mock getAnalyticsMetrics error:', error);
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        uniqueSessions: 0,
        topActions: [],
        topCategories: [],
        timeSeriesData: [],
        conversionFunnels: {}
      };
    }
  }),
  getPerformanceMetrics: vi.fn().mockImplementation(async (startDate, endDate, filters = {}) => {
    try {
      const { getStorageService } = await import('@/lib/storage');
      const storage = getStorageService();
      const eventsResult = await storage.getAll('analytics_events');

      if (!eventsResult.success) {
        return {
          averageResponseTime: 0,
          p95ResponseTime: 0,
          errorRate: 0,
          throughput: 0,
          uptime: 99.9
        };
      }

      const events = eventsResult.data || [];
      const apiEvents = events.filter(e => e.type === 'api_usage');
      const responseTimes = apiEvents.map(e => e.value || 250).filter(Boolean);
      const errorEvents = apiEvents.filter(e => e.properties?.statusCode >= 400);

      return {
        averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 250,
        p95ResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 500,
        errorRate: apiEvents.length > 0 ? errorEvents.length / apiEvents.length : 0.01,
        throughput: apiEvents.length,
        uptime: 99.9
      };
    } catch (error) {
      console.error('Mock getPerformanceMetrics error:', error);
      return {
        averageResponseTime: 250,
        p95ResponseTime: 500,
        errorRate: 0.01,
        throughput: 0,
        uptime: 99.9
      };
    }
  }),
  getUserBehaviorMetrics: vi.fn().mockResolvedValue({
    bounce_rate: 0.25,
    avg_session_duration: 300,
    pages_per_session: 3.5,
    returning_users: 0.6
  }),

  // Tracking methods
  trackEvent: vi.fn().mockImplementation(async (event) => {
    try {
      // Store the event in memory storage for tests that check storage
      const { getStorageService } = await import('@/lib/storage');
      const storage = getStorageService();
      const eventWithId = {
        ...event,
        id: `event_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString()
      };
      const result = await storage.set('analytics_events', eventWithId.id, eventWithId);
      return result.success;
    } catch (error) {
      console.error('Mock trackEvent error:', error);
      return false;
    }
  }),
  trackPageView: vi.fn().mockImplementation(async (page, userId, sessionId, properties = {}) => {
    try {
      const { getStorageService } = await import('@/lib/storage');
      const storage = getStorageService();
      const event = {
        id: `event_${Date.now()}_${Math.random()}`,
        type: 'pageview',
        category: 'navigation',
        action: 'page_view',
        label: page,
        userId,
        sessionId,
        properties: { page, ...properties },
        timestamp: new Date().toISOString()
      };
      const result = await storage.set('analytics_events', event.id, event);
      return result.success;
    } catch (error) {
      console.error('Mock trackPageView error:', error);
      return false;
    }
  }),
  trackUserAction: vi.fn().mockImplementation(async (action, category, label, value, userId, properties = {}) => {
    try {
      const { getStorageService } = await import('@/lib/storage');
      const storage = getStorageService();
      const event = {
        id: `event_${Date.now()}_${Math.random()}`,
        type: 'action',
        category,
        action,
        label,
        value,
        userId,
        properties,
        timestamp: new Date().toISOString()
      };
      const result = await storage.set('analytics_events', event.id, event);
      return result.success;
    } catch (error) {
      console.error('Mock trackUserAction error:', error);
      return false;
    }
  }),
  trackApiUsage: vi.fn().mockImplementation(async (endpoint, method, statusCode, responseTime, userId, apiKeyId) => {
    try {
      const { getStorageService } = await import('@/lib/storage');
      const storage = getStorageService();
      const event = {
        id: `event_${Date.now()}_${Math.random()}`,
        type: 'api_usage',
        category: 'api',
        action: `${method}_${endpoint}`,
        value: responseTime,
        userId,
        properties: { endpoint, method, statusCode, responseTime, apiKeyId },
        timestamp: new Date().toISOString()
      };
      const result = await storage.set('analytics_events', event.id, event);
      return result.success;
    } catch (error) {
      console.error('Mock trackApiUsage error:', error);
      return false;
    }
  }),
  trackServerRegistration: vi.fn().mockResolvedValue(true)
};

vi.mock('@/lib/services/analytics-service', () => {
  // Create a mock constructor that always returns the same mock instance
  const MockAnalyticsService = vi.fn().mockImplementation(() => {
    console.log('🔧 Creating mock AnalyticsService instance');
    return mockAnalyticsInstance;
  });

  // Also add the methods directly to the constructor for static access
  Object.assign(MockAnalyticsService.prototype, mockAnalyticsInstance);

  // Add static methods if needed
  MockAnalyticsService.getInstance = vi.fn().mockReturnValue(mockAnalyticsInstance);

  return {
    AnalyticsService: MockAnalyticsService,
    default: MockAnalyticsService
  };
})

// Reset mocks between tests (but preserve implementations)
beforeEach(() => {
  // Only clear call history, don't reset implementations
  vi.clearAllMocks()
})

afterEach(() => {
  // Don't reset implementations, just clear call history
  vi.clearAllMocks()
})

// Global test utilities
declare global {
  var __TEST_MODE__: boolean
}

globalThis.__TEST_MODE__ = true
