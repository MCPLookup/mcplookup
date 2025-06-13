// Complete End-to-End Workflow Integration Tests
// Tests entire user journeys from start to finish with real services

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStorageService, setStorageService } from '@/lib/storage';
import { AnalyticsService } from '@/lib/services/analytics-service';

// Mock external services but keep internal logic
vi.mock('@/lib/services/resend-email', () => ({
  sendEmailVerification: vi.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true })
}));

vi.mock('dns', () => ({
  promises: {
    resolveTxt: vi.fn().mockResolvedValue([['mcp_verify_test123']])
  }
}));

vi.mock('@/lib/auth/setup', () => ({
  isUserAdmin: vi.fn().mockImplementation((userId) => {
    return Promise.resolve(userId === 'admin-user-123');
  })
}));

describe('Complete End-to-End Workflow Integration Tests', () => {
  let analyticsService: AnalyticsService;
  let baseUrl: string;

  beforeEach(() => {
    // Reset storage for each test
    setStorageService(null as any);
    analyticsService = new AnalyticsService();
    baseUrl = 'http://localhost:3000';
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Complete Server Owner Journey', () => {
    it('should handle full server owner lifecycle', async () => {
      // Step 1: User discovers the platform
      await analyticsService.trackPageView('/', 'user123', 'session1');
      await analyticsService.trackPageView('/discover', 'user123', 'session1');
      
      // Step 2: User searches for existing servers
      await analyticsService.trackUserAction('search', 'discovery', 'file management', 3, 'user123');
      
      // Step 3: User decides to register their own server
      await analyticsService.trackPageView('/register', 'user123', 'session1');
      
      // Step 4: User registers their server (simulate API call)
      const registrationData = {
        domain: 'myserver.com',
        endpoint: 'https://myserver.com/mcp',
        name: 'My File Server',
        description: 'Personal file management server',
        contact_email: 'owner@myserver.com',
        capabilities: ['file_management', 'storage']
      };

      // Simulate registration through storage (since we can't make real HTTP calls in this test)
      const storage = getStorageService();
      const challengeId = `challenge_${Date.now()}`;
      const challenge = {
        challenge_id: challengeId,
        domain: 'myserver.com',
        txt_record_name: '_mcp-verify.myserver.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      await storage.set('domain_challenges', `challenge_myserver.com_${challengeId}`, challenge);
      await analyticsService.trackServerRegistration('myserver.com', true, 'user123');

      // Step 5: User verifies domain ownership
      const verifiedChallenge = { ...challenge, status: 'verified', verified_at: new Date().toISOString() };
      await storage.set('domain_challenges', `challenge_myserver.com_${challengeId}`, verifiedChallenge);

      // Step 6: Server is registered in the system
      const serverData = {
        ...registrationData,
        verified: true,
        user_id: 'user123',
        created_at: new Date().toISOString(),
        verified_at: new Date().toISOString()
      };
      await storage.set('mcp_servers', 'myserver.com', serverData);

      // Step 7: User manages their server
      await analyticsService.trackPageView('/dashboard', 'user123', 'session2');
      await analyticsService.trackUserAction('update', 'management', 'server_info', 1, 'user123');

      // Verify the complete journey
      const events = await storage.getAll('analytics_events');
      expect(events.success).toBe(true);
      expect(events.data.length).toBeGreaterThan(5);

      const registeredServer = await storage.get('mcp_servers', 'myserver.com');
      expect(registeredServer.success).toBe(true);
      expect(registeredServer.data.verified).toBe(true);
      expect(registeredServer.data.user_id).toBe('user123');

      const verificationChallenge = await storage.get('domain_challenges', `challenge_myserver.com_${challengeId}`);
      expect(verificationChallenge.success).toBe(true);
      expect(verificationChallenge.data.status).toBe('verified');
    });
  });

  describe('Complete AI Agent Journey', () => {
    it('should handle full AI agent discovery and usage workflow', async () => {
      // Pre-populate with servers for discovery
      const storage = getStorageService();
      const testServers = [
        {
          domain: 'gmail.com',
          endpoint: 'https://gmail.com/mcp',
          name: 'Gmail MCP Server',
          description: 'Email management and calendar integration',
          verified: true,
          capabilities: {
            category: 'communication',
            subcategories: ['email', 'calendar'],
            intent_keywords: ['email', 'gmail', 'send', 'read']
          }
        },
        {
          domain: 'github.com',
          endpoint: 'https://github.com/mcp',
          name: 'GitHub MCP Server',
          description: 'Repository management and code operations',
          verified: true,
          capabilities: {
            category: 'development',
            subcategories: ['git', 'repositories'],
            intent_keywords: ['github', 'git', 'code']
          }
        }
      ];

      for (const server of testServers) {
        await storage.set('mcp_servers', server.domain, server);
      }

      // Step 1: AI agent connects to MCPLookup
      await analyticsService.trackApiUsage('/api/mcp', 'POST', 200, 150, 'ai-agent-1');

      // Step 2: AI agent discovers servers by intent
      const discoveryResult = await storage.getAll('mcp_servers');
      expect(discoveryResult.success).toBe(true);
      expect(discoveryResult.data.length).toBe(2);

      // Step 3: AI agent filters servers by capability
      const emailServers = discoveryResult.data.filter(server => 
        server.capabilities.subcategories.includes('email')
      );
      expect(emailServers.length).toBe(1);
      expect(emailServers[0].domain).toBe('gmail.com');

      // Step 4: AI agent uses discovered server
      await analyticsService.trackEvent({
        type: 'mcp_usage',
        category: 'ai_agent',
        action: 'server_connection',
        label: 'gmail.com',
        properties: { 
          agent_id: 'ai-agent-1',
          server_domain: 'gmail.com',
          capability_used: 'email'
        }
      });

      // Step 5: AI agent performs operations
      await analyticsService.trackEvent({
        type: 'mcp_usage',
        category: 'ai_agent',
        action: 'tool_call',
        label: 'send_email',
        properties: { 
          agent_id: 'ai-agent-1',
          server_domain: 'gmail.com',
          tool_name: 'send_email',
          success: true
        }
      });

      // Verify the AI agent journey
      const events = await storage.getAll('analytics_events');
      expect(events.success).toBe(true);
      
      const agentEvents = events.data.filter(event => 
        event.properties && event.properties.agent_id === 'ai-agent-1'
      );
      expect(agentEvents.length).toBeGreaterThan(0);

      const connectionEvent = agentEvents.find(event => event.action === 'server_connection');
      expect(connectionEvent).toBeDefined();
      expect(connectionEvent.properties.server_domain).toBe('gmail.com');

      const toolCallEvent = agentEvents.find(event => event.action === 'tool_call');
      expect(toolCallEvent).toBeDefined();
      expect(toolCallEvent.properties.tool_name).toBe('send_email');
      expect(toolCallEvent.properties.success).toBe(true);
    });
  });

  describe('Complete Admin Journey', () => {
    it('should handle full admin monitoring and management workflow', async () => {
      const storage = getStorageService();
      
      // Pre-populate with data for admin to monitor
      await storage.set('mcp_servers', 'suspicious.com', {
        domain: 'suspicious.com',
        verified: false,
        created_at: new Date().toISOString(),
        last_activity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      });

      // Step 1: Admin logs in and views dashboard
      await analyticsService.trackPageView('/admin/advanced', 'admin-user-123', 'admin-session-1');

      // Step 2: Admin reviews security monitoring
      await analyticsService.trackEvent({
        type: 'admin_action',
        category: 'security',
        action: 'view_security_dashboard',
        userId: 'admin-user-123',
        properties: { dashboard: 'security' }
      });

      // Step 3: Admin initiates domain challenge for suspicious activity
      const challengeId = `admin_challenge_${Date.now()}`;
      const securityChallenge = {
        challenge_id: challengeId,
        domain: 'suspicious.com',
        challenge_type: 'suspicious_activity',
        reason: 'Unusual traffic patterns detected',
        initiated_by: 'admin-user-123',
        txt_record_name: '_mcplookup-challenge.suspicious.com',
        txt_record_value: 'mcplookup-challenge-admin123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      await storage.set('domain_challenges', `challenge_suspicious.com_${challengeId}`, securityChallenge);
      
      await analyticsService.trackEvent({
        type: 'admin_action',
        category: 'security',
        action: 'initiate_domain_challenge',
        userId: 'admin-user-123',
        properties: { 
          domain: 'suspicious.com',
          challenge_type: 'suspicious_activity',
          challenge_id: challengeId
        }
      });

      // Step 4: Admin runs security sweep
      await analyticsService.trackEvent({
        type: 'admin_action',
        category: 'security',
        action: 'security_sweep',
        userId: 'admin-user-123',
        properties: { 
          automated: false,
          scanned_domains: 45,
          issues_found: 3
        }
      });

      // Step 5: Admin reviews analytics
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const metrics = await analyticsService.getAnalyticsMetrics(oneHourAgo, now);

      expect(metrics.totalEvents).toBeGreaterThan(0);
      expect(metrics.uniqueUsers).toBeGreaterThan(0);

      await analyticsService.trackEvent({
        type: 'admin_action',
        category: 'analytics',
        action: 'view_analytics_dashboard',
        userId: 'admin-user-123',
        properties: { 
          time_range: '1h',
          total_events: metrics.totalEvents
        }
      });

      // Step 6: Admin manages real-time server
      await analyticsService.trackEvent({
        type: 'admin_action',
        category: 'system',
        action: 'start_realtime_server',
        userId: 'admin-user-123',
        properties: { 
          server_port: 3001,
          previous_status: 'stopped'
        }
      });

      // Verify the complete admin journey
      const events = await storage.getAll('analytics_events');
      expect(events.success).toBe(true);
      
      const adminEvents = events.data.filter(event => event.userId === 'admin-user-123');
      expect(adminEvents.length).toBeGreaterThan(5);

      const securityEvents = adminEvents.filter(event => event.category === 'security');
      expect(securityEvents.length).toBeGreaterThan(0);

      const challengeEvent = securityEvents.find(event => event.action === 'initiate_domain_challenge');
      expect(challengeEvent).toBeDefined();
      expect(challengeEvent.properties.domain).toBe('suspicious.com');

      const sweepEvent = securityEvents.find(event => event.action === 'security_sweep');
      expect(sweepEvent).toBeDefined();
      expect(sweepEvent.properties.scanned_domains).toBe(45);

      // Verify security challenge was stored
      const storedChallenge = await storage.get('domain_challenges', `challenge_suspicious.com_${challengeId}`);
      expect(storedChallenge.success).toBe(true);
      expect(storedChallenge.data.initiated_by).toBe('admin-user-123');
    });
  });

  describe('Complete Developer Integration Journey', () => {
    it('should handle full developer API integration workflow', async () => {
      const storage = getStorageService();
      const developerId = 'dev-user-456';

      // Step 1: Developer discovers API documentation
      await analyticsService.trackPageView('/docs/api', developerId, 'dev-session-1');

      // Step 2: Developer tests discovery API
      await analyticsService.trackApiUsage('/api/v1/discover', 'GET', 200, 120, developerId);

      // Step 3: Developer integrates MCP tools
      await analyticsService.trackApiUsage('/api/mcp', 'POST', 200, 180, developerId);

      // Step 4: Developer's application uses the platform
      const apiCalls = [
        { endpoint: '/api/v1/discover', method: 'GET', status: 200, time: 150 },
        { endpoint: '/api/mcp', method: 'POST', status: 200, time: 200 },
        { endpoint: '/api/v1/health', method: 'GET', status: 200, time: 50 },
        { endpoint: '/api/v1/discover', method: 'GET', status: 200, time: 130 }
      ];

      for (const call of apiCalls) {
        await analyticsService.trackApiUsage(
          call.endpoint, 
          call.method, 
          call.status, 
          call.time, 
          developerId,
          'api-key-dev-456'
        );
      }

      // Step 5: Developer monitors their usage
      await analyticsService.trackPageView('/dashboard/api-usage', developerId, 'dev-session-2');

      // Verify the developer journey
      const events = await storage.getAll('analytics_events');
      expect(events.success).toBe(true);
      
      const devEvents = events.data.filter(event => event.userId === developerId);
      expect(devEvents.length).toBeGreaterThan(5);

      const apiEvents = devEvents.filter(event => event.type === 'api_usage');
      expect(apiEvents.length).toBe(6); // 2 initial + 4 from loop

      const discoveryCalls = apiEvents.filter(event => 
        event.properties.endpoint === '/api/v1/discover'
      );
      expect(discoveryCalls.length).toBe(3);

      const mcpCalls = apiEvents.filter(event => 
        event.properties.endpoint === '/api/mcp'
      );
      expect(mcpCalls.length).toBe(2);

      // Verify API key tracking
      const keyedCalls = apiEvents.filter(event => 
        event.properties.apiKeyId === 'api-key-dev-456'
      );
      expect(keyedCalls.length).toBe(4);
    });
  });

  describe('Cross-Workflow Data Consistency', () => {
    it('should maintain data consistency across all workflows', async () => {
      const storage = getStorageService();

      // Simulate multiple concurrent workflows
      const workflows = [
        // Server owner workflow
        async () => {
          await analyticsService.trackServerRegistration('workflow-test-1.com', true, 'user1');
          await storage.set('mcp_servers', 'workflow-test-1.com', {
            domain: 'workflow-test-1.com',
            verified: true,
            user_id: 'user1'
          });
        },
        
        // AI agent workflow
        async () => {
          await analyticsService.trackEvent({
            type: 'mcp_usage',
            category: 'ai_agent',
            action: 'server_connection',
            properties: { agent_id: 'agent1', server_domain: 'workflow-test-1.com' }
          });
        },
        
        // Admin workflow
        async () => {
          await analyticsService.trackEvent({
            type: 'admin_action',
            category: 'security',
            action: 'security_sweep',
            userId: 'admin-user-123',
            properties: { scanned_domains: 1 }
          });
        },
        
        // Developer workflow
        async () => {
          await analyticsService.trackApiUsage('/api/v1/discover', 'GET', 200, 100, 'dev1');
        }
      ];

      // Execute all workflows concurrently
      await Promise.all(workflows.map(workflow => workflow()));

      // Verify data consistency
      const events = await storage.getAll('analytics_events');
      expect(events.success).toBe(true);
      expect(events.data.length).toBe(4);

      const servers = await storage.getAll('mcp_servers');
      expect(servers.success).toBe(true);
      expect(servers.data.length).toBe(1);

      // Verify all event types are present
      const eventTypes = new Set(events.data.map(event => event.type));
      expect(eventTypes.has('registration')).toBe(true);
      expect(eventTypes.has('mcp_usage')).toBe(true);
      expect(eventTypes.has('admin_action')).toBe(true);
      expect(eventTypes.has('api_usage')).toBe(true);

      // Verify data integrity
      const serverEvent = events.data.find(event => event.type === 'registration');
      const serverData = servers.data.find(server => server.domain === 'workflow-test-1.com');
      
      expect(serverEvent.properties.domain).toBe(serverData.domain);
      expect(serverEvent.properties.success).toBe(serverData.verified);
    });
  });
});
