// Admin Features Integration Tests
// Tests admin dashboard, security monitoring, and analytics workflows

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getStorageService, setStorageService } from '@/lib/storage';

// Import API route handlers
import { GET as analyticsGET, POST as analyticsPOST } from '@/app/api/admin/analytics/route';
import { GET as securityGET, POST as securityPOST } from '@/app/api/admin/security/route';
import { GET as realtimeGET, POST as realtimePOST } from '@/app/api/admin/realtime/route';

// Mock auth module
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'admin-user-123',
      email: 'admin@mcplookup.org',
      name: 'Admin User',
      role: 'admin'
    }
  })
}));

// Mock services
vi.mock('@/lib/services/analytics-service', () => ({
  AnalyticsService: vi.fn().mockImplementation(() => ({
    getAnalyticsMetrics: vi.fn().mockResolvedValue({
      totalEvents: 1250,
      uniqueUsers: 89,
      uniqueSessions: 156,
      topActions: [
        { action: 'page_view', count: 450 },
        { action: 'search', count: 320 },
        { action: 'register', count: 89 }
      ],
      topCategories: [
        { category: 'navigation', count: 450 },
        { category: 'discovery', count: 320 },
        { category: 'registration', count: 89 }
      ],
      timeSeriesData: [
        { timestamp: '2025-06-13T00:00:00Z', events: 45 },
        { timestamp: '2025-06-13T01:00:00Z', events: 52 }
      ],
      conversionFunnels: {
        registration: { started: 120, completed: 89, rate: 74.2 }
      }
    }),
    getPerformanceMetrics: vi.fn().mockResolvedValue({
      averageResponseTime: 245,
      p95ResponseTime: 450,
      errorRate: 2.1,
      throughput: 125.5,
      uptime: 99.8
    }),
    getUserBehaviorMetrics: vi.fn().mockResolvedValue({
      averageSessionDuration: 420,
      bounceRate: 35.2,
      pagesPerSession: 3.4,
      topPages: [
        { page: '/discover', views: 450 },
        { page: '/dashboard', views: 320 },
        { page: '/', views: 280 }
      ],
      userFlow: [
        { from: '/', to: '/discover', count: 180 },
        { from: '/discover', to: '/register', count: 89 }
      ],
      retentionRate: 68.5
    }),
    trackEvent: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@/lib/services/domain-transfer-security', () => ({
  DomainTransferSecurityService: vi.fn().mockImplementation(() => ({
    initiateDomainChallenge: vi.fn().mockResolvedValue({
      challenge_id: 'challenge_123456',
      domain: 'example.com',
      txt_record_name: '_mcplookup-challenge.example.com',
      txt_record_value: 'mcplookup-challenge-abc123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }),
    verifyDomainChallenge: vi.fn().mockResolvedValue({
      verified: true,
      challenge_id: 'challenge_123456',
      domain: 'example.com'
    }),
    runVerificationSweep: vi.fn().mockResolvedValue({
      scanned_domains: 45,
      verification_failures: 3,
      expired_registrations: 2,
      actions_taken: 5
    })
  }))
}));

describe('Admin Features Integration Tests', () => {
  beforeEach(() => {
    // Reset storage for each test
    setStorageService(null as any);
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Analytics Dashboard Workflow', () => {
    it('should retrieve comprehensive analytics data', async () => {
      const analyticsRequest = new NextRequest('http://localhost:3000/api/admin/analytics?startDate=2025-06-12T00:00:00Z&endDate=2025-06-13T00:00:00Z');
      
      const response = await analyticsGET(analyticsRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.period).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(data.data).toBeDefined();
      
      // Verify analytics structure
      expect(data.summary.total_events).toBeGreaterThan(0);
      expect(data.summary.unique_users).toBeGreaterThan(0);
      expect(data.data.analytics_metrics).toBeDefined();
      expect(data.data.performance_metrics).toBeDefined();
      expect(data.data.user_behavior_metrics).toBeDefined();
    });

    it('should handle analytics filtering by category', async () => {
      const filteredRequest = new NextRequest('http://localhost:3000/api/admin/analytics?category=navigation&startDate=2025-06-12T00:00:00Z');
      
      const response = await analyticsGET(filteredRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.filters.category).toBe('navigation');
    });

    it('should track analytics events via POST', async () => {
      const trackEventRequest = new NextRequest('http://localhost:3000/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_event',
          event: {
            type: 'admin_action',
            category: 'administration',
            action: 'view_analytics',
            userId: 'admin-user-123',
            properties: { dashboard: 'analytics' }
          }
        })
      });

      const response = await analyticsPOST(trackEventRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain('tracked');
    });

    it('should handle invalid analytics requests', async () => {
      const invalidRequest = new NextRequest('http://localhost:3000/api/admin/analytics?startDate=invalid-date');
      
      const response = await analyticsGET(invalidRequest);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error).toBeDefined();
    });
  });

  describe('Security Monitoring Workflow', () => {
    it('should retrieve security monitoring data', async () => {
      const securityRequest = new NextRequest('http://localhost:3000/api/admin/security?startDate=2025-06-12T00:00:00Z&endDate=2025-06-13T00:00:00Z');
      
      const response = await securityGET(securityRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.period).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(data.data).toBeDefined();
      
      // Verify security data structure
      expect(data.data.pending_challenges).toBeDefined();
      expect(data.data.expired_registrations).toBeDefined();
      expect(data.data.security_events).toBeDefined();
      expect(data.data.threat_summary).toBeDefined();
    });

    it('should initiate domain challenges', async () => {
      const challengeRequest = new NextRequest('http://localhost:3000/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate_domain_challenge',
          domain: 'suspicious-domain.com',
          challengeType: 'suspicious_activity',
          reason: 'Unusual traffic patterns detected'
        })
      });

      const response = await securityPOST(challengeRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain('initiated');
      expect(data.challenge).toBeDefined();
      expect(data.challenge.challenge_id).toBeDefined();
      expect(data.challenge.domain).toBe('suspicious-domain.com');
      expect(data.challenge.txt_record_name).toBe('_mcplookup-challenge.suspicious-domain.com');
    });

    it('should run security sweeps', async () => {
      const sweepRequest = new NextRequest('http://localhost:3000/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_security_sweep'
        })
      });

      const response = await securityPOST(sweepRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain('completed');
      expect(data.result).toBeDefined();
      expect(data.result.scanned_domains).toBeGreaterThanOrEqual(0);
      expect(data.result.actions_taken).toBeGreaterThanOrEqual(0);
    });

    it('should verify domain ownership', async () => {
      const verifyRequest = new NextRequest('http://localhost:3000/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_domain_ownership',
          domain: 'example.com'
        })
      });

      const response = await securityPOST(verifyRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain('verification');
      expect(data.verification).toBeDefined();
      expect(data.verification.domain).toBe('example.com');
    });

    it('should handle invalid security actions', async () => {
      const invalidRequest = new NextRequest('http://localhost:3000/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invalid_action'
        })
      });

      const response = await securityPOST(invalidRequest);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error).toBe('Invalid action');
    });
  });

  describe('Real-time Server Management Workflow', () => {
    it('should get real-time server status', async () => {
      const statusRequest = new NextRequest('http://localhost:3000/api/admin/realtime');
      
      const response = await realtimeGET(statusRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBeDefined();
      expect(data.port).toBe(3001);
      expect(data.clients_connected).toBeGreaterThanOrEqual(0);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.memory_usage).toBeDefined();
      expect(data.metrics.cpu_usage).toBeDefined();
    });

    it('should start real-time server', async () => {
      const startRequest = new NextRequest('http://localhost:3000/api/admin/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start'
        })
      });

      const response = await realtimePOST(startRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain('started');
      expect(data.status).toBe('running');
      expect(data.port).toBe(3001);
    });

    it('should stop real-time server', async () => {
      const stopRequest = new NextRequest('http://localhost:3000/api/admin/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop'
        })
      });

      const response = await realtimePOST(stopRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toContain('stopped');
      expect(data.status).toBe('stopped');
    });

    it('should handle invalid real-time actions', async () => {
      const invalidRequest = new NextRequest('http://localhost:3000/api/admin/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invalid_action'
        })
      });

      const response = await realtimePOST(invalidRequest);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error).toContain('Invalid action');
    });
  });

  describe('Admin Authentication and Authorization', () => {
    it('should require admin role for all endpoints', async () => {
      // Mock non-admin user
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValueOnce({
        user: {
          id: 'regular-user-123',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user'
        }
      } as any);

      const analyticsRequest = new NextRequest('http://localhost:3000/api/admin/analytics');
      const response = await analyticsGET(analyticsRequest);
      
      expect(response.status).toBe(403);
      const errorData = await response.json();
      expect(errorData.error).toBe('Admin access required');
    });

    it('should require authentication for all endpoints', async () => {
      // Mock unauthenticated user
      const { auth } = await import('@/auth');
      vi.mocked(auth).mockResolvedValueOnce(null);

      const securityRequest = new NextRequest('http://localhost:3000/api/admin/security');
      const response = await securityGET(securityRequest);
      
      expect(response.status).toBe(401);
      const errorData = await response.json();
      expect(errorData.error).toBe('Authentication required');
    });
  });

  describe('Cross-Admin Feature Integration', () => {
    it('should track admin actions in analytics', async () => {
      // Perform a security action
      const securityAction = new NextRequest('http://localhost:3000/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_security_sweep'
        })
      });

      const securityResponse = await securityPOST(securityAction);
      expect(securityResponse.status).toBe(200);

      // Track the action in analytics
      const analyticsTrack = new NextRequest('http://localhost:3000/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_event',
          event: {
            type: 'admin_action',
            category: 'security',
            action: 'security_sweep',
            userId: 'admin-user-123',
            properties: { automated: false }
          }
        })
      });

      const analyticsResponse = await analyticsPOST(analyticsTrack);
      expect(analyticsResponse.status).toBe(200);

      // Verify the event was tracked
      const { AnalyticsService } = await import('@/lib/services/analytics-service');
      const mockAnalytics = new AnalyticsService();
      expect(mockAnalytics.trackEvent).toHaveBeenCalled();
    });

    it('should handle concurrent admin operations', async () => {
      // Create multiple concurrent admin requests
      const requests = [
        analyticsGET(new NextRequest('http://localhost:3000/api/admin/analytics')),
        securityGET(new NextRequest('http://localhost:3000/api/admin/security')),
        realtimeGET(new NextRequest('http://localhost:3000/api/admin/realtime'))
      ];

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle service failures gracefully', async () => {
      // Mock service failure
      const { AnalyticsService } = await import('@/lib/services/analytics-service');
      const mockAnalytics = new AnalyticsService();
      vi.mocked(mockAnalytics.getAnalyticsMetrics).mockRejectedValueOnce(new Error('Service unavailable'));

      const analyticsRequest = new NextRequest('http://localhost:3000/api/admin/analytics');
      const response = await analyticsGET(analyticsRequest);
      
      expect(response.status).toBe(500);
      const errorData = await response.json();
      expect(errorData.error).toBe('Failed to get analytics data');
    });

    it('should handle malformed admin requests', async () => {
      const malformedRequest = new NextRequest('http://localhost:3000/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{'
      });

      const response = await securityPOST(malformedRequest);
      expect(response.status).toBe(500); // JSON parsing error
    });
  });
});
