// Storage Factory - Environment-based storage selection
// Tests: in-memory, Dev: local Redis, Prod: Upstash Redis

import { IRegistryStorage, IVerificationStorage, VerificationChallengeData } from './interfaces';
import { UpstashRegistryStorage } from './registry-storage';
import { UpstashVerificationStorage } from './upstash';
import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery';

export interface StorageConfig {
  provider?: 'upstash' | 'local' | 'memory';
  redisUrl?: string;
  redisToken?: string;
}

/**
 * Simple In-Memory Storage for Tests
 */
class InMemoryRegistryStorage implements IRegistryStorage {
  private servers = new Map<string, MCPServerRecord>();

  async addServer(server: MCPServerRecord): Promise<void> {
    this.servers.set(server.domain, server);
  }

  async storeServer(domain: string, server: MCPServerRecord): Promise<void> {
    this.servers.set(domain, server);
  }

  async getServer(domain: string): Promise<MCPServerRecord | null> {
    return this.servers.get(domain) || null;
  }

  async updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void> {
    const existing = this.servers.get(domain);
    if (!existing) {
      throw new Error(`Server ${domain} not found`);
    }
    const updated = { ...existing, ...updates };
    this.servers.set(domain, updated);
  }

  async removeServer(domain: string): Promise<void> {
    this.servers.delete(domain);
  }

  async deleteServer(domain: string): Promise<void> {
    this.servers.delete(domain);
  }

  async getAllServers(): Promise<MCPServerRecord[]> {
    return Array.from(this.servers.values());
  }

  async getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]> {
    return Array.from(this.servers.values()).filter(s => s.capabilities.category === category);
  }

  async getServersByDomain(domain: string): Promise<MCPServerRecord[]> {
    const server = this.servers.get(domain);
    return server ? [server] : [];
  }

  async getServersByCapability(capability: CapabilityCategory): Promise<MCPServerRecord[]> {
    return Array.from(this.servers.values()).filter(s => s.capabilities.category === capability);
  }

  async searchServers(query: string, filters?: {
    capability?: CapabilityCategory;
    verified?: boolean;
    health?: string;
    minTrustScore?: number;
  }): Promise<MCPServerRecord[]> {
    let servers = Array.from(this.servers.values());

    // Text search
    if (query) {
      const terms = query.toLowerCase().split(/\s+/);
      servers = servers.filter(server => {
        const searchText = `${server.name} ${server.description} ${server.capabilities.subcategories.join(' ')}`.toLowerCase();
        return terms.some(term => searchText.includes(term));
      });
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

  async updateServerHealth(domain: string, health: string, responseTime: number): Promise<void> {
    const server = this.servers.get(domain);
    if (server) {
      server.health.status = health as any;
      server.health.response_time_ms = responseTime;
      server.health.last_check = new Date().toISOString();
      this.servers.set(domain, server);
    }
  }

  async getHealthStats(): Promise<{
    totalServers: number;
    healthyServers: number;
    averageResponseTime: number;
  }> {
    const servers = Array.from(this.servers.values());
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

  async cleanup(): Promise<void> {
    // No cleanup needed for in-memory storage
  }

  async getStats(): Promise<{ totalServers: number; categories: Record<string, number> }> {
    const servers = Array.from(this.servers.values());
    const categories: Record<string, number> = {};
    servers.forEach(s => {
      categories[s.capabilities.category] = (categories[s.capabilities.category] || 0) + 1;
    });
    return { totalServers: servers.length, categories };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

class InMemoryVerificationStorage implements IVerificationStorage {
  private challenges = new Map<string, VerificationChallengeData>();

  async storeChallenge(data: VerificationChallengeData): Promise<void> {
    this.challenges.set(data.id, data);
  }

  async getChallenge(id: string): Promise<VerificationChallengeData | null> {
    return this.challenges.get(id) || null;
  }

  async markChallengeVerified(id: string): Promise<void> {
    const challenge = this.challenges.get(id);
    if (challenge) {
      challenge.verified = true;
    }
  }

  async removeChallenge(id: string): Promise<void> {
    this.challenges.delete(id);
  }

  async cleanupExpiredChallenges(): Promise<void> {
    const now = new Date();
    for (const [id, challenge] of this.challenges.entries()) {
      if (challenge.expiresAt < now) {
        this.challenges.delete(id);
      }
    }
  }

  async getStats(): Promise<{
    totalChallenges: number;
    memoryUsed: string;
  }> {
    return {
      totalChallenges: this.challenges.size,
      memoryUsed: 'unknown'
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
    case 'local':
      return new UpstashRegistryStorage();
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
    case 'local':
      return new UpstashVerificationStorage();
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
