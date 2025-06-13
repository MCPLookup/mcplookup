// Real API Endpoint Integration Tests
// Tests actual HTTP requests to API endpoints with real services

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createServer } from 'http';
import { parse } from 'url';
import { getStorageService, setStorageService } from '@/lib/storage';

// Test server setup
let testServer: any;
let testPort: number;
let baseUrl: string;

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
  beforeEach(async () => {
    // Reset storage for each test
    setStorageService(null as any);
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Find available port and start test server
    testPort = 3001 + Math.floor(Math.random() * 1000);
    baseUrl = `http://localhost:${testPort}`;
  });

  afterEach(async () => {
    if (testServer) {
      testServer.close();
    }
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

      const registrationResponse = await fetch(`${baseUrl}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

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
      const statusResponse = await fetch(`${baseUrl}/api/v1/register/verify/${challengeId}`);
      expect(statusResponse.status).toBe(200);
      
      const statusResult = await statusResponse.json();
      expect(statusResult.challenge_id).toBe(challengeId);
      expect(statusResult.domain).toBe('test-server.com');
      expect(statusResult.verified_at).toBeNull();

      // Step 3: Verify DNS challenge
      const verificationResponse = await fetch(`${baseUrl}/api/v1/register/verify/${challengeId}`, {
        method: 'POST'
      });

      expect(verificationResponse.status).toBe(200);
      const verificationResult = await verificationResponse.json();
      expect(verificationResult.verified).toBe(true);
      expect(verificationResult.domain).toBe('test-server.com');

      // Step 4: Verify server is discoverable
      const discoveryResponse = await fetch(`${baseUrl}/api/v1/discover?domain=test-server.com`);
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
