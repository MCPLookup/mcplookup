// Domain Transfer Security Service
// Handles domain ownership verification, expiry, and transfer challenges

import { randomUUID } from 'crypto';
import { VerificationService, IVerificationService } from './verification';
import { RegistryService } from './registry';
import { createStorage } from './storage/factory';
import { IStorage, isSuccessResult } from './storage/unified-storage';
import { VerificationChallengeData } from './verification';
import { MCPServerRecord } from '../schemas/discovery';

export interface DomainChallenge {
  challenge_id: string;
  domain: string;
  challenger_ip: string;
  challenge_type: 'ownership_transfer' | 'expired_verification' | 'forced_renewal';
  txt_record_name: string;
  txt_record_value: string;
  created_at: Date;
  expires_at: Date;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  current_owner_notified: boolean;
  notification_sent_at?: Date;
}

// Extended verification challenge data for domain transfer security
export interface DomainTransferChallengeData extends VerificationChallengeData {
  challenger_ip: string;
  challenge_type: 'ownership_transfer' | 'expired_verification' | 'forced_renewal';
  current_owner_notified: boolean;
  notification_sent_at?: string;
}

export interface VerificationStatus {
  domain: string;
  verification_status: 'verified' | 'expired' | 'challenged' | 'revoked';
  verified_at: Date;
  expires_at: Date;
  days_until_expiry: number;
  pending_challenges: DomainChallenge[];
  requires_reverification: boolean;
}

export interface UpdateRequest {
  endpoint?: string;
  capabilities?: string[];
  contact_email?: string;
  description?: string;
}

/**
 * Enhanced Verification Service with Domain Transfer Security
 */
export class DomainTransferSecurityService {
  private readonly VERIFICATION_TTL = 90 * 24 * 60 * 60 * 1000; // 90 days
  private readonly GRACE_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly CHALLENGE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  private verificationService: IVerificationService;
  private registryService: RegistryService;
  private storageService: any;

  constructor(
    verificationService: IVerificationService,
    registryService: RegistryService
  ) {
    this.verificationService = verificationService;
    this.registryService = registryService;
    this.storageService = createStorage();
  }

  /**
   * Check if an update requires re-verification
   */
  async requiresReverification(
    domain: string,
    updateRequest: UpdateRequest
  ): Promise<boolean> {
    const servers = await this.registryService.getServersByDomain(domain);
    if (servers.length === 0) {
      return true; // New registration always requires verification
    }

    const currentRegistration = servers[0];
    
    // Check if verification has expired
    const verificationExpiry = new Date(
      new Date(currentRegistration.verification.verified_at || currentRegistration.verification.last_verification).getTime() + this.VERIFICATION_TTL
    );
    
    if (new Date() > verificationExpiry) {
      return true;
    }

    // Check if endpoint is changing
    if (updateRequest.endpoint && updateRequest.endpoint !== currentRegistration.endpoint) {
      return true;
    }

    // Check for significant capability changes
    if (updateRequest.capabilities) {
      const currentCaps = new Set(currentRegistration.capabilities.subcategories);
      const newCaps = new Set(updateRequest.capabilities);
      
      // Require re-verification if capabilities are significantly different
      const hasSignificantChange = 
        newCaps.size !== currentCaps.size ||
        [...newCaps].some(cap => !currentCaps.has(cap)) ||
        currentCaps.size > 0 && [...currentCaps].some(cap => !newCaps.has(cap));
        
      if (hasSignificantChange) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get verification status for a domain
   */
  async getVerificationStatus(domain: string): Promise<VerificationStatus | null> {
    const servers = await this.registryService.getServersByDomain(domain);
    if (servers.length === 0) {
      return null;
    }

    const registration = servers[0];
    const verifiedAt = new Date(registration.verification.verified_at || registration.verification.last_verification);
    const expiresAt = new Date(verifiedAt.getTime() + this.VERIFICATION_TTL);
    const now = new Date();
    
    const daysUntilExpiry = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    
    // Get pending challenges
    const pendingChallenges = await this.getPendingChallenges(domain);
    
    // Determine status
    let verificationStatus: VerificationStatus['verification_status'] = 'verified';
    if (now > expiresAt) {
      verificationStatus = 'expired';
    } else if (pendingChallenges.length > 0) {
      verificationStatus = 'challenged';
    }

    return {
      domain,
      verification_status: verificationStatus,
      verified_at: verifiedAt,
      expires_at: expiresAt,
      days_until_expiry: daysUntilExpiry,
      pending_challenges: pendingChallenges,
      requires_reverification: daysUntilExpiry <= 30 || verificationStatus !== 'verified'
    };
  }

  /**
   * Initiate a domain ownership challenge
   */
  async initiateDomainChallenge(
    domain: string,
    challengerIp: string,
    challengeType: DomainChallenge['challenge_type'] = 'ownership_transfer'
  ): Promise<DomainChallenge> {
    // Check if there's an existing registration
    const existing = await this.registryService.getServersByDomain(domain);
    
    const token = this.generateSecureToken();
    const challenge: DomainChallenge = {
      challenge_id: randomUUID(),
      domain,
      challenger_ip: challengerIp,
      challenge_type: challengeType,
      txt_record_name: `_mcp-challenge.${domain}`,
      txt_record_value: `mcp_challenge_${token}`,
      created_at: new Date(),
      expires_at: new Date(Date.now() + this.CHALLENGE_TTL),
      status: 'pending',
      current_owner_notified: false
    };

    // Store challenge
    await this.storeChallenge(challenge);

    // Notify current owner if registration exists
    if (existing.length > 0 && challengeType === 'ownership_transfer') {
      await this.notifyCurrentOwner(existing[0], challenge);
      challenge.current_owner_notified = true;
      challenge.notification_sent_at = new Date();
      await this.updateChallenge(challenge);
    }

    return challenge;
  }

  /**
   * Resolve a domain challenge by verifying DNS
   */
  async resolveDomainChallenge(challengeId: string): Promise<{
    success: boolean;
    ownership_transferred?: boolean;
    message: string;
  }> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      return { success: false, message: 'Challenge not found or expired' };
    }

    // Verify DNS record
    const verified = await this.verifyDNSRecord(
      challenge.txt_record_name,
      challenge.txt_record_value
    );

    if (!verified) {
      challenge.status = 'failed';
      await this.updateChallenge(challenge);
      return { success: false, message: 'DNS verification failed' };
    }

    // Challenge verified successfully
    challenge.status = 'verified';
    await this.updateChallenge(challenge);

    // Handle ownership transfer
    const existing = await this.registryService.getServersByDomain(challenge.domain);
    let ownershipTransferred = false;

    if (existing.length > 0) {
      // Archive existing registration
      await this.archiveRegistration(existing[0], 'ownership_transferred');
      ownershipTransferred = true;
    }

    return {
      success: true,
      ownership_transferred: ownershipTransferred,
      message: ownershipTransferred 
        ? 'Domain ownership transferred successfully'
        : 'Domain ownership verified successfully'
    };
  }

  /**
   * Monitor and handle expired verifications
   */
  async monitorVerificationExpiry(): Promise<void> {
    const allServers = await this.registryService.getAllServers();
    const now = new Date();

    for (const server of allServers) {
      const verifiedAt = new Date(server.verification.verified_at || server.verification.last_verification);
      const expiresAt = new Date(verifiedAt.getTime() + this.VERIFICATION_TTL);
      const gracePeriodEnd = new Date(expiresAt.getTime() + this.GRACE_PERIOD);

      if (now > gracePeriodEnd) {
        // Grace period expired, archive registration
        await this.archiveRegistration(server, 'grace_period_expired');
      } else if (now > expiresAt) {
        // Verification expired, mark as expired
        await this.markRegistrationExpired(server.domain);
      } else if (now > new Date(expiresAt.getTime() - (7 * 24 * 60 * 60 * 1000))) {
        // Send expiry warning (7 days before)
        await this.sendExpiryWarning(server, Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
      }
    }
  }

  // Private helper methods
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async verifyDNSRecord(recordName: string, expectedValue: string): Promise<boolean> {
    // Use the existing verification service's DNS verification logic
    try {
      const dns = await import('dns/promises');
      const records = await dns.resolveTxt(recordName);
      
      for (const record of records) {
        const recordValue = Array.isArray(record) ? record.join('') : record;
        if (recordValue === expectedValue) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('DNS verification failed:', error);
      return false;
    }
  }

  private async storeChallenge(challenge: DomainChallenge): Promise<void> {
    // Store in verification storage with challenge prefix
    const challengeData: VerificationChallengeData = {
      // Base VerificationChallenge fields
      challenge_id: challenge.challenge_id,
      domain: challenge.domain,
      txt_record_name: challenge.txt_record_name,
      txt_record_value: challenge.txt_record_value,
      expires_at: challenge.expires_at.toISOString(),
      instructions: `Add TXT record: ${challenge.txt_record_name} = ${challenge.txt_record_value}`,

      // Extended VerificationChallengeData fields
      endpoint: `https://${challenge.domain}/.well-known/mcp`,
      contact_email: 'admin@' + challenge.domain,
      token: 'transfer-token-' + challenge.challenge_id,
      created_at: challenge.created_at.toISOString()
    };

    await this.storageService.set('domain_challenges', `challenge_${challenge.challenge_id}`, challengeData);
  }

  private async getChallenge(challengeId: string): Promise<DomainChallenge | null> {
    const result = await this.storageService.get('domain_challenges', `challenge_${challengeId}`);
    if (!result.success || !result.data) {
      return null;
    }

    // Convert stored data back to DomainChallenge
    const data = result.data as any;
    return {
      challenge_id: challengeId,
      domain: data.domain,
      challenger_ip: 'unknown', // Not stored in VerificationChallengeData
      challenge_type: 'ownership_transfer', // Default type
      txt_record_name: data.txt_record_name,
      txt_record_value: data.txt_record_value,
      created_at: new Date(data.created_at),
      expires_at: new Date(data.expires_at),
      status: data.verified_at ? 'verified' : 'pending',
      current_owner_notified: false, // Not stored in VerificationChallengeData
      notification_sent_at: undefined // Not stored in VerificationChallengeData
    };
  }

  private async updateChallenge(challenge: DomainChallenge): Promise<void> {
    await this.storeChallenge(challenge);
  }

  private async getPendingChallenges(domain: string): Promise<DomainChallenge[]> {
    // This would need to be implemented based on storage capabilities
    // For now, return empty array
    return [];
  }

  private async notifyCurrentOwner(registration: MCPServerRecord, challenge: DomainChallenge): Promise<void> {
    // Implementation would send email/webhook notification
    console.log(`Domain challenge notification sent for ${registration.domain}`);
  }

  private async archiveRegistration(registration: MCPServerRecord, reason: string): Promise<void> {
    // Archive the registration (move to archived table/storage)
    console.log(`Archiving registration for ${registration.domain}: ${reason}`);
    await this.registryService.unregisterServer(registration.domain);
  }

  private async markRegistrationExpired(domain: string): Promise<void> {
    // Mark registration as expired but keep it discoverable during grace period
    console.log(`Marking registration expired for ${domain}`);
  }

  private async sendExpiryWarning(registration: MCPServerRecord, daysUntilExpiry: number): Promise<void> {
    // Send expiry warning notification
    console.log(`Sending expiry warning for ${registration.domain}: ${daysUntilExpiry} days remaining`);
  }
}
