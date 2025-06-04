// In-Memory Storage Implementations
// For development and testing only - no persistence

import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery';
import {
  IRegistryStorage,
  IVerificationStorage,
  IUserStorage,
  IAuditStorage,
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
 * In-memory storage for development and testing
 * Implements the full IRegistryStorage interface with pagination and error handling
 */
export class InMemoryRegistryStorage implements IRegistryStorage {
  private servers = new Map<string, MCPServerRecord>();

  async storeServer(domain: string, server: MCPServerRecord): Promise<StorageResult<void>> {
    try {
      this.servers.set(domain, { ...server, updated_at: new Date().toISOString() });
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
          this.servers.set(domain, { ...server, updated_at: new Date().toISOString() });
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
      case 'updated_at': return server.updated_at || '';
      case 'health_score': return String(server.health?.uptime_percentage || 0);
      default: return server.domain;
    }
  }

  private getSearchText(server: MCPServerRecord): string {
    return [
      server.domain,
      server.name || '',
      server.server_info?.name || '',
      server.description || '',
      server.capabilities.category,
      ...(server.capabilities.subcategories || []),
      ...(server.capabilities.intent_keywords || []),
      ...(server.capabilities.use_cases || []),
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

export class InMemoryVerificationStorage implements IVerificationStorage {
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
        challenge.verified = true;
        challenge.verified_at = new Date().toISOString();
        this.challenges.set(challengeId, challenge);
      }
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to mark challenge verified: ${error}`, 'UPDATE_ERROR');
    }
  }

  async recordVerificationAttempt(challengeId: string, success: boolean, details?: string): Promise<StorageResult<void>> {
    try {
      const challenge = this.challenges.get(challengeId);
      if (challenge) {
        if (!challenge.verification_attempts) {
          challenge.verification_attempts = [];
        }
        challenge.verification_attempts.push({
          timestamp: new Date().toISOString(),
          success,
          details
        });
        this.challenges.set(challengeId, challenge);
      }
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to record verification attempt: ${error}`, 'RECORD_ERROR');
    }
  }

  async getChallengesByDomain(
    domain: string,
    options?: ChallengeQueryOptions
  ): Promise<StorageResult<PaginatedResult<VerificationChallengeData>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      let challenges = Array.from(this.challenges.values()).filter(c => c.domain === domain);

      // Apply status filter
      if (opts.status) {
        challenges = challenges.filter(c => {
          if (opts.status === 'verified') return c.verified;
          if (opts.status === 'pending') return !c.verified && new Date(c.expires_at) > new Date();
          if (opts.status === 'expired') return !c.verified && new Date(c.expires_at) <= new Date();
          return true;
        });
      }

      // Sort by created_at (newest first)
      challenges.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      return createErrorResult(`Failed to get challenges by domain: ${error}`, 'GET_ERROR');
    }
  }

  async getStats(): Promise<StorageResult<VerificationStats>> {
    try {
      const challenges = Array.from(this.challenges.values());
      const now = new Date();

      const totalChallenges = challenges.length;
      const verified = challenges.filter(c => c.verified).length;
      const pending = challenges.filter(c => !c.verified && new Date(c.expires_at) > now).length;
      const expired = challenges.filter(c => !c.verified && new Date(c.expires_at) <= now).length;

      // Calculate success rate
      const attempted = verified + expired;
      const successRate = attempted > 0 ? verified / attempted : 0;

      return createSuccessResult({
        totalChallenges,
        verifiedChallenges: verified,
        pendingChallenges: pending,
        expiredChallenges: expired,
        successRate,
        averageVerificationTime: 0, // Could calculate from verification_attempts
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get verification stats: ${error}`, 'STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const latency = Date.now() - startTime;

    return createHealthCheckResult(true, latency, {
      provider: 'in-memory',
      challengeCount: this.challenges.size
    });
  }

  async cleanup(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      const now = new Date();
      const expiredChallenges = Array.from(this.challenges.entries()).filter(([, challenge]) =>
        new Date(challenge.expires_at) <= now
      );

      if (!dryRun) {
        expiredChallenges.forEach(([id]) => this.challenges.delete(id));
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

  getProviderInfo() {
    return {
      name: 'in-memory',
      version: '1.0.0',
      capabilities: ['fast-access', 'no-persistence', 'development-only']
    };
  }
}

export class InMemoryUserStorage implements IUserStorage {
  private users = new Map<string, UserProfile>();
  private sessions = new Map<string, UserSession>();

  async createUser(registration: UserRegistration): Promise<StorageResult<UserProfile>> {
    try {
      const now = new Date().toISOString();
      const user: UserProfile = {
        id: `user_${Date.now()}`,
        email: registration.email,
        name: registration.name,
        role: 'user',
        created_at: now,
        updated_at: now,
        last_login: null,
        email_verified: false,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        activity: {
          servers_registered: 0,
          last_activity: now,
          total_sessions: 0
        }
      };

      this.users.set(user.id, user);
      return createSuccessResult(user);
    } catch (error) {
      return createErrorResult(`Failed to create user: ${error}`, 'CREATE_ERROR');
    }
  }

  async getUser(userId: string): Promise<StorageResult<UserProfile | null>> {
    try {
      const user = this.users.get(userId) || null;
      return createSuccessResult(user);
    } catch (error) {
      return createErrorResult(`Failed to get user: ${error}`, 'GET_ERROR');
    }
  }

  async getUserByEmail(email: string): Promise<StorageResult<UserProfile | null>> {
    try {
      const user = Array.from(this.users.values()).find(u => u.email === email) || null;
      return createSuccessResult(user);
    } catch (error) {
      return createErrorResult(`Failed to get user by email: ${error}`, 'GET_ERROR');
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<StorageResult<UserProfile>> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return createErrorResult('User not found', 'NOT_FOUND');
      }

      const updatedUser = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.users.set(userId, updatedUser);
      return createSuccessResult(updatedUser);
    } catch (error) {
      return createErrorResult(`Failed to update user: ${error}`, 'UPDATE_ERROR');
    }
  }

  async deleteUser(userId: string): Promise<StorageResult<void>> {
    try {
      // Remove user sessions
      const userSessions = Array.from(this.sessions.entries())
        .filter(([, session]) => session.userId === userId);
      
      userSessions.forEach(([sessionId]) => this.sessions.delete(sessionId));
      
      // Remove user
      this.users.delete(userId);
      
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete user: ${error}`, 'DELETE_ERROR');
    }
  }

  async getAllUsers(options?: UserQueryOptions): Promise<StorageResult<PaginatedResult<UserProfile>>> {
    try {
      const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
      let users = Array.from(this.users.values());

      // Apply role filter
      if (opts.role) {
        users = users.filter(u => u.role === opts.role);
      }

      // Apply email verification filter
      if (opts.emailVerified !== undefined) {
        users = users.filter(u => u.email_verified === opts.emailVerified);
      }

      // Sort by created_at (newest first)
      users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      return createErrorResult(`Failed to get all users: ${error}`, 'GET_ALL_ERROR');
    }
  }

  async createSession(userId: string, sessionData: Omit<UserSession, 'id' | 'userId' | 'created_at'>): Promise<StorageResult<UserSession>> {
    try {
      const session: UserSession = {
        id: `session_${Date.now()}`,
        userId,
        ...sessionData,
        created_at: new Date().toISOString()
      };

      this.sessions.set(session.id, session);
      
      // Update user's last login and session count
      const user = this.users.get(userId);
      if (user) {
        user.last_login = session.created_at;
        user.activity.total_sessions += 1;
        user.activity.last_activity = session.created_at;
        this.users.set(userId, user);
      }

      return createSuccessResult(session);
    } catch (error) {
      return createErrorResult(`Failed to create session: ${error}`, 'CREATE_ERROR');
    }
  }

  async getSession(sessionId: string): Promise<StorageResult<UserSession | null>> {
    try {
      const session = this.sessions.get(sessionId) || null;
      return createSuccessResult(session);
    } catch (error) {
      return createErrorResult(`Failed to get session: ${error}`, 'GET_ERROR');
    }
  }

  async deleteSession(sessionId: string): Promise<StorageResult<void>> {
    try {
      this.sessions.delete(sessionId);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete session: ${error}`, 'DELETE_ERROR');
    }
  }

  async getUserSessions(userId: string): Promise<StorageResult<UserSession[]>> {
    try {
      const sessions = Array.from(this.sessions.values())
        .filter(s => s.userId === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return createSuccessResult(sessions);
    } catch (error) {
      return createErrorResult(`Failed to get user sessions: ${error}`, 'GET_ERROR');
    }
  }

  async getStats(): Promise<StorageResult<UserStats>> {
    try {
      const users = Array.from(this.users.values());
      const sessions = Array.from(this.sessions.values());

      const totalUsers = users.length;
      const verifiedUsers = users.filter(u => u.email_verified).length;
      const adminUsers = users.filter(u => u.role === 'admin').length;
      const activeUsers = users.filter(u => {
        const lastActivity = new Date(u.activity.last_activity);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastActivity > dayAgo;
      }).length;

      return createSuccessResult({
        totalUsers,
        verifiedUsers,
        adminUsers,
        activeUsers,
        totalSessions: sessions.length,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get user stats: ${error}`, 'STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const latency = Date.now() - startTime;

    return createHealthCheckResult(true, latency, {
      provider: 'in-memory',
      userCount: this.users.size,
      sessionCount: this.sessions.size
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
