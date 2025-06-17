import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the services
vi.mock('@/lib/services', () => ({
  getServerlessServices: vi.fn()
}));

// Mock the storage service for test mode
vi.mock('@/lib/storage', () => ({
  getStorageService: vi.fn()
}));

// Mock the discovery service
const mockDiscoveryService = {
  discoverServers: vi.fn()
};

// Mock storage service for test mode
const mockStorageService = {
  get: vi.fn(),
  getAll: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn()
};

describe('/api/v1/discover', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mock implementation
    const { getServerlessServices } = await import('@/lib/services');
    (getServerlessServices as any).mockReturnValue({
      discovery: mockDiscoveryService
    });

    // Setup storage service mock for test mode with default empty response
    const { getStorageService } = await import('@/lib/storage');
    (getStorageService as any).mockReturnValue(mockStorageService);
    
    // Default storage mock - return empty results
    mockStorageService.getAll.mockResolvedValue({
      success: true,
      data: []
    });
    
    mockStorageService.get.mockResolvedValue({
      success: false,
      data: null
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/v1/discover', () => {
    it('should discover servers by domain', async () => {
      const mockServer = {
        domain: 'gmail.com',
        endpoint: 'https://gmail.com/.well-known/mcp',
        name: 'Gmail MCP Server',
        description: 'Gmail integration for MCP',
        capabilities: {
          category: 'communication',
          subcategories: ['email'],
          intent_keywords: ['email', 'gmail'],
          use_cases: ['Send emails', 'Read emails']
        },
        verification: {
          dns_verified: true,
          endpoint_verified: true,
          ssl_verified: true
        },
        health: {
          status: 'healthy',
          response_time_ms: 150
        }
      };

      // Mock storage service to return the server for test mode
      mockStorageService.get.mockResolvedValue({
        success: true,
        data: mockServer
      });

      const request = new NextRequest('http://localhost:3000/api/v1/discover?domain=gmail.com');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers).toHaveLength(1);
      expect(data.servers[0].domain).toBe('gmail.com');
      expect(data.total_results).toBe(1);
      
      expect(mockStorageService.get).toHaveBeenCalledWith('mcp_servers', 'gmail.com');
    });

    it('should discover servers by capability', async () => {
      // Mock storage to return servers with matching capability
      const mockServers = [
        {
          domain: 'email-service.com',
          endpoint: 'https://email-service.com/.well-known/mcp',
          name: 'Email Service',
          capabilities: {
            category: 'communication',
            subcategories: ['email'],
            intent_keywords: ['email'],
            use_cases: ['Email management']
          }
        }
      ];

      mockStorageService.getAll.mockResolvedValue({
        success: true,
        data: mockServers
      });

      const request = new NextRequest('http://localhost:3000/api/v1/discover?capability=email');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers).toHaveLength(1);
      expect(data.servers[0].capabilities.subcategories).toContain('email');
      
      expect(mockStorageService.getAll).toHaveBeenCalledWith('mcp_servers');
    });

    it('should discover servers by category', async () => {
      // Mock storage to return servers with matching category
      const mockServers = [
        {
          domain: 'productivity-app.com',
          capabilities: {
            category: 'productivity',
            subcategories: ['calendar', 'tasks'],
            intent_keywords: ['productivity'],
            use_cases: ['Task management']
          }
        }
      ];

      mockStorageService.getAll.mockResolvedValue({
        success: true,
        data: mockServers
      });

      const request = new NextRequest('http://localhost:3000/api/v1/discover?category=productivity');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers[0].capabilities.category).toBe('productivity');
      
      expect(mockStorageService.getAll).toHaveBeenCalledWith('mcp_servers');
    });

    it('should discover servers by intent', async () => {
      // Mock storage to return servers for intent filtering in test mode
      const mockServers = [
        {
          domain: 'calendar-app.com',
          capabilities: {
            category: 'productivity',
            subcategories: ['calendar'],
            intent_keywords: ['schedule', 'meeting'],
            use_cases: ['Schedule meetings']
          }
        }
      ];

      mockStorageService.getAll.mockResolvedValue({
        success: true,
        data: mockServers
      });

      const request = new NextRequest('http://localhost:3000/api/v1/discover?intent=schedule%20a%20meeting');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers[0].capabilities.intent_keywords).toContain('schedule');
      
      expect(mockStorageService.getAll).toHaveBeenCalledWith('mcp_servers');
    });

    it('should handle search queries', async () => {
      // Mock storage to return servers for keyword search in test mode
      const mockServers = [
        {
          domain: 'search-result.com',
          name: 'Email Management Tool',
          description: 'Advanced email management and automation'
        }
      ];

      mockStorageService.getAll.mockResolvedValue({
        success: true,
        data: mockServers
      });

      const request = new NextRequest('http://localhost:3000/api/v1/discover?keywords=email,management');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.servers[0].name).toContain('Email');

      expect(mockStorageService.getAll).toHaveBeenCalledWith('mcp_servers');
    });

    it('should handle pagination parameters', async () => {
      // Mock storage to return servers for pagination test in test mode
      const mockServers = [
        { domain: 'server1.com' },
        { domain: 'server2.com' },
        { domain: 'server3.com' },
        { domain: 'server4.com' },
        { domain: 'server5.com' }
      ];

      mockStorageService.getAll.mockResolvedValue({
        success: true,
        data: mockServers
      });

      const request = new NextRequest('http://localhost:3000/api/v1/discover?limit=2&offset=1');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers).toHaveLength(2); // Should return 2 servers due to limit
      
      expect(mockStorageService.getAll).toHaveBeenCalledWith('mcp_servers');
    });



    it('should return all servers when no parameters provided', async () => {
      // Mock storage to return all servers for test mode
      const mockServers = [
        { domain: 'server1.com' },
        { domain: 'server2.com' },
        { domain: 'server3.com' }
      ];

      mockStorageService.getAll.mockResolvedValue({
        success: true,
        data: mockServers
      });

      const request = new NextRequest('http://localhost:3000/api/v1/discover');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers).toHaveLength(3);
      
      expect(mockStorageService.getAll).toHaveBeenCalledWith('mcp_servers');
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        servers: [],
        total_results: 0,
        has_more: false,
        query_time_ms: 10
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?domain=nonexistent.com');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers).toHaveLength(0);
      expect(data.total_results).toBe(0);
    });

    it('should return 400 for invalid query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/discover?limit=invalid');
      const response = await GET(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Invalid request parameters');
    });

    it('should handle service errors gracefully', async () => {
      mockDiscoveryService.discoverServers.mockRejectedValue(new Error('Service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/v1/discover?domain=test.com&_useMockService=true');
      const response = await GET(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should set correct CORS headers', async () => {
      const mockResponse = {
        servers: [],
        total_results: 0,
        has_more: false,
        query_time_ms: 5
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover');
      const response = await GET(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://mcplookup.org');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });

    it('should set cache headers for performance', async () => {
      const mockResponse = {
        servers: [],
        total_results: 0,
        has_more: false,
        query_time_ms: 5
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=60');
    });

    it('should handle multiple query parameters correctly', async () => {
      const mockResponse = {
        servers: [
          {
            domain: 'filtered-server.com',
            capabilities: {
              category: 'productivity',
              subcategories: ['email'],
              intent_keywords: ['email'],
              use_cases: ['Email management']
            },
            verification: {
              dns_verified: true,
              endpoint_verified: true,
              ssl_verified: true
            }
          }
        ],
        total_results: 1,
        has_more: false,
        query_time_ms: 45
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?category=productivity&capability=email&verified_only=true&limit=10&_useMockService=true');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        auth_types: undefined,
        capability: 'email',
        category: 'productivity',
        cors_required: undefined,
        domain: undefined,
        include_health: true,
        include_resources: false,
        include_tools: true,
        intent: undefined,
        keywords: undefined,
        limit: 10,
        max_response_time: undefined,
        min_uptime: undefined,
        offset: 0,
        sort_by: 'relevance',
        transport: undefined,
        use_case: undefined
      });
    });
  });
});
