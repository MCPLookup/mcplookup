// Local Redis Storage Implementation
// Uses standard Redis client for local development with Docker

import { createClient, RedisClientType } from 'redis';
import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery';
import {
  IRegistryStorage,
  IVerificationStorage,
  IUserStorage,
  VerificationChallengeData,
  UserProfile,
  UserSession,
  UserRegistration,
  UserQueryOptions,
  UserStats,
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
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 500)
      }
    });

    this.redis.on('error', (err: Error) => {
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
      .filter((result: string | null) => result !== null)
      .map((result: string | null) => {
        try {
          return JSON.parse(result as string) as MCPServerRecord;
        } catch (error) {
          console.error('Error parsing server data:', error);
          return null;
        }
      })
      .filter((server: MCPServerRecord | null) => server !== null) as MCPServerRecord[];
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
      server.server_info.name.split(/\s+/).forEach((word: string) => terms.add(word));
    }

    // Add main description (from MCPServerRecord, not server_info)
    if (server.description) {
      server.description.split(/\s+/).forEach((word: string) => terms.add(word));
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
          tool.description.split(/\s+/).forEach((word: string) => terms.add(word));
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
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 500)
      }
    });

    this.redis.on('error', (err: Error) => {
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
   * Remove verification challenge
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
      const keys = challengeIds.map((id: string) => `challenge:${id}`);
      const results = await this.redis.mGet(keys);

      let challenges = results
        .filter((result: string | null) => result !== null)
        .map((result: string | null) => {
          try {
            return JSON.parse(result as string);
          } catch (error) {
            console.error('Error parsing challenge data:', error);
            return null;
          }
        })
        .filter((challenge: VerificationChallengeData | null) => challenge !== null) as VerificationChallengeData[];

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
        challenges = challenges.filter((c: VerificationChallengeData) => new Date(c.created_at) >= new Date(opts.createdAfter!));
      }
      if (opts.createdBefore) {
        challenges = challenges.filter((c: VerificationChallengeData) => new Date(c.created_at) <= new Date(opts.createdBefore!));
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
      const keys = challengeIds.map((id: string) => `challenge:${id}`);
      const results = await this.redis.mGet(keys);

      const now = new Date();
      const expiredChallenges: string[] = [];

      results.forEach((result: string | null, index: number) => {
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
      const keys = challengeIds.map((id: string) => `challenge:${id}`);
      const results = await this.redis.mGet(keys);

      const challenges = results
        .filter((result: string | null) => result !== null)
        .map((result: string | null) => {
          try {
            return JSON.parse(result as string);
          } catch (error) {
            return null;
          }
        })
        .filter((challenge: VerificationChallengeData | null) => challenge !== null) as VerificationChallengeData[];

      const now = new Date();
      const activeChallenges = challenges.filter(c => new Date(c.expires_at) > now && !c.verified_at);
      const verifiedChallenges = challenges.filter(c => !!c.verified_at);
      const expiredChallenges = challenges.filter(c => new Date(c.expires_at) < now);
      const failedChallenges = challenges.filter(c => (c as any).attempts > 0 && !c.verified_at);

      const verificationTimes = verifiedChallenges
        .filter(c => c.verified_at)
        .map(c => new Date().getTime() - new Date(c.created_at).getTime());

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

/**
 * Local Redis User Storage
 * Handles user authentication, profiles, and session management using Redis
 */
export class LocalRedisUserStorage implements IUserStorage {
  private redis: RedisClientType;
  private connected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.redis = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 500)
      }
    });

    this.redis.on('error', (err: Error) => {
      console.error('Local Redis User Storage connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Connected to local Redis for user storage');
      this.connected = true;
    });

    this.redis.on('disconnect', () => {
      console.log('Disconnected from local Redis user storage');
      this.connected = false;
    });
  }

  private async ensureConnection(): Promise<void> {
    if (!this.connected) {
      await this.redis.connect();
    }
  }

  // ==========================================================================
  // USER PROFILE OPERATIONS
  // ==========================================================================

  async storeUser(userId: string, user: UserProfile): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      const userWithTimestamp = { ...user, updated_at: new Date().toISOString() };
      const multi = this.redis.multi();

      // 1. Store the full user profile
      multi.set(`user:${userId}`, JSON.stringify(userWithTimestamp));

      // 2. Create email index for fast email lookups
      multi.set(`email:${user.email}`, userId);

      // 3. Create provider index for OAuth lookups
      multi.set(`provider:${user.provider}:${user.provider_id}`, userId);

      // 4. Add to role index
      multi.sAdd(`role:${user.role}`, userId);

      // 5. Add to provider index
      multi.sAdd(`provider_type:${user.provider}`, userId);

      // 6. Add to all users set
      multi.sAdd('users:all', userId);

      // 7. Add to active/inactive index
      if (user.is_active) {
        multi.sAdd('users:active', userId);
      } else {
        multi.sAdd('users:inactive', userId);
      }

      // 8. Add to verified/unverified index
      if (user.email_verified) {
        multi.sAdd('users:verified', userId);
      } else {
        multi.sAdd('users:unverified', userId);
      }

      // Execute all operations atomically
      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store user: ${error}`, 'LOCAL_REDIS_USER_STORE_ERROR');
    }
  }

  async getUser(userId: string): Promise<StorageResult<UserProfile | null>> {
    try {
      await this.ensureConnection();

      const userData = await this.redis.get(`user:${userId}`);
      if (!userData) {
        return createSuccessResult(null);
      }

      const user = JSON.parse(userData) as UserProfile;
      return createSuccessResult(user);
    } catch (error) {
      return createErrorResult(`Failed to get user: ${error}`, 'LOCAL_REDIS_USER_GET_ERROR');
    }
  }

  async getUserByEmail(email: string): Promise<StorageResult<UserProfile | null>> {
    try {
      await this.ensureConnection();

      const userId = await this.redis.get(`email:${email}`);
      if (!userId) {
        return createSuccessResult(null);
      }

      return this.getUser(userId);
    } catch (error) {
      return createErrorResult(`Failed to get user by email: ${error}`, 'LOCAL_REDIS_USER_GET_BY_EMAIL_ERROR');
    }
  }

  async getUserByProvider(provider: string, providerId: string): Promise<StorageResult<UserProfile | null>> {
    try {
      await this.ensureConnection();

      const userId = await this.redis.get(`provider:${provider}:${providerId}`);
      if (!userId) {
        return createSuccessResult(null);
      }

      return this.getUser(userId);
    } catch (error) {
      return createErrorResult(`Failed to get user by provider: ${error}`, 'LOCAL_REDIS_USER_GET_BY_PROVIDER_ERROR');
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      // Get existing user
      const existingResult = await this.getUser(userId);
      if (!existingResult.success || !existingResult.data) {
        return createErrorResult('User not found', 'USER_NOT_FOUND');
      }

      const existingUser = existingResult.data;
      const updatedUser = {
        ...existingUser,
        ...updates,
        updated_at: new Date().toISOString()
      };

      const multi = this.redis.multi();

      // Update main user record
      multi.set(`user:${userId}`, JSON.stringify(updatedUser));

      // Update indexes if relevant fields changed
      if (updates.email && updates.email !== existingUser.email) {
        // Remove old email index and add new one
        multi.del(`email:${existingUser.email}`);
        multi.set(`email:${updates.email}`, userId);
      }

      if (updates.role && updates.role !== existingUser.role) {
        // Update role indexes
        multi.sRem(`role:${existingUser.role}`, userId);
        multi.sAdd(`role:${updates.role}`, userId);
      }

      if (updates.is_active !== undefined && updates.is_active !== existingUser.is_active) {
        // Update active/inactive indexes
        if (updates.is_active) {
          multi.sRem('users:inactive', userId);
          multi.sAdd('users:active', userId);
        } else {
          multi.sRem('users:active', userId);
          multi.sAdd('users:inactive', userId);
        }
      }

      if (updates.email_verified !== undefined && updates.email_verified !== existingUser.email_verified) {
        // Update verified/unverified indexes
        if (updates.email_verified) {
          multi.sRem('users:unverified', userId);
          multi.sAdd('users:verified', userId);
        } else {
          multi.sRem('users:verified', userId);
          multi.sAdd('users:unverified', userId);
        }
      }

      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to update user: ${error}`, 'LOCAL_REDIS_USER_UPDATE_ERROR');
    }
  }

  async deleteUser(userId: string): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      // Get existing user to clean up indexes
      const existingResult = await this.getUser(userId);
      if (!existingResult.success || !existingResult.data) {
        return createErrorResult('User not found', 'USER_NOT_FOUND');
      }

      const user = existingResult.data;
      const multi = this.redis.multi();

      // Remove main user record
      multi.del(`user:${userId}`);

      // Remove from all indexes
      multi.del(`email:${user.email}`);
      multi.del(`provider:${user.provider}:${user.provider_id}`);
      multi.sRem(`role:${user.role}`, userId);
      multi.sRem(`provider_type:${user.provider}`, userId);
      multi.sRem('users:all', userId);
      multi.sRem('users:active', userId);
      multi.sRem('users:inactive', userId);
      multi.sRem('users:verified', userId);
      multi.sRem('users:unverified', userId);

      // Delete user sessions
      const sessionKeys = await this.redis.keys(`session:*:${userId}`);
      for (const key of sessionKeys) {
        multi.del(key);
      }

      // Delete user registrations
      const registrationKeys = await this.redis.keys(`registration:*:${userId}`);
      for (const key of registrationKeys) {
        multi.del(key);
      }

      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete user: ${error}`, 'LOCAL_REDIS_USER_DELETE_ERROR');
    }
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  async storeSession(sessionId: string, session: UserSession): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      const key = `session:${sessionId}`;
      const userSessionKey = `session:user:${session.user_id}`;

      const multi = this.redis.multi();

      // Store session with TTL based on expires_at
      const expiresAt = new Date(session.expires_at);
      const ttlSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

      multi.setEx(key, ttlSeconds, JSON.stringify(session));

      // Add to user's session list
      multi.sAdd(userSessionKey, sessionId);
      multi.expire(userSessionKey, ttlSeconds);

      // Add to all sessions set
      multi.sAdd('sessions:all', sessionId);

      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store session: ${error}`, 'LOCAL_REDIS_SESSION_STORE_ERROR');
    }
  }

  async getSession(sessionId: string): Promise<StorageResult<UserSession | null>> {
    try {
      await this.ensureConnection();

      const sessionData = await this.redis.get(`session:${sessionId}`);
      if (!sessionData) {
        return createSuccessResult(null);
      }

      const session = JSON.parse(sessionData) as UserSession;
      return createSuccessResult(session);
    } catch (error) {
      return createErrorResult(`Failed to get session: ${error}`, 'LOCAL_REDIS_SESSION_GET_ERROR');
    }
  }

  async deleteSession(sessionId: string): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      // Get session to find user ID
      const sessionResult = await this.getSession(sessionId);
      if (sessionResult.success && sessionResult.data) {
        const session = sessionResult.data;
        const multi = this.redis.multi();

        // Remove session
        multi.del(`session:${sessionId}`);

        // Remove from user's session list
        multi.sRem(`session:user:${session.user_id}`, sessionId);

        // Remove from all sessions set
        multi.sRem('sessions:all', sessionId);

        await multi.exec();
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete session: ${error}`, 'LOCAL_REDIS_SESSION_DELETE_ERROR');
    }
  }

  async deleteUserSessions(userId: string): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      // Get all session IDs for the user
      const sessionIds = await this.redis.sMembers(`session:user:${userId}`);

      if (sessionIds.length > 0) {
        const multi = this.redis.multi();

        // Delete all sessions
        for (const sessionId of sessionIds) {
          multi.del(`session:${sessionId}`);
          multi.sRem('sessions:all', sessionId);
        }

        // Delete user's session list
        multi.del(`session:user:${userId}`);

        await multi.exec();
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete user sessions: ${error}`, 'LOCAL_REDIS_USER_SESSIONS_DELETE_ERROR');
    }
  }

  // ==========================================================================
  // REGISTRATION TRACKING
  // ==========================================================================

  async storeRegistration(registrationId: string, registration: UserRegistration): Promise<StorageResult<void>> {
    try {
      await this.ensureConnection();

      const key = `registration:${registrationId}`;
      const userRegKey = `registration:user:${registration.user_id}`;
      const domainRegKey = `registration:domain:${registration.domain}`;

      const multi = this.redis.multi();

      // Store registration
      multi.set(key, JSON.stringify(registration));

      // Add to user's registration list
      multi.sAdd(userRegKey, registrationId);

      // Add to domain's registration list
      multi.sAdd(domainRegKey, registrationId);

      // Add to status index
      multi.sAdd(`registration:status:${registration.status}`, registrationId);

      // Add to all registrations set
      multi.sAdd('registrations:all', registrationId);

      await multi.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store registration: ${error}`, 'LOCAL_REDIS_REGISTRATION_STORE_ERROR');
    }
  }

  async getRegistrationsByUser(
    userId: string,
    options?: UserQueryOptions
  ): Promise<StorageResult<PaginatedResult<UserRegistration>>> {
    try {
      await this.ensureConnection();

      const registrationIds = await this.redis.sMembers(`registration:user:${userId}`);

      if (registrationIds.length === 0) {
        return createSuccessResult({
          items: [],
          total: 0,
          hasMore: false
        });
      }

      // Get all registrations
      const keys = registrationIds.map(id => `registration:${id}`);
      const results = await this.redis.mGet(keys);

      let registrations = results
        .filter((result: string | null) => result !== null)
        .map((result: string | null) => {
          try {
            return JSON.parse(result as string) as UserRegistration;
          } catch (error) {
            return null;
          }
        })
        .filter((reg: UserRegistration | null) => reg !== null) as UserRegistration[];

      // Apply status filter
      const opts = { ...options };
      if (opts.status) {
        registrations = registrations.filter(r => r.status === opts.status);
      }

      // Apply pagination
      const total = registrations.length;
      const start = opts.offset || 0;
      const limit = opts.limit || 50;
      const items = registrations.slice(start, start + limit);
      const hasMore = start + limit < total;

      return createSuccessResult({
        items,
        total,
        hasMore,
        nextCursor: hasMore ? String(start + limit) : undefined
      });
    } catch (error) {
      return createErrorResult(`Failed to get registrations by user: ${error}`, 'LOCAL_REDIS_REGISTRATION_GET_BY_USER_ERROR');
    }
  }

  async getRegistrationsByDomain(domain: string): Promise<StorageResult<UserRegistration[]>> {
    try {
      await this.ensureConnection();

      const registrationIds = await this.redis.sMembers(`registration:domain:${domain}`);

      if (registrationIds.length === 0) {
        return createSuccessResult([]);
      }

      // Get all registrations
      const keys = registrationIds.map(id => `registration:${id}`);
      const results = await this.redis.mGet(keys);

      const registrations = results
        .filter((result: string | null) => result !== null)
        .map((result: string | null) => {
          try {
            return JSON.parse(result as string) as UserRegistration;
          } catch (error) {
            return null;
          }
        })
        .filter((reg: UserRegistration | null) => reg !== null) as UserRegistration[];

      return createSuccessResult(registrations);
    } catch (error) {
      return createErrorResult(`Failed to get registrations by domain: ${error}`, 'LOCAL_REDIS_REGISTRATION_GET_BY_DOMAIN_ERROR');
    }
  }

  // ==========================================================================
  // SEARCH & FILTERING
  // ==========================================================================

  async getAllUsers(options?: UserQueryOptions): Promise<StorageResult<PaginatedResult<UserProfile>>> {
    try {
      await this.ensureConnection();

      let userIds: string[] = [];

      // Apply filters using Redis sets
      const opts = { ...options };

      if (opts.role) {
        userIds = await this.redis.sMembers(`role:${opts.role}`);
      } else if (opts.provider) {
        userIds = await this.redis.sMembers(`provider_type:${opts.provider}`);
      } else if (opts.is_active !== undefined) {
        userIds = await this.redis.sMembers(opts.is_active ? 'users:active' : 'users:inactive');
      } else if (opts.email_verified !== undefined) {
        userIds = await this.redis.sMembers(opts.email_verified ? 'users:verified' : 'users:unverified');
      } else {
        userIds = await this.redis.sMembers('users:all');
      }

      if (userIds.length === 0) {
        return createSuccessResult({
          items: [],
          total: 0,
          hasMore: false
        });
      }

      // Get user data
      const users = await this.getUsersByIds(userIds);

      // Apply additional filters if needed
      let filteredUsers = users;

      if (opts.role && !opts.provider && !opts.is_active && !opts.email_verified) {
        // Already filtered by role
      } else {
        // Apply additional filters
        if (opts.role) {
          filteredUsers = filteredUsers.filter(u => u.role === opts.role);
        }
        if (opts.provider) {
          filteredUsers = filteredUsers.filter(u => u.provider === opts.provider);
        }
        if (opts.is_active !== undefined) {
          filteredUsers = filteredUsers.filter(u => u.is_active === opts.is_active);
        }
        if (opts.email_verified !== undefined) {
          filteredUsers = filteredUsers.filter(u => u.email_verified === opts.email_verified);
        }
      }

      // Apply pagination
      const total = filteredUsers.length;
      const start = opts.offset || 0;
      const limit = opts.limit || 50;
      const items = filteredUsers.slice(start, start + limit);
      const hasMore = start + limit < total;

      return createSuccessResult({
        items,
        total,
        hasMore,
        nextCursor: hasMore ? String(start + limit) : undefined
      });
    } catch (error) {
      return createErrorResult(`Failed to get all users: ${error}`, 'LOCAL_REDIS_USER_GET_ALL_ERROR');
    }
  }

  async searchUsers(
    query: string,
    options?: UserQueryOptions
  ): Promise<StorageResult<PaginatedResult<UserProfile>>> {
    try {
      await this.ensureConnection();

      // For Redis implementation, we'll get all users and filter in memory
      // In a production system, you might want to use Redis search modules
      const allUsersResult = await this.getAllUsers({ limit: 1000 });
      if (!allUsersResult.success) {
        return allUsersResult;
      }

      const searchTerms = query.toLowerCase().split(/\s+/);
      let users = allUsersResult.data.items.filter(user => {
        const searchText = [
          user.name || '',
          user.email,
          user.provider
        ].join(' ').toLowerCase();

        return searchTerms.some(term => searchText.includes(term));
      });

      // Apply additional filters
      const opts = { ...options };
      if (opts.role) {
        users = users.filter(u => u.role === opts.role);
      }
      if (opts.provider) {
        users = users.filter(u => u.provider === opts.provider);
      }
      if (opts.is_active !== undefined) {
        users = users.filter(u => u.is_active === opts.is_active);
      }
      if (opts.email_verified !== undefined) {
        users = users.filter(u => u.email_verified === opts.email_verified);
      }

      // Apply pagination
      const total = users.length;
      const start = opts.offset || 0;
      const limit = opts.limit || 50;
      const items = users.slice(start, start + limit);
      const hasMore = start + limit < total;

      return createSuccessResult({
        items,
        total,
        hasMore,
        nextCursor: hasMore ? String(start + limit) : undefined
      });
    } catch (error) {
      return createErrorResult(`Failed to search users: ${error}`, 'LOCAL_REDIS_USER_SEARCH_ERROR');
    }
  }

  // ==========================================================================
  // MONITORING & MAINTENANCE
  // ==========================================================================

  async getStats(): Promise<StorageResult<UserStats>> {
    try {
      await this.ensureConnection();

      const userIds = await this.redis.sMembers('users:all');

      if (userIds.length === 0) {
        return createSuccessResult({
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          usersByProvider: {},
          usersByRole: {},
          registrationsToday: 0,
          registrationsThisWeek: 0,
          registrationsThisMonth: 0,
          lastUpdated: new Date().toISOString()
        });
      }

      const users = await this.getUsersByIds(userIds);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const usersByProvider: Record<string, number> = {};
      const usersByRole: Record<string, number> = {};
      let activeUsers = 0;
      let verifiedUsers = 0;
      let registrationsToday = 0;
      let registrationsThisWeek = 0;
      let registrationsThisMonth = 0;

      users.forEach(user => {
        // Count by provider
        usersByProvider[user.provider] = (usersByProvider[user.provider] || 0) + 1;

        // Count by role
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;

        // Count active and verified
        if (user.is_active) activeUsers++;
        if (user.email_verified) verifiedUsers++;

        // Count registrations by time period
        const createdAt = new Date(user.created_at);
        if (createdAt >= today) registrationsToday++;
        if (createdAt >= weekAgo) registrationsThisWeek++;
        if (createdAt >= monthAgo) registrationsThisMonth++;
      });

      return createSuccessResult({
        totalUsers: users.length,
        activeUsers,
        verifiedUsers,
        usersByProvider,
        usersByRole,
        registrationsToday,
        registrationsThisWeek,
        registrationsThisMonth,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get user stats: ${error}`, 'LOCAL_REDIS_USER_STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      await this.ensureConnection();
      const result = await this.redis.ping();
      const latency = Date.now() - startTime;
      const healthy = result === 'PONG';

      const userCount = await this.redis.sCard('users:all');
      const sessionCount = await this.redis.sCard('sessions:all');
      const registrationCount = await this.redis.sCard('registrations:all');

      return createHealthCheckResult(healthy, latency, {
        provider: 'local-redis',
        connection: this.connected ? 'active' : 'inactive',
        userCount,
        sessionCount,
        registrationCount
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      return createHealthCheckResult(false, latency, {
        provider: 'local-redis',
        error: String(error)
      });
    }
  }

  async cleanup(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      await this.ensureConnection();

      const now = new Date();
      let removedCount = 0;

      // Clean up expired sessions
      const sessionIds = await this.redis.sMembers('sessions:all');
      const expiredSessions: string[] = [];

      for (const sessionId of sessionIds) {
        const sessionData = await this.redis.get(`session:${sessionId}`);
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData) as UserSession;
            if (new Date(session.expires_at) < now) {
              expiredSessions.push(sessionId);
            }
          } catch (error) {
            // Invalid session data, mark for removal
            expiredSessions.push(sessionId);
          }
        } else {
          // Session key exists in set but no data, clean up
          expiredSessions.push(sessionId);
        }
      }

      if (!dryRun && expiredSessions.length > 0) {
        for (const sessionId of expiredSessions) {
          await this.deleteSession(sessionId);
        }
      }

      removedCount = expiredSessions.length;
      const freedSpace = `${Math.round(removedCount * 100 / 1024)}KB`;

      return createSuccessResult({
        removedCount,
        freedSpace
      });
    } catch (error) {
      return createErrorResult(`Cleanup failed: ${error}`, 'LOCAL_REDIS_USER_CLEANUP_ERROR');
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async getUsersByIds(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) return [];

    const keys = userIds.map(id => `user:${id}`);
    const results = await this.redis.mGet(keys);

    return results
      .filter((result: string | null) => result !== null)
      .map((result: string | null) => {
        try {
          return JSON.parse(result as string) as UserProfile;
        } catch (error) {
          return null;
        }
      })
      .filter((user: UserProfile | null) => user !== null) as UserProfile[];
  }

  getProviderInfo() {
    return {
      name: 'local-redis',
      version: '1.0.0',
      capabilities: ['persistence', 'fast-access', 'local-development', 'user-management', 'session-management']
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
