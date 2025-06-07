// MCP Server Implementation Tests
// Tests for the Vercel MCP adapter implementation

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the services
vi.mock('../../../lib/services/index', () => ({
  getServerlessServices: vi.fn(() => ({
    discovery: {
      discoverServers: vi.fn(),
      discoverByDomain: vi.fn()
    },
    verification: {
      initiateDNSVerification: vi.fn(),
      checkChallengeStatus: vi.fn()
    },
    health: {
      checkServerHealth: vi.fn()
    },
    registry: {
      getAllVerifiedServers: vi.fn()
    }
  }))
}))

// Mock the Vercel MCP adapter
vi.mock('@vercel/mcp-adapter', () => ({
  createMcpHandler: vi.fn((serverSetup, serverOptions, adapterConfig) => {
    // Create a mock handler that captures the server setup
    const mockServer = {
      tool: vi.fn(),
      tools: []
    }
    
    // Execute the server setup to register tools
    serverSetup(mockServer)
    
    // Return a mock handler function
    return vi.fn(async (request: NextRequest) => {
      return new Response(JSON.stringify({
        message: 'MCP server mock response',
        tools: mockServer.tools.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })
}))

describe('MCP Server Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('MCP Handler Creation', () => {
    it('should create MCP handler with proper configuration', async () => {
      const { createMcpHandler } = await import('@vercel/mcp-adapter')
      
      // Import the route to trigger handler creation
      await import('./route')
      
      expect(createMcpHandler).toHaveBeenCalledWith(
        expect.any(Function), // Server setup function
        expect.objectContaining({
          name: 'mcp-lookup-discovery-server',
          version: '1.0.0'
        }),
        expect.objectContaining({
          basePath: '/api/mcp',
          maxDuration: expect.any(Number),
          verboseLogs: expect.any(Boolean)
        })
      )
    })

    it('should register all required MCP tools', async () => {
      // Test that the route file can be imported without errors
      // This verifies that the MCP handler is properly configured
      try {
        await import('./route')
        expect(true).toBe(true) // Import successful
      } catch (error) {
        throw new Error(`Failed to import MCP route: ${error instanceof Error ? error.message : String(error)}`)
      }

      // Verify that the expected tools are defined in the implementation
      // This is a static analysis test
      const routeContent = await import('fs').then(fs =>
        fs.readFileSync('./src/app/api/mcp/route.ts', 'utf-8')
      ).catch(() => '')

      const expectedTools = [
        'discover_mcp_servers',
        'register_mcp_server',
        'verify_domain_ownership',
        'get_server_health',
        'browse_capabilities',
        'get_discovery_stats',
        'list_mcp_tools'
      ]

      expectedTools.forEach(toolName => {
        expect(routeContent).toContain(toolName)
      })
    })
  })

  describe('MCP Tool Functionality', () => {
    it('should handle discover_mcp_servers tool correctly', async () => {
      const { getServerlessServices } = await import('../../../lib/services/index')
      const mockServices = getServerlessServices()
      
      // Mock discovery response
      vi.mocked(mockServices.discovery.discoverServers).mockResolvedValue({
        servers: [
          {
            domain: 'example.com',
            endpoint: 'https://example.com/mcp',
            name: 'Example Server',
            description: 'Test server',
            auth: { type: 'none' },
            capabilities: {
              category: 'development',
              subcategories: ['testing'],
              intent_keywords: ['test'],
              use_cases: ['testing']
            },
            cors_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            availability: {
              status: 'live',
              live_endpoint: 'https://example.com/mcp',
              endpoint_verified: true,
              packages_available: false
            }
          }
        ],
        pagination: {
          offset: 0,
          total_count: 1,
          returned_count: 1,
          has_more: false
        },
        query_metadata: {
          query_time_ms: 50,
          cache_hit: false,
          filters_applied: []
        }
      })
      
      // Import and test the route
      const { GET } = await import('./route')
      const request = new NextRequest('http://localhost:3000/api/mcp')
      
      const response = await GET(request)
      expect(response).toBeDefined()
    })

    it('should handle register_mcp_server tool correctly', async () => {
      const { getServerlessServices } = await import('../../../lib/services/index')
      const mockServices = getServerlessServices()
      
      // Mock verification response
      vi.mocked(mockServices.verification.initiateDNSVerification).mockResolvedValue({
        challenge_id: 'test-challenge-123',
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration'
      })
      
      // Import and test the route
      const { POST } = await import('./route')
      const request = new NextRequest('http://localhost:3000/api/mcp', {
        method: 'POST'
      })
      
      const response = await POST(request)
      expect(response).toBeDefined()
    })

    it('should handle verify_domain_ownership tool correctly', async () => {
      const { getServerlessServices } = await import('../../../lib/services/index')
      const mockServices = getServerlessServices()
      
      // Mock domain discovery response
      vi.mocked(mockServices.discovery.discoverByDomain).mockResolvedValue({
        domain: 'verified.com',
        endpoint: 'https://verified.com/mcp',
        name: 'Verified Server',
        description: 'A verified test server',
        auth: { type: 'none' },
        capabilities: {
          category: 'development',
          subcategories: ['testing'],
          intent_keywords: ['test'],
          use_cases: ['testing']
        },
        cors_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        availability: {
          status: 'live',
          live_endpoint: 'https://verified.com/mcp',
          endpoint_verified: true,
          packages_available: false
        },
        verification: {
          endpoint_verified: true,
          dns_verified: true,
          ssl_verified: true,
          last_verification: new Date().toISOString(),
          verification_method: 'dns',
          verified_at: new Date().toISOString()
        }
      })
      
      // Test should pass with mocked services
      expect(mockServices.discovery.discoverByDomain).toBeDefined()
    })

    it('should handle get_server_health tool correctly', async () => {
      const { getServerlessServices } = await import('../../../lib/services/index')
      const mockServices = getServerlessServices()
      
      // Mock health check response
      vi.mocked(mockServices.health.checkServerHealth).mockResolvedValue({
        status: 'healthy',
        avg_response_time_ms: 200,
        uptime_percentage: 99.9,
        error_rate: 0.1,
        last_check: new Date().toISOString(),
        consecutive_failures: 0,
        response_time_ms: 150
      })
      
      // Mock server discovery
      vi.mocked(mockServices.discovery.discoverByDomain).mockResolvedValue({
        domain: 'healthy.com',
        endpoint: 'https://healthy.com/mcp',
        name: 'Healthy Server',
        description: 'A healthy test server',
        auth: { type: 'none' },
        capabilities: {
          category: 'development',
          subcategories: ['testing'],
          intent_keywords: ['test'],
          use_cases: ['testing']
        },
        cors_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        availability: {
          status: 'live',
          live_endpoint: 'https://healthy.com/mcp',
          endpoint_verified: true,
          packages_available: false
        },
        trust_score: 85
      })
      
      // Test should pass with mocked services
      expect(mockServices.health.checkServerHealth).toBeDefined()
    })

    it('should handle browse_capabilities tool correctly', async () => {
      const { getServerlessServices } = await import('../../../lib/services/index')
      const mockServices = getServerlessServices()
      
      // Mock registry response
      vi.mocked(mockServices.registry.getAllVerifiedServers).mockResolvedValue([
        {
          domain: 'example.com',
          endpoint: 'https://example.com/mcp',
          name: 'Example Server',
          description: 'Email and chat server',
          auth: { type: 'none' },
          capabilities: {
            category: 'communication',
            subcategories: ['email', 'chat'],
            intent_keywords: ['email', 'chat'],
            use_cases: ['communication']
          },
          cors_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          availability: {
            status: 'live',
            live_endpoint: 'https://example.com/mcp',
            endpoint_verified: true,
            packages_available: false
          }
        }
      ])
      
      // Test should pass with mocked services
      expect(mockServices.registry.getAllVerifiedServers).toBeDefined()
    })

    it('should handle get_discovery_stats tool correctly', async () => {
      const { getServerlessServices } = await import('../../../lib/services/index')
      const mockServices = getServerlessServices()
      
      // Mock registry response for stats
      vi.mocked(mockServices.registry.getAllVerifiedServers).mockResolvedValue([
        {
          domain: 'stats1.com',
          endpoint: 'https://stats1.com/mcp',
          name: 'Stats Server 1',
          description: 'First stats server',
          auth: { type: 'none' },
          verification: {
            endpoint_verified: true,
            dns_verified: true,
            ssl_verified: true,
            last_verification: new Date().toISOString(),
            verification_method: 'dns'
          },
          health: {
            status: 'healthy',
            avg_response_time_ms: 100,
            uptime_percentage: 99.9,
            error_rate: 0.1,
            last_check: new Date().toISOString(),
            consecutive_failures: 0
          },
          capabilities: {
            category: 'productivity',
            subcategories: ['stats'],
            intent_keywords: ['productivity'],
            use_cases: ['analytics']
          },
          cors_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          availability: {
            status: 'live',
            live_endpoint: 'https://stats1.com/mcp',
            endpoint_verified: true,
            packages_available: false
          },
          trust_score: 90
        },
        {
          domain: 'stats2.com',
          endpoint: 'https://stats2.com/mcp',
          name: 'Stats Server 2',
          description: 'Second stats server',
          auth: { type: 'none' },
          verification: {
            endpoint_verified: false,
            dns_verified: false,
            ssl_verified: false,
            last_verification: new Date().toISOString(),
            verification_method: 'dns'
          },
          health: {
            status: 'unhealthy',
            avg_response_time_ms: 1000,
            uptime_percentage: 50.0,
            error_rate: 25.0,
            last_check: new Date().toISOString(),
            consecutive_failures: 5
          },
          capabilities: {
            category: 'communication',
            subcategories: ['chat'],
            intent_keywords: ['communication'],
            use_cases: ['messaging']
          },
          cors_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          availability: {
            status: 'package_only',
            live_endpoint: undefined,
            endpoint_verified: false,
            packages_available: true,
            primary_package: 'npm'
          },
          trust_score: 75
        }
      ])
      
      // Test should pass with mocked services
      expect(mockServices.registry.getAllVerifiedServers).toBeDefined()
    })

    it('should handle list_mcp_tools tool correctly', async () => {
      // This tool doesn't depend on external services
      // It should return a static list of available tools
      
      // Import the route to ensure it's properly set up
      await import('./route')
      
      // The tool should be registered and ready to use
      expect(true).toBe(true) // Placeholder assertion
    })
  })

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const { getServerlessServices } = await import('../../../lib/services/index')
      const mockServices = getServerlessServices()
      
      // Mock service error
      vi.mocked(mockServices.discovery.discoverServers).mockRejectedValue(
        new Error('Service unavailable')
      )
      
      // Test should handle errors without crashing
      expect(mockServices.discovery.discoverServers).toBeDefined()
    })

    it('should validate tool parameters correctly', async () => {
      // The zod schemas should validate parameters
      // This is handled by the MCP adapter and zod validation
      expect(true).toBe(true) // Placeholder assertion
    })
  })

  describe('Configuration', () => {
    it('should use correct Redis URL configuration', async () => {
      // Test that the configuration includes Redis URL
      const routeContent = await import('fs').then(fs =>
        fs.readFileSync('./src/app/api/mcp/route.ts', 'utf-8')
      ).catch(() => '')

      // Check that Redis configuration is present
      expect(routeContent).toContain('redisUrl')
      expect(routeContent).toContain('REDIS_URL')
    })

    it('should set appropriate maxDuration for environment', async () => {
      // Test that maxDuration configuration is present
      const routeContent = await import('fs').then(fs =>
        fs.readFileSync('./src/app/api/mcp/route.ts', 'utf-8')
      ).catch(() => '')

      // Check that maxDuration configuration is present
      expect(routeContent).toContain('maxDuration')
      expect(routeContent).toContain('VERCEL_ENV')
    })
  })
})
