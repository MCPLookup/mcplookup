// Unified Storage - Stores Rich SDK Objects
// No more fragmented Redis hashes!

import { Redis } from 'ioredis';
import { MCPServer } from '@mcplookup-org/mcp-sdk';
import { StoredServerData } from '../types/unified';

export class UnifiedRedisStorage {
  private redis: Redis;
  
  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }
  
  /**
   * Store complete SDK object as JSON
   */
  async storeServer(id: string, data: StoredServerData): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    // 1. Store complete object as JSON
    pipeline.set(`server:${id}`, JSON.stringify(data));
    
    // 2. Index for search (extract key fields from SDK object)
    const server = data.server;
    
    // Category indexing
    pipeline.sadd(`category:${server.category}`, id);
    
    // Tag indexing  
    server.tags?.forEach((tag: string) => {
      pipeline.sadd(`tag:${tag}`, id);
    });
    
    // Text indexing (use SDK fields directly)
    const searchText = [
      server.name,
      server.description,
      ...(server.tags ?? []),
      ...(server.subcategories ?? []),
      server.repository.language
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Store searchable text
    pipeline.set(`search:${id}`, searchText);
    
    // 3. Popularity indexing (use SDK quality metrics)
    pipeline.zadd('servers:by-stars', server.repository.stars, id);
    pipeline.zadd('servers:by-quality', server.quality?.score || 0, id);
    
    await pipeline.exec();
  }
  
  /**
   * Get complete SDK object
   */
  async getServer(id: string): Promise<StoredServerData | null> {
    const data = await this.redis.get(`server:${id}`);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data) as StoredServerData;
    } catch (error) {
      console.error(`Failed to parse server data for ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Search using SDK fields
   */
  async searchServers(query: string): Promise<StoredServerData[]> {
    const searchTerms = query.toLowerCase().split(/\s+/);
    const serverIds = new Set<string>();
    
    // Get all server IDs that match search terms
    for (const term of searchTerms) {
      const keys = await this.redis.keys(`search:*`);
      
      for (const key of keys) {
        const searchText = await this.redis.get(key);
        if (searchText && searchText.includes(term)) {
          const id = key.replace('search:', '');
          serverIds.add(id);
        }
      }
    }
    
    // Load complete objects
    const servers = await Promise.all(
      Array.from(serverIds).map(id => this.getServer(id))
    );
    
    return servers.filter(Boolean) as StoredServerData[];
  }
  
  /**
   * Get servers by category using SDK types
   */
  async getServersByCategory(category: string): Promise<StoredServerData[]> {
    const serverIds = await this.redis.smembers(`category:${category}`);
    
    const servers = await Promise.all(
      serverIds.map(id => this.getServer(id))
    );
    
    return servers.filter(Boolean) as StoredServerData[];
  }
  
  /**
   * Get top servers by quality score
   */
  async getTopServers(limit: number = 10): Promise<StoredServerData[]> {
    const serverIds = await this.redis.zrevrange('servers:by-quality', 0, limit - 1);
    
    const servers = await Promise.all(
      serverIds.map(id => this.getServer(id))
    );
    
    return servers.filter(Boolean) as StoredServerData[];
  }
}
