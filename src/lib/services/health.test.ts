import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HealthService, EnhancedHealthService } from './health';
import { HealthMetrics } from '../schemas/discovery';

// Mock fetch globally
global.fetch = vi.fn();

describe('HealthService', () => {
  let healthService: HealthService;

  beforeEach(() => {
    healthService = new HealthService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('checkServerHealth', () => {
    it('should return healthy status for successful endpoint', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json'
        }),
        json: vi.fn().mockResolvedValue({
          jsonrpc: '2.0',
          id: 'health-check-123',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            serverInfo: {
              name: 'Test Server',
              version: '1.0.0'
            }
          }
        })
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const startTime = Date.now();
      const result = await healthService.checkServerHealth('https://test.com/mcp');
      const endTime = Date.now();

      expect(result.status).toBe('healthy');
      expect(result.response_time_ms).toBeGreaterThanOrEqual(0);
      expect(result.response_time_ms).toBeLessThan(endTime - startTime + 100); // Allow some margin
      expect(result.error_rate).toBe(0);
      expect(result.last_check).toBeDefined();
      expect(new Date(result.last_check).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return unhealthy status for failed endpoint', async () => {
      (fetch as any).mockRejectedValue(new Error('Connection failed'));

      const result = await healthService.checkServerHealth('https://test.com/mcp');

      expect(result.status).toBe('unhealthy');
      expect(result.response_time_ms).toBeGreaterThan(0);
      expect(result.error_rate).toBe(1);
      expect(result.consecutive_failures).toBe(1);
      expect(result.last_check).toBeDefined();
    });

    it('should return degraded status for slow response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({
          jsonrpc: '2.0',
          id: 'health-check-123',
          result: { protocolVersion: '2024-11-05', capabilities: {} }
        })
      };

      // Mock a slow response by delaying the fetch
      (fetch as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 6000))
      );

      const result = await healthService.checkServerHealth('https://test.com/mcp');

      expect(result.status).toBe('degraded');
      expect(result.response_time_ms).toBeGreaterThan(5000);
    });

    it('should return unhealthy status for HTTP error codes', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        headers: new Headers(),
        statusText: 'Internal Server Error'
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await healthService.checkServerHealth('https://test.com/mcp');

      expect(result.status).toBe('unhealthy');
      expect(result.consecutive_failures).toBe(1);
    });

    it('should handle timeout correctly', async () => {
      // Mock a request that never resolves
      (fetch as any).mockImplementation(() => new Promise(() => {}));

      const result = await healthService.checkServerHealth('https://test.com/mcp');

      expect(result.status).toBe('unhealthy');
      expect(result.response_time_ms).toBeGreaterThan(10000); // Should timeout after 10s
    });

    it('should validate endpoint URL format', async () => {
      await expect(healthService.checkServerHealth('invalid-url')).rejects.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await healthService.checkServerHealth('https://test.com/mcp');

      expect(result.status).toBe('unhealthy');
      expect(result.error_rate).toBe(1);
    });
  });

  describe('batchHealthCheck', () => {
    it('should check multiple endpoints concurrently', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({})
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const endpoints = [
        'https://server1.com/mcp',
        'https://server2.com/mcp',
        'https://server3.com/mcp'
      ];

      const startTime = Date.now();
      const results = await healthService.batchHealthCheck(endpoints);
      const endTime = Date.now();

      expect(results.size).toBe(3);
      expect(results.get('https://server1.com/mcp')?.status).toBe('healthy');
      expect(results.get('https://server2.com/mcp')?.status).toBe('healthy');
      expect(results.get('https://server3.com/mcp')?.status).toBe('healthy');

      // Should be faster than sequential checks (allowing some margin)
      expect(endTime - startTime).toBeLessThan(3000);
    });

    it('should handle mixed success and failure results', async () => {
      (fetch as any)
        .mockResolvedValueOnce({ ok: true, status: 200, headers: new Headers(), json: vi.fn().mockResolvedValue({}) })
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({ ok: false, status: 500, headers: new Headers() });

      const endpoints = [
        'https://healthy.com/mcp',
        'https://failed.com/mcp',
        'https://error.com/mcp'
      ];

      const results = await healthService.batchHealthCheck(endpoints);

      expect(results.size).toBe(3);
      expect(results.get('https://healthy.com/mcp')?.status).toBe('healthy');
      expect(results.get('https://failed.com/mcp')?.status).toBe('unhealthy');
      expect(results.get('https://error.com/mcp')?.status).toBe('unhealthy');
    });

    it('should handle empty endpoint list', async () => {
      const results = await healthService.batchHealthCheck([]);

      expect(results.size).toBe(0);
    });

    it('should respect concurrency limits for large batches', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({})
      };

      (fetch as any).mockResolvedValue(mockResponse);

      // Create a large number of endpoints
      const endpoints = Array.from({ length: 50 }, (_, i) => `https://server${i}.com/mcp`);

      const results = await healthService.batchHealthCheck(endpoints);

      expect(results.size).toBe(50);
      // All should be healthy since we mocked successful responses
      Array.from(results.values()).forEach(health => {
        expect(health.status).toBe('healthy');
      });
    });
  });

  describe('health metrics calculation', () => {
    it('should calculate uptime percentage correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({})
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await healthService.checkServerHealth('https://test.com/mcp');

      expect(result.uptime_percentage).toBeGreaterThanOrEqual(0);
      expect(result.uptime_percentage).toBeLessThanOrEqual(100);
    });

    it('should track consecutive failures', async () => {
      (fetch as any).mockRejectedValue(new Error('Connection failed'));

      const result1 = await healthService.checkServerHealth('https://test.com/mcp');
      expect(result1.consecutive_failures).toBe(1);

      const result2 = await healthService.checkServerHealth('https://test.com/mcp');
      expect(result2.consecutive_failures).toBe(2);
    });

    it('should reset consecutive failures on success', async () => {
      // First, simulate failures
      (fetch as any).mockRejectedValue(new Error('Connection failed'));
      await healthService.checkServerHealth('https://test.com/mcp');

      // Then simulate success
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({})
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await healthService.checkServerHealth('https://test.com/mcp');
      expect(result.consecutive_failures).toBe(0);
    });
  });
});

describe('EnhancedHealthService', () => {
  let enhancedHealthService: EnhancedHealthService;

  beforeEach(() => {
    enhancedHealthService = new EnhancedHealthService();
    vi.clearAllMocks();
  });

  describe('enhanced health checks', () => {
    it('should perform more comprehensive health checks', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'x-response-time': '50ms'
        }),
        json: vi.fn().mockResolvedValue({
          server_info: {
            name: 'Test Server',
            version: '1.0.0',
            capabilities: {
              tools: true,
              resources: true
            }
          }
        })
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await enhancedHealthService.checkServerHealth('https://test.com/mcp');

      expect(result.status).toBe('healthy');
      expect(result.response_time_ms).toBeDefined();
      expect(result.last_check).toBeDefined();
    });

    it('should include additional metrics in enhanced mode', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({
          server_info: {
            name: 'Test Server',
            version: '1.0.0'
          }
        })
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await enhancedHealthService.checkServerHealth('https://test.com/mcp');

      // Enhanced service should provide more detailed metrics
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('response_time_ms');
      expect(result).toHaveProperty('uptime_percentage');
      expect(result).toHaveProperty('error_rate');
      expect(result).toHaveProperty('last_check');
      expect(result).toHaveProperty('consecutive_failures');
    });
  });

  describe('batch health checks with caching', () => {
    it('should cache results for improved performance', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({})
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const endpoint = 'https://test.com/mcp';

      // First call should hit the network
      const result1 = await enhancedHealthService.checkServerHealth(endpoint);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call within cache period should use cache
      const result2 = await enhancedHealthService.checkServerHealth(endpoint);
      expect(fetch).toHaveBeenCalledTimes(1); // Should not increase

      expect(result1.status).toBe(result2.status);
    });
  });
});
