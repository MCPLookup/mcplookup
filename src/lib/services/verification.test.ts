import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { VerificationService, MCPValidationService } from './verification';
import { getVerificationStorage } from './storage/storage';
import { RegistrationRequest, VerificationChallenge } from '../schemas/discovery';

// Mock DNS module
vi.mock('dns/promises', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    resolveTxt: vi.fn(),
    default: {
      resolveTxt: vi.fn()
    }
  };
});

// Mock storage
vi.mock('./storage/storage', () => ({
  getVerificationStorage: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('VerificationService', () => {
  let verificationService: VerificationService;
  let mockStorage: any;
  let mockMCPService: any;

  beforeEach(() => {
    mockStorage = {
      storeChallenge: vi.fn(),
      getChallenge: vi.fn(),
      deleteChallenge: vi.fn(),
      updateChallenge: vi.fn(),
      getStats: vi.fn(),
      healthCheck: vi.fn(),
      cleanup: vi.fn()
    };

    mockMCPService = {
      validateMCPEndpoint: vi.fn().mockResolvedValue(true),
      getMCPServerInfo: vi.fn().mockResolvedValue({ server_info: { name: 'Test' } }),
      testMCPConnection: vi.fn().mockResolvedValue(true)
    };

    (getVerificationStorage as any).mockReturnValue(mockStorage);
    verificationService = new VerificationService(mockMCPService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initiateDNSVerification', () => {
    it('should create and store a DNS verification challenge', async () => {
      const registrationRequest: RegistrationRequest = {
        domain: 'test.com',
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        capabilities: ['email'],
        description: 'Test server'
      };

      mockStorage.storeChallenge.mockResolvedValue({ success: true });

      const challenge = await verificationService.initiateDNSVerification(registrationRequest);

      expect(challenge.domain).toBe('test.com');
      expect(challenge.txt_record_name).toBe('_mcplookup-verify.test.com');
      expect(challenge.txt_record_value).toMatch(/^mcplookup-verify=/);
      expect(challenge.contact_email).toBe('admin@test.com');
      expect(challenge.endpoint).toBe('https://test.com/.well-known/mcp');
      expect(challenge.expires_at).toBeDefined();
      expect(new Date(challenge.expires_at).getTime()).toBeGreaterThan(Date.now());
      expect(mockStorage.storeChallenge).toHaveBeenCalled();
    });

    it('should generate unique challenge IDs and tokens', async () => {
      const registrationRequest: RegistrationRequest = {
        domain: 'test.com',
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        capabilities: ['email'],
        description: 'Test server'
      };

      mockStorage.storeChallenge.mockResolvedValue({ success: true });

      const challenge1 = await verificationService.initiateDNSVerification(registrationRequest);
      const challenge2 = await verificationService.initiateDNSVerification(registrationRequest);

      expect(challenge1.challenge_id).not.toBe(challenge2.challenge_id);
      expect(challenge1.txt_record_value).not.toBe(challenge2.txt_record_value);
    });

    it('should handle storage errors gracefully', async () => {
      const registrationRequest: RegistrationRequest = {
        domain: 'test.com',
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        capabilities: ['email'],
        description: 'Test server'
      };

      mockStorage.storeChallenge.mockResolvedValue({ 
        success: false, 
        error: 'Storage error' 
      });

      await expect(verificationService.initiateDNSVerification(registrationRequest))
        .rejects.toThrow('Failed to store challenge');
    });
  });

  describe('verifyDNSChallenge', () => {
    it('should verify a valid DNS challenge', async () => {
      const mockChallenge = {
        challenge_id: 'test-challenge',
        domain: 'test.com',
        txt_record_name: '_mcplookup-verify.test.com',
        txt_record_value: 'mcplookup-verify=abc123.1234567890',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        token: 'abc123',
        created_at: new Date().toISOString()
      };

      mockStorage.getChallenge.mockResolvedValue({ 
        success: true, 
        data: mockChallenge 
      });

      // Mock DNS resolution to return the expected TXT record
      const dns = await import('dns/promises');
      (dns.resolveTxt as any).mockResolvedValue([['mcplookup-verify=abc123.1234567890']]);

      mockStorage.updateChallenge.mockResolvedValue({ success: true });

      const result = await verificationService.verifyDNSChallenge('test-challenge');

      expect(result).toBe(true);
      expect(dns.resolveTxt).toHaveBeenCalledWith('_mcplookup-verify.test.com');
      expect(mockStorage.updateChallenge).toHaveBeenCalledWith(
        'test-challenge',
        expect.objectContaining({
          verified_at: expect.any(String)
        })
      );
    });

    it('should fail verification for incorrect TXT record', async () => {
      const mockChallenge = {
        challenge_id: 'test-challenge',
        domain: 'test.com',
        txt_record_name: '_mcplookup-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        token: 'abc123',
        created_at: new Date().toISOString()
      };

      mockStorage.getChallenge.mockResolvedValue({ 
        success: true, 
        data: mockChallenge 
      });

      // Mock DNS resolution to return wrong TXT record
      const dns = await import('dns/promises');
      (dns.resolveTxt as any).mockResolvedValue([['wrong_value']]);

      mockStorage.updateChallenge.mockResolvedValue({ success: true });

      const result = await verificationService.verifyDNSChallenge('test-challenge');

      expect(result).toBe(false);
      expect(mockStorage.updateChallenge).toHaveBeenCalledWith(
        'test-challenge',
        expect.objectContaining({
          attempts: expect.any(Number),
          last_attempt_at: expect.any(String)
        })
      );
    });

    it('should fail verification for expired challenge', async () => {
      const mockChallenge = {
        challenge_id: 'test-challenge',
        domain: 'test.com',
        txt_record_name: '_mcplookup-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        token: 'abc123',
        created_at: new Date().toISOString()
      };

      mockStorage.getChallenge.mockResolvedValue({
        success: true,
        data: mockChallenge
      });

      await expect(verificationService.verifyDNSChallenge('test-challenge'))
        .rejects.toThrow('Challenge has expired');
    });

    it('should handle DNS resolution errors', async () => {
      const mockChallenge = {
        challenge_id: 'test-challenge',
        domain: 'test.com',
        txt_record_name: '_mcplookup-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        token: 'abc123',
        created_at: new Date().toISOString()
      };

      mockStorage.getChallenge.mockResolvedValue({ 
        success: true, 
        data: mockChallenge 
      });

      // Mock DNS resolution to throw error
      const dns = await import('dns/promises');
      (dns.resolveTxt as any).mockRejectedValue(new Error('DNS resolution failed'));

      mockStorage.updateChallenge.mockResolvedValue({ success: true });

      const result = await verificationService.verifyDNSChallenge('test-challenge');

      expect(result).toBe(false);
    });

    it('should handle non-existent challenge', async () => {
      mockStorage.getChallenge.mockResolvedValue({
        success: true,
        data: null
      });

      await expect(verificationService.verifyDNSChallenge('non-existent'))
        .rejects.toThrow('Challenge not found or expired');
    });
  });

  describe('verifyMCPEndpoint', () => {
    it('should verify a valid MCP endpoint', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json'
        }),
        json: vi.fn().mockResolvedValue({
          server_info: {
            name: 'Test Server',
            version: '1.0.0',
            protocolVersion: '2024-11-05'
          }
        })
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await verificationService.verifyMCPEndpoint('https://test.com/.well-known/mcp');

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('https://test.com/.well-known/mcp', expect.any(Object));
    });

    it('should fail verification for invalid endpoint response', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await verificationService.verifyMCPEndpoint('https://test.com/.well-known/mcp');

      expect(result).toBe(false);
    });

    it('should fail verification for network errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await verificationService.verifyMCPEndpoint('https://test.com/.well-known/mcp');

      expect(result).toBe(false);
    });

    it('should fail verification for invalid JSON response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json'
        }),
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await verificationService.verifyMCPEndpoint('https://test.com/.well-known/mcp');

      expect(result).toBe(false);
    });
  });

  describe('getChallengeStatus', () => {
    it('should return challenge status', async () => {
      const mockChallenge = {
        challenge_id: 'test-challenge',
        domain: 'test.com',
        txt_record_name: '_mcplookup-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        token: 'abc123',
        created_at: new Date().toISOString()
      };

      mockStorage.getChallenge.mockResolvedValue({ 
        success: true, 
        data: mockChallenge 
      });

      const result = await verificationService.getChallengeStatus('test-challenge');

      expect(result.challenge_id).toBe('test-challenge');
      expect(result.domain).toBe('test.com');
      expect(result.txt_record_name).toBe('_mcplookup-verify.test.com');
    });

    it('should return null for non-existent challenge', async () => {
      mockStorage.getChallenge.mockResolvedValue({ 
        success: true, 
        data: null 
      });

      const result = await verificationService.getChallengeStatus('non-existent');

      expect(result).toBeNull();
    });
  });
});

describe('MCPValidationService', () => {
  let validationService: MCPValidationService;

  beforeEach(() => {
    validationService = new MCPValidationService();
    vi.clearAllMocks();
  });

  describe('validateMCPEndpoint', () => {
    it('should validate MCP endpoint connectivity', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          server_info: {
            name: 'Test Server',
            version: '1.0.0'
          }
        })
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await validationService.validateMCPEndpoint('https://test.com/.well-known/mcp');

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalled();
    });

    it('should reject invalid endpoints', async () => {
      const mockResponse = {
        ok: false,
        status: 500
      };

      (fetch as any).mockResolvedValue(mockResponse);

      const result = await validationService.validateMCPEndpoint('https://test.com/.well-known/mcp');

      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await validationService.validateMCPEndpoint('https://test.com/.well-known/mcp');

      expect(result).toBe(false);
    });
  });
});
