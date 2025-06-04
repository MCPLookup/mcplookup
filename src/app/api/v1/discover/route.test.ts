import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the services
vi.mock('@/lib/services', () => ({
  getServerlessServices: vi.fn()
}));

// Mock the discovery service
const mockDiscoveryService = {
  discoverServers: vi.fn()
};

describe('/api/v1/discover', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mock implementation
    const { getServerlessServices } = await import('@/lib/services');
    (getServerlessServices as any).mockReturnValue({
      discovery: mockDiscoveryService
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/v1/discover', () => {
    it('should discover servers by domain', async () => {
      const mockResponse = {
        servers: [
          {
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
          }
        ],
        total_results: 1,
        has_more: false,
        query_time_ms: 25
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?domain=gmail.com');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers).toHaveLength(1);
      expect(data.servers[0].domain).toBe('gmail.com');
      expect(data.total_results).toBe(1);
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        domain: 'gmail.com',
        limit: 10,
        offset: 0,
        include_health: true,
        include_tools: true,
        include_resources: false,
        sort_by: 'relevance'
      });
    });

    it('should discover servers by capability', async () => {
      const mockResponse = {
        servers: [
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
        ],
        total_results: 1,
        has_more: false,
        query_time_ms: 30
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?capability=email');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers).toHaveLength(1);
      expect(data.servers[0].capabilities.subcategories).toContain('email');
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        capability: 'email'
      });
    });

    it('should discover servers by category', async () => {
      const mockResponse = {
        servers: [
          {
            domain: 'productivity-app.com',
            capabilities: {
              category: 'productivity',
              subcategories: ['calendar', 'tasks'],
              intent_keywords: ['productivity'],
              use_cases: ['Task management']
            }
          }
        ],
        total_results: 1,
        has_more: false,
        query_time_ms: 20
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?category=productivity');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers[0].capabilities.category).toBe('productivity');
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        category: 'productivity'
      });
    });

    it('should discover servers by intent', async () => {
      const mockResponse = {
        servers: [
          {
            domain: 'calendar-app.com',
            capabilities: {
              category: 'productivity',
              subcategories: ['calendar'],
              intent_keywords: ['schedule', 'meeting'],
              use_cases: ['Schedule meetings']
            }
          }
        ],
        total_results: 1,
        has_more: false,
        query_time_ms: 35
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?intent=schedule%20a%20meeting');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers[0].capabilities.intent_keywords).toContain('schedule');
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        intent: 'schedule a meeting'
      });
    });

    it('should handle search queries', async () => {
      const mockResponse = {
        servers: [
          {
            domain: 'search-result.com',
            name: 'Email Management Tool',
            description: 'Advanced email management and automation'
          }
        ],
        total_results: 1,
        has_more: false,
        query_time_ms: 40
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?search=email%20management');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers[0].name).toContain('Email');
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        search: 'email management'
      });
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        servers: [
          { domain: 'server1.com' },
          { domain: 'server2.com' }
        ],
        total_results: 10,
        has_more: true,
        query_time_ms: 25
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?limit=2&offset=5');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.has_more).toBe(true);
      expect(data.total_results).toBe(10);
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        limit: 2,
        offset: 5
      });
    });

    it('should handle verified_only filter', async () => {
      const mockResponse = {
        servers: [
          {
            domain: 'verified-server.com',
            verification: {
              dns_verified: true,
              endpoint_verified: true,
              ssl_verified: true
            }
          }
        ],
        total_results: 1,
        has_more: false,
        query_time_ms: 30
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover?verified_only=true');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers[0].verification.dns_verified).toBe(true);
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        verified_only: true
      });
    });

    it('should return all servers when no parameters provided', async () => {
      const mockResponse = {
        servers: [
          { domain: 'server1.com' },
          { domain: 'server2.com' },
          { domain: 'server3.com' }
        ],
        total_results: 3,
        has_more: false,
        query_time_ms: 15
      };

      mockDiscoveryService.discoverServers.mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/v1/discover');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.servers).toHaveLength(3);
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({});
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
      expect(data.error).toContain('Invalid request data');
    });

    it('should handle service errors gracefully', async () => {
      mockDiscoveryService.discoverServers.mockRejectedValue(new Error('Service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/v1/discover?domain=test.com');
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

      const request = new NextRequest('http://localhost:3000/api/v1/discover?category=productivity&capability=email&verified_only=true&limit=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      expect(mockDiscoveryService.discoverServers).toHaveBeenCalledWith({
        category: 'productivity',
        capability: 'email',
        verified_only: true,
        limit: 10
      });
    });
  });
});
