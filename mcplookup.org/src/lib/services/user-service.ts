// User Service - Business logic for user management
// Uses unified storage interface for data persistence

import { IStorage, StorageResult, QueryOptions, isSuccessResult } from './storage/unified-storage';
import { createStorage, StorageConfig } from './storage/factory';

// =============================================================================
// USER DATA TYPES
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator';
  created_at: string;
  updated_at: string;
  last_login: string | null;
  email_verified: boolean;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  activity: {
    servers_registered: number;
    last_activity: string;
    total_sessions: number;
  };
  provider?: {
    name: string;
    id: string;
  };
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expires_at: string;
  created_at: string;
  last_accessed: string;
  ip_address?: string;
  user_agent?: string;
}

export interface UserRegistration {
  id: string;
  userId: string;
  domain: string;
  endpoint: string;
  contact_email: string;
  created_at: string;
  status: 'pending' | 'verified' | 'failed';
}

/**
 * User Service
 * Handles all business logic for user management operations
 * Storage-agnostic through the unified storage interface
 */
export class UserService {
  private storage: IStorage;
  private readonly USERS_COLLECTION = 'users';
  private readonly SESSIONS_COLLECTION = 'sessions';
  private readonly REGISTRATIONS_COLLECTION = 'registrations';

  constructor() {
    this.storage = createStorage();
  }

  // ==========================================================================
  // USER PROFILE OPERATIONS
  // ==========================================================================

  /**
   * Create a new user
   */
  async createUser(userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const now = new Date().toISOString();
    const user: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      created_at: now,
      updated_at: now,
      activity: {
        ...userData.activity,
        servers_registered: userData.activity?.servers_registered || 0,
        last_activity: now,
        total_sessions: userData.activity?.total_sessions || 0
      }
    };

    const result = await this.storage.set(this.USERS_COLLECTION, user.id, user);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to create user: ${result.error}`);
    }

    return user;
  }

  /**
   * Get a user by ID
   */
  async getUser(userId: string): Promise<UserProfile | null> {
    const result = await this.storage.get<UserProfile>(this.USERS_COLLECTION, userId);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get user: ${result.error}`);
    }

    return result.data;
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const queryOptions: QueryOptions = {
      filters: { email }
    };

    const result = await this.storage.query<UserProfile>(this.USERS_COLLECTION, queryOptions);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get user by email: ${result.error}`);
    }

    return result.data.items[0] || null;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const existing = await this.getUser(userId);
    if (!existing) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedUser = {
      ...existing,
      ...updates,
      id: userId, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    const result = await this.storage.set(this.USERS_COLLECTION, userId, updatedUser);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to update user: ${result.error}`);
    }
  }

  /**
   * Delete a user and all associated data
   */
  async deleteUser(userId: string): Promise<void> {
    // Delete user sessions
    await this.deleteUserSessions(userId);

    // Delete user registrations
    const registrations = await this.getRegistrationsByUser(userId);
    for (const registration of registrations) {
      await this.storage.delete(this.REGISTRATIONS_COLLECTION, registration.id);
    }

    // Delete user profile
    const result = await this.storage.delete(this.USERS_COLLECTION, userId);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to delete user: ${result.error}`);
    }
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  /**
   * Create a user session
   */
  async createSession(sessionData: Omit<UserSession, 'id' | 'created_at'>): Promise<UserSession> {
    const session: UserSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...sessionData,
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString()
    };

    const result = await this.storage.set(this.SESSIONS_COLLECTION, session.id, session);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to create session: ${result.error}`);
    }

    // Update user's last login and session count
    const user = await this.getUser(sessionData.userId);
    if (user) {
      await this.updateUser(sessionData.userId, {
        last_login: session.created_at,
        activity: {
          ...user.activity,
          total_sessions: user.activity.total_sessions + 1,
          last_activity: session.created_at
        }
      });
    }

    return session;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<UserSession | null> {
    const result = await this.storage.get<UserSession>(this.SESSIONS_COLLECTION, sessionId);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get session: ${result.error}`);
    }

    return result.data;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const result = await this.storage.delete(this.SESSIONS_COLLECTION, sessionId);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to delete session: ${result.error}`);
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<void> {
    const queryOptions: QueryOptions = {
      filters: { userId }
    };

    const result = await this.storage.query<UserSession>(this.SESSIONS_COLLECTION, queryOptions);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get user sessions: ${result.error}`);
    }

    // Delete all sessions
    const sessionIds = result.data.items.map(session => session.id);
    if (sessionIds.length > 0) {
      const deleteResult = await this.storage.deleteBatch(this.SESSIONS_COLLECTION, sessionIds);
      if (!isSuccessResult(deleteResult)) {
        throw new Error(`Failed to delete user sessions: ${deleteResult.error}`);
      }
    }
  }

  // ==========================================================================
  // REGISTRATION TRACKING
  // ==========================================================================

  /**
   * Store a user registration record
   */
  async createRegistration(registrationData: Omit<UserRegistration, 'id' | 'created_at'>): Promise<UserRegistration> {
    const registration: UserRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...registrationData,
      created_at: new Date().toISOString()
    };

    const result = await this.storage.set(this.REGISTRATIONS_COLLECTION, registration.id, registration);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to create registration: ${result.error}`);
    }

    return registration;
  }

  /**
   * Get registrations by user
   */
  async getRegistrationsByUser(userId: string): Promise<UserRegistration[]> {
    const queryOptions: QueryOptions = {
      filters: { userId }
    };

    const result = await this.storage.query<UserRegistration>(this.REGISTRATIONS_COLLECTION, queryOptions);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get user registrations: ${result.error}`);
    }

    return result.data.items;
  }

  /**
   * Get registrations by domain
   */
  async getRegistrationsByDomain(domain: string): Promise<UserRegistration[]> {
    const queryOptions: QueryOptions = {
      filters: { domain }
    };

    const result = await this.storage.query<UserRegistration>(this.REGISTRATIONS_COLLECTION, queryOptions);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get domain registrations: ${result.error}`);
    }

    return result.data.items;
  }

  // ==========================================================================
  // SEARCH & FILTERING
  // ==========================================================================

  /**
   * Get all users with pagination
   */
  async getAllUsers(options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<UserProfile[]> {
    const queryOptions: QueryOptions = {
      pagination: {
        limit: options?.limit || 50,
        offset: options?.offset || 0
      },
      sort: options?.sortBy ? {
        field: options.sortBy,
        direction: options.sortDirection || 'asc'
      } : undefined
    };

    const result = await this.storage.getAll<UserProfile>(this.USERS_COLLECTION, queryOptions);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to get users: ${result.error}`);
    }

    return result.data.items;
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<UserProfile[]> {
    const result = await this.storage.search<UserProfile>(this.USERS_COLLECTION, query);
    
    if (!isSuccessResult(result)) {
      throw new Error(`Failed to search users: ${result.error}`);
    }

    return result.data.items;
  }

  // ==========================================================================
  // STATISTICS & MONITORING
  // ==========================================================================

  /**
   * Get user statistics
   */
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    totalSessions: number;
  }> {
    const allUsers = await this.getAllUsers();
    const today = new Date().toISOString().split('T')[0];
    
    const newUsersToday = allUsers.filter(user => 
      user.created_at.startsWith(today)
    ).length;

    const activeUsers = allUsers.filter(user => 
      user.last_login && 
      new Date(user.last_login) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days
    ).length;

    const totalSessions = allUsers.reduce((sum, user) => 
      sum + user.activity.total_sessions, 0
    );

    return {
      totalUsers: allUsers.length,
      activeUsers,
      newUsersToday,
      totalSessions
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const result = await this.storage.healthCheck();
      return {
        healthy: result.healthy,
        details: result
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: String(error) }
      };
    }
  }
}
