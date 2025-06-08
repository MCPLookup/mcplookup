import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiscoveryService } from './discovery';
import { RegistryService } from './registry';
import { HealthService } from './health';
import { IntentService } from './intent';
import { MCPServerRecord, CapabilityCategory, DiscoveryRequest } from '../schemas/discovery';

// Mock the service dependencies
vi.mock('./registry');
vi.mock('./health');
vi.mock('./intent');

function createMockServer(overrides: Partial<MCPServerRecord> = {}): MCPServerRecord {
  return {
    domain: 'test.example.com',
    endpoint: 'https://test.example.com/.well-known/mcp',
    name: 'Test Server',
    description: 'A test MCP server',

    // Availability Status (FIRST-CLASS)
    availability: {
      status: 'live',
      live_endpoint: 'https://test.example.com/.well-known/mcp',
      endpoint_verified: true,
      last_endpoint_check: new Date().toISOString(),
      packages_available: false
    },

    server_info: {
      name: 'Test Server',
      version: '1.0.0',
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
        logging: false
      }
    },
    tools: [],
    resources: [],
    transport: 'streamable_http',

    capabilities: {
      category: 'productivity',
      subcategories: ['testing'],
      intent_keywords: ['test'],
      use_cases: ['Testing']
    },
    
    auth: { type: 'none' },
    cors_enabled: true,
    
    health: {
      status: 'healthy',
      uptime_percentage: 99.5,
      avg_response_time_ms: 150,
      error_rate: 0.01,
      last_check: '2025-06-04T00:00:00Z',
      consecutive_failures: 0
    },
    
    verification: {
      dns_verified: true,
      endpoint_verified: true,
      ssl_verified: true,
      last_verification: '2025-06-04T00:00:00Z',
      verification_method: 'dns-txt'
    },
    
    created_at: '2025-06-04T00:00:00Z',
    updated_at: '2025-06-04T00:00:00Z',
    maintainer: {
      name: 'Test Maintainer',
      email: 'test@example.com'
    },
    
    ...overrides
  };
}

describe('DiscoveryService', () => {
  let discoveryService: DiscoveryService;
  let mockRegistryService: any;
  let mockHealthService: any;
  let mockIntentService: any;

  beforeEach(() => {
    // Create mocked services
    mockRegistryService = {
      getAllServers: vi.fn(),
      getServersByDomain: vi.fn(),
      getServersByCategory: vi.fn(),
      getServersByCapability: vi.fn(),
      searchServers: vi.fn(),
      registerServer: vi.fn(),
      updateServer: vi.fn(),
      unregisterServer: vi.fn(),
      getRegistryStats: vi.fn(),
      getRelatedCapabilities: vi.fn(),
      getAllVerifiedServers: vi.fn()
    } as any;

    mockHealthService = {
      checkServerHealth: vi.fn(),
      batchHealthCheck: vi.fn()
    } as any;

    mockIntentService = {
      intentToCapabilities: vi.fn(),
      getSimilarIntents: vi.fn()
    } as any;

    discoveryService = new DiscoveryService(
      mockRegistryService,
      mockHealthService,
      mockIntentService
    );
  });

  describe('discoverServers', () => {
    it('should discover servers by domain', async () => {
      const mockServer = createMockServer({ domain: 'gmail.com' });
      mockRegistryService.getServersByDomain.mockResolvedValue([mockServer]);

      const request: DiscoveryRequest = {
        domain: { value: 'gmail.com', type: 'exact', weight: 1, required: true },
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(1);
      expect(response.servers[0].domain).toBe('gmail.com');
      expect(response.pagination.total_count).toBe(1);
      expect(mockRegistryService.getServersByDomain).toHaveBeenCalledWith('gmail.com');
    });

    it('should discover servers by capability', async () => {
      const mockServers = [
        createMockServer({ domain: 'email1.com', capabilities: { category: 'communication', subcategories: ['email'], intent_keywords: ['email'], use_cases: [] } }),
        createMockServer({ domain: 'email2.com', capabilities: { category: 'communication', subcategories: ['email'], intent_keywords: ['email'], use_cases: [] } })
      ];
      mockRegistryService.getServersByCapability.mockResolvedValue(mockServers);

      const request: DiscoveryRequest = {
        capabilities: {
          operator: 'AND',
          capabilities: [{ value: 'email', type: 'exact', weight: 1, required: true }],
          minimum_match: 0.5
        },
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(2);
      expect(response.pagination.total_count).toBe(2);
      expect(mockRegistryService.getServersByCapability).toHaveBeenCalledWith('email');
    });

    it('should discover servers by category', async () => {
      const mockServers = [createMockServer({ capabilities: { category: 'productivity', subcategories: [], intent_keywords: [], use_cases: [] } })];
      mockRegistryService.getServersByCategory.mockResolvedValue(mockServers);

      const request: DiscoveryRequest = {
        categories: ['productivity'],
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(1);
      expect(response.servers[0].capabilities.category).toBe('productivity');
      expect(mockRegistryService.getServersByCategory).toHaveBeenCalledWith('productivity');
    });

    it('should discover servers by intent', async () => {
      const mockServers = [createMockServer({ domain: 'calendar.com' })];
      mockIntentService.intentToCapabilities.mockResolvedValue(['calendar', 'scheduling']);
      mockRegistryService.getServersByCapability.mockResolvedValue(mockServers);

      const request: DiscoveryRequest = {
        intent: 'schedule a meeting',
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(1);
      expect(mockIntentService.intentToCapabilities).toHaveBeenCalledWith('schedule a meeting');
      expect(mockRegistryService.getServersByCapability).toHaveBeenCalledWith('calendar');
    });

    it('should handle search queries', async () => {
      const mockServers = [createMockServer({ name: 'Email Service' })];
      mockRegistryService.searchServers.mockResolvedValue(mockServers);

      const request: DiscoveryRequest = {
        keywords: [
          { value: 'email', type: 'contains', weight: 1, required: false },
          { value: 'management', type: 'contains', weight: 1, required: false }
        ],
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(1);
      expect(mockRegistryService.searchServers).toHaveBeenCalledWith(['email', 'management']);
    });

    it('should return all servers when no specific criteria provided', async () => {
      const mockServers = [
        createMockServer({ domain: 'server1.com' }),
        createMockServer({ domain: 'server2.com' })
      ];
      mockRegistryService.getAllVerifiedServers.mockResolvedValue(mockServers);

      const request: DiscoveryRequest = {
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(2);
      expect(mockRegistryService.getAllVerifiedServers).toHaveBeenCalled();
    });

    it('should return verified servers by default', async () => {
      const verifiedServer = createMockServer({
        domain: 'verified.com',
        verification: { dns_verified: true, endpoint_verified: true, ssl_verified: true, last_verification: '2025-06-04T00:00:00Z', verification_method: 'dns-txt' }
      });

      mockRegistryService.getAllVerifiedServers.mockResolvedValue([verifiedServer]);

      const request: DiscoveryRequest = {
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(1);
      expect(response.servers[0].domain).toBe('verified.com');
    });

    it('should apply limit and offset for pagination', async () => {
      const mockServers = Array.from({ length: 5 }, (_, i) =>
        createMockServer({ domain: `server${i}.com` })
      );
      mockRegistryService.getAllVerifiedServers.mockResolvedValue(mockServers);

      const request: DiscoveryRequest = {
        limit: 2,
        offset: 1,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(2);
      expect(response.servers[0].domain).toBe('server1.com');
      expect(response.servers[1].domain).toBe('server2.com');
      expect(response.pagination.has_more).toBe(true);
    });

    it('should handle empty results gracefully', async () => {
      mockRegistryService.getServersByDomain.mockResolvedValue([]);

      const request: DiscoveryRequest = {
        domain: { value: 'nonexistent.com', type: 'exact', weight: 1, required: true },
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };
      const response = await discoveryService.discoverServers(request);

      expect(response.servers).toHaveLength(0);
      expect(response.pagination.total_count).toBe(0);
      expect(response.pagination.has_more).toBe(false);
    });
  });

  describe('discoverByDomain', () => {
    it('should return server for existing domain', async () => {
      const mockServer = createMockServer({ domain: 'test.com' });
      mockRegistryService.getServersByDomain.mockResolvedValue([mockServer]);

      const result = await discoveryService.discoverByDomain('test.com');

      expect(result).toEqual(mockServer);
      expect(mockRegistryService.getServersByDomain).toHaveBeenCalledWith('test.com');
    });

    it('should return null for non-existent domain', async () => {
      mockRegistryService.getServersByDomain.mockResolvedValue([]);

      const result = await discoveryService.discoverByDomain('nonexistent.com');

      expect(result).toBeNull();
    });
  });

  describe('discoverByIntent', () => {
    it('should discover servers by intent using capability mapping', async () => {
      const mockServers = [createMockServer({ domain: 'calendar.com' })];
      mockIntentService.intentToCapabilities.mockResolvedValue(['calendar']);
      mockRegistryService.getServersByCapability.mockResolvedValue(mockServers);

      const result = await discoveryService.discoverByIntent('schedule meeting');

      expect(result).toHaveLength(1);
      expect(result[0].domain).toBe('calendar.com');
      expect(mockIntentService.intentToCapabilities).toHaveBeenCalledWith('schedule meeting');
    });

    it('should return empty array for unrecognized intent', async () => {
      mockIntentService.intentToCapabilities.mockResolvedValue([]);

      const result = await discoveryService.discoverByIntent('unknown intent');

      expect(result).toHaveLength(0);
    });
  });

  describe('discoverByCapability', () => {
    it('should discover servers by capability', async () => {
      const mockServers = [createMockServer({ domain: 'email.com' })];
      mockRegistryService.getServersByCapability.mockResolvedValue(mockServers);

      const result = await discoveryService.discoverByCapability('email');

      expect(result).toHaveLength(1);
      expect(result[0].domain).toBe('email.com');
      expect(mockRegistryService.getServersByCapability).toHaveBeenCalledWith('email');
    });
  });

  describe('error handling', () => {
    it('should handle registry service errors gracefully', async () => {
      mockRegistryService.getAllVerifiedServers.mockRejectedValue(new Error('Registry error'));

      const request: DiscoveryRequest = {
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };

      await expect(discoveryService.discoverServers(request)).rejects.toThrow('Discovery failed: Registry error');
    });

    it('should handle intent service errors gracefully', async () => {
      mockIntentService.intentToCapabilities.mockRejectedValue(new Error('Intent service error'));

      const request: DiscoveryRequest = {
        intent: 'test intent',
        limit: 10,
        offset: 0,
        sort_by: 'relevance'
      };

      await expect(discoveryService.discoverServers(request)).rejects.toThrow('Discovery failed: Intent service error');
    });
  });
});
