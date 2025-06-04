// Storage Factory - Environment-based storage selection
// Tests: in-memory, Dev: local Redis, Prod: Upstash Redis

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
import { UpstashRegistryStorage } from './upstash-registry-storage';
import { UpstashVerificationStorage } from './upstash-verification-storage';
import { UpstashUserStorage } from './upstash-user-storage';
import { LocalRedisRegistryStorage, LocalRedisVerificationStorage, LocalRedisUserStorage } from './local-redis-storage';
import { InMemoryAuditStorage, LocalRedisAuditStorage, UpstashAuditStorage } from './audit-storage';
import { MCPServerRecord, CapabilityCategory } from '../../schemas/discovery';

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
 * In-memory user storage for development and testing
 * Implements the full IUserStorage interface with pagination and error handling
 */
class InMemoryUserStorage implements IUserStorage {
  private users = new Map<string, UserProfile>();
  private sessions = new Map<string, UserSession>();
  private registrations = new Map<string, UserRegistration>();
  private emailIndex = new Map<string, string>(); // email -> userId
  private providerIndex = new Map<string, string>(); // provider:providerId -> userId

  // ==========================================================================
  // USER PROFILE OPERATIONS
  // ==========================================================================

  async storeUser(userId: string, user: UserProfile): Promise<StorageResult<void>> {
    try {
      this.users.set(userId, { ...user, updated_at: new Date().toISOString() });
      this.emailIndex.set(user.email, userId);
      this.providerIndex.set(`${user.provider}:${user.provider_id}`, userId);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store user: ${error}`, 'STORE_ERROR');
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
      const userId = this.emailIndex.get(email);
      if (!userId) {
        return createSuccessResult(null);
      }
      const user = this.users.get(userId) || null;
      return createSuccessResult(user);
    } catch (error) {
      return createErrorResult(`Failed to get user by email: ${error}`, 'GET_ERROR');
    }
  }

  async getUserByProvider(provider: string, providerId: string): Promise<StorageResult<UserProfile | null>> {
    try {
      const userId = this.providerIndex.get(`${provider}:${providerId}`);
      if (!userId) {
        return createSuccessResult(null);
      }
      const user = this.users.get(userId) || null;
      return createSuccessResult(user);
    } catch (error) {
      return createErrorResult(`Failed to get user by provider: ${error}`, 'GET_ERROR');
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<StorageResult<void>> {
    try {
      const existingUser = this.users.get(userId);
      if (!existingUser) {
        return createErrorResult('User not found', 'NOT_FOUND');
      }

      const updatedUser = {
        ...existingUser,
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.users.set(userId, updatedUser);

      // Update indexes if email or provider changed
      if (updates.email && updates.email !== existingUser.email) {
        this.emailIndex.delete(existingUser.email);
        this.emailIndex.set(updates.email, userId);
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to update user: ${error}`, 'UPDATE_ERROR');
    }
  }

  async deleteUser(userId: string): Promise<StorageResult<void>> {
    try {
      const user = this.users.get(userId);
      if (user) {
        this.users.delete(userId);
        this.emailIndex.delete(user.email);
        this.providerIndex.delete(`${user.provider}:${user.provider_id}`);

        // Delete user sessions
        for (const [sessionId, session] of this.sessions) {
          if (session.user_id === userId) {
            this.sessions.delete(sessionId);
          }
        }

        // Delete user registrations
        for (const [regId, registration] of this.registrations) {
          if (registration.user_id === userId) {
            this.registrations.delete(regId);
          }
        }
      }
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete user: ${error}`, 'DELETE_ERROR');
    }
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  async storeSession(sessionId: string, session: UserSession): Promise<StorageResult<void>> {
    try {
      this.sessions.set(sessionId, session);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store session: ${error}`, 'STORE_ERROR');
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

  async deleteUserSessions(userId: string): Promise<StorageResult<void>> {
    try {
      for (const [sessionId, session] of this.sessions) {
        if (session.user_id === userId) {
          this.sessions.delete(sessionId);
        }
      }
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete user sessions: ${error}`, 'DELETE_ERROR');
    }
  }

  // ==========================================================================
  // REGISTRATION TRACKING
  // ==========================================================================

  async storeRegistration(registrationId: string, registration: UserRegistration): Promise<StorageResult<void>> {
    try {
      this.registrations.set(registrationId, registration);
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store registration: ${error}`, 'STORE_ERROR');
    }
  }

  async getRegistrationsByUser(
    userId: string,
    options?: UserQueryOptions
  ): Promise<StorageResult<PaginatedResult<UserRegistration>>> {
    try {
      const opts = { ...options };
      let registrations = Array.from(this.registrations.values()).filter(r => r.user_id === userId);

      // Apply status filter
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
      return createErrorResult(`Failed to get registrations by user: ${error}`, 'GET_ERROR');
    }
  }

  async getRegistrationsByDomain(domain: string): Promise<StorageResult<UserRegistration[]>> {
    try {
      const registrations = Array.from(this.registrations.values()).filter(r => r.domain === domain);
      return createSuccessResult(registrations);
    } catch (error) {
      return createErrorResult(`Failed to get registrations by domain: ${error}`, 'GET_ERROR');
    }
  }

  // ==========================================================================
  // SEARCH & FILTERING
  // ==========================================================================

  async getAllUsers(options?: UserQueryOptions): Promise<StorageResult<PaginatedResult<UserProfile>>> {
    try {
      const opts = { ...options };
      let users = Array.from(this.users.values());

      // Apply filters
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
      return createErrorResult(`Failed to get all users: ${error}`, 'GET_ERROR');
    }
  }

  async searchUsers(
    query: string,
    options?: UserQueryOptions
  ): Promise<StorageResult<PaginatedResult<UserProfile>>> {
    try {
      const searchTerms = query.toLowerCase().split(/\s+/);
      let users = Array.from(this.users.values()).filter(user => {
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
      return createErrorResult(`Failed to search users: ${error}`, 'SEARCH_ERROR');
    }
  }

  // ==========================================================================
  // MONITORING & MAINTENANCE
  // ==========================================================================

  async getStats(): Promise<StorageResult<UserStats>> {
    try {
      const users = Array.from(this.users.values());
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
      return createErrorResult(`Failed to get user stats: ${error}`, 'STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return createHealthCheckResult(true, 0, {
      provider: 'in-memory',
      userCount: this.users.size,
      sessionCount: this.sessions.size,
      registrationCount: this.registrations.size
    });
  }

  async cleanup(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      const now = new Date();
      let removedCount = 0;

      // Clean up expired sessions
      for (const [sessionId, session] of this.sessions) {
        if (new Date(session.expires_at) < now) {
          if (!dryRun) {
            this.sessions.delete(sessionId);
          }
          removedCount++;
        }
      }

      const freedSpace = `${Math.round(removedCount * 100 / 1024)}KB`;

      return createSuccessResult({
        removedCount,
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

/**
 * Get registry storage based on environment
 */
export function getRegistryStorage(config?: StorageConfig): IRegistryStorage {
  const provider = config?.provider || detectStorageProvider();

  switch (provider) {
    case 'upstash':
      try {
        return new UpstashRegistryStorage();
      } catch (error) {
        console.warn('UpstashRegistryStorage initialization failed, falling back to memory:', error);
        return new InMemoryRegistryStorage();
      }
    case 'local':
      try {
        return new LocalRedisRegistryStorage();
      } catch (error) {
        console.warn('LocalRedisRegistryStorage initialization failed, falling back to memory:', error);
        return new InMemoryRegistryStorage();
      }
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
 * Get user storage based on environment
 */
export function getUserStorage(config?: StorageConfig): IUserStorage {
  const provider = config?.provider || detectStorageProvider();

  switch (provider) {
    case 'upstash':
      return new UpstashUserStorage();
    case 'local':
      return new LocalRedisUserStorage();
    case 'memory':
      return new InMemoryUserStorage();
    default:
      return new InMemoryUserStorage();
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

/**
 * Get audit storage based on environment
 */
export function getAuditStorage(config?: StorageConfig): IAuditStorage {
  const provider = config?.provider || detectStorageProvider();

  switch (provider) {
    case 'upstash':
      return new UpstashAuditStorage();
    case 'local':
      return new LocalRedisAuditStorage();
    case 'memory':
      return new InMemoryAuditStorage();
    default:
      return new InMemoryAuditStorage();
  }
}
