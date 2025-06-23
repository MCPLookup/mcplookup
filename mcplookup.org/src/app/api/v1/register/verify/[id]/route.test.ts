import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GET, POST, OPTIONS } from './route';
import { NextRequest } from 'next/server';
import { getServerlessServices } from '@/lib/services';

// Mock the services
vi.mock('@/lib/services', () => ({
  getServerlessServices: vi.fn()
}));

// Mock the verification service
const mockVerificationService = {
  verifyDNSChallenge: vi.fn(),
  getChallengeStatus: vi.fn()
};

describe.skip('/api/v1/register/verify/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    vi.mocked(getServerlessServices).mockReturnValue({
      verification: mockVerificationService
    } as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/v1/register/verify/[id]', () => {
    const challengeId = 'test-challenge-123';

    it('should successfully verify a valid DNS challenge', async () => {
      mockVerificationService.verifyDNSChallenge.mockResolvedValue(true);

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`, {
        method: 'POST'
      });

      const response = await POST(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.verified).toBe(true);
      expect(data.domain).toBeDefined();
      expect(data.verified_at).toBeDefined();
      expect(data.registration_status).toBe('verified');
      expect(data.next_steps).toContain('successfully registered');
      
      expect(mockVerificationService.verifyDNSChallenge).toHaveBeenCalledWith(challengeId);
    });

    it('should return 400 for failed DNS verification', async () => {
      mockVerificationService.verifyDNSChallenge.mockResolvedValue(false);

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`, {
        method: 'POST'
      });

      const response = await POST(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.verified).toBe(false);
      expect(data.error).toBe('DNS verification failed');
      expect(data.details).toContain('TXT record was not found');
      
      expect(mockVerificationService.verifyDNSChallenge).toHaveBeenCalledWith(challengeId);
    });

    it('should return 400 for missing challenge ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/register/verify/', {
        method: 'POST'
      });

      const response = await POST(request, { params: Promise.resolve({ id: '' }) });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Challenge ID is required');
    });

    it('should return 404 for non-existent challenge', async () => {
      mockVerificationService.verifyDNSChallenge.mockRejectedValue(new Error('Challenge not found'));

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/non-existent`, {
        method: 'POST'
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'non-existent' }) });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Challenge not found or expired');
    });

    it('should handle verification service errors gracefully', async () => {
      mockVerificationService.verifyDNSChallenge.mockRejectedValue(new Error('Service unavailable'));

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`, {
        method: 'POST'
      });

      const response = await POST(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should set correct CORS headers', async () => {
      mockVerificationService.verifyDNSChallenge.mockResolvedValue(true);

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`, {
        method: 'POST'
      });

      const response = await POST(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should handle expired challenges', async () => {
      mockVerificationService.verifyDNSChallenge.mockRejectedValue(new Error('Challenge expired'));

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/expired-challenge`, {
        method: 'POST'
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'expired-challenge' }) });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Challenge not found or expired');
    });
  });

  describe('GET /api/v1/register/verify/[id]', () => {
    const challengeId = 'test-challenge-123';

    it('should return challenge status for existing challenge', async () => {
      const mockChallenge = {
        challenge_id: challengeId,
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration',
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        created_at: '2025-06-04T00:00:00Z',
        verified_at: null,
        attempts: 0
      };

      mockVerificationService.getChallengeStatus.mockResolvedValue(mockChallenge);

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`);

      const response = await GET(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.challenge_id).toBe(challengeId);
      expect(data.domain).toBe('test.com');
      expect(data.txt_record_name).toBe('_mcp-verify.test.com');
      expect(data.txt_record_value).toBe('mcp_verify_abc123');
      expect(data.verified_at).toBeNull();
      
      expect(mockVerificationService.getChallengeStatus).toHaveBeenCalledWith(challengeId);
    });

    it('should return challenge status for verified challenge', async () => {
      const mockVerifiedChallenge = {
        challenge_id: challengeId,
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration',
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        created_at: '2025-06-04T00:00:00Z',
        verified_at: '2025-06-04T01:00:00Z',
        attempts: 1
      };

      mockVerificationService.getChallengeStatus.mockResolvedValue(mockVerifiedChallenge);

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`);

      const response = await GET(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.verified_at).toBe('2025-06-04T01:00:00Z');
      expect(data.attempts).toBe(1);
    });

    it('should return 404 for non-existent challenge', async () => {
      mockVerificationService.getChallengeStatus.mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/non-existent`);

      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Challenge not found or expired');
    });

    it('should return 400 for missing challenge ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/register/verify/');

      const response = await GET(request, { params: Promise.resolve({ id: '' }) });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Challenge ID is required');
    });

    it('should handle service errors gracefully', async () => {
      mockVerificationService.getChallengeStatus.mockRejectedValue(new Error('Service error'));

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`);

      const response = await GET(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should set correct cache headers', async () => {
      const mockChallenge = {
        challenge_id: challengeId,
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration'
      };

      mockVerificationService.getChallengeStatus.mockResolvedValue(mockChallenge);

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`);

      const response = await GET(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=60');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });

    it('should handle challenges with multiple verification attempts', async () => {
      const mockChallengeWithAttempts = {
        challenge_id: challengeId,
        domain: 'test.com',
        txt_record_name: '_mcp-verify.test.com',
        txt_record_value: 'mcp_verify_abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Add this TXT record to your DNS configuration',
        endpoint: 'https://test.com/.well-known/mcp',
        contact_email: 'admin@test.com',
        created_at: '2025-06-04T00:00:00Z',
        verified_at: null,
        attempts: 3,
        last_attempt_at: '2025-06-04T02:00:00Z'
      };

      mockVerificationService.getChallengeStatus.mockResolvedValue(mockChallengeWithAttempts);

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`);

      const response = await GET(request, { params: Promise.resolve({ id: challengeId }) });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.attempts).toBe(3);
      expect(data.last_attempt_at).toBe('2025-06-04T02:00:00Z');
    });
  });

  describe('OPTIONS /api/v1/register/verify/[id]', () => {
    it('should return correct CORS headers for preflight request', async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });
  });

  describe('edge cases and security', () => {
    it('should handle malformed challenge IDs', async () => {
      const malformedIds = ['../../../etc/passwd', '<script>alert("xss")</script>', 'null', 'undefined'];

      for (const malformedId of malformedIds) {
        mockVerificationService.verifyDNSChallenge.mockRejectedValue(new Error('Invalid challenge ID'));

        const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${encodeURIComponent(malformedId)}`, {
          method: 'POST'
        });

        const response = await POST(request, { params: Promise.resolve({ id: malformedId }) });

        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it('should handle very long challenge IDs', async () => {
      const longId = 'a'.repeat(1000);
      mockVerificationService.verifyDNSChallenge.mockRejectedValue(new Error('Invalid challenge ID'));

      const request = new NextRequest(`http://localhost:3000/api/v1/register/verify/${longId}`, {
        method: 'POST'
      });

      const response = await POST(request, { params: Promise.resolve({ id: longId }) });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle concurrent verification attempts', async () => {
      mockVerificationService.verifyDNSChallenge.mockResolvedValue(true);

      const challengeId = 'concurrent-test';
      const requests = Array.from({ length: 5 }, () => 
        POST(
          new NextRequest(`http://localhost:3000/api/v1/register/verify/${challengeId}`, { method: 'POST' }),
          { params: Promise.resolve({ id: challengeId }) }
        )
      );

      const responses = await Promise.all(requests);

      // All should succeed (idempotent operation)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
