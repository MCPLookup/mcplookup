// Upstash User Storage Implementation
// Uses Upstash Redis REST API for production cloud deployment

import { Redis } from '@upstash/redis';
import {
  IUserStorage,
  UserProfile,
  UserSession,
  UserRegistration,
  UserQueryOptions,
  UserStats,
  StorageResult,
  PaginatedResult,
  HealthCheckResult,
  createSuccessResult,
  createErrorResult,
  createHealthCheckResult
} from './interfaces';

/**
 * Upstash User Storage
 * Handles user authentication, profiles, and session management using Upstash Redis
 */
export class UpstashUserStorage implements IUserStorage {
  private redis: Redis;

  constructor() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Upstash Redis credentials not found. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    }

    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  // ==========================================================================
  // USER PROFILE OPERATIONS
  // ==========================================================================

  async storeUser(userId: string, user: UserProfile): Promise<StorageResult<void>> {
    try {
      const userWithTimestamp = { ...user, updated_at: new Date().toISOString() };

      // Use pipeline for atomic operations
      const pipeline = this.redis.pipeline();

      // 1. Store the full user profile
      pipeline.set(`user:${userId}`, JSON.stringify(userWithTimestamp));

      // 2. Create email index for fast email lookups
      pipeline.set(`email:${user.email}`, userId);

      // 3. Create provider index for OAuth lookups
      pipeline.set(`provider:${user.provider}:${user.provider_id}`, userId);

      // 4. Add to role index
      pipeline.sadd(`role:${user.role}`, userId);

      // 5. Add to provider index
      pipeline.sadd(`provider_type:${user.provider}`, userId);

      // 6. Add to all users set
      pipeline.sadd('users:all', userId);

      // 7. Add to active/inactive index
      if (user.is_active) {
        pipeline.sadd('users:active', userId);
      } else {
        pipeline.sadd('users:inactive', userId);
      }

      // 8. Add to verified/unverified index
      if (user.email_verified) {
        pipeline.sadd('users:verified', userId);
      } else {
        pipeline.sadd('users:unverified', userId);
      }

      // Execute all operations atomically
      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store user: ${error}`, 'UPSTASH_USER_STORE_ERROR');
    }
  }

  async getUser(userId: string): Promise<StorageResult<UserProfile | null>> {
    try {
      const userData = await this.redis.get(`user:${userId}`);
      if (!userData) {
        return createSuccessResult(null);
      }

      const user = typeof userData === 'string' ? JSON.parse(userData) : userData as UserProfile;
      return createSuccessResult(user);
    } catch (error) {
      return createErrorResult(`Failed to get user: ${error}`, 'UPSTASH_USER_GET_ERROR');
    }
  }

  async getUserByEmail(email: string): Promise<StorageResult<UserProfile | null>> {
    try {
      const userId = await this.redis.get(`email:${email}`);
      if (!userId) {
        return createSuccessResult(null);
      }

      return this.getUser(userId as string);
    } catch (error) {
      return createErrorResult(`Failed to get user by email: ${error}`, 'UPSTASH_USER_GET_BY_EMAIL_ERROR');
    }
  }

  async getUserByProvider(provider: string, providerId: string): Promise<StorageResult<UserProfile | null>> {
    try {
      const userId = await this.redis.get(`provider:${provider}:${providerId}`);
      if (!userId) {
        return createSuccessResult(null);
      }

      return this.getUser(userId as string);
    } catch (error) {
      return createErrorResult(`Failed to get user by provider: ${error}`, 'UPSTASH_USER_GET_BY_PROVIDER_ERROR');
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<StorageResult<void>> {
    try {
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

      const pipeline = this.redis.pipeline();

      // Update main user record
      pipeline.set(`user:${userId}`, JSON.stringify(updatedUser));

      // Update indexes if relevant fields changed
      if (updates.email && updates.email !== existingUser.email) {
        // Remove old email index and add new one
        pipeline.del(`email:${existingUser.email}`);
        pipeline.set(`email:${updates.email}`, userId);
      }

      if (updates.role && updates.role !== existingUser.role) {
        // Update role indexes
        pipeline.srem(`role:${existingUser.role}`, userId);
        pipeline.sadd(`role:${updates.role}`, userId);
      }

      if (updates.is_active !== undefined && updates.is_active !== existingUser.is_active) {
        // Update active/inactive indexes
        if (updates.is_active) {
          pipeline.srem('users:inactive', userId);
          pipeline.sadd('users:active', userId);
        } else {
          pipeline.srem('users:active', userId);
          pipeline.sadd('users:inactive', userId);
        }
      }

      if (updates.email_verified !== undefined && updates.email_verified !== existingUser.email_verified) {
        // Update verified/unverified indexes
        if (updates.email_verified) {
          pipeline.srem('users:unverified', userId);
          pipeline.sadd('users:verified', userId);
        } else {
          pipeline.srem('users:verified', userId);
          pipeline.sadd('users:unverified', userId);
        }
      }

      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to update user: ${error}`, 'UPSTASH_USER_UPDATE_ERROR');
    }
  }

  async deleteUser(userId: string): Promise<StorageResult<void>> {
    try {
      // Get existing user to clean up indexes
      const existingResult = await this.getUser(userId);
      if (!existingResult.success || !existingResult.data) {
        return createErrorResult('User not found', 'USER_NOT_FOUND');
      }

      const user = existingResult.data;
      const pipeline = this.redis.pipeline();

      // Remove main user record
      pipeline.del(`user:${userId}`);

      // Remove from all indexes
      pipeline.del(`email:${user.email}`);
      pipeline.del(`provider:${user.provider}:${user.provider_id}`);
      pipeline.srem(`role:${user.role}`, userId);
      pipeline.srem(`provider_type:${user.provider}`, userId);
      pipeline.srem('users:all', userId);
      pipeline.srem('users:active', userId);
      pipeline.srem('users:inactive', userId);
      pipeline.srem('users:verified', userId);
      pipeline.srem('users:unverified', userId);

      // Note: For Upstash, we can't use KEYS command efficiently
      // In production, you'd want to maintain separate indexes for user sessions and registrations
      // For now, we'll handle cleanup differently

      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete user: ${error}`, 'UPSTASH_USER_DELETE_ERROR');
    }
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  async storeSession(sessionId: string, session: UserSession): Promise<StorageResult<void>> {
    try {
      const key = `session:${sessionId}`;
      const userSessionKey = `session:user:${session.user_id}`;

      const pipeline = this.redis.pipeline();

      // Store session with TTL based on expires_at
      const expiresAt = new Date(session.expires_at);
      const ttlSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

      pipeline.setex(key, ttlSeconds, JSON.stringify(session));

      // Add to user's session list
      pipeline.sadd(userSessionKey, sessionId);
      pipeline.expire(userSessionKey, ttlSeconds);

      // Add to all sessions set
      pipeline.sadd('sessions:all', sessionId);

      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store session: ${error}`, 'UPSTASH_SESSION_STORE_ERROR');
    }
  }

  async getSession(sessionId: string): Promise<StorageResult<UserSession | null>> {
    try {
      const sessionData = await this.redis.get(`session:${sessionId}`);
      if (!sessionData) {
        return createSuccessResult(null);
      }

      const session = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData as UserSession;
      return createSuccessResult(session);
    } catch (error) {
      return createErrorResult(`Failed to get session: ${error}`, 'UPSTASH_SESSION_GET_ERROR');
    }
  }

  async deleteSession(sessionId: string): Promise<StorageResult<void>> {
    try {
      // Get session to find user ID
      const sessionResult = await this.getSession(sessionId);
      if (sessionResult.success && sessionResult.data) {
        const session = sessionResult.data;
        const pipeline = this.redis.pipeline();

        // Remove session
        pipeline.del(`session:${sessionId}`);

        // Remove from user's session list
        pipeline.srem(`session:user:${session.user_id}`, sessionId);

        // Remove from all sessions set
        pipeline.srem('sessions:all', sessionId);

        await pipeline.exec();
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete session: ${error}`, 'UPSTASH_SESSION_DELETE_ERROR');
    }
  }

  async deleteUserSessions(userId: string): Promise<StorageResult<void>> {
    try {
      // Get all session IDs for the user
      const sessionIds = await this.redis.smembers(`session:user:${userId}`);

      if (sessionIds.length > 0) {
        const pipeline = this.redis.pipeline();

        // Delete all sessions
        for (const sessionId of sessionIds) {
          pipeline.del(`session:${sessionId}`);
          pipeline.srem('sessions:all', sessionId);
        }

        // Delete user's session list
        pipeline.del(`session:user:${userId}`);

        await pipeline.exec();
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete user sessions: ${error}`, 'UPSTASH_USER_SESSIONS_DELETE_ERROR');
    }
  }

  // ==========================================================================
  // REGISTRATION TRACKING
  // ==========================================================================

  async storeRegistration(registrationId: string, registration: UserRegistration): Promise<StorageResult<void>> {
    try {
      const key = `registration:${registrationId}`;
      const userRegKey = `registration:user:${registration.user_id}`;
      const domainRegKey = `registration:domain:${registration.domain}`;

      const pipeline = this.redis.pipeline();

      // Store registration
      pipeline.set(key, JSON.stringify(registration));

      // Add to user's registration list
      pipeline.sadd(userRegKey, registrationId);

      // Add to domain's registration list
      pipeline.sadd(domainRegKey, registrationId);

      // Add to status index
      pipeline.sadd(`registration:status:${registration.status}`, registrationId);

      // Add to all registrations set
      pipeline.sadd('registrations:all', registrationId);

      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store registration: ${error}`, 'UPSTASH_REGISTRATION_STORE_ERROR');
    }
  }

  async getRegistrationsByUser(
    userId: string,
    options?: UserQueryOptions
  ): Promise<StorageResult<PaginatedResult<UserRegistration>>> {
    try {
      const registrationIds = await this.redis.smembers(`registration:user:${userId}`);

      if (registrationIds.length === 0) {
        return createSuccessResult({
          items: [],
          total: 0,
          hasMore: false
        });
      }

      // Get all registrations
      const keys = registrationIds.map(id => `registration:${id}`);
      const results = await this.redis.mget(...keys);

      let registrations = results
        .filter((result: any) => result !== null)
        .map((result: any) => {
          try {
            return typeof result === 'string' ? JSON.parse(result) : result as UserRegistration;
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
      return createErrorResult(`Failed to get registrations by user: ${error}`, 'UPSTASH_REGISTRATION_GET_BY_USER_ERROR');
    }
  }

  async getRegistrationsByDomain(domain: string): Promise<StorageResult<UserRegistration[]>> {
    try {
      const registrationIds = await this.redis.smembers(`registration:domain:${domain}`);

      if (registrationIds.length === 0) {
        return createSuccessResult([]);
      }

      // Get all registrations
      const keys = registrationIds.map(id => `registration:${id}`);
      const results = await this.redis.mget(...keys);

      const registrations = results
        .filter((result: any) => result !== null)
        .map((result: any) => {
          try {
            return typeof result === 'string' ? JSON.parse(result) : result as UserRegistration;
          } catch (error) {
            return null;
          }
        })
        .filter((reg: UserRegistration | null) => reg !== null) as UserRegistration[];

      return createSuccessResult(registrations);
    } catch (error) {
      return createErrorResult(`Failed to get registrations by domain: ${error}`, 'UPSTASH_REGISTRATION_GET_BY_DOMAIN_ERROR');
    }
  }

  // ==========================================================================
  // SEARCH & FILTERING
  // ==========================================================================

  async getAllUsers(options?: UserQueryOptions): Promise<StorageResult<PaginatedResult<UserProfile>>> {
    try {
      let userIds: string[] = [];

      // Apply filters using Redis sets
      const opts = { ...options };

      if (opts.role) {
        userIds = await this.redis.smembers(`role:${opts.role}`);
      } else if (opts.provider) {
        userIds = await this.redis.smembers(`provider_type:${opts.provider}`);
      } else if (opts.is_active !== undefined) {
        userIds = await this.redis.smembers(opts.is_active ? 'users:active' : 'users:inactive');
      } else if (opts.email_verified !== undefined) {
        userIds = await this.redis.smembers(opts.email_verified ? 'users:verified' : 'users:unverified');
      } else {
        userIds = await this.redis.smembers('users:all');
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
      return createErrorResult(`Failed to get all users: ${error}`, 'UPSTASH_USER_GET_ALL_ERROR');
    }
  }

  async searchUsers(
    query: string,
    options?: UserQueryOptions
  ): Promise<StorageResult<PaginatedResult<UserProfile>>> {
    try {
      // For Upstash implementation, we'll get all users and filter in memory
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
      return createErrorResult(`Failed to search users: ${error}`, 'UPSTASH_USER_SEARCH_ERROR');
    }
  }

  // ==========================================================================
  // MONITORING & MAINTENANCE
  // ==========================================================================

  async getStats(): Promise<StorageResult<UserStats>> {
    try {
      const userIds = await this.redis.smembers('users:all');

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
      return createErrorResult(`Failed to get user stats: ${error}`, 'UPSTASH_USER_STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const result = await this.redis.ping();
      const latency = Date.now() - startTime;
      const healthy = result === 'PONG';

      const userCount = await this.redis.scard('users:all');
      const sessionCount = await this.redis.scard('sessions:all');
      const registrationCount = await this.redis.scard('registrations:all');

      return createHealthCheckResult(healthy, latency, {
        provider: 'upstash',
        userCount,
        sessionCount,
        registrationCount
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
      const now = new Date();
      let removedCount = 0;

      // Clean up expired sessions
      const sessionIds = await this.redis.smembers('sessions:all');
      const expiredSessions: string[] = [];

      for (const sessionId of sessionIds) {
        const sessionData = await this.redis.get(`session:${sessionId}`);
        if (sessionData) {
          try {
            const session = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData as UserSession;
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
      return createErrorResult(`Cleanup failed: ${error}`, 'UPSTASH_USER_CLEANUP_ERROR');
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private async getUsersByIds(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) return [];

    const keys = userIds.map(id => `user:${id}`);
    const results = await this.redis.mget(...keys);

    return results
      .filter((result: any) => result !== null)
      .map((result: any) => {
        try {
          return typeof result === 'string' ? JSON.parse(result) : result as UserProfile;
        } catch (error) {
          return null;
        }
      })
      .filter((user: UserProfile | null) => user !== null) as UserProfile[];
  }

  getProviderInfo() {
    return {
      name: 'upstash',
      version: '1.0.0',
      capabilities: ['persistence', 'cloud-native', 'production-ready', 'user-management', 'session-management']
    };
  }
}
