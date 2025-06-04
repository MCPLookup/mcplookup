// Upstash Redis Registry Storage - Production Implementation
// Implements the full IRegistryStorage interface with pagination and error handling

import { Redis } from '@upstash/redis';
import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery.js';
import { 
  IRegistryStorage,
  StorageResult,
  PaginatedResult,
  SearchOptions,
  RegistryStats,
  HealthCheckResult,
  BatchOperationResult,
  createSuccessResult,
  createErrorResult,
  createHealthCheckResult,
  createEmptyPaginatedResult,
  validatePaginationOptions,
  DEFAULT_SEARCH_OPTIONS
} from './interfaces';

/**
 * Upstash Redis Registry Storage
 * Production-ready implementation with full pagination and error handling
 */
export class UpstashRegistryStorage implements IRegistryStorage {
  private redis: Redis;

  constructor() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Upstash Redis environment variables not configured');
    }

    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  async storeServer(domain: string, server: MCPServerRecord): Promise<StorageResult<void>> {
    try {
      const serverWithTimestamp = { ...server, last_updated: new Date().toISOString() };
      const pipeline = this.redis.pipeline();
      
      // Store the full server record
      pipeline.set(`server:${domain}`, JSON.stringify(serverWithTimestamp));
      
      // Add to category index
      pipeline.sadd(`category:${serverWithTimestamp.capabilities.category}`, domain);
      
      // Add to capability indexes
      if (serverWithTimestamp.capabilities.subcategories) {
        for (const capability of serverWithTimestamp.capabilities.subcategories) {
          pipeline.sadd(`capability:${capability}`, domain);
        }
      }
      
      // Add to all servers set
      pipeline.sadd('servers:all', domain);
      
      // Add search terms for text search
      const searchTerms = this.extractSearchTerms(serverWithTimestamp);
      for (const term of searchTerms) {
        pipeline.sadd(`search:${term.toLowerCase()}`, domain);
      }
      
      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store server: ${error}`, 'UPSTASH_STORE_ERROR');
    }
  }

  async getServer(domain: string): Promise<StorageResult<MCPServerRecord | null>> {
    try {
      const data = await this.redis.get(`server:${domain}`);
      if (!data) {
        return createSuccessResult(null);
      }

      // Upstash Redis client automatically deserializes JSON
      const server = typeof data === 'string' ? JSON.parse(data) : data;
      return createSuccessResult(server as MCPServerRecord);
    } catch (error) {
      return createErrorResult(`Failed to get server: ${error}`, 'UPSTASH_GET_ERROR');
    }
  }

  async deleteServer(domain: string): Promise<StorageResult<void>> {
    try {
      // First get the server to know what indexes to clean
      const serverResult = await this.getServer(domain);
      if (!serverResult.success || !serverResult.data) {
        return createSuccessResult(undefined); // Already deleted
      }

      const server = serverResult.data;
      const pipeline = this.redis.pipeline();
      
      // Remove main record
      pipeline.del(`server:${domain}`);
      
      // Remove from all indexes
      pipeline.srem('servers:all', domain);
      pipeline.srem(`category:${server.capabilities.category}`, domain);
      
      if (server.capabilities.subcategories) {
        for (const capability of server.capabilities.subcategories) {
          pipeline.srem(`capability:${capability}`, domain);
        }
      }
      
      // Remove from search indexes
      const searchTerms = this.extractSearchTerms(server);
      for (const term of searchTerms) {
        pipeline.srem(`search:${term.toLowerCase()}`, domain);
      }
      
      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete server: ${error}`, 'UPSTASH_DELETE_ERROR');
    }
  }

  async getAllServers(options?: SearchOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const domains = await this.redis.smembers('servers:all') as string[];
      
      let servers = await this.getServersByDomains(domains);
      
      // Filter inactive servers if needed
      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }
      
      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get all servers: ${error}`, 'UPSTASH_GET_ALL_ERROR');
    }
  }

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
      return createErrorResult(`Batch operation failed: ${error}`, 'UPSTASH_BATCH_ERROR');
    }
  }

  async getServersByCategory(
    category: CapabilityCategory, 
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const domains = await this.redis.smembers(`category:${category}`) as string[];
      let servers = await this.getServersByDomains(domains);
      
      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }
      
      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get servers by category: ${error}`, 'UPSTASH_CATEGORY_ERROR');
    }
  }

  async getServersByCapability(
    capability: string, 
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const domains = await this.redis.smembers(`capability:${capability}`) as string[];
      let servers = await this.getServersByDomains(domains);
      
      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }
      
      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Failed to get servers by capability: ${error}`, 'UPSTASH_CAPABILITY_ERROR');
    }
  }

  async searchServers(
    query: string, 
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
      
      if (searchTerms.length === 0) {
        return createSuccessResult(createEmptyPaginatedResult());
      }

      // Get domains that match each search term
      const domainSets = await Promise.all(
        searchTerms.map(term => this.redis.smembers(`search:${term}`) as Promise<string[]>)
      );
      
      // Union all sets to get domains that match any term
      const allDomains = new Set<string>();
      domainSets.forEach(domains => {
        domains.forEach(domain => allDomains.add(domain));
      });
      
      let servers = await this.getServersByDomains(Array.from(allDomains));
      
      if (!opts.includeInactive) {
        servers = servers.filter(s => s.health?.status === 'healthy');
      }
      
      return this.paginateResults(servers, opts);
    } catch (error) {
      return createErrorResult(`Search failed: ${error}`, 'UPSTASH_SEARCH_ERROR');
    }
  }

  async getStats(): Promise<StorageResult<RegistryStats>> {
    try {
      const totalServers = await this.redis.scard('servers:all') || 0;
      
      // Get all servers to calculate active count and other stats
      const domains = await this.redis.smembers('servers:all') as string[];
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
      
      return createSuccessResult({
        totalServers,
        activeServers: activeServers.length,
        categories,
        capabilities,
        memoryUsage: {
          used: 'N/A', // Upstash doesn't expose memory usage
          percentage: 0
        },
        performance: {
          avgResponseTime: Math.round(avgResponseTime),
          cacheHitRate: 0.95 // Estimated for Upstash
        },
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get stats: ${error}`, 'UPSTASH_STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.redis.ping();
      const latency = Date.now() - startTime;
      const healthy = result === 'PONG';
      
      return createHealthCheckResult(healthy, latency, {
        provider: 'upstash',
        region: 'global',
        connection: healthy ? 'active' : 'failed'
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      return createHealthCheckResult(false, latency, {
        provider: 'upstash',
        error: String(error)
      });
    }
  }

  async cleanup(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      // For Upstash, we can clean up servers with old timestamps or invalid health
      const domains = await this.redis.smembers('servers:all') as string[];
      const servers = await this.getServersByDomains(domains);
      
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const serversToRemove = servers.filter(server => 
        !server.last_updated || 
        new Date(server.last_updated) < cutoffDate ||
        server.health?.status === 'unhealthy'
      );
      
      if (!dryRun) {
        for (const server of serversToRemove) {
          await this.deleteServer(server.domain);
        }
      }
      
      return createSuccessResult({
        removedCount: serversToRemove.length,
        freedSpace: 'N/A' // Upstash doesn't expose storage details
      });
    } catch (error) {
      return createErrorResult(`Cleanup failed: ${error}`, 'UPSTASH_CLEANUP_ERROR');
    }
  }

  getProviderInfo() {
    return {
      name: 'upstash',
      version: '1.0.0',
      capabilities: ['persistence', 'global-replication', 'auto-scaling', 'production-ready']
    };
  }

  // Helper methods
  private async getServersByDomains(domains: string[]): Promise<MCPServerRecord[]> {
    if (domains.length === 0) return [];
    
    const keys = domains.map(domain => `server:${domain}`);
    const results = await this.redis.mget(...keys);
    
    return results
      .filter(result => result !== null)
      .map(result => {
        try {
          return typeof result === 'string' ? JSON.parse(result) : result;
        } catch (error) {
          console.error('Error parsing server data:', error);
          return null;
        }
      })
      .filter(server => server !== null) as MCPServerRecord[];
  }

  private extractSearchTerms(server: MCPServerRecord): string[] {
    const terms = new Set<string>();

    // Add domain parts
    const domainParts = server.domain.split('.');
    domainParts.forEach(part => terms.add(part));

    // Add server info terms
    if (server.server_info?.name) {
      server.server_info.name.split(/\s+/).forEach(word => terms.add(word));
    }

    if (server.server_info?.description) {
      server.server_info.description.split(/\s+/).forEach(word => terms.add(word));
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

  private getSortValue(server: MCPServerRecord, sortBy: string): string {
    switch (sortBy) {
      case 'domain': return server.domain;
      case 'name': return server.server_info?.name || server.domain;
      case 'updated_at': return server.last_updated || '';
      case 'health_score': return String(server.health?.uptime_percentage || 0);
      default: return server.domain;
    }
  }
}
