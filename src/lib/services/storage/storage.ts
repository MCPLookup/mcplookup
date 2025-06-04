// Storage Factory - Environment-based storage selection
// Tests: in-memory, Dev: local Redis, Prod: Upstash Redis

import {
  IRegistryStorage,
  IVerificationStorage,
  VerificationChallengeData,
  StorageResult,
  PaginatedResult,
  SearchOptions,
  RegistryStats,
  VerificationStats,
  HealthCheckResult,
  BatchOperationResult,
  ChallengeQueryOptions,
  createSuccessResult,
  createErrorResult,
  createHealthCheckResult,
  createEmptyPaginatedResult,
  validatePaginationOptions,
  DEFAULT_SEARCH_OPTIONS
} from './interfaces.js';
import { UpstashRegistryStorage } from './upstash-registry-storage.js';
import { UpstashVerificationStorage } from './upstash-verification-storage.js';
import { LocalRedisRegistryStorage, LocalRedisVerificationStorage } from './local-redis-storage.js';
import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery.js';

export interface StorageConfig {
  provider?: 'upstash' | 'local' | 'memory';
  redisUrl?: string;
  redisToken?: string;
}

/**
 * In-memory storage for development and testing
 * Implements the full IRegistryStorage interface with pagination and error handling
 */
class InMemoryRegistryStorage implements IRegistryStorage {
  private servers = new Map<string, MCPServerRecord>();

  async storeServer(domain: string, server: MCPServerRecord): Promise<StorageResult<void>> {
    try {
      this.servers.set(domain, { ...server, last_updated: new Date().toISOString() });
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store server: ${error}`, 'STORE_ERROR');
    }
  }

  async getServer(domain: string): Promise<StorageResult<MCPServerRecord | null>> {
    try {
      const server = this.servers.get(domain) || null;
      return createSuccessResult(server);
    } catch (error) {
      return createErrorResult(`Failed to get server: ${error}`, 'GET_ERROR');
    }
  }

  async deleteServer(domain: string): Promise<StorageResult<void>> {
    try {
      this.servers.delete(domain);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete server: ${error}`, 'DELETE_ERROR');
    }
  }

  async getAllServers(options?: SearchOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const validatedOpts = validatePaginationOptions(opts);

      let servers = Array.from(this.servers.values());

      // Filter inactive servers if needed
      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }

      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get all servers: ${error}`, 'GET_ALL_ERROR');
    }
  }

  async storeServers(servers: Map<string, MCPServerRecord>): Promise<StorageResult<BatchOperationResult>> {
    try {
      let successful = 0;
      let failed = 0;
      const errors: Array<{ domain: string; error: string }> = [];

      for (const [domain, server] of servers) {
        try {
          this.servers.set(domain, { ...server, last_updated: new Date().toISOString() });
          successful++;
        } catch (error) {
          failed++;
          errors.push({ domain, error: String(error) });
        }
      }

      return createSuccessResult({ successful, failed, errors });
    } catch (error) {
      return createErrorResult(`Batch operation failed: ${error}`, 'BATCH_ERROR');
    }
  }

  async getServersByCategory(
    category: CapabilityCategory,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      let servers = Array.from(this.servers.values()).filter(s => s.capabilities.category === category);

      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }

      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get servers by category: ${error}`, 'CATEGORY_ERROR');
    }
  }

  async getServersByCapability(
    capability: string,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      let servers = Array.from(this.servers.values()).filter(s =>
        s.capabilities.subcategories?.includes(capability)
      );

      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }

      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get servers by capability: ${error}`, 'CAPABILITY_ERROR');
    }
  }

  async searchServers(
    query: string,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

      if (terms.length === 0) {
        return createSuccessResult(createEmptyPaginatedResult());
      }

      let servers = Array.from(this.servers.values()).filter(server => {
        const searchText = this.getSearchText(server).toLowerCase();
        return terms.every(term => searchText.includes(term));
      });

      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }

      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Search failed: ${error}`, 'SEARCH_ERROR');
    }
  }

  async getStats(): Promise<StorageResult<RegistryStats>> {
    try {
      const servers = Array.from(this.servers.values());
      const activeServers = servers.filter(s => s.health?.status === 'healthy');

      const categories: Record<CapabilityCategory, number> = {} as Record<CapabilityCategory, number>;
      const capabilities: Record<string, number> = {};

      servers.forEach(s => {
        categories[s.capabilities.category] = (categories[s.capabilities.category] || 0) + 1;
        s.capabilities.subcategories?.forEach(cap => {
          capabilities[cap] = (capabilities[cap] || 0) + 1;
        });
      });

      const avgResponseTime = activeServers.length > 0
        ? activeServers.reduce((sum, s) => sum + (s.health?.response_time_ms || 0), 0) / activeServers.length
        : 0;

      const memoryUsed = JSON.stringify(servers).length;

      return createSuccessResult({
        totalServers: servers.length,
        activeServers: activeServers.length,
        categories,
        capabilities,
        memoryUsage: {
          used: `${Math.round(memoryUsed / 1024)}KB`,
          percentage: 0 // Not applicable for in-memory
        },
        performance: {
          avgResponseTime: Math.round(avgResponseTime),
          cacheHitRate: 1.0 // Always 100% for in-memory
        },
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get stats: ${error}`, 'STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const latency = Date.now() - startTime;

    return createHealthCheckResult(true, latency, {
      provider: 'in-memory',
      serverCount: this.servers.size,
      memoryUsage: `${Math.round(JSON.stringify(Array.from(this.servers.values())).length / 1024)}KB`
    });
  }

  async cleanup(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      // For in-memory storage, we can clean up servers with invalid health status
      const serversToRemove = Array.from(this.servers.entries()).filter(([, server]) =>
        !server.health || server.health.status === 'unhealthy'
      );

      if (!dryRun) {
        serversToRemove.forEach(([domain]) => this.servers.delete(domain));
      }

      const freedSpace = `${Math.round(JSON.stringify(serversToRemove.map(([, s]) => s)).length / 1024)}KB`;

      return createSuccessResult({
        removedCount: serversToRemove.length,
        freedSpace
      });
    } catch (error) {
      return createErrorResult(`Cleanup failed: ${error}`, 'CLEANUP_ERROR');
    }
  }

  getProviderInfo() {
    return {
      name: 'in-memory',
      version: '1.0.0',
      capabilities: ['fast-access', 'no-persistence', 'development-only']
    };
  }

  // Helper methods
  private getSortValue(server: MCPServerRecord, sortBy: string): string {
    switch (sortBy) {
      case 'domain': return server.domain;
      case 'name': return server.server_info?.name || server.domain;
      case 'updated_at': return server.last_updated || '';
      case 'health_score': return String(server.health?.uptime_percentage || 0);
      default: return server.domain;
    }
  }

  private getSearchText(server: MCPServerRecord): string {
    return [
      server.domain,
      server.server_info?.name || '',
      server.server_info?.description || '',
      server.capabilities.category,
      ...(server.capabilities.subcategories || []),
      ...(server.tools?.map(t => `${t.name} ${t.description || ''}`) || [])
    ].join(' ');
  }

  private paginateResults(
    servers: MCPServerRecord[],
    options: SearchOptions
  ): StorageResult<PaginatedResult<MCPServerRecord>> {
    try {
      // Sort servers
      servers.sort((a, b) => {
        const aVal = this.getSortValue(a, options.sortBy || 'updated_at');
        const bVal = this.getSortValue(b, options.sortBy || 'updated_at');
        const comparison = aVal.localeCompare(bVal);
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });

      // Apply pagination
      const total = servers.length;
      const start = options.offset || 0;
      const limit = options.limit || 50;
      const items = servers.slice(start, start + limit);
      const hasMore = start + limit < total;

      return createSuccessResult({
        items,
        total,
        hasMore,
        nextCursor: hasMore ? String(start + limit) : undefined
      });
    } catch (error) {
      return createErrorResult(`Pagination failed: ${error}`, 'PAGINATION_ERROR');
    }
  }
}

class InMemoryVerificationStorage implements IVerificationStorage {
  private challenges = new Map<string, VerificationChallengeData>();

  async storeChallenge(challengeId: string, challenge: VerificationChallengeData): Promise<StorageResult<void>> {
    try {
      this.challenges.set(challengeId, challenge);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store challenge: ${error}`, 'STORE_ERROR');
    }
  }

  async getChallenge(challengeId: string): Promise<StorageResult<VerificationChallengeData | null>> {
    try {
      const challenge = this.challenges.get(challengeId) || null;
      return createSuccessResult(challenge);
    } catch (error) {
      return createErrorResult(`Failed to get challenge: ${error}`, 'GET_ERROR');
    }
  }

  async deleteChallenge(challengeId: string): Promise<StorageResult<void>> {
    try {
      this.challenges.delete(challengeId);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete challenge: ${error}`, 'DELETE_ERROR');
    }
  }

  async markChallengeVerified(challengeId: string): Promise<StorageResult<void>> {
    try {
      const challenge = this.challenges.get(challengeId);
      if (challenge) {
        (challenge as any).verified_at = new Date().toISOString();
        return createSuccessResult(undefined);
      }
      return createErrorResult('Challenge not found', 'NOT_FOUND');
    } catch (error) {
      return createErrorResult(`Failed to mark challenge verified: ${error}`, 'VERIFY_ERROR');
    }
  }

  async recordVerificationAttempt(challengeId: string, success: boolean, details?: string): Promise<StorageResult<void>> {
    try {
      const challenge = this.challenges.get(challengeId);
      if (challenge) {
        (challenge as any).attempts = ((challenge as any).attempts || 0) + 1;
        (challenge as any).last_attempt_at = new Date().toISOString();
        if (success) {
          (challenge as any).verified_at = new Date().toISOString();
        }
        return createSuccessResult(undefined);
      }
      return createErrorResult('Challenge not found', 'NOT_FOUND');
    } catch (error) {
      return createErrorResult(`Failed to record attempt: ${error}`, 'ATTEMPT_ERROR');
    }
  }

  async getChallengesByDomain(
    domain: string,
    options?: ChallengeQueryOptions
  ): Promise<StorageResult<PaginatedResult<VerificationChallengeData>>> {
    try {
      const opts = { ...options };
      let challenges = Array.from(this.challenges.values()).filter(c => c.domain === domain);

      // Apply status filter
      if (opts.status) {
        challenges = challenges.filter(c => {
          switch (opts.status) {
            case 'pending': return !c.verified_at;
            case 'verified': return !!c.verified_at;
            case 'expired': return new Date(c.expires_at) < new Date();
            case 'failed': return (c as any).attempts > 0 && !c.verified_at;
            default: return true;
          }
        });
      }

      // Apply date filters
      if (opts.createdAfter) {
        challenges = challenges.filter(c => c.created_at >= opts.createdAfter!);
      }
      if (opts.createdBefore) {
        challenges = challenges.filter(c => c.created_at <= opts.createdBefore!);
      }

      // Apply pagination
      const total = challenges.length;
      const start = opts.offset || 0;
      const limit = opts.limit || 50;
      const items = challenges.slice(start, start + limit);
      const hasMore = start + limit < total;

      return createSuccessResult({
        items,
        total,
        hasMore,
        nextCursor: hasMore ? String(start + limit) : undefined
      });
    } catch (error) {
      return createErrorResult(`Failed to get challenges by domain: ${error}`, 'DOMAIN_ERROR');
    }
  }

  async cleanupExpiredChallenges(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      const now = new Date();
      const expiredChallenges = Array.from(this.challenges.entries()).filter(([, challenge]) =>
        new Date(challenge.expires_at) < now
      );

      if (!dryRun) {
        expiredChallenges.forEach(([challengeId]) => this.challenges.delete(challengeId));
      }

      const freedSpace = `${Math.round(JSON.stringify(expiredChallenges.map(([, c]) => c)).length / 1024)}KB`;

      return createSuccessResult({
        removedCount: expiredChallenges.length,
        freedSpace
      });
    } catch (error) {
      return createErrorResult(`Cleanup failed: ${error}`, 'CLEANUP_ERROR');
    }
  }

  async getStats(): Promise<StorageResult<VerificationStats>> {
    try {
      const challenges = Array.from(this.challenges.values());
      const now = new Date();

      const activeChallenges = challenges.filter(c => new Date(c.expires_at) > now && !c.verified_at);
      const verifiedChallenges = challenges.filter(c => !!c.verified_at);
      const expiredChallenges = challenges.filter(c => new Date(c.expires_at) < now);
      const failedChallenges = challenges.filter(c => (c as any).attempts > 0 && !c.verified_at);

      const verificationTimes = verifiedChallenges
        .filter(c => c.verified_at)
        .map(c => new Date(c.verified_at!).getTime() - new Date(c.created_at).getTime());

      const avgVerificationTime = verificationTimes.length > 0
        ? verificationTimes.reduce((sum, time) => sum + time, 0) / verificationTimes.length / 1000 // Convert to seconds
        : 0;

      const memoryUsed = JSON.stringify(challenges).length;

      return createSuccessResult({
        totalChallenges: challenges.length,
        activeChallenges: activeChallenges.length,
        verifiedChallenges: verifiedChallenges.length,
        expiredChallenges: expiredChallenges.length,
        failedChallenges: failedChallenges.length,
        memoryUsage: {
          used: `${Math.round(memoryUsed / 1024)}KB`
        },
        averageVerificationTime: Math.round(avgVerificationTime),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get stats: ${error}`, 'STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const latency = Date.now() - startTime;

    return createHealthCheckResult(true, latency, {
      provider: 'in-memory',
      challengeCount: this.challenges.size,
      memoryUsage: `${Math.round(JSON.stringify(Array.from(this.challenges.values())).length / 1024)}KB`
    });
  }

  getProviderInfo() {
    return {
      name: 'in-memory',
      version: '1.0.0',
      capabilities: ['fast-access', 'no-persistence', 'development-only']
    };
  }
}

/**
 * Get registry storage based on environment
 */
export function getRegistryStorage(config?: StorageConfig): IRegistryStorage {
  const provider = config?.provider || detectStorageProvider();

  switch (provider) {
    case 'upstash':
      return new UpstashRegistryStorage();
    case 'local':
      return new LocalRedisRegistryStorage();
    case 'memory':
      return new InMemoryRegistryStorage();
    default:
      return new InMemoryRegistryStorage();
  }
}

/**
 * Get verification storage based on environment
 */
export function getVerificationStorage(config?: StorageConfig): IVerificationStorage {
  const provider = config?.provider || detectStorageProvider();

  switch (provider) {
    case 'upstash':
      return new UpstashVerificationStorage();
    case 'local':
      return new LocalRedisVerificationStorage();
    case 'memory':
      return new InMemoryVerificationStorage();
    default:
      return new InMemoryVerificationStorage();
  }
}

/**
 * Auto-detect storage provider based on environment
 */
function detectStorageProvider(): 'upstash' | 'local' | 'memory' {
  // Tests always use memory
  if (process.env.NODE_ENV === 'test') {
    return 'memory';
  }
  
  // Production uses Upstash
  if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL) {
    return 'upstash';
  }
  
  // Development: Check for local Redis first, then Upstash, then memory
  if (process.env.REDIS_URL) {
    return 'local';
  }
  
  if (process.env.UPSTASH_REDIS_REST_URL) {
    return 'upstash';
  }
  
  // Fallback to memory for development without Redis
  console.warn('No Redis configuration found, using in-memory storage');
  return 'memory';
}
