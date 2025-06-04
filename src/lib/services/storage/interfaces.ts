import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery';

export interface VerificationChallengeData {
  id: string;
  domain: string;
  challenge: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
}

export interface IRegistryStorage {
  // Server management
  addServer(server: MCPServerRecord): Promise<void>;
  getServer(domain: string): Promise<MCPServerRecord | null>;
  getAllServers(): Promise<MCPServerRecord[]>;
  updateServer(domain: string, updates: Partial<MCPServerRecord>): Promise<void>;
  removeServer(domain: string): Promise<void>;

  // Search and discovery
  searchServers(query: string, filters?: {
    capability?: CapabilityCategory;
    verified?: boolean;
    health?: string;
    minTrustScore?: number;
  }): Promise<MCPServerRecord[]>;

  getServersByDomain(domain: string): Promise<MCPServerRecord[]>;
  getServersByCapability(capability: CapabilityCategory): Promise<MCPServerRecord[]>;

  // Health and stats
  updateServerHealth(domain: string, health: string, responseTime: number): Promise<void>;
  getHealthStats(): Promise<{
    totalServers: number;
    healthyServers: number;
    averageResponseTime: number;
  }>;

  // Cleanup
  cleanup(): Promise<void>;
}

export interface IVerificationStorage {
  // Challenge management
  storeChallenge(data: VerificationChallengeData): Promise<void>;
  getChallenge(id: string): Promise<VerificationChallengeData | null>;
  markChallengeVerified(id: string): Promise<void>;
  removeChallenge(id: string): Promise<void>;

  // Cleanup expired challenges
  cleanupExpiredChallenges(): Promise<void>;

  // Stats
  getStats(): Promise<{
    totalChallenges: number;
    memoryUsed: string;
  }>;
}