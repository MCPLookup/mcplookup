// Registry Storage with Upstash Redis
// Efficient NoSQL storage and search for MCP servers

import { Redis } from '@upstash/redis';
import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery';
import { IRegistryStorage } from './interfaces';

/**
 * Upstash Redis Registry Storage
 * Uses multiple Redis data structures for efficient storage and search
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

  /**
   * Add a new MCP server
   */
  async addServer(server: MCPServerRecord): Promise<void> {
    return this.storeServer(server.domain, server);
  }

  /**
   * Store MCP server with multiple indexes for efficient search
   */
  async storeServer(domain: string, server: MCPServerRecord): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    // 1. Store the full server record
    pipeline.set(`server:${domain}`, JSON.stringify(server));
    
    // 2. Add to category index
    pipeline.sadd(`category:${server.capabilities.category}`, domain);
    
    // 3. Add to capability indexes
    if (server.capabilities.subcategories) {
      for (const capability of server.capabilities.subcategories) {
        pipeline.sadd(`capability:${capability}`, domain);
      }
    }
    
    // 4. Add to all servers set
    pipeline.sadd('servers:all', domain);
    
    // 5. Add search terms for text search
    const searchTerms = this.extractSearchTerms(server);
    for (const term of searchTerms) {
      pipeline.sadd(`search:${term.toLowerCase()}`, domain);
    }
    
    // Execute all operations atomically
    await pipeline.exec();
  }

  /**
   * Get server by domain
   */
  async getServer(domain: string): Promise<MCPServerRecord | null> {
    const data = await this.redis.get(`server:${domain}`);
    if (!data) return null;
    
    try {
      return JSON.parse(data as string) as MCPServerRecord;
    } catch (error) {
      console.error('Error parsing server data:', error);
      return null;
    }
  }

  /**
   * Update an existing server
   */
  async updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void> {
    const existing = await this.getServer(domain);
    if (!existing) {
      throw new Error(`Server ${domain} not found`);
    }

    const updated = { ...existing, ...updates };
    return this.storeServer(domain, updated);
  }

  /**
   * Remove a server
   */
  async removeServer(domain: string): Promise<void> {
    return this.deleteServer(domain);
  }

  /**
   * Delete server and all its indexes
   */
  async deleteServer(domain: string): Promise<void> {
    // First get the server to know what indexes to clean
    const server = await this.getServer(domain);
    if (!server) return;

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
  }

  /**
   * Get all registered servers
   */
  async getAllServers(): Promise<MCPServerRecord[]> {
    const domains = await this.redis.smembers('servers:all') as string[];
    return this.getServersByDomains(domains);
  }

  /**
   * Get servers by category
   */
  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    const domains = await this.redis.smembers(`category:${category}`) as string[];
    return this.getServersByDomains(domains);
  }

  /**
   * Get servers by capability
   */
  async getServersByCapability(capability: CapabilityCategory): Promise<MCPServerRecord[]> {
    const domains = await this.redis.smembers(`capability:${capability}`) as string[];
    return this.getServersByDomains(domains);
  }

  /**
   * Get servers by domain (exact match)
   */
  async getServersByDomain(domain: string): Promise<MCPServerRecord[]> {
    const server = await this.getServer(domain);
    return server ? [server] : [];
  }

  /**
   * Search servers by text query with filters
   */
  async searchServers(query: string, filters?: {
    capability?: CapabilityCategory;
    verified?: boolean;
    health?: string;
    minTrustScore?: number;
  }): Promise<MCPServerRecord[]> {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    let servers: MCPServerRecord[];

    if (searchTerms.length === 0) {
      servers = await this.getAllServers();
    } else {
      // Get domains that match each search term
      const domainSets = await Promise.all(
        searchTerms.map(term => this.redis.smembers(`search:${term}`) as Promise<string[]>)
      );

      // Union all sets to get domains that match any term
      const allDomains = new Set<string>();
      domainSets.forEach(domains => {
        domains.forEach(domain => allDomains.add(domain));
      });

      servers = await this.getServersByDomains(Array.from(allDomains));
    }

    // Apply filters
    if (filters) {
      servers = servers.filter(server => {
        if (filters.capability && server.capabilities.category !== filters.capability) {
          return false;
        }
        if (filters.verified !== undefined && server.verification.dns_verified !== filters.verified) {
          return false;
        }
        if (filters.health && server.health.status !== filters.health) {
          return false;
        }
        if (filters.minTrustScore && server.health.uptime_percentage < filters.minTrustScore) {
          return false;
        }
        return true;
      });
    }

    return servers;
  }

  /**
   * Get registry statistics
   */
  async getStats(): Promise<{ totalServers: number; categories: Record<string, number> }> {
    const totalServers = await this.redis.scard('servers:all') || 0;
    
    // Get category counts
    const categories: Record<string, number> = {};
    const categoryKeys = [
      'communication', 'productivity', 'development', 'data', 
      'automation', 'ai', 'infrastructure', 'other'
    ];
    
    for (const category of categoryKeys) {
      const count = await this.redis.scard(`category:${category}`) || 0;
      if (count > 0) {
        categories[category] = count;
      }
    }
    
    return { totalServers, categories };
  }

  /**
   * Update server health status
   */
  async updateServerHealth(domain: string, health: string, responseTime: number): Promise<void> {
    const server = await this.getServer(domain);
    if (server) {
      server.health.status = health as any;
      server.health.response_time_ms = responseTime;
      server.health.last_check = new Date().toISOString();
      await this.storeServer(domain, server);
    }
  }

  /**
   * Get health statistics
   */
  async getHealthStats(): Promise<{
    totalServers: number;
    healthyServers: number;
    averageResponseTime: number;
  }> {
    const servers = await this.getAllServers();
    const totalServers = servers.length;
    const healthyServers = servers.filter(s => s.health.status === 'healthy').length;
    const averageResponseTime = servers.length > 0
      ? servers.reduce((sum, s) => sum + (s.health.response_time_ms || 0), 0) / servers.length
      : 0;

    return {
      totalServers,
      healthyServers,
      averageResponseTime
    };
  }

  /**
   * Cleanup expired or invalid data
   */
  async cleanup(): Promise<void> {
    // TODO: Implement cleanup logic for expired servers
    console.log('Cleanup not yet implemented');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Registry storage health check failed:', error);
      return false;
    }
  }

  /**
   * Helper: Get multiple servers by domains
   */
  private async getServersByDomains(domains: string[]): Promise<MCPServerRecord[]> {
    if (domains.length === 0) return [];
    
    const keys = domains.map(domain => `server:${domain}`);
    const results = await this.redis.mget(...keys);
    
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
   * Extract searchable terms from server record
   */
  private extractSearchTerms(server: MCPServerRecord): string[] {
    const terms = new Set<string>();
    
    // Add domain parts
    terms.add(server.domain);
    server.domain.split('.').forEach(part => terms.add(part));
    
    // Add name and description words
    server.name.split(/\s+/).forEach(word => terms.add(word));
    server.description.split(/\s+/).forEach(word => terms.add(word));
    
    // Add capabilities
    terms.add(server.capabilities.category);
    if (server.capabilities.subcategories) {
      server.capabilities.subcategories.forEach(cap => terms.add(cap));
    }
    
    // Filter out short terms
    return Array.from(terms).filter(term => term.length > 2);
  }
}
