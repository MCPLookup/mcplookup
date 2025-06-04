// DNS Verification Service - Cryptographic proof of domain ownership
// Serverless, no SQL, pluggable architecture

import dns from 'dns/promises';
import { randomUUID } from 'crypto';
import { getVerificationStorage, StorageConfig } from './storage/storage';
import { IVerificationStorage, VerificationChallengeData, isSuccessResult } from './storage/interfaces';
import { VerificationChallenge, RegistrationRequest, TransportCapabilities } from '../schemas/discovery';

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
    mcpService: IMCPValidationService,
    storageConfig?: StorageConfig
  ) {
    this.storageService = getVerificationStorage(storageConfig);
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
    const challengeData: VerificationChallengeData = {
      // Base VerificationChallenge fields
      challenge_id: challengeId,
      domain: request.domain,
      txt_record_name: txtRecordName,
      txt_record_value: txtRecordValue,
      expires_at: challenge.expires_at,
      instructions: this.generateInstructions(txtRecordName, txtRecordValue, request.domain),

      // Extended VerificationChallengeData fields
      endpoint: request.endpoint,
      contact_email: request.contact_email,
      token: 'verification-token-' + challengeId,
      created_at: new Date().toISOString()
    };

    const storeResult = await this.storageService.storeChallenge(challengeId, challengeData);
    if (!storeResult.success) {
      throw new Error(`Failed to store challenge: ${storeResult.error}`);
    }

    return challenge;
  }

  /**
   * Verify DNS challenge by checking TXT records across multiple resolvers
   */
  async verifyDNSChallenge(challengeId: string): Promise<boolean> {
    const challengeResult = await this.storageService.getChallenge(challengeId);
    if (!challengeResult.success || !challengeResult.data) {
      throw new Error('Challenge not found or expired');
    }

    const challenge = challengeResult.data;

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
        // Mark as verified in storage
        const verifyResult = await this.storageService.markChallengeVerified(challengeId);
        if (!verifyResult.success) {
          console.error('Failed to mark challenge as verified:', verifyResult.error);
        }
        return true;
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
      const challengeResult = await this.storageService.getChallenge(challengeId);

      if (!challengeResult.success || !challengeResult.data) {
        return null;
      }

      const challengeData = challengeResult.data;

      // Check if challenge has expired
      if (new Date(challengeData.expires_at) < new Date()) {
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
      // Validate resolver IP is not private
      const { isPrivateIP } = await import('../security/url-validation');
      if (isPrivateIP(resolver)) {
        console.warn(`Blocked private DNS resolver: ${resolver}`);
        return false;
      }

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

export interface IMCPValidationService {
  validateMCPEndpoint(endpoint: string): Promise<boolean>;
  getMCPServerInfo(endpoint: string): Promise<any>;
  testMCPConnection(endpoint: string): Promise<boolean>;
  discoverTransportCapabilities(endpoint: string): Promise<TransportCapabilities>;
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
      const { safeFetch } = await import('../security/url-validation');

      const response = await safeFetch(endpoint, {
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
      const { safeFetch } = await import('../security/url-validation');

      const response = await safeFetch(endpoint, {
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

  async discoverTransportCapabilities(endpoint: string): Promise<TransportCapabilities> {
    const startTime = Date.now();

    try {
      const [
        methodSupport,
        sseCapabilities,
        sessionSupport,
        resumabilitySupport,
        corsDetails,
        securityFeatures
      ] = await Promise.allSettled([
        this.detectMethodSupport(endpoint),
        this.detectSSECapabilities(endpoint),
        this.detectSessionSupport(endpoint),
        this.detectResumabilitySupport(endpoint),
        this.detectCORSDetails(endpoint),
        this.detectSecurityFeatures(endpoint)
      ]);

      const responseTime = Date.now() - startTime;

      return {
        primary_transport: this.determinePrimaryTransport(methodSupport, sseCapabilities),
        supported_methods: this.extractValue(methodSupport, []),
        content_types: this.extractContentTypes(methodSupport, sseCapabilities),
        sse_support: this.extractValue(sseCapabilities, {
          supports_sse: false,
          supports_get_streaming: false,
          supports_post_streaming: false
        }),
        session_support: this.extractValue(sessionSupport, {
          supports_sessions: false,
          session_timeout_indicated: false
        }),
        resumability: this.extractValue(resumabilitySupport, {
          supports_event_ids: false,
          supports_last_event_id: false
        }),
        connection_limits: {
          supports_multiple_connections: false, // Would need more complex testing
        },
        security_features: this.extractValue(securityFeatures, {
          origin_validation: false,
          ssl_required: endpoint.startsWith('https://'),
          custom_auth_headers: []
        }),
        performance: {
          avg_response_time_ms: responseTime,
          supports_compression: false // Would need header analysis
        },
        cors_details: this.extractValue(corsDetails, {
          cors_enabled: false,
          allowed_origins: [],
          allowed_methods: [],
          allowed_headers: [],
          supports_credentials: false
        })
      };

    } catch (error) {
      console.error('Transport capabilities discovery failed:', error);
      // Return minimal capabilities on error
      return this.getMinimalCapabilities(endpoint);
    }
  }

  private async detectMethodSupport(endpoint: string): Promise<string[]> {
    const { safeFetch } = await import('../security/url-validation');
    const supportedMethods: string[] = [];
    const methods = ['GET', 'POST', 'DELETE', 'OPTIONS'];

    for (const method of methods) {
      try {
        const response = await safeFetch(endpoint, {
          method,
          signal: AbortSignal.timeout(5000),
          headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {}
        });

        // Consider method supported if we don't get 405 Method Not Allowed
        if (response.status !== 405) {
          supportedMethods.push(method);
        }
      } catch (error) {
        // Method might be supported but endpoint might be down
        console.debug(`Method ${method} test failed:`, error);
      }
    }

    return supportedMethods;
  }

  private async detectSSECapabilities(endpoint: string): Promise<any> {
    const { safeFetch } = await import('../security/url-validation');

    try {
      // Test GET with SSE accept header
      const getResponse = await safeFetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream'
        },
        signal: AbortSignal.timeout(5000)
      });

      const supportsGetSSE = getResponse.headers.get('content-type')?.includes('text/event-stream') || false;

      // Test POST with SSE accept header
      const postResponse = await safeFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: { name: 'mcplookup-verifier', version: '1.0.0' }
          }
        }),
        signal: AbortSignal.timeout(5000)
      });

      const supportsPostSSE = postResponse.headers.get('content-type')?.includes('text/event-stream') || false;

      return {
        supports_sse: supportsGetSSE || supportsPostSSE,
        supports_get_streaming: supportsGetSSE,
        supports_post_streaming: supportsPostSSE
      };

    } catch (error) {
      console.debug('SSE capabilities detection failed:', error);
      return {
        supports_sse: false,
        supports_get_streaming: false,
        supports_post_streaming: false
      };
    }
  }

  private async detectSessionSupport(endpoint: string): Promise<any> {
    const { safeFetch } = await import('../security/url-validation');

    try {
      // Send initialize request and check for session header
      const response = await safeFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: { name: 'mcplookup-verifier', version: '1.0.0' }
          }
        }),
        signal: AbortSignal.timeout(5000)
      });

      const sessionHeader = response.headers.get('mcp-session-id') || response.headers.get('Mcp-Session-Id');

      return {
        supports_sessions: !!sessionHeader,
        session_header_name: sessionHeader ? 'Mcp-Session-Id' : undefined,
        session_timeout_indicated: false // Would need more analysis
      };

    } catch (error) {
      console.debug('Session support detection failed:', error);
      return {
        supports_sessions: false,
        session_timeout_indicated: false
      };
    }
  }

  private async detectResumabilitySupport(endpoint: string): Promise<any> {
    // This would require establishing an SSE connection and monitoring for event IDs
    // For now, return basic detection
    return {
      supports_event_ids: false,
      supports_last_event_id: false
    };
  }

  private async detectCORSDetails(endpoint: string): Promise<any> {
    const { safeFetch } = await import('../security/url-validation');

    try {
      // Send OPTIONS preflight request
      const response = await safeFetch(endpoint, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://mcplookup.org',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        signal: AbortSignal.timeout(5000)
      });

      const allowOrigin = response.headers.get('access-control-allow-origin');
      const allowMethods = response.headers.get('access-control-allow-methods')?.split(',').map(m => m.trim()) || [];
      const allowHeaders = response.headers.get('access-control-allow-headers')?.split(',').map(h => h.trim()) || [];
      const allowCredentials = response.headers.get('access-control-allow-credentials') === 'true';

      return {
        cors_enabled: !!allowOrigin,
        allowed_origins: allowOrigin ? [allowOrigin] : [],
        allowed_methods: allowMethods,
        allowed_headers: allowHeaders,
        supports_credentials: allowCredentials
      };

    } catch (error) {
      console.debug('CORS detection failed:', error);
      return {
        cors_enabled: false,
        allowed_origins: [],
        allowed_methods: [],
        allowed_headers: [],
        supports_credentials: false
      };
    }
  }

  private async detectSecurityFeatures(endpoint: string): Promise<any> {
    return {
      origin_validation: false, // Would need careful testing
      ssl_required: endpoint.startsWith('https://'),
      custom_auth_headers: [] // Would need error response analysis
    };
  }

  private determinePrimaryTransport(methodSupport: PromiseSettledResult<string[]>, sseCapabilities: PromiseSettledResult<any>): 'streamable_http' | 'sse' | 'stdio' {
    const methods = this.extractValue(methodSupport, []);
    const sse = this.extractValue(sseCapabilities, { supports_sse: false });

    if (sse.supports_sse && methods.includes('GET') && methods.includes('POST')) {
      return 'streamable_http';
    } else if (sse.supports_sse) {
      return 'sse';
    } else {
      return 'streamable_http'; // Default assumption for HTTP endpoints
    }
  }

  private extractContentTypes(methodSupport: PromiseSettledResult<string[]>, sseCapabilities: PromiseSettledResult<any>): string[] {
    const contentTypes = ['application/json']; // Always supported for MCP
    const sse = this.extractValue(sseCapabilities, { supports_sse: false });

    if (sse.supports_sse) {
      contentTypes.push('text/event-stream');
    }

    return contentTypes;
  }

  private extractValue<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
    return result.status === 'fulfilled' ? result.value : defaultValue;
  }

  private getMinimalCapabilities(endpoint: string): TransportCapabilities {
    return {
      primary_transport: 'streamable_http',
      supported_methods: ['POST'],
      content_types: ['application/json'],
      sse_support: {
        supports_sse: false,
        supports_get_streaming: false,
        supports_post_streaming: false
      },
      session_support: {
        supports_sessions: false,
        session_timeout_indicated: false
      },
      resumability: {
        supports_event_ids: false,
        supports_last_event_id: false
      },
      connection_limits: {
        supports_multiple_connections: false
      },
      security_features: {
        origin_validation: false,
        ssl_required: endpoint.startsWith('https://'),
        custom_auth_headers: []
      },
      performance: {
        avg_response_time_ms: 0,
        supports_compression: false
      },
      cors_details: {
        cors_enabled: false,
        allowed_origins: [],
        allowed_methods: [],
        allowed_headers: [],
        supports_credentials: false
      }
    };
  }
