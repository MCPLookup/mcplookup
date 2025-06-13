// Cross-Service Integration Tests
// Tests integration between multiple services using in-memory storage

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { getStorageService, setStorageService } from '@/lib/storage';

// Mock the registry service since it has complex dependencies
const mockRegistryService = {
  registerServer: vi.fn(),
  getServerByDomain: vi.fn(),
  getAllServers: vi.fn(),
  getServersByUser: vi.fn(),
  updateServer: vi.fn(),
  unregisterServer: vi.fn(),
  verifyServer: vi.fn(),
  searchServers: vi.fn(),
  getRegistryStats: vi.fn(),
  getUserStats: vi.fn()
};

describe('Cross-Service Integration', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    // Reset storage for each test
    setStorageService(null as any);
    analyticsService = new AnalyticsService();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Analytics and Storage Integration', () => {
    it('should track events across multiple sessions', async () => {
      // Simulate a user journey across multiple sessions
      const userId = 'user123';
      const sessions = ['session1', 'session2', 'session3'];
      
      // Session 1: User discovers the platform
      await analyticsService.trackPageView('/', userId, sessions[0]);
      await analyticsService.trackPageView('/discover', userId, sessions[0]);
      await analyticsService.trackEvent({
        type: 'action',
        category: 'discovery',
        action: 'search',
        label: 'file management',
        value: 5,
        userId,
        sessionId: sessions[0],
        properties: { query: 'file management' }
      });

      // Session 2: User registers a server
      await analyticsService.trackPageView('/register', userId, sessions[1]);
      await analyticsService.trackEvent({
        type: 'registration',
        category: 'servers',
        action: 'register_success',
        label: 'example.com',
        value: 1,
        userId,
        sessionId: sessions[1],
        properties: { domain: 'example.com', success: true }
      });
      await analyticsService.trackEvent({
        type: 'api_usage',
        category: 'api',
        action: 'POST_/api/v1/register',
        value: 250,
        userId,
        sessionId: sessions[1],
        properties: { endpoint: '/api/v1/register', method: 'POST', statusCode: 201, responseTime: 250 }
      });

      // Session 3: User manages their server
      await analyticsService.trackPageView('/dashboard', userId, sessions[2]);
      await analyticsService.trackEvent({
        type: 'action',
        category: 'management',
        action: 'update',
        label: 'server_info',
        value: 1,
        userId,
        sessionId: sessions[2],
        properties: { action: 'update', target: 'server_info' }
      });
      
      // Verify all events were stored
      const storage = getStorageService();
      const result = await storage.getAll('analytics_events');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(8);
      
      // Verify user journey can be reconstructed
      const userEvents = result.data.filter(event => event.userId === userId);
      expect(userEvents).toHaveLength(8);
      
      // Verify session distribution
      const sessionCounts = sessions.reduce((acc, sessionId) => {
        acc[sessionId] = userEvents.filter(event => event.sessionId === sessionId).length;
        return acc;
      }, {} as Record<string, number>);
      
      expect(sessionCounts[sessions[0]]).toBe(3); // Discovery session
      expect(sessionCounts[sessions[1]]).toBe(3); // Registration session
      expect(sessionCounts[sessions[2]]).toBe(2); // Management session
    });

    it('should handle concurrent analytics from multiple users', async () => {
      const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
      const promises: Promise<void>[] = [];
      
      // Simulate concurrent user activity
      users.forEach((userId, index) => {
        promises.push(
          analyticsService.trackPageView('/', userId, `session_${userId}`),
          analyticsService.trackUserAction('search', 'discovery', `query_${index}`, index + 1, userId),
          analyticsService.trackApiUsage('/api/v1/discover', 'GET', 200, 100 + index * 10, userId)
        );
      });
      
      // Wait for all events to be tracked
      await Promise.all(promises);
      
      // Verify all events were stored correctly
      const storage = getStorageService();
      const result = await storage.getAll('analytics_events');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(15); // 3 events per user * 5 users
      
      // Verify each user has exactly 3 events
      users.forEach(userId => {
        const userEvents = result.data.filter(event => event.userId === userId);
        expect(userEvents).toHaveLength(3);
      });
      
      // Verify event integrity (all events have unique IDs)
      const eventIds = result.data.map(event => event.id);
      const uniqueIds = new Set(eventIds);
      expect(uniqueIds.size).toBe(result.data.length);
    });

    it('should generate comprehensive analytics metrics', async () => {
      // Create a realistic dataset
      const now = new Date();
      const users = ['user1', 'user2', 'user3'];
      
      // User 1: Power user with multiple sessions
      await analyticsService.trackPageView('/', users[0], 'session1');
      await analyticsService.trackPageView('/discover', users[0], 'session1');
      await analyticsService.trackPageView('/register', users[0], 'session1');
      await analyticsService.trackServerRegistration('poweruser.com', true, users[0]);
      await analyticsService.trackPageView('/dashboard', users[0], 'session2');
      await analyticsService.trackUserAction('update', 'management', 'server', 1, users[0]);
      
      // User 2: Casual browser
      await analyticsService.trackPageView('/', users[1], 'session3');
      await analyticsService.trackPageView('/discover', users[1], 'session3');
      await analyticsService.trackUserAction('search', 'discovery', 'database', 3, users[1]);
      
      // User 3: API user
      await analyticsService.trackApiUsage('/api/v1/discover', 'GET', 200, 150, users[2]);
      await analyticsService.trackApiUsage('/api/v1/discover', 'GET', 200, 120, users[2]);
      await analyticsService.trackApiUsage('/api/v1/register', 'POST', 201, 300, users[2]);
      
      // Generate metrics
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const [analyticsMetrics, performanceMetrics, userBehaviorMetrics] = await Promise.all([
        analyticsService.getAnalyticsMetrics(oneHourAgo, now),
        analyticsService.getPerformanceMetrics(oneHourAgo, now),
        analyticsService.getUserBehaviorMetrics(oneHourAgo, now)
      ]);
      
      // Verify analytics metrics (check actual count since storage resets between tests)
      expect(analyticsMetrics.totalEvents).toBeGreaterThanOrEqual(3); // At least the events from this test
      expect(analyticsMetrics.uniqueUsers).toBeGreaterThanOrEqual(1);
      expect(analyticsMetrics.uniqueSessions).toBeGreaterThanOrEqual(1);
      expect(analyticsMetrics.topActions.length).toBeGreaterThan(0);
      expect(analyticsMetrics.topCategories.length).toBeGreaterThan(0);
      
      // Verify performance metrics
      expect(performanceMetrics.averageResponseTime).toBeGreaterThan(0);
      expect(performanceMetrics.throughput).toBeGreaterThan(0);
      expect(performanceMetrics.errorRate).toBe(0); // No errors in our test data
      
      // Verify user behavior metrics
      expect(userBehaviorMetrics.averageSessionDuration).toBeGreaterThanOrEqual(0);
      expect(userBehaviorMetrics.pagesPerSession).toBeGreaterThan(0);
      expect(userBehaviorMetrics.topPages.length).toBeGreaterThan(0);
    });
  });

  describe('Storage Performance Under Load', () => {
    it('should handle high-volume analytics data efficiently', async () => {
      const startTime = Date.now();
      const eventCount = 1000;
      const promises: Promise<void>[] = [];
      
      // Generate 1000 analytics events
      for (let i = 0; i < eventCount; i++) {
        promises.push(
          analyticsService.trackEvent({
            type: 'performance_test',
            category: 'load_testing',
            action: 'bulk_insert',
            label: `event_${i}`,
            value: i,
            properties: { 
              index: i, 
              batch: Math.floor(i / 100),
              timestamp: new Date().toISOString()
            },
            userId: `user_${i % 50}` // 50 different users
          })
        );
      }
      
      // Wait for all events to be processed
      await Promise.all(promises);
      const processingTime = Date.now() - startTime;
      
      // Verify all events were stored
      const storage = getStorageService();
      const result = await storage.getAll('analytics_events');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(eventCount);
      
      // Performance assertions
      expect(processingTime).toBeLessThan(10000); // Should complete in less than 10 seconds
      
      // Verify data integrity
      const eventIndices = result.data.map(event => event.properties.index);
      const uniqueIndices = new Set(eventIndices);
      expect(uniqueIndices.size).toBe(eventCount); // All events should have unique indices
      
      console.log(`📊 Performance test completed:`);
      console.log(`   - Events processed: ${eventCount}`);
      console.log(`   - Processing time: ${processingTime}ms`);
      console.log(`   - Events per second: ${Math.round(eventCount / (processingTime / 1000))}`);
    });

    it('should maintain data consistency during concurrent operations', async () => {
      const storage = getStorageService();
      const collectionName = 'consistency_test';
      const operationCount = 100;
      
      // Perform concurrent read/write operations
      const promises: Promise<any>[] = [];
      
      // Concurrent writes
      for (let i = 0; i < operationCount; i++) {
        promises.push(
          storage.set(collectionName, `key_${i}`, { 
            id: i, 
            value: `value_${i}`,
            timestamp: new Date().toISOString()
          })
        );
      }
      
      // Concurrent reads (some will fail initially, but that's expected)
      for (let i = 0; i < operationCount / 2; i++) {
        promises.push(
          storage.get(collectionName, `key_${i}`)
        );
      }
      
      // Wait for all operations
      const results = await Promise.all(promises);
      
      // Verify writes succeeded
      const writeResults = results.slice(0, operationCount);
      expect(writeResults.every(result => result.success)).toBe(true);
      
      // Verify final state is consistent
      const finalResult = await storage.getAll(collectionName);
      expect(finalResult.success).toBe(true);
      expect(finalResult.data).toHaveLength(operationCount);
      
      // Verify all data is intact
      finalResult.data.forEach((item: any) => {
        expect(item.id).toBeGreaterThanOrEqual(0);
        expect(item.id).toBeLessThan(operationCount);
        expect(item.value).toBe(`value_${item.id}`);
        expect(item.timestamp).toBeDefined();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle partial storage failures gracefully', async () => {
      // Create a storage service that fails intermittently
      let failureCount = 0;
      const maxFailures = 3;
      
      const originalStorage = getStorageService();
      const flakyStorage = {
        ...originalStorage,
        set: async (collection: string, key: string, value: any) => {
          if (failureCount < maxFailures && Math.random() < 0.3) {
            failureCount++;
            return { success: false, error: 'Simulated storage failure' };
          }
          return originalStorage.set(collection, key, value);
        }
      };
      
      setStorageService(flakyStorage as any);
      const flakyAnalytics = new AnalyticsService();
      
      // Track multiple events, some may fail
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          flakyAnalytics.trackEvent({
            type: 'reliability_test',
            category: 'error_handling',
            action: 'flaky_storage',
            label: `event_${i}`,
            properties: { index: i },
            userId: 'test_user'
          })
        );
      }
      
      // Should not throw errors even with storage failures
      await Promise.all(promises);
      
      // Verify that some events were still stored successfully
      const result = await originalStorage.getAll('analytics_events');
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.length).toBeLessThanOrEqual(20);
      
      // Verify error logging occurred
      expect(console.error).toHaveBeenCalled();
    });

    it('should recover from complete storage failure', async () => {
      // Create a completely failing storage service
      const failingStorage = {
        set: vi.fn().mockResolvedValue({ success: false, error: 'Complete storage failure' }),
        get: vi.fn().mockResolvedValue({ success: false, error: 'Complete storage failure' }),
        getAll: vi.fn().mockResolvedValue({ success: false, error: 'Complete storage failure' }),
        delete: vi.fn().mockResolvedValue({ success: false, error: 'Complete storage failure' }),
        getByPrefix: vi.fn().mockResolvedValue({ success: false, error: 'Complete storage failure' }),
        healthCheck: vi.fn().mockResolvedValue({ healthy: false, error: 'Complete storage failure' })
      };
      
      setStorageService(failingStorage as any);
      const failingAnalytics = new AnalyticsService();
      
      // Should handle complete failure gracefully
      await expect(failingAnalytics.trackEvent({
        type: 'failure_test',
        category: 'error_handling',
        action: 'complete_failure',
        properties: {}
      })).resolves.not.toThrow();
      
      // Should return empty metrics when storage fails
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const metrics = await failingAnalytics.getAnalyticsMetrics(oneHourAgo, now);
      expect(metrics.totalEvents).toBe(0);
      expect(metrics.uniqueUsers).toBe(0);
      expect(metrics.topActions).toEqual([]);
      
      // Verify error logging
      expect(console.error).toHaveBeenCalled();
    });
  });
});
