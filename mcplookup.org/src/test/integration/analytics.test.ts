// Analytics Service Integration Tests
// Tests the analytics service with real in-memory storage operations

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { getStorageService, setStorageService } from '@/lib/storage';

describe('Analytics Service Integration', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    // Reset storage for each test
    setStorageService(null as any);
    analyticsService = new AnalyticsService();
    
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Event Tracking', () => {
    it('should track basic events', async () => {
      await analyticsService.trackEvent({
        type: 'pageview',
        category: 'navigation',
        action: 'page_view',
        label: '/dashboard',
        properties: { page: '/dashboard' },
        userId: 'user123'
      });

      // Verify event was stored
      const storage = getStorageService();
      const result = await storage.getAll('analytics_events');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      
      const event = result.data[0];
      expect(event.type).toBe('pageview');
      expect(event.category).toBe('navigation');
      expect(event.action).toBe('page_view');
      expect(event.userId).toBe('user123');
      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeDefined();
    });

    it('should track page views', async () => {
      await analyticsService.trackPageView(
        '/discover',
        'user123',
        'session456',
        { referrer: 'google.com' }
      );

      const storage = getStorageService();
      const result = await storage.getAll('analytics_events');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      
      const event = result.data[0];
      expect(event.type).toBe('pageview');
      expect(event.category).toBe('navigation');
      expect(event.action).toBe('page_view');
      expect(event.label).toBe('/discover');
      expect(event.properties.page).toBe('/discover');
      expect(event.properties.referrer).toBe('google.com');
      expect(event.userId).toBe('user123');
      expect(event.sessionId).toBe('session456');
    });

    it('should track user actions', async () => {
      await analyticsService.trackUserAction(
        'search',
        'discovery',
        'mcp servers',
        5,
        'user123',
        { query: 'mcp servers', filters: { verified: true } }
      );

      const storage = getStorageService();
      const result = await storage.getAll('analytics_events');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      
      const event = result.data[0];
      expect(event.type).toBe('action');
      expect(event.category).toBe('discovery');
      expect(event.action).toBe('search');
      expect(event.label).toBe('mcp servers');
      expect(event.value).toBe(5);
      expect(event.properties.query).toBe('mcp servers');
      expect(event.properties.filters.verified).toBe(true);
    });

    it('should track API usage', async () => {
      await analyticsService.trackApiUsage(
        '/api/v1/discover',
        'GET',
        200,
        150,
        'user123',
        'api_key_456'
      );

      const storage = getStorageService();
      const result = await storage.getAll('analytics_events');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      
      const event = result.data[0];
      expect(event.type).toBe('api_usage');
      expect(event.category).toBe('api');
      expect(event.action).toBe('GET_/api/v1/discover');
      expect(event.value).toBe(150);
      expect(event.properties.endpoint).toBe('/api/v1/discover');
      expect(event.properties.method).toBe('GET');
      expect(event.properties.statusCode).toBe(200);
      expect(event.properties.responseTime).toBe(150);
      expect(event.properties.apiKeyId).toBe('api_key_456');
    });
  });

  describe('Analytics Metrics', () => {
    beforeEach(async () => {
      // Create test data
      await analyticsService.trackPageView('/dashboard', 'user1', 'session1');
      await analyticsService.trackPageView('/discover', 'user1', 'session1');
      await analyticsService.trackPageView('/dashboard', 'user2', 'session2');
      
      await analyticsService.trackUserAction('search', 'discovery', 'mcp', 5, 'user1');
      await analyticsService.trackUserAction('click', 'navigation', 'menu', 1, 'user2');
      
      await analyticsService.trackApiUsage('/api/v1/discover', 'GET', 200, 150, 'user1');
      await analyticsService.trackApiUsage('/api/v1/register', 'POST', 201, 300, 'user2');
      await analyticsService.trackApiUsage('/api/v1/discover', 'GET', 500, 5000, 'user1');
    });

    it('should calculate basic analytics metrics', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const metrics = await analyticsService.getAnalyticsMetrics(oneHourAgo, now);

      expect(metrics.totalEvents).toBe(8); // All events we created
      expect(metrics.uniqueUsers).toBe(2); // user1 and user2
      expect(metrics.uniqueSessions).toBe(2); // session1 and session2
      
      expect(metrics.topActions).toBeDefined();
      expect(metrics.topActions.length).toBeGreaterThan(0);
      
      expect(metrics.topCategories).toBeDefined();
      expect(metrics.topCategories.length).toBeGreaterThan(0);
      
      expect(metrics.timeSeriesData).toBeDefined();
      expect(Array.isArray(metrics.timeSeriesData)).toBe(true);
      
      expect(metrics.conversionFunnels).toBeDefined();
    });

    it('should calculate performance metrics', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const metrics = await analyticsService.getPerformanceMetrics(oneHourAgo, now);

      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      expect(metrics.p95ResponseTime).toBeGreaterThan(0);
      expect(metrics.errorRate).toBeGreaterThan(0); // We have one 500 error
      expect(metrics.throughput).toBeGreaterThan(0);
      expect(metrics.uptime).toBe(100); // Default value
    });

    it('should filter events by category', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const navigationMetrics = await analyticsService.getAnalyticsMetrics(
        oneHourAgo, 
        now, 
        { category: 'navigation' }
      );

      expect(navigationMetrics.totalEvents).toBe(4); // 3 page views + 1 click action
      expect(navigationMetrics.uniqueUsers).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      // Mock storage to fail
      const mockStorage = {
        set: vi.fn().mockResolvedValue({ success: false, error: 'Storage error' }),
        get: vi.fn().mockResolvedValue({ success: false, error: 'Storage error' }),
        getAll: vi.fn().mockResolvedValue({ success: false, error: 'Storage error' }),
        delete: vi.fn().mockResolvedValue({ success: false, error: 'Storage error' }),
        getByPrefix: vi.fn().mockResolvedValue({ success: false, error: 'Storage error' }),
        healthCheck: vi.fn().mockResolvedValue({ healthy: false })
      };

      setStorageService(mockStorage as any);
      const failingAnalytics = new AnalyticsService();

      // Should not throw, but should log error
      await expect(failingAnalytics.trackEvent({
        type: 'test',
        category: 'test',
        action: 'test',
        properties: {}
      })).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });
  });
});
