import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GET, OPTIONS } from './route';
import { NextRequest } from 'next/server';

// Mock the services
vi.mock('@/lib/services', () => ({
  getServerlessServices: vi.fn()
}));

// Mock security url validation to prevent real network calls
vi.mock('@/lib/security/url-validation', () => ({
  safeFetch: vi.fn()
}));

// Mock rate limiting
vi.mock('@/lib/security/rate-limiting', () => ({
  healthRateLimit: vi.fn().mockResolvedValue(null),
  addRateLimitHeaders: vi.fn()
}));

// Mock global fetch to prevent any real network calls
global.fetch = vi.fn();

// Mock services
const mockRegistryService = {
  getServersByDomain: vi.fn(),
  storage: {} as any,
  COLLECTION: 'servers',
  getAllServers: vi.fn(),
  getVerifiedServers: vi.fn(),
  getServersByCapability: vi.fn(),
  getServersByCategory: vi.fn(),
  registerServer: vi.fn(),
  updateServer: vi.fn(),
  deleteServer: vi.fn(),
  getServerStats: vi.fn(),
  searchServers: vi.fn(),
  getServersByIntent: vi.fn(),
  getServersByAvailability: vi.fn(),
  getServersByTrustScore: vi.fn(),
  getAllVerifiedServers: vi.fn(),
  getServersByDomainPattern: vi.fn()
} as any;

const mockHealthService = {
  checkServerHealth: vi.fn(),
  getHealthHistory: vi.fn(),
  updateHealthStatus: vi.fn(),
  getHealthStats: vi.fn()
} as any;

describe('/api/v1/health/[domain]', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mock implementation
    const services = await import('@/lib/services');
    vi.mocked(services.getServerlessServices).mockReturnValue({
      registry: mockRegistryService,
      health: mockHealthService,
      user: {} as any,
      audit: {} as any,
      ai: {} as any,
      aiStorage: {} as any,
      intent: {} as any,
      discovery: {} as any,
      verification: {} as any
    });

    // Mock safeFetch to prevent real network calls
    const urlValidation = await import('@/lib/security/url-validation');
    vi.mocked(urlValidation.safeFetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        result: {
          tools: ['mock-tool']
        }
      })
    } as any);

    // Mock global fetch as fallback
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true })
    } as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/v1/health/[domain]', () => {
    const mockServer = {
      domain: 'test.com',
      endpoint: 'https://test.com/.well-known/mcp',
      name: 'Test Server',
      health: {
        status: 'healthy',
        uptime_percentage: 99.5,
        avg_response_time_ms: 150,
        response_time_ms: 150,
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
      }
    };

    it('should return health status for existing server', async () => {
      mockRegistryService.getServersByDomain.mockResolvedValue([mockServer]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.domain).toBe('test.com');
      expect(data.endpoint).toBe('https://test.com/.well-known/mcp');
      expect(data.health.status).toBe('healthy');
      expect(data.capabilities_working).toBeDefined();
      expect(data.ssl_valid).toBeDefined();
      expect(data.trust_score).toBeDefined();
      
      expect(mockRegistryService.getServersByDomain).toHaveBeenCalledWith('test.com');
    });

    it('should return 404 for non-existent server', async () => {
      mockRegistryService.getServersByDomain.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/nonexistent.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'nonexistent.com' }) });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Server not found');
      expect(data.domain).toBe('nonexistent.com');
    });

    it('should return 400 for missing domain', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/health/');
      const response = await GET(request, { params: Promise.resolve({ domain: '' }) });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Domain is required');
    });

    it('should perform real-time health check when requested', async () => {
      const realtimeHealthMetrics = {
        status: 'healthy',
        uptime_percentage: 99.8,
        avg_response_time_ms: 120,
        response_time_ms: 120,
        error_rate: 0.005,
        last_check: new Date().toISOString(),
        consecutive_failures: 0
      };

      mockRegistryService.getServersByDomain.mockResolvedValue([mockServer]);
      mockHealthService.checkServerHealth.mockResolvedValue(realtimeHealthMetrics);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com?realtime=true');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.health.response_time_ms).toBe(120);
      expect(data.health.uptime_percentage).toBe(99.8);
      
      expect(mockHealthService.checkServerHealth).toHaveBeenCalledWith('https://test.com/.well-known/mcp');
    });

    it('should fall back to cached health data when real-time check fails', async () => {
      mockRegistryService.getServersByDomain.mockResolvedValue([mockServer]);
      mockHealthService.checkServerHealth.mockRejectedValue(new Error('Health check failed'));

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com?realtime=true');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      // Should use cached health data from mockServer
      expect(data.health.status).toBe('healthy');
      expect(data.health.response_time_ms).toBe(150);
    });

    it('should calculate trust score correctly', async () => {
      const highTrustServer = {
        ...mockServer,
        health: {
          status: 'healthy',
          uptime_percentage: 99.9,
          avg_response_time_ms: 100,
          response_time_ms: 100,
          error_rate: 0.001,
          last_check: '2025-06-04T00:00:00Z',
          consecutive_failures: 0
        },
        verification: {
          dns_verified: true,
          endpoint_verified: true,
          ssl_verified: true,
          last_verification: '2025-06-04T00:00:00Z',
          verification_method: 'dns-txt'
        }
      };

      mockRegistryService.getServersByDomain.mockResolvedValue([highTrustServer]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.trust_score).toBeGreaterThan(80); // High trust score for verified, healthy server
    });

    it('should calculate lower trust score for unverified server', async () => {
      const unverifiedServer = {
        ...mockServer,
        verification: {
          dns_verified: false,
          endpoint_verified: false,
          ssl_verified: false,
          last_verification: '2025-06-04T00:00:00Z',
          verification_method: 'none'
        }
      };

      mockRegistryService.getServersByDomain.mockResolvedValue([unverifiedServer]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.trust_score).toBeLessThan(50); // Lower trust score for unverified server
    });

    it('should calculate lower trust score for unhealthy server', async () => {
      const unhealthyServer = {
        ...mockServer,
        health: {
          status: 'unhealthy',
          uptime_percentage: 85.0,
          avg_response_time_ms: 5000,
          response_time_ms: 5000,
          error_rate: 0.15,
          last_check: '2025-06-04T00:00:00Z',
          consecutive_failures: 5
        }
      };

      mockRegistryService.getServersByDomain.mockResolvedValue([unhealthyServer]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.trust_score).toBeLessThan(60); // Lower trust score for unhealthy server
    });

    it('should set correct cache headers for cached response', async () => {
      mockRegistryService.getServersByDomain.mockResolvedValue([mockServer]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=60');
    });

    it('should set no-cache headers for real-time response', async () => {
      const realtimeHealthMetrics = {
        status: 'healthy',
        uptime_percentage: 99.8,
        avg_response_time_ms: 120,
        response_time_ms: 120,
        error_rate: 0.005,
        last_check: new Date().toISOString(),
        consecutive_failures: 0
      };

      mockRegistryService.getServersByDomain.mockResolvedValue([mockServer]);
      mockHealthService.checkServerHealth.mockResolvedValue(realtimeHealthMetrics);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com?realtime=true');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should set correct CORS headers', async () => {
      mockRegistryService.getServersByDomain.mockResolvedValue([mockServer]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });

    it('should handle registry service errors gracefully', async () => {
      mockRegistryService.getServersByDomain.mockRejectedValue(new Error('Registry service error'));

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should handle servers with degraded health status', async () => {
      const degradedServer = {
        ...mockServer,
        health: {
          status: 'degraded',
          uptime_percentage: 95.0,
          avg_response_time_ms: 3000,
          response_time_ms: 3000,
          error_rate: 0.05,
          last_check: '2025-06-04T00:00:00Z',
          consecutive_failures: 1
        }
      };

      mockRegistryService.getServersByDomain.mockResolvedValue([degradedServer]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.health.status).toBe('degraded');
      expect(data.trust_score).toBeGreaterThan(40);
      expect(data.trust_score).toBeLessThan(80);
    });

    it('should handle servers with missing health data', async () => {
      const serverWithoutHealth = {
        ...mockServer,
        health: undefined
      };

      mockRegistryService.getServersByDomain.mockResolvedValue([serverWithoutHealth]);

      const request = new NextRequest('http://localhost:3000/api/v1/health/test.com');
      const response = await GET(request, { params: Promise.resolve({ domain: 'test.com' }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.health).toBeUndefined();
      expect(data.trust_score).toBeLessThan(50); // Lower score without health data
    });
  });

  describe('OPTIONS /api/v1/health/[domain]', () => {
    it('should return correct CORS headers for preflight request', async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });
  });
});
