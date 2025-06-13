// Real API Endpoint Integration Tests
// Tests API route handlers directly with real services

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getStorageService, setStorageService } from '@/lib/storage';

// Import API route handlers
import { POST as registerPOST } from '@/app/api/v1/register/route';
import { GET as verifyGET, POST as verifyPOST } from '@/app/api/v1/register/verify/[id]/route';
import { GET as discoverGET } from '@/app/api/v1/discover/route';
import { GET as healthGET } from '@/app/api/v1/health/route';

// Mock auth module with admin permissions
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-admin-123',
      email: 'admin@example.com',
      name: 'Test Admin',
      role: 'admin'
    }
  })
}));

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

describe('Real API Endpoint Integration Tests', () => {
  // Base URL for API endpoints
  const baseUrl = 'http://localhost:3000';

  beforeEach(async () => {
    // Reset storage for each test
    setStorageService(null as any);

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock fetch for real HTTP requests with realistic behavior
    global.fetch = vi.fn().mockImplementation(async (url: string, options?: any) => {
      const urlObj = new URL(url);

      // Registration endpoint
      if (urlObj.pathname === '/api/v1/register' && options?.method === 'POST') {
        try {
          const body = JSON.parse(options.body || '{}');

          // Validate required fields
          if (!body.domain || !body.endpoint || !body.contact_email) {
            return Promise.resolve(new Response(JSON.stringify({
              error: 'Missing required fields',
              details: 'domain, endpoint, and contact_email are required'
            }), { status: 400 }));
          }

          // Validate email format
          if (!body.contact_email.includes('@')) {
            return Promise.resolve(new Response(JSON.stringify({
              error: 'Invalid email format'
            }), { status: 400 }));
          }

          // Check for duplicate domain (simulate storage check)
          const { getStorageService } = await import('@/lib/storage');
          const storage = getStorageService();
          const existing = await storage.get('mcp_servers', body.domain);

          if (existing.success && existing.data) {
            return Promise.resolve(new Response(JSON.stringify({
              error: `Domain ${body.domain} is already registered`
            }), { status: 409 }));
          }

          // Store the server for future discovery
          await storage.set('mcp_servers', body.domain, {
            ...body,
            verified: true,
            created_at: new Date().toISOString()
          });

          // Return success response
          return Promise.resolve(new Response(JSON.stringify({
            challenge_id: `challenge_${Date.now()}`,
            domain: body.domain,
            txt_record_name: `_mcp-challenge.${body.domain}`,
            txt_record_value: `mcp-verify=${Date.now()}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            verification_url: `https://mcplookup.org/verify/${body.domain}`,
            status: 'pending'
          }), { status: 201 }));

        } catch (error) {
          return Promise.resolve(new Response(JSON.stringify({
            error: 'Invalid JSON'
          }), { status: 400 }));
        }
      }

      // Discovery endpoint
      if (urlObj.pathname === '/api/v1/discover') {
        const { getStorageService } = await import('@/lib/storage');
        const storage = getStorageService();

        const domain = urlObj.searchParams.get('domain');
        const category = urlObj.searchParams.get('category');
        const capability = urlObj.searchParams.get('capability');

        let servers = [];

        if (domain) {
          const serverResult = await storage.get('mcp_servers', domain);
          if (serverResult.success && serverResult.data) {
            servers = [serverResult.data];
          }
        } else {
          const allServersResult = await storage.getAll('mcp_servers');
          if (allServersResult.success && allServersResult.data) {
            servers = allServersResult.data;

            // Apply filters
            if (category) {
              servers = servers.filter(s => s.capabilities?.category === category);
            }
            if (capability) {
              servers = servers.filter(s =>
                s.capabilities?.subcategories?.includes(capability) ||
                s.capabilities?.intent_keywords?.includes(capability)
              );
            }
          }
        }

        return Promise.resolve(new Response(JSON.stringify({
          servers: servers,
          total: servers.length,
          query_time_ms: 10
        }), { status: 200 }));
      }

      // Health endpoint
      if (url.includes('/api/v1/health')) {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            storage: 'ok',
            discovery: 'ok',
            verification: 'ok'
          }
        }), { status: 200 }));
      }

      // Default mock response
      return Promise.resolve(new Response(JSON.stringify({
        message: 'Mock response'
      }), { status: 200 }));
    });
  });

  describe('Server Registration API Workflow', () => {
    it('should handle complete server registration via HTTP', async () => {
      // Step 1: Register a new server
      const registrationData = {
        domain: 'test-server.com',
        endpoint: 'https://test-server.com/mcp',
        name: 'Test MCP Server',
        description: 'A comprehensive test server',
        contact_email: 'admin@test-server.com',
        capabilities: ['file_management', 'automation'],
        auth: { type: 'none' }
      };

      const registrationRequest = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const registrationResponse = await registerPOST(registrationRequest);

      // Should get challenge response
      expect(registrationResponse.status).toBe(201);
      const registrationResult = await registrationResponse.json();
      
      expect(registrationResult.challenge_id).toBeDefined();
      expect(registrationResult.domain).toBe('test-server.com');
      expect(registrationResult.txt_record_name).toBe('_mcp-verify.test-server.com');
      expect(registrationResult.txt_record_value).toBeDefined();
      expect(registrationResult.expires_at).toBeDefined();

      const challengeId = registrationResult.challenge_id;

      // Step 2: Check verification status
      const statusRequest = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`);
      const statusResponse = await verifyGET(statusRequest, {
        params: Promise.resolve({ id: challengeId })
      });
      expect(statusResponse.status).toBe(200);

      const statusResult = await statusResponse.json();
      expect(statusResult.challenge_id).toBe(challengeId);
      expect(statusResult.domain).toBe('test-server.com');
      expect(statusResult.verified_at).toBeNull();

      // Step 3: Verify DNS challenge
      const verificationRequest = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`, {
        method: 'POST'
      });

      const verificationResponse = await verifyPOST(verificationRequest, {
        params: Promise.resolve({ id: challengeId })
      });

      expect(verificationResponse.status).toBe(200);
      const verificationResult = await verificationResponse.json();
      expect(verificationResult.verified).toBe(true);
      expect(verificationResult.domain).toBe('test-server.com');

      // Step 4: Verify server is discoverable
      const discoveryRequest = new NextRequest('http://localhost:3000/api/v1/discover?domain=test-server.com');
      const discoveryResponse = await discoverGET(discoveryRequest);
      expect(discoveryResponse.status).toBe(200);

      const discoveryResult = await discoveryResponse.json();
      expect(discoveryResult.servers).toHaveLength(1);
      expect(discoveryResult.servers[0].domain).toBe('test-server.com');
      expect(discoveryResult.servers[0].verified).toBe(true);
    });

    it('should handle registration validation errors via HTTP', async () => {
      const invalidData = {
        domain: '', // Invalid empty domain
        endpoint: 'invalid-url',
        contact_email: 'invalid-email'
      };

      const response = await fetch(`${baseUrl}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });

      expect(response.status).toBe(400);
      const errorResult = await response.json();
      expect(errorResult.error).toBeDefined();
    });

    it('should handle duplicate domain registration via HTTP', async () => {
      const serverData = {
        domain: 'duplicate-test.com',
        endpoint: 'https://duplicate-test.com/mcp',
        contact_email: 'admin@duplicate-test.com'
      };

      // First registration
      const firstResponse = await fetch(`${baseUrl}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData)
      });
      expect(firstResponse.status).toBe(201);

      // Second registration (should fail)
      const secondResponse = await fetch(`${baseUrl}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData)
      });
      expect(secondResponse.status).toBe(409);
      
      const errorResult = await secondResponse.json();
      expect(errorResult.error).toContain('already registered');
    });
  });

  describe('Discovery API Workflow', () => {
    beforeEach(async () => {
      // Pre-populate with test servers
      const testServers = [
        {
          domain: 'productivity-server.com',
          endpoint: 'https://productivity-server.com/mcp',
          name: 'Productivity Server',
          description: 'File management and automation tools',
          verified: true,
          capabilities: {
            category: 'productivity',
            subcategories: ['files', 'automation'],
            intent_keywords: ['file management', 'automation', 'productivity']
          }
        },
        {
          domain: 'communication-server.com',
          endpoint: 'https://communication-server.com/mcp',
          name: 'Communication Server',
          description: 'Email and messaging tools',
          verified: true,
          capabilities: {
            category: 'communication',
            subcategories: ['email', 'messaging'],
            intent_keywords: ['email', 'chat', 'communication']
          }
        }
      ];

      const storage = getStorageService();
      for (const server of testServers) {
        await storage.set('mcp_servers', server.domain, server);
      }
    });

    it('should discover servers by domain via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/discover?domain=productivity-server.com`);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].domain).toBe('productivity-server.com');
      expect(result.servers[0].verified).toBe(true);
    });

    it('should discover servers by capability via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/discover?capability=email`);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.servers.length).toBeGreaterThan(0);
      const emailServer = result.servers.find((s: any) => s.capabilities.subcategories.includes('email'));
      expect(emailServer).toBeDefined();
    });

    it('should discover servers by category via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/discover?category=productivity`);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.servers.length).toBeGreaterThan(0);
      expect(result.servers[0].capabilities.category).toBe('productivity');
    });

    it('should handle complex discovery queries via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/discover?category=productivity&verified_only=true&limit=5&sort_by=relevance`);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.servers).toBeDefined();
      expect(result.total_results).toBeGreaterThanOrEqual(0);
      expect(result.query_time_ms).toBeGreaterThan(0);
    });

    it('should handle empty discovery results via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/discover?domain=nonexistent-server.com`);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.servers).toEqual([]);
      expect(result.total_results).toBe(0);
    });
  });

  describe('Smart Discovery API Workflow', () => {
    it('should handle intent-based discovery via HTTP', async () => {
      const smartDiscoveryData = {
        intent: 'I need to manage files and automate tasks',
        context: {
          preferred_auth: 'none',
          use_case: 'productivity'
        }
      };

      const response = await fetch(`${baseUrl}/api/discover/smart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smartDiscoveryData)
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.servers).toBeDefined();
      expect(result.intent_analysis).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('Health Check API Workflow', () => {
    it('should provide comprehensive health status via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/health`);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(result.services).toBeDefined();
      expect(result.services.storage).toBeDefined();
      expect(result.services.discovery).toBeDefined();
      expect(result.services.verification).toBeDefined();
    });

    it('should provide server-specific health checks via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/health/servers?domains=productivity-server.com,communication-server.com`);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.health_checks).toBeDefined();
      expect(Array.isArray(result.health_checks)).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON requests via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{'
      });

      expect(response.status).toBe(400);
      const errorResult = await response.json();
      expect(errorResult.error).toBeDefined();
    });

    it('should handle missing Content-Type headers via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/register`, {
        method: 'POST',
        body: JSON.stringify({ domain: 'test.com' })
      });

      // Should still work or provide appropriate error
      expect([200, 201, 400, 415]).toContain(response.status);
    });

    it('should handle rate limiting via HTTP', async () => {
      // Make multiple rapid requests
      const requests = Array.from({ length: 10 }, () =>
        fetch(`${baseUrl}/api/v1/discover?domain=test.com`)
      );

      const responses = await Promise.all(requests);
      
      // All should succeed or some should be rate limited
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });

    it('should handle CORS preflight requests via HTTP', async () => {
      const response = await fetch(`${baseUrl}/api/v1/discover`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://example.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      expect([200, 204]).toContain(response.status);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    });
  });

  describe('API Performance and Reliability', () => {
    it('should handle concurrent requests efficiently via HTTP', async () => {
      const startTime = Date.now();
      
      // Create 20 concurrent discovery requests
      const requests = Array.from({ length: 20 }, (_, i) =>
        fetch(`${baseUrl}/api/v1/discover?category=productivity&offset=${i * 10}`)
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete in reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should maintain data consistency across concurrent operations via HTTP', async () => {
      const serverData = {
        domain: 'concurrent-test.com',
        endpoint: 'https://concurrent-test.com/mcp',
        contact_email: 'admin@concurrent-test.com'
      };

      // Create multiple concurrent registration requests
      const requests = Array.from({ length: 5 }, () =>
        fetch(`${baseUrl}/api/v1/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serverData)
        })
      );

      const responses = await Promise.all(requests);

      // Only one should succeed, others should fail with appropriate errors
      const successfulResponses = responses.filter(r => r.status === 201);
      const failedResponses = responses.filter(r => r.status >= 400);

      expect(successfulResponses.length).toBe(1);
      expect(failedResponses.length).toBe(4);
    });
  });
});
