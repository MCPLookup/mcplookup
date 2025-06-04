// Storage Factory - Environment-based storage selection
// Tests: in-memory, Dev: local Redis, Prod: Upstash Redis

import { IRegistryStorage, IVerificationStorage, VerificationChallengeData } from './interfaces';
import { UpstashRegistryStorage } from './upstash-registry-storage';
import { UpstashVerificationStorage } from './upstash-verification-storage';
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

  async storeServer(domain: string, server: MCPServerRecord): Promise<void> {
    this.servers.set(domain, server);
  }

  async getServer(domain: string): Promise<MCPServerRecord | null> {
    return this.servers.get(domain) || null;
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

  async getServersByCapability(capability: string): Promise<MCPServerRecord[]> {
    return Array.from(this.servers.values()).filter(s => 
      s.capabilities.subcategories.includes(capability)
    );
  }

  async searchServers(query: string): Promise<MCPServerRecord[]> {
    const terms = query.toLowerCase().split(/\s+/);
    return Array.from(this.servers.values()).filter(server => {
      const searchText = `${server.name} ${server.description} ${server.capabilities.subcategories.join(' ')}`.toLowerCase();
      return terms.some(term => searchText.includes(term));
    });
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

  async storeChallenge(challengeId: string, challenge: VerificationChallengeData): Promise<void> {
    this.challenges.set(challengeId, challenge);
  }

  async getChallenge(challengeId: string): Promise<VerificationChallengeData | null> {
    return this.challenges.get(challengeId) || null;
  }

  async deleteChallenge(challengeId: string): Promise<void> {
    this.challenges.delete(challengeId);
  }

  async markChallengeVerified(challengeId: string): Promise<void> {
    const challenge = this.challenges.get(challengeId);
    if (challenge) {
      challenge.verified_at = new Date().toISOString();
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
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
  
  // Development uses local Redis if available, otherwise memory
  if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) {
    return 'local';
  }
  
  // Fallback to memory
  return 'memory';
}
