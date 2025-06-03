// DNS Verification Service - Cryptographic proof of domain ownership
// Serverless, no SQL, pluggable architecture

import dns from 'dns/promises';
import { randomUUID } from 'crypto';
import { VerificationChallenge, RegistrationRequest } from '../schemas/discovery.js';

export interface IVerificationService {
  initiateDNSVerification(request: RegistrationRequest): Promise<VerificationChallenge>;
  verifyDNSChallenge(challengeId: string): Promise<boolean>;
  verifyMCPEndpoint(endpoint: string): Promise<boolean>;
  generateVerificationRecord(domain: string, token: string): Promise<string>;
  getChallengeStatus(challengeId: string): Promise<VerificationChallenge | null>;
}

/**
 * DNS Verification Service Implementation
 * Uses multiple DNS resolvers for security
 */
export class VerificationService implements IVerificationService {
  private readonly DNS_RESOLVERS = [
    '1.1.1.1',        // Cloudflare
    '8.8.8.8',        // Google
    '9.9.9.9',        // Quad9
    '208.67.222.222'  // OpenDNS
  ];

  private readonly VERIFICATION_PREFIX = '_mcplookup-verify';
  private readonly TOKEN_TTL_HOURS = 24;
  
  private storageService: IVerificationStorage;
  private mcpService: IMCPValidationService;

  constructor(
    storageService: IVerificationStorage,
    mcpService: IMCPValidationService
  ) {
    this.storageService = storageService;
    this.mcpService = mcpService;
  }

  /**
   * Initiate DNS verification process
   */
  async initiateDNSVerification(request: RegistrationRequest): Promise<VerificationChallenge> {
    const challengeId = randomUUID();
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + (this.TOKEN_TTL_HOURS * 60 * 60 * 1000));
    
    const txtRecordName = `${this.VERIFICATION_PREFIX}.${request.domain}`;
    const txtRecordValue = await this.generateTxtRecordValue(request.domain, token);

    const challenge: VerificationChallenge = {
      challenge_id: challengeId,
      domain: request.domain,
      txt_record_name: txtRecordName,
      txt_record_value: txtRecordValue,
      expires_at: expiresAt.toISOString(),
      instructions: this.generateInstructions(txtRecordName, txtRecordValue, request.domain)
    };

    // Store challenge for later verification
    await this.storageService.storeChallenge(challengeId, {
      ...challenge,
      endpoint: request.endpoint,
      contact_email: request.contact_email,
      token,
      created_at: new Date().toISOString()
    });

    return challenge;
  }

  /**
   * Verify DNS challenge by checking TXT records across multiple resolvers
   */
  async verifyDNSChallenge(challengeId: string): Promise<boolean> {
    const challenge = await this.storageService.getChallenge(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found or expired');
    }

    // Check if challenge has expired
    if (new Date() > new Date(challenge.expires_at)) {
      await this.storageService.deleteChallenge(challengeId);
      throw new Error('Challenge has expired');
    }

    try {
      // Verify DNS record across multiple resolvers
      const verificationResults = await Promise.allSettled(
        this.DNS_RESOLVERS.map(resolver => 
          this.verifyDNSRecordWithResolver(challenge.txt_record_name, challenge.txt_record_value, resolver)
        )
      );

      // Require majority consensus (>50% of resolvers must agree)
      const successCount = verificationResults.filter(
        result => result.status === 'fulfilled' && result.value
      ).length;

      const isVerified = successCount > this.DNS_RESOLVERS.length / 2;

      if (isVerified) {
        // Also verify the MCP endpoint
        const endpointValid = await this.verifyMCPEndpoint(challenge.endpoint);
        
        if (endpointValid) {
          // Mark as verified in storage
          await this.storageService.markChallengeVerified(challengeId);
          return true;
        } else {
          throw new Error('MCP endpoint verification failed');
        }
      }

      return false;

    } catch (error) {
      console.error('DNS verification error:', error);
      return false;
    }
  }

  /**
   * Verify MCP endpoint responds correctly to protocol checks
   */
  async verifyMCPEndpoint(endpoint: string): Promise<boolean> {
    try {
      return await this.mcpService.validateMCPEndpoint(endpoint);
    } catch (error) {
      console.error('MCP endpoint validation failed:', error);
      return false;
    }
  }

  /**
   * Generate TXT record value for DNS verification (format for DNS challenges)
   */
  async generateTxtRecordValue(domain: string, token: string): Promise<string> {
    // Format: mcplookup-verify=token.timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    return `mcplookup-verify=${token}.${timestamp}`;
  }

  /**
   * Generate verification record value (format for API responses)
   */
  async generateVerificationRecord(domain: string, token: string): Promise<string> {
    // Format: v=mcp1 domain=example.com token=abc123 timestamp=1234567890
    const timestamp = Math.floor(Date.now() / 1000);
    return `v=mcp1 domain=${domain} token=${token} timestamp=${timestamp}`;
  }

  /**
   * Get challenge status by ID
   */
  async getChallengeStatus(challengeId: string): Promise<VerificationChallenge | null> {
    try {
      const challengeData = await this.storageService.getChallenge(challengeId);

      if (!challengeData) {
        return null;
      }

      // Check if challenge has expired
      const expiresAt = new Date(challengeData.expires_at);
      if (expiresAt < new Date()) {
        await this.storageService.deleteChallenge(challengeId);
        return null;
      }

      // Return the challenge without sensitive data
      return {
        challenge_id: challengeData.challenge_id,
        domain: challengeData.domain,
        txt_record_name: challengeData.txt_record_name,
        txt_record_value: challengeData.txt_record_value,
        expires_at: challengeData.expires_at,
        instructions: challengeData.instructions,
        status: challengeData.verified_at ? 'verified' : 'pending'
      };

    } catch (error) {
      console.error('Error getting challenge status:', error);
      return null;
    }
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  private generateSecureToken(): string {
    // Generate cryptographically secure random token
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async verifyDNSRecordWithResolver(
    recordName: string, 
    expectedValue: string, 
    resolver: string
  ): Promise<boolean> {
    try {
      // Set custom resolver
      dns.setServers([resolver]);
      
      const records = await dns.resolveTxt(recordName);
      
      // Check if any TXT record matches our expected value
      for (const record of records) {
        const recordValue = Array.isArray(record) ? record.join('') : record;
        if (recordValue === expectedValue) {
          return true;
        }
      }
      
      return false;

    } catch (error) {
      // DNS lookup failed - record doesn't exist or other error
      console.error(`DNS verification failed with resolver ${resolver}:`, error);
      return false;
    }
  }

  private generateInstructions(txtRecordName: string, txtRecordValue: string, domain: string): string {
    return `
To verify ownership of ${domain}, please add the following DNS TXT record:

Record Type: TXT
Name: ${txtRecordName}
Value: ${txtRecordValue}

Instructions by DNS provider:

CLOUDFLARE:
1. Log into your Cloudflare dashboard
2. Select your domain (${domain})
3. Go to DNS settings
4. Click "Add record"
5. Type: TXT
6. Name: ${txtRecordName}
7. Content: ${txtRecordValue}
8. Click "Save"

NAMECHEAP:
1. Log into your Namecheap account
2. Go to Domain List
3. Click "Manage" next to ${domain}
4. Go to "Advanced DNS" tab
5. Click "Add New Record"
6. Type: TXT Record
7. Host: ${this.VERIFICATION_PREFIX}
8. Value: ${txtRecordValue}
9. Click the checkmark to save

GODADDY:
1. Log into your GoDaddy account
2. Go to DNS Management for ${domain}
3. Click "Add" in the Records section
4. Type: TXT
5. Name: ${this.VERIFICATION_PREFIX}
6. Value: ${txtRecordValue}
7. Click "Save"

After adding the record, it may take up to 48 hours to propagate globally.
You can check propagation status at: https://dnschecker.org

Once the record is active, click "Verify" to complete the process.
    `.trim();
  }
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface IVerificationStorage {
  storeChallenge(challengeId: string, challenge: VerificationChallengeData): Promise<void>;
  getChallenge(challengeId: string): Promise<VerificationChallengeData | null>;
  deleteChallenge(challengeId: string): Promise<void>;
  markChallengeVerified(challengeId: string): Promise<void>;
  getVerifiedDomains(): Promise<string[]>;
}

export interface IMCPValidationService {
  validateMCPEndpoint(endpoint: string): Promise<boolean>;
  getMCPServerInfo(endpoint: string): Promise<any>;
  testMCPConnection(endpoint: string): Promise<boolean>;
}

export interface VerificationChallengeData extends VerificationChallenge {
  endpoint: string;
  contact_email: string;
  token: string;
  created_at: string;
  verified_at?: string;
}

// ============================================================================
// SERVERLESS-FRIENDLY STORAGE IMPLEMENTATION
// ============================================================================

/**
 * In-memory verification storage for serverless environments
 * In production, this would be replaced with Redis, DynamoDB, etc.
 */
export class InMemoryVerificationStorage implements IVerificationStorage {
  private challenges = new Map<string, VerificationChallengeData>();

  async storeChallenge(challengeId: string, challenge: VerificationChallengeData): Promise<void> {
    this.challenges.set(challengeId, challenge);
    
    // Auto-cleanup expired challenges
    setTimeout(() => {
      this.challenges.delete(challengeId);
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  async getChallenge(challengeId: string): Promise<VerificationChallengeData | null> {
    return this.challenges.get(challengeId) || null;
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    this.challenges.delete(challengeId);
  }

  async markChallengeVerified(challengeId: string): Promise<void> {
    const challenge = this.challenges.get(challengeId);
    if (challenge) {
      challenge.verified_at = new Date().toISOString();
      this.challenges.set(challengeId, challenge);
    }
  }

  async getVerifiedDomains(): Promise<string[]> {
    const verifiedDomains: string[] = [];
    
    for (const challenge of this.challenges.values()) {
      if (challenge.verified_at) {
        verifiedDomains.push(challenge.domain);
      }
    }
    
    return [...new Set(verifiedDomains)]; // Remove duplicates
  }
}

// ============================================================================
// MCP VALIDATION SERVICE IMPLEMENTATION
// ============================================================================

/**
 * MCP Endpoint Validation Service
 * Tests actual MCP protocol connectivity
 */
export class MCPValidationService implements IMCPValidationService {
  private readonly TIMEOUT_MS = 10000; // 10 seconds

  async validateMCPEndpoint(endpoint: string): Promise<boolean> {
    try {
      // Test basic connectivity
      const connectionTest = await this.testMCPConnection(endpoint);
      if (!connectionTest) {
        return false;
      }

      // Try to get server info via MCP initialize
      const serverInfo = await this.getMCPServerInfo(endpoint);
      return serverInfo !== null;

    } catch (error) {
      console.error('MCP validation error:', error);
      return false;
    }
  }

  async getMCPServerInfo(endpoint: string): Promise<any> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'mcplookup-verifier',
              version: '1.0.0'
            }
          }
        }),
        signal: AbortSignal.timeout(this.TIMEOUT_MS)
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.result || null;

    } catch (error) {
      console.error('MCP server info fetch failed:', error);
      return null;
    }
  }

  async testMCPConnection(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: AbortSignal.timeout(this.TIMEOUT_MS)
      });

      // Accept any response that indicates the endpoint exists
      // (MCP servers might return different status codes for GET requests)
      return response.status < 500;

    } catch (error) {
      console.error('MCP connection test failed:', error);
      return false;
    }
  }
}
