// @ts-nocheck
// Daily Verification Sweep Service
// Checks all registrations daily and marks unverified ones

import { RealtimeDomainSecurityService } from './realtime-domain-security';
import { RegistryService } from './registry';
import { MCPServerRecord } from '../schemas/discovery';

export interface VerificationSweepResult {
  total_checked: number;
  verified_count: number;
  unverified_count: number;
  marked_as_unverified: number;
  errors: number;
  duration_ms: number;
  checked_at: Date;
  details: {
    verified_domains: string[];
    unverified_domains: string[];
    error_domains: string[];
  };
}

export interface UnverifiedRegistration {
  domain: string;
  endpoint: string;
  last_verified_at: Date;
  marked_unverified_at: Date;
  verification_failure_reason: string;
  consecutive_failures: number;
}

/**
 * Daily Verification Sweep Service
 * Runs background checks to detect stale/transferred domains
 */
export class DailyVerificationSweepService {
  private registryService: RegistryService;
  private securityService: RealtimeDomainSecurityService;

  constructor(registryService: RegistryService, securityService: RealtimeDomainSecurityService) {
    this.registryService = registryService;
    this.securityService = securityService;
  }

  /**
   * Run daily verification sweep on all registrations
   */
  async runDailyVerificationSweep(): Promise<VerificationSweepResult> {
    const startTime = Date.now();
    const checkedAt = new Date();
    
    console.log('🔍 Starting daily verification sweep...');

    // Get all registered servers
    const allServers = await this.registryService.getAllVerifiedServers();
    
    const result: VerificationSweepResult = {
      total_checked: allServers.length,
      verified_count: 0,
      unverified_count: 0,
      marked_as_unverified: 0,
      errors: 0,
      duration_ms: 0,
      checked_at: checkedAt,
      details: {
        verified_domains: [],
        unverified_domains: [],
        error_domains: []
      }
    };

    // Check each registration
    for (const server of allServers) {
      try {
        await this.checkSingleRegistration(server, result);
        
        // Add small delay to avoid overwhelming DNS servers
        await this.sleep(100);
        
      } catch (error) {
        console.error(`Error checking ${server.domain}:`, error);
        result.errors++;
        result.details.error_domains.push(server.domain);
      }
    }

    result.duration_ms = Date.now() - startTime;
    
    console.log(`✅ Daily verification sweep completed:`, {
      total: result.total_checked,
      verified: result.verified_count,
      unverified: result.unverified_count,
      marked: result.marked_as_unverified,
      errors: result.errors,
      duration: `${result.duration_ms}ms`
    });

    // Store sweep results for monitoring
    await this.storeSweepResults(result);

    return result;
  }

  /**
   * Check a single registration and update status if needed
   */
  private async checkSingleRegistration(
    server: MCPServerRecord, 
    result: VerificationSweepResult
  ): Promise<void> {
    const domain = server.domain;
    
    // Skip if already marked as unverified (avoid repeated checks)
    if (server.verification_status === 'unverified') {
      console.log(`⏭️ Skipping ${domain} (already marked unverified)`);
      result.unverified_count++;
      result.details.unverified_domains.push(domain);
      return;
    }

    console.log(`🔍 Checking ${domain}...`);

    // Verify current ownership
    const ownershipResult = await this.securityService.verifyCurrentOwnership(domain);

    if (ownershipResult.verified) {
      // Still verified - update last check timestamp
      result.verified_count++;
      result.details.verified_domains.push(domain);
      
      await this.updateLastVerificationCheck(domain);
      console.log(`✅ ${domain} - verified via ${ownershipResult.method}`);
      
    } else {
      // No longer verified - mark as unverified
      result.unverified_count++;
      result.marked_as_unverified++;
      result.details.unverified_domains.push(domain);
      
      await this.markAsUnverified(domain, ownershipResult.details);
      console.log(`❌ ${domain} - marked as unverified: ${ownershipResult.details}`);
    }
  }

  /**
   * Mark a registration as unverified (but keep it in registry)
   */
  private async markAsUnverified(domain: string, reason: string): Promise<void> {
    try {
      // Get current registration
      const servers = await this.registryService.getServersByDomain(domain);
      if (servers.length === 0) return;

      const server = servers[0];
      
      // Calculate consecutive failures
      const consecutiveFailures = (server.consecutive_verification_failures || 0) + 1;
      
      // Update registration with unverified status
      const updates = {
        verification_status: 'unverified' as const,
        marked_unverified_at: new Date().toISOString(),
        verification_failure_reason: reason,
        consecutive_verification_failures: consecutiveFailures,
        last_verification_check: new Date().toISOString(),
        // Reduce trust score for unverified domains
        trust_score: Math.max(0, (server.trust_score || 50) - 20)
      };

      await this.registryService.updateServer(domain, updates);

      // If too many consecutive failures, consider archiving
      if (consecutiveFailures >= 7) { // 7 days of failures
        console.log(`⚠️ ${domain} has ${consecutiveFailures} consecutive failures - consider archiving`);
        await this.considerArchiving(domain, server);
      }

    } catch (error) {
      console.error(`Failed to mark ${domain} as unverified:`, error);
    }
  }

  /**
   * Update last verification check timestamp for verified domains
   */
  private async updateLastVerificationCheck(domain: string): Promise<void> {
    try {
      const updates = {
        last_verification_check: new Date().toISOString(),
        consecutive_verification_failures: 0, // Reset failure count
        verification_status: 'verified' as const
      };

      await this.registryService.updateServer(domain, updates);
    } catch (error) {
      console.error(`Failed to update verification check for ${domain}:`, error);
    }
  }

  /**
   * Consider archiving domains with too many consecutive failures
   */
  private async considerArchiving(domain: string, server: MCPServerRecord): Promise<void> {
    // Archive after 30 days of consecutive failures
    const markedUnverifiedAt = new Date(server.marked_unverified_at || Date.now());
    const daysSinceMarked = (Date.now() - markedUnverifiedAt.getTime()) / (24 * 60 * 60 * 1000);
    
    if (daysSinceMarked >= 30) {
      console.log(`🗄️ Archiving ${domain} after 30 days of verification failures`);
      
      // Move to archived storage (implementation depends on storage backend)
      await this.archiveRegistration(domain, server, 'verification_failure_timeout');
      
      // Remove from active registry
      await this.registryService.unregisterServer(domain);
    }
  }

  /**
   * Get all unverified registrations
   */
  async getUnverifiedRegistrations(): Promise<UnverifiedRegistration[]> {
    const allServers = await this.registryService.getAllServers();
    
    return allServers
      .filter(server => server.verification_status === 'unverified' && server.endpoint)
      .map(server => ({
        domain: server.domain,
        endpoint: server.endpoint!,
        last_verified_at: new Date(server.verification?.verified_at || server.verification?.last_verification || Date.now()),
        marked_unverified_at: new Date((server as any).marked_unverified_at || Date.now()),
        verification_failure_reason: (server as any).verification_failure_reason || 'Unknown',
        consecutive_failures: (server as any).consecutive_verification_failures || 0
      }));
  }

  /**
   * Retry verification for a specific domain
   */
  async retryVerification(domain: string): Promise<{
    success: boolean;
    verified: boolean;
    message: string;
  }> {
    try {
      const servers = await this.registryService.getServersByDomain(domain);
      if (servers.length === 0) {
        return { success: false, verified: false, message: 'Domain not found' };
      }

      const server = servers[0];
      const ownershipResult = await this.securityService.verifyCurrentOwnership(domain);

      if (ownershipResult.verified) {
        // Restore verified status
        await this.registryService.updateServer(domain, {
          verification_status: 'verified',
          consecutive_verification_failures: 0,
          last_verification_check: new Date().toISOString(),
          trust_score: Math.min(100, (server.trust_score || 50) + 20) // Restore trust score
        });

        return {
          success: true,
          verified: true,
          message: `Domain ownership re-verified via ${ownershipResult.method}`
        };
      } else {
        return {
          success: true,
          verified: false,
          message: `Verification still failing: ${ownershipResult.details}`
        };
      }

    } catch (error) {
      console.error(`Retry verification failed for ${domain}:`, error);
      return {
        success: false,
        verified: false,
        message: 'Retry verification failed'
      };
    }
  }

  /**
   * Schedule daily verification sweep (for serverless environments)
   */
  async scheduleDailySweep(): Promise<void> {
    // This would integrate with your deployment platform's cron/scheduler
    // Examples:
    // - Vercel Cron Jobs
    // - AWS EventBridge
    // - GitHub Actions scheduled workflows
    // - Cloudflare Workers Cron Triggers
    
    console.log('📅 Daily verification sweep scheduled');
  }

  // Private helper methods
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async storeSweepResults(result: VerificationSweepResult): Promise<void> {
    // Store results for monitoring/analytics
    // Implementation depends on storage backend
    console.log('📊 Storing sweep results for monitoring');
  }

  private async archiveRegistration(
    domain: string, 
    server: MCPServerRecord, 
    reason: string
  ): Promise<void> {
    // Archive registration (move to archived storage)
    // Implementation depends on storage backend
    console.log(`🗄️ Archiving ${domain}: ${reason}`);
  }
}
