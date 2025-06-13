// @ts-nocheck
// Real-time Domain Security Service/ Real-Time Domain Security Service
// Verifies domain ownership when it matters, not on arbitrary schedules

import dns from 'dns/promises';
import { randomUUID } from 'crypto';
import { RegistryService } from './registry';
import { MCPServerRecord } from '../schemas/discovery';

export interface UpdateRequest {
  endpoint?: string;
  capabilities?: string[];
  contact_email?: string;
  description?: string;
}

export interface OwnershipChallenge {
  challenge_id: string;
  domain: string;
  challenger_ip: string;
  txt_record_name: string;
  txt_record_value: string;
  created_at: Date;
  expires_at: Date;
  reason: 'ownership_transfer' | 'suspicious_activity' | 'user_request';
}

/**
 * Real-Time Domain Security Service
 * No arbitrary expiry dates - verify ownership when changes are made
 */
export class RealtimeDomainSecurityService {
  private readonly CHALLENGE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly DNS_RESOLVERS = [
    '1.1.1.1',        // Cloudflare
    '8.8.8.8',        // Google
    '9.9.9.9',        // Quad9
  ];

  private registryService: RegistryService;

  constructor(registryService: RegistryService) {
    this.registryService = registryService;
  }

  /**
   * Check if an update requires ownership verification
   */
  requiresOwnershipVerification(
    currentRegistration: MCPServerRecord,
    updateRequest: UpdateRequest
  ): boolean {
    // Always verify for endpoint changes (most critical)
    if (updateRequest.endpoint && updateRequest.endpoint !== currentRegistration.endpoint) {
      return true;
    }

    // Verify for major capability changes
    if (updateRequest.capabilities) {
      const currentCaps = new Set(currentRegistration.capabilities.subcategories);
      const newCaps = new Set(updateRequest.capabilities);
      
      // Core capabilities that require verification
      const coreCaps = ['file_system', 'database', 'network', 'authentication', 'system'];
      const coreChanges = coreCaps.some(cap => 
        currentCaps.has(cap) !== newCaps.has(cap)
      );
      
      if (coreChanges) return true;
      
      // Large capability changes (>50% different)
      const totalCaps = new Set([...currentCaps, ...newCaps]).size;
      const commonCaps = currentCaps.size > 0 ? [...currentCaps].filter(cap => newCaps.has(cap)).length : 0;
      const changePercentage = 1 - (commonCaps / totalCaps);
      
      if (changePercentage > 0.5) return true;
    }

    // Minor changes don't require verification
    return false;
  }

  /**
   * Verify current domain ownership in real-time
   */
  async verifyCurrentOwnership(domain: string): Promise<{
    verified: boolean;
    method: string;
    details: string;
  }> {
    // Method 1: Check for existing verification record
    const dnsVerification = await this.checkDNSVerification(domain);
    if (dnsVerification.verified) {
      return dnsVerification;
    }

    // Method 2: Check for well-known endpoint
    const wellKnownVerification = await this.checkWellKnownVerification(domain);
    if (wellKnownVerification.verified) {
      return wellKnownVerification;
    }

    // Method 3: Check for service discovery record
    const serviceVerification = await this.checkServiceRecord(domain);
    if (serviceVerification.verified) {
      return serviceVerification;
    }

    return {
      verified: false,
      method: 'none',
      details: 'No valid ownership proof found'
    };
  }

  /**
   * Create ownership challenge for domain transfer
   */
  async createOwnershipChallenge(
    domain: string,
    challengerIp: string,
    reason: OwnershipChallenge['reason'] = 'ownership_transfer'
  ): Promise<OwnershipChallenge> {
    const token = this.generateSecureToken();
    
    const challenge: OwnershipChallenge = {
      challenge_id: randomUUID(),
      domain,
      challenger_ip: challengerIp,
      txt_record_name: `_mcp-challenge.${domain}`,
      txt_record_value: `mcp_challenge_${token}`,
      created_at: new Date(),
      expires_at: new Date(Date.now() + this.CHALLENGE_TTL),
      reason
    };

    // Store challenge in storage backend
    await this.storeChallenge(challenge);

    return challenge;
  }

  /**
   * Verify ownership challenge
   */
  async verifyOwnershipChallenge(challengeId: string): Promise<{
    success: boolean;
    message: string;
    ownership_transferred?: boolean;
  }> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      return { success: false, message: 'Challenge not found or expired' };
    }

    // Check if challenge has expired
    if (new Date() > challenge.expires_at) {
      return { success: false, message: 'Challenge has expired' };
    }

    // Verify DNS record
    const verified = await this.verifyDNSRecord(
      challenge.txt_record_name,
      challenge.txt_record_value
    );

    if (!verified) {
      return { success: false, message: 'DNS verification failed' };
    }

    // Handle ownership transfer
    const existingServers = await this.registryService.getServersByDomain(challenge.domain);
    let ownershipTransferred = false;

    if (existingServers.length > 0) {
      // Remove existing registration (new owner will re-register)
      await this.registryService.unregisterServer(challenge.domain);
      ownershipTransferred = true;
    }

    // Clean up challenge
    await this.deleteChallenge(challengeId);

    return {
      success: true,
      ownership_transferred: ownershipTransferred,
      message: ownershipTransferred 
        ? 'Domain ownership transferred successfully'
        : 'Domain ownership verified successfully'
    };
  }

  /**
   * Safe update with ownership verification
   */
  async updateWithVerification(
    domain: string,
    updateRequest: UpdateRequest
  ): Promise<{
    success: boolean;
    verification_required?: boolean;
    challenge?: OwnershipChallenge;
    message: string;
  }> {
    const existingServers = await this.registryService.getServersByDomain(domain);
    if (existingServers.length === 0) {
      return { success: false, message: 'Domain not registered' };
    }

    const currentRegistration = existingServers[0];

    // Check if verification is required
    if (this.requiresOwnershipVerification(currentRegistration, updateRequest)) {
      // Verify current ownership
      const ownership = await this.verifyCurrentOwnership(domain);
      
      if (!ownership.verified) {
        return {
          success: false,
          verification_required: true,
          message: 'Domain ownership verification required for this change'
        };
      }
    }

    // Proceed with update - convert capabilities format if needed
    const serverUpdate: Partial<MCPServerRecord> = {
      ...updateRequest,
      capabilities: updateRequest.capabilities ? {
        category: 'other' as const,
        subcategories: updateRequest.capabilities,
        intent_keywords: updateRequest.capabilities,
        use_cases: updateRequest.capabilities.map(cap => `${cap} functionality`)
      } : undefined
    };

    await this.registryService.updateServer(domain, serverUpdate);
    
    return {
      success: true,
      message: 'Registration updated successfully'
    };
  }

  // Private helper methods
  private async checkDNSVerification(domain: string): Promise<{
    verified: boolean;
    method: string;
    details: string;
  }> {
    try {
      const records = await dns.resolveTxt(`_mcp-verify.${domain}`);
      const hasValidRecord = records.some(record => 
        record.join('').includes('mcplookup-verify=')
      );
      
      return {
        verified: hasValidRecord,
        method: 'dns_txt',
        details: hasValidRecord ? 'Valid DNS TXT verification record found' : 'No valid DNS TXT record'
      };
    } catch {
      return {
        verified: false,
        method: 'dns_txt',
        details: 'DNS TXT record not found'
      };
    }
  }

  private async checkWellKnownVerification(domain: string): Promise<{
    verified: boolean;
    method: string;
    details: string;
  }> {
    try {
      const response = await fetch(`https://${domain}/.well-known/mcp`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          verified: !!data.endpoint,
          method: 'well_known',
          details: 'Valid .well-known/mcp endpoint found'
        };
      }
    } catch {
      // Ignore errors
    }

    return {
      verified: false,
      method: 'well_known',
      details: '.well-known/mcp endpoint not accessible'
    };
  }

  private async checkServiceRecord(domain: string): Promise<{
    verified: boolean;
    method: string;
    details: string;
  }> {
    try {
      const records = await dns.resolveTxt(`_mcp.${domain}`);
      const hasServiceRecord = records.some(record => 
        record.join('').includes('v=mcp1')
      );
      
      return {
        verified: hasServiceRecord,
        method: 'service_record',
        details: hasServiceRecord ? 'Valid MCP service record found' : 'No MCP service record'
      };
    } catch {
      return {
        verified: false,
        method: 'service_record',
        details: 'MCP service record not found'
      };
    }
  }

  private async verifyDNSRecord(recordName: string, expectedValue: string): Promise<boolean> {
    // Use multiple resolvers for consensus with security validation
    const { isPrivateIP } = await import('../security/url-validation');

    const promises = this.DNS_RESOLVERS.map(async resolver => {
      try {
        // Validate resolver is not private
        if (isPrivateIP(resolver)) {
          console.warn(`Blocked private DNS resolver: ${resolver}`);
          return false;
        }

        dns.setServers([resolver]);
        const records = await dns.resolveTxt(recordName);
        return records.some(record => record.join('') === expectedValue);
      } catch {
        return false;
      }
    });

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

    // Require majority consensus
    return successCount > this.DNS_RESOLVERS.length / 2;
  }

  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async storeChallenge(challenge: OwnershipChallenge): Promise<void> {
    try {
      // Store challenge with expiration
      const storage = await import('../storage');
      const storageService = storage.getStorageService();

      const result = await storageService.set(
        'ownership_challenges',
        challenge.challenge_id,
        challenge
      );

      if (!result.success) {
        throw new Error(`Failed to store challenge: ${result.error}`);
      }

      console.log(`Successfully stored challenge ${challenge.challenge_id} for ${challenge.domain}`);
    } catch (error) {
      console.error(`Failed to store challenge ${challenge.challenge_id}:`, error);
      throw error;
    }
  }

  private async getChallenge(challengeId: string): Promise<OwnershipChallenge | null> {
    try {
      const storage = await import('../storage');
      const storageService = storage.getStorageService();

      const result = await storageService.get('ownership_challenges', challengeId);

      if (!result.success) {
        return null;
      }

      const challenge = result.data as OwnershipChallenge;

      // Check if challenge has expired
      if (new Date(challenge.expires_at) < new Date()) {
        await this.deleteChallenge(challengeId);
        return null;
      }

      return challenge;
    } catch (error) {
      console.error(`Failed to get challenge ${challengeId}:`, error);
      return null;
    }
  }

  private async deleteChallenge(challengeId: string): Promise<void> {
    try {
      const storage = await import('../storage');
      const storageService = storage.getStorageService();

      const result = await storageService.delete('ownership_challenges', challengeId);

      if (!result.success) {
        console.error(`Failed to delete challenge ${challengeId}: ${result.error}`);
      } else {
        console.log(`Successfully deleted challenge ${challengeId}`);
      }
    } catch (error) {
      console.error(`Failed to delete challenge ${challengeId}:`, error);
    }
  }
}
