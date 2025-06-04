// Local Redis Storage Implementation
// Uses standard Redis client for local development with Docker

import { createClient, RedisClientType } from 'redis';
import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery';
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
} from './interfaces';

/**
 * Local Redis Registry Storage
 * Uses standard Redis client for local development
 */
export class LocalRedisRegistryStorage implements IRegistryStorage {
  private redis: RedisClientType;
  private connected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.redis = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    this.redis.on('error', (err) => {
      console.error('Local Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Connected to local Redis');
      this.connected = true;
    });

    this.redis.on('disconnect', () => {
      console.log('Disconnected from local Redis');
      this.connected = false;
    });
  }

  private async ensureConnection(): Promise<void> {
    if (!this.connected) {
      await this.redis.connect();
    }
  }

  /**
   * Store MCP server with multiple indexes for efficient search
   */
  async storeServer(domain: string, server: MCPServerRecord): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      const serverWithTimestamp = { ...server, updated_at: new Date().toISOString() };
      const multi = this.redis.multi();

      // 1. Store the full server record
      multi.set(`server:${domain}`, JSON.stringify(serverWithTimestamp));

      // 2. Add to category index
      multi.sAdd(`category:${serverWithTimestamp.capabilities.category}`, domain);

      // 3. Add to capability indexes
      if (serverWithTimestamp.capabilities.subcategories) {
        for (const capability of serverWithTimestamp.capabilities.subcategories) {
          multi.sAdd(`capability:${capability}`, domain);
        }
      }

      // 4. Add to all servers set
      multi.sAdd('servers:all', domain);

      // 5. Add search terms for text search
      const searchTerms = this.extractSearchTerms(serverWithTimestamp);
      for (const term of searchTerms) {
        multi.sAdd(`search:${term.toLowerCase()}`, domain);
      }

      // Execute all operations atomically
      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store server: ${error}`, 'LOCAL_REDIS_STORE_ERROR');
    }
  }

  /**
   * Get server by domain
   */
  async getServer(domain: string): Promise<StorageResult<MCPServerRecord | null>> {
    try {
      await this.ensureConnection();

      const data = await this.redis.get(`server:${domain}`);
      if (!data) {
        return createSuccessResult(null);
      }

      const server = JSON.parse(data) as MCPServerRecord;
      return createSuccessResult(server);
    } catch (error) {
      return createErrorResult(`Failed to get server: ${error}`, 'LOCAL_REDIS_GET_ERROR');
    }
  }

  /**
   * Delete server and all its indexes
   */
  async deleteServer(domain: string): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      // First get the server to know what indexes to clean
      const serverResult = await this.getServer(domain);
      if (!serverResult.success || !serverResult.data) {
        return createSuccessResult(undefined); // Already deleted
      }

      const server = serverResult.data;
      const multi = this.redis.multi();

      // Remove main record
      multi.del(`server:${domain}`);

      // Remove from all indexes
      multi.sRem('servers:all', domain);
      multi.sRem(`category:${server.capabilities.category}`, domain);

      if (server.capabilities.subcategories) {
        for (const capability of server.capabilities.subcategories) {
          multi.sRem(`capability:${capability}`, domain);
        }
      }

      // Remove from search indexes
      const searchTerms = this.extractSearchTerms(server);
      for (const term of searchTerms) {
        multi.sRem(`search:${term.toLowerCase()}`, domain);
      }

      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete server: ${error}`, 'LOCAL_REDIS_DELETE_ERROR');
    }
  }

  /**
   * Get all registered servers with pagination
   */
  async getAllServers(options?: SearchOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      await this.ensureConnection();

      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const domains = await this.redis.sMembers('servers:all');
      let servers = await this.getServersByDomains(domains);

      // Filter inactive servers if needed
      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }

      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get all servers: ${error}`, 'LOCAL_REDIS_GET_ALL_ERROR');
    }
  }

  /**
   * Store multiple servers in batch
   */
  async storeServers(servers: Map<string, MCPServerRecord>): Promise<StorageResult<BatchOperationResult>> {
    try {
      let successful = 0;
      let failed = 0;
      const errors: Array<{ domain: string; error: string }> = [];

      // Process in batches to avoid overwhelming Redis
      const batchSize = 10;
      const entries = Array.from(servers.entries());

      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);

        for (const [domain, server] of batch) {
          const result = await this.storeServer(domain, server);
          if (result.success) {
            successful++;
          } else {
            failed++;
            errors.push({ domain, error: result.error });
          }
        }
      }

      return createSuccessResult({ successful, failed, errors });
    } catch (error) {
      return createErrorResult(`Batch operation failed: ${error}`, 'LOCAL_REDIS_BATCH_ERROR');
    }
  }

  /**
   * Get servers by category with pagination
   */
  async getServersByCategory(
    category: CapabilityCategory,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      await this.ensureConnection();

      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const domains = await this.redis.sMembers(`category:${category}`);
      let servers = await this.getServersByDomains(domains);

      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }

      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get servers by category: ${error}`, 'LOCAL_REDIS_CATEGORY_ERROR');
    }
  }

  /**
   * Get servers by capability with pagination
   */
  async getServersByCapability(
    capability: string,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      await this.ensureConnection();

      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const domains = await this.redis.sMembers(`capability:${capability}`);
      let servers = await this.getServersByDomains(domains);

      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }

      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get servers by capability: ${error}`, 'LOCAL_REDIS_CAPABILITY_ERROR');
    }
  }

  /**
   * Search servers by text query with pagination
   */
  async searchServers(
    query: string,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      await this.ensureConnection();

      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);

      if (searchTerms.length === 0) {
        return createSuccessResult(createEmptyPaginatedResult());
      }

      // Get domains that match any search term
      const domainSets = await Promise.all(
        searchTerms.map(term => this.redis.sMembers(`search:${term}`))
      );

      // Find intersection of all search terms (AND logic)
      const allDomains = domainSets.flat();
      const domainCounts = new Map<string, number>();

      for (const domain of allDomains) {
        domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
      }

      // Only include domains that appear in all search term results
      const matchingDomains = Array.from(domainCounts.entries())
        .filter(([, count]) => count === searchTerms.length)
        .map(([domain]) => domain);

      let servers = await this.getServersByDomains(matchingDomains);

      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }

      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Search failed: ${error}`, 'LOCAL_REDIS_SEARCH_ERROR');
    }
  }

  /**
   * Get comprehensive storage statistics
   */
  async getStats(): Promise<StorageResult<RegistryStats>> {
    try {
      await this.ensureConnection();

      const totalServers = await this.redis.sCard('servers:all');

      // Get all servers to calculate active count and other stats
      const domains = await this.redis.sMembers('servers:all');
      const servers = await this.getServersByDomains(domains);
      const activeServers = servers.filter(s => s.health?.status === 'healthy');

      // Get category counts
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

      // Get memory usage if available
      let memoryUsed = 'N/A';
      try {
        // Use INFO command instead of MEMORY which might not be available
        const info = await this.redis.info('memory');
        const match = info.match(/used_memory:(\d+)/);
        if (match) {
          memoryUsed = `${Math.round(parseInt(match[1]) / 1024)}KB`;
        }
      } catch (error) {
        // Memory info might not be available in all Redis versions
      }

      return createSuccessResult({
        totalServers,
        activeServers: activeServers.length,
        categories,
        capabilities,
        memoryUsage: {
          used: memoryUsed,
          percentage: 0 // Not easily calculable for Redis
        },
        performance: {
          avgResponseTime: Math.round(avgResponseTime),
          cacheHitRate: 0.98 // Estimated for local Redis
        },
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get stats: ${error}`, 'LOCAL_REDIS_STATS_ERROR');
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      await this.ensureConnection();
      const result = await this.redis.ping();
      const latency = Date.now() - startTime;
      const healthy = result === 'PONG';

      return createHealthCheckResult(healthy, latency, {
        provider: 'local-redis',
        connection: this.connected ? 'active' : 'inactive',
        serverCount: await this.redis.sCard('servers:all')
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      return createHealthCheckResult(false, latency, {
        provider: 'local-redis',
        error: String(error)
      });
    }
  }

  /**
   * Cleanup expired or invalid records
   */
  async cleanup(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      await this.ensureConnection();

      // For local Redis, we can clean up servers with old timestamps or invalid health
      const domains = await this.redis.sMembers('servers:all');
      const servers = await this.getServersByDomains(domains);

      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const serversToRemove = servers.filter(server =>
        !server.updated_at ||
        new Date(server.updated_at) < cutoffDate ||
        server.health?.status === 'unhealthy'
      );

      if (!dryRun) {
        for (const server of serversToRemove) {
          await this.deleteServer(server.domain);
        }
      }

      // Estimate freed space
      const freedSpace = `${Math.round(JSON.stringify(serversToRemove).length / 1024)}KB`;

      return createSuccessResult({
        removedCount: serversToRemove.length,
        freedSpace
      });
    } catch (error) {
      return createErrorResult(`Cleanup failed: ${error}`, 'LOCAL_REDIS_CLEANUP_ERROR');
    }
  }

  getProviderInfo() {
    return {
      name: 'local-redis',
      version: '1.0.0',
      capabilities: ['persistence', 'fast-access', 'local-development', 'docker-ready']
    };
  }

  /**
   * Helper: Get multiple servers by domains
   */
  private async getServersByDomains(domains: string[]): Promise<MCPServerRecord[]> {
    if (domains.length === 0) return [];
    
    const keys = domains.map(domain => `server:${domain}`);
    const results = await this.redis.mGet(keys);
    
    return results
      .filter(result => result !== null)
      .map(result => {
        try {
          return JSON.parse(result as string) as MCPServerRecord;
        } catch (error) {
          console.error('Error parsing server data:', error);
          return null;
        }
      })
      .filter(server => server !== null) as MCPServerRecord[];
  }

  /**
   * Helper: Extract search terms from server record
   */
  private extractSearchTerms(server: MCPServerRecord): string[] {
    const terms = new Set<string>();
    
    // Add domain parts
    const domainParts = server.domain.split('.');
    domainParts.forEach(part => terms.add(part));
    
    // Add server info terms
    if (server.server_info?.name) {
      server.server_info.name.split(/\s+/).forEach(word => terms.add(word));
    }

    // Add main description (from MCPServerRecord, not server_info)
    if (server.description) {
      server.description.split(/\s+/).forEach(word => terms.add(word));
    }
    
    // Add capability terms
    terms.add(server.capabilities.category);
    if (server.capabilities.subcategories) {
      server.capabilities.subcategories.forEach(cap => terms.add(cap));
    }
    
    // Add tool names
    if (server.tools) {
      server.tools.forEach(tool => {
        terms.add(tool.name);
        if (tool.description) {
          tool.description.split(/\s+/).forEach(word => terms.add(word));
        }
      });
    }
    
    return Array.from(terms).filter(term => term.length > 2);
  }

  /**
   * Helper: Paginate and sort results
   */
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

  /**
   * Helper: Get sort value for a server
   */
  private getSortValue(server: MCPServerRecord, sortBy: string): string {
    switch (sortBy) {
      case 'domain': return server.domain;
      case 'name': return server.server_info?.name || server.domain;
      case 'updated_at': return server.updated_at || '';
      case 'health_score': return String(server.health?.uptime_percentage || 0);
      default: return server.domain;
    }
  }

  /**
   * Cleanup method to close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.redis.disconnect();
    }
  }
}

/**
 * Local Redis Verification Storage
 * Uses standard Redis client for local development
 */
export class LocalRedisVerificationStorage implements IVerificationStorage {
  private redis: RedisClientType;
  private connected = false;
  private readonly TTL_SECONDS = 24 * 60 * 60; // 24 hours

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.redis = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    this.redis.on('error', (err) => {
      console.error('Local Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Connected to local Redis for verification');
      this.connected = true;
    });

    this.redis.on('disconnect', () => {
      console.log('Disconnected from local Redis verification');
      this.connected = false;
    });
  }

  private async ensureConnection(): Promise<void> {
    if (!this.connected) {
      await this.redis.connect();
    }
  }

  /**
   * Store verification challenge with automatic expiration
   */
  async storeChallenge(challengeId: string, challenge: VerificationChallengeData): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      const key = `challenge:${challengeId}`;
      const domainKey = `domain:${challenge.domain}`;

      // Use pipeline for atomic operations
      const multi = this.redis.multi();

      // Store the challenge with TTL
      multi.setEx(key, this.TTL_SECONDS, JSON.stringify(challenge));

      // Add to domain index for efficient domain-based queries
      multi.sAdd(domainKey, challengeId);
      multi.expire(domainKey, this.TTL_SECONDS);

      // Add to global challenges set
      multi.sAdd('challenges:all', challengeId);

      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store challenge: ${error}`, 'LOCAL_REDIS_STORE_ERROR');
    }
  }

  /**
   * Retrieve verification challenge by ID
   */
  async getChallenge(challengeId: string): Promise<StorageResult<VerificationChallengeData | null>> {
    try {
      await this.ensureConnection();

      const key = `challenge:${challengeId}`;
      const data = await this.redis.get(key);

      if (!data) {
        return createSuccessResult(null);
      }

      const challenge = JSON.parse(data) as VerificationChallengeData;
      return createSuccessResult(challenge);
    } catch (error) {
      return createErrorResult(`Failed to get challenge: ${error}`, 'LOCAL_REDIS_GET_ERROR');
    }
  }

  /**
   * Delete verification challenge
   */
  async deleteChallenge(challengeId: string): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      // Get challenge first to clean up domain index
      const challengeResult = await this.getChallenge(challengeId);

      const multi = this.redis.multi();

      // Remove main challenge
      multi.del(`challenge:${challengeId}`);

      // Remove from global set
      multi.sRem('challenges:all', challengeId);

      // Remove from domain index if challenge exists
      if (challengeResult.success && challengeResult.data) {
        multi.sRem(`domain:${challengeResult.data.domain}`, challengeId);
      }

      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete challenge: ${error}`, 'LOCAL_REDIS_DELETE_ERROR');
    }
  }

  /**
   * Mark challenge as verified
   */
  async markChallengeVerified(challengeId: string): Promise<StorageResult<void>> {
    try {
      const challengeResult = await this.getChallenge(challengeId);
      if (!challengeResult.success || !challengeResult.data) {
        return createErrorResult('Challenge not found', 'NOT_FOUND');
      }

      const challenge = challengeResult.data;
      const updatedChallenge = {
        ...challenge,
        verified_at: new Date().toISOString()
      };

      return await this.storeChallenge(challengeId, updatedChallenge);
    } catch (error) {
      return createErrorResult(`Failed to mark challenge verified: ${error}`, 'LOCAL_REDIS_VERIFY_ERROR');
    }
  }

  /**
   * Record verification attempt
   */
  async recordVerificationAttempt(challengeId: string, success: boolean, details?: string): Promise<StorageResult<void>> {
    try {
      const challengeResult = await this.getChallenge(challengeId);
      if (!challengeResult.success || !challengeResult.data) {
        return createErrorResult('Challenge not found', 'NOT_FOUND');
      }

      const challenge = challengeResult.data as any;
      const updatedChallenge = {
        ...challenge,
        attempts: (challenge.attempts || 0) + 1,
        last_attempt_at: new Date().toISOString()
      };

      if (success) {
        updatedChallenge.verified_at = new Date().toISOString();
      }

      return await this.storeChallenge(challengeId, updatedChallenge);
    } catch (error) {
      return createErrorResult(`Failed to record attempt: ${error}`, 'LOCAL_REDIS_ATTEMPT_ERROR');
    }
  }

  /**
   * Get challenges by domain with filtering
   */
  async getChallengesByDomain(
    domain: string,
    options?: ChallengeQueryOptions
  ): Promise<StorageResult<PaginatedResult<VerificationChallengeData>>> {
    try {
      await this.ensureConnection();

      const opts = { ...options };
      const domainKey = `domain:${domain}`;

      // Get challenge IDs for this domain
      const challengeIds = await this.redis.sMembers(domainKey);

      if (challengeIds.length === 0) {
        return createSuccessResult(createEmptyPaginatedResult());
      }

      // Get all challenges
      const keys = challengeIds.map(id => `challenge:${id}`);
      const results = await this.redis.mGet(keys);

      let challenges = results
        .filter(result => result !== null)
        .map(result => {
          try {
            return JSON.parse(result as string);
          } catch (error) {
            console.error('Error parsing challenge data:', error);
            return null;
          }
        })
        .filter(challenge => challenge !== null) as VerificationChallengeData[];

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
      return createErrorResult(`Failed to get challenges by domain: ${error}`, 'LOCAL_REDIS_DOMAIN_ERROR');
    }
  }

  /**
   * Cleanup expired challenges
   */
  async cleanupExpiredChallenges(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      await this.ensureConnection();

      // Get all challenge IDs
      const challengeIds = await this.redis.sMembers('challenges:all');

      if (challengeIds.length === 0) {
        return createSuccessResult({ removedCount: 0, freedSpace: '0KB' });
      }

      // Get all challenges to check expiration
      const keys = challengeIds.map(id => `challenge:${id}`);
      const results = await this.redis.mGet(keys);

      const now = new Date();
      const expiredChallenges: string[] = [];

      results.forEach((result, index) => {
        if (result) {
          try {
            const challenge = JSON.parse(result as string);
            if (new Date(challenge.expires_at) < now) {
              expiredChallenges.push(challengeIds[index]);
            }
          } catch (error) {
            // If we can't parse it, consider it expired
            expiredChallenges.push(challengeIds[index]);
          }
        }
      });

      if (!dryRun && expiredChallenges.length > 0) {
        // Delete expired challenges
        for (const challengeId of expiredChallenges) {
          await this.deleteChallenge(challengeId);
        }
      }

      const freedSpace = `${Math.round(JSON.stringify(expiredChallenges).length / 1024)}KB`;

      return createSuccessResult({
        removedCount: expiredChallenges.length,
        freedSpace
      });
    } catch (error) {
      return createErrorResult(`Cleanup failed: ${error}`, 'LOCAL_REDIS_CLEANUP_ERROR');
    }
  }

  /**
   * Get comprehensive verification statistics
   */
  async getStats(): Promise<StorageResult<VerificationStats>> {
    try {
      await this.ensureConnection();

      // Get all challenge IDs
      const challengeIds = await this.redis.sMembers('challenges:all');

      if (challengeIds.length === 0) {
        return createSuccessResult({
          totalChallenges: 0,
          activeChallenges: 0,
          verifiedChallenges: 0,
          expiredChallenges: 0,
          failedChallenges: 0,
          memoryUsage: { used: '0KB' },
          averageVerificationTime: 0,
          lastUpdated: new Date().toISOString()
        });
      }

      // Get all challenges
      const keys = challengeIds.map(id => `challenge:${id}`);
      const results = await this.redis.mGet(keys);

      const challenges = results
        .filter(result => result !== null)
        .map(result => {
          try {
            return JSON.parse(result as string);
          } catch (error) {
            return null;
          }
        })
        .filter(challenge => challenge !== null) as VerificationChallengeData[];

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

      // Get memory usage if available
      let memoryUsed = 'N/A';
      try {
        // Use INFO command instead of MEMORY which might not be available
        const info = await this.redis.info('memory');
        const match = info.match(/used_memory:(\d+)/);
        if (match) {
          memoryUsed = `${Math.round(parseInt(match[1]) / 1024)}KB`;
        }
      } catch (error) {
        // Memory info might not be available in all Redis versions
      }

      return createSuccessResult({
        totalChallenges: challenges.length,
        activeChallenges: activeChallenges.length,
        verifiedChallenges: verifiedChallenges.length,
        expiredChallenges: expiredChallenges.length,
        failedChallenges: failedChallenges.length,
        memoryUsage: {
          used: memoryUsed
        },
        averageVerificationTime: Math.round(avgVerificationTime),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get stats: ${error}`, 'LOCAL_REDIS_STATS_ERROR');
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      await this.ensureConnection();
      const result = await this.redis.ping();
      const latency = Date.now() - startTime;
      const healthy = result === 'PONG';

      return createHealthCheckResult(healthy, latency, {
        provider: 'local-redis',
        connection: this.connected ? 'active' : 'inactive',
        challengeCount: await this.redis.sCard('challenges:all')
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      return createHealthCheckResult(false, latency, {
        provider: 'local-redis',
        error: String(error)
      });
    }
  }

  getProviderInfo() {
    return {
      name: 'local-redis',
      version: '1.0.0',
      capabilities: ['persistence', 'fast-access', 'local-development', 'docker-ready']
    };
  }

  /**
   * Cleanup method to close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.redis.disconnect();
    }
  }
}
