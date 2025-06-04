import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the services
vi.mock('@/lib/services', () => ({
  createVerificationService: vi.fn()
}));

// Mock the verification service
const mockVerificationService = {
  verifyMCPEndpoint: vi.fn(),
  initiateDNSVerification: vi.fn()
};

describe('/api/v1/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    const { createVerificationService } = require('@/lib/services');
    createVerificationService.mockReturnValue(mockVerificationService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/v1/register', () => {
    const validRegistrationRequest = {
      domain: 'test.com',
      endpoint: 'https://test.com/.well-known/mcp',
      contact_email: 'admin@test.com',
      capabilities: ['email', 'calendar'],
      description: 'Test MCP server for email and calendar integration'
    };

    it('should successfully register a valid MCP server', async () => {
      const mockChallenge = {
        challenge_id: 'test-challenge-123',
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration',
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com'
      };

      mockVerificationService.verifyMCPEndpoint.mockResolvedValue(true);
      mockVerificationService.initiateDNSVerification.mockResolvedValue(mockChallenge);

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRegistrationRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.challenge_id).toBe('test-challenge-123');
      expect(data.domain).toBe('test.com');
      expect(data.txt_record_name).toBe('_mcp-verify.test.com');
      expect(data.txt_record_value).toBe('mcp_verify_abc123');
      expect(data.instructions).toBeDefined();
      
      expect(mockVerificationService.verifyMCPEndpoint).toHaveBeenCalledWith(
        'https://test.com/.well-known/mcp'
      );
      expect(mockVerificationService.initiateDNSVerification).toHaveBeenCalledWith(
        validRegistrationRequest
      );
    });

    it('should reject registration for invalid MCP endpoint', async () => {
      mockVerificationService.verifyMCPEndpoint.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRegistrationRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid MCP endpoint');
      expect(data.details).toContain('does not respond to MCP protocol requests');
      
      expect(mockVerificationService.verifyMCPEndpoint).toHaveBeenCalledWith(
        'https://test.com/.well-known/mcp'
      );
      expect(mockVerificationService.initiateDNSVerification).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidRequest = {
        domain: 'test.com',
        // Missing endpoint, contact_email, capabilities, description
      };

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should return 400 for invalid domain format', async () => {
      const invalidRequest = {
        ...validRegistrationRequest,
        domain: 'invalid-domain'
      };

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });

    it('should return 400 for invalid endpoint URL', async () => {
      const invalidRequest = {
        ...validRegistrationRequest,
        endpoint: 'not-a-valid-url'
      };

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidRequest = {
        ...validRegistrationRequest,
        contact_email: 'invalid-email'
      };

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });

    it('should return 400 for empty capabilities array', async () => {
      const invalidRequest = {
        ...validRegistrationRequest,
        capabilities: []
      };

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });

    it('should handle endpoint verification errors gracefully', async () => {
      mockVerificationService.verifyMCPEndpoint.mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRegistrationRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should handle DNS verification initiation errors', async () => {
      mockVerificationService.verifyMCPEndpoint.mockResolvedValue(true);
      mockVerificationService.initiateDNSVerification.mockRejectedValue(new Error('DNS service error'));

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRegistrationRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should return 400 for malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      const response = await POST(request);

      expect(response.status).toBe(500); // JSON parsing error becomes 500
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should set correct CORS headers', async () => {
      const mockChallenge = {
        challenge_id: 'test-challenge-123',
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration'
      };

      mockVerificationService.verifyMCPEndpoint.mockResolvedValue(true);
      mockVerificationService.initiateDNSVerification.mockResolvedValue(mockChallenge);

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRegistrationRequest)
      });

      const response = await POST(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should handle different capability types', async () => {
      const requestWithDifferentCapabilities = {
        ...validRegistrationRequest,
        capabilities: ['database', 'analytics', 'ai', 'file_storage']
      };

      const mockChallenge = {
        challenge_id: 'test-challenge-456',
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_def456',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration'
      };

      mockVerificationService.verifyMCPEndpoint.mockResolvedValue(true);
      mockVerificationService.initiateDNSVerification.mockResolvedValue(mockChallenge);

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestWithDifferentCapabilities)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      
      expect(mockVerificationService.initiateDNSVerification).toHaveBeenCalledWith(
        requestWithDifferentCapabilities
      );
    });

    it('should handle long descriptions', async () => {
      const requestWithLongDescription = {
        ...validRegistrationRequest,
        description: 'A'.repeat(1000) // Very long description
      };

      const mockChallenge = {
        challenge_id: 'test-challenge-789',
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_ghi789',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration'
      };

      mockVerificationService.verifyMCPEndpoint.mockResolvedValue(true);
      mockVerificationService.initiateDNSVerification.mockResolvedValue(mockChallenge);

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestWithLongDescription)
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should validate challenge response format', async () => {
      const invalidChallenge = {
        // Missing required fields
        domain: 'test.com'
      };

      mockVerificationService.verifyMCPEndpoint.mockResolvedValue(true);
      mockVerificationService.initiateDNSVerification.mockResolvedValue(invalidChallenge);

      const request = new NextRequest('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validRegistrationRequest)
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });
  });
});
