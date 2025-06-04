// First-Time Setup System
// Handles initial admin user creation and system configuration

import { getUserStorage } from '../services/storage/storage';
import { UserProfile } from '../services/storage/interfaces';
import { randomUUID } from 'crypto';

export interface SetupStatus {
  isSetupComplete: boolean;
  hasAdminUser: boolean;
  totalUsers: number;
  setupRequired: boolean;
}

export interface SetupRequest {
  adminEmail: string;
  adminName: string;
  adminProvider?: 'github' | 'google' | 'email';
  adminProviderId?: string;
  skipEmailVerification?: boolean;
}

export interface SetupResult {
  success: boolean;
  adminUserId?: string;
  error?: string;
}

/**
 * Check if the system needs initial setup
 */
export async function checkSetupStatus(): Promise<SetupStatus> {
  try {
    const userStorage = getUserStorage();
    
    // Get all users to check if any exist
    const usersResult = await userStorage.getAllUsers({ limit: 1 });
    if (!usersResult.success) {
      return {
        isSetupComplete: false,
        hasAdminUser: false,
        totalUsers: 0,
        setupRequired: true
      };
    }

    const totalUsers = usersResult.data.total;
    
    // Check if there's at least one admin user
    const adminUsersResult = await userStorage.getAllUsers({ 
      role: 'admin', 
      limit: 1 
    });
    
    const hasAdminUser = adminUsersResult.success && adminUsersResult.data.total > 0;
    
    return {
      isSetupComplete: totalUsers > 0 && hasAdminUser,
      hasAdminUser,
      totalUsers,
      setupRequired: totalUsers === 0 || !hasAdminUser
    };
  } catch (error) {
    console.error('Error checking setup status:', error);
    return {
      isSetupComplete: false,
      hasAdminUser: false,
      totalUsers: 0,
      setupRequired: true
    };
  }
}

/**
 * Create the initial admin user
 */
export async function createInitialAdmin(request: SetupRequest): Promise<SetupResult> {
  try {
    const userStorage = getUserStorage();
    
    // Check if setup is still needed
    const status = await checkSetupStatus();
    if (status.isSetupComplete) {
      return {
        success: false,
        error: 'Setup has already been completed'
      };
    }

    // Check if user already exists
    const existingUserResult = await userStorage.getUserByEmail(request.adminEmail);
    if (existingUserResult.success && existingUserResult.data) {
      // User exists, promote to admin
      const updateResult = await userStorage.updateUser(existingUserResult.data.id, {
        role: 'admin',
        updated_at: new Date().toISOString()
      });
      
      if (!updateResult.success) {
        return {
          success: false,
          error: `Failed to promote existing user to admin: ${updateResult.error}`
        };
      }

      return {
        success: true,
        adminUserId: existingUserResult.data.id
      };
    }

    // Create new admin user
    const adminUserId = randomUUID();
    const now = new Date().toISOString();

    const adminUser: UserProfile = {
      id: adminUserId,
      email: request.adminEmail,
      name: request.adminName,
      provider: request.adminProvider || 'email',
      provider_id: request.adminProviderId || adminUserId,
      role: 'admin',
      created_at: now,
      updated_at: now,
      email_verified: request.skipEmailVerification || false,
      is_active: true,
      preferences: {
        theme: 'system',
        notifications: true,
        newsletter: false
      },
      metadata: {
        setup_admin: true,
        setup_timestamp: now
      }
    };

    const storeResult = await userStorage.storeUser(adminUserId, adminUser);
    if (!storeResult.success) {
      return {
        success: false,
        error: `Failed to create admin user: ${storeResult.error}`
      };
    }

    return {
      success: true,
      adminUserId
    };
  } catch (error) {
    console.error('Error creating initial admin:', error);
    return {
      success: false,
      error: `Setup failed: ${error}`
    };
  }
}

/**
 * Promote an existing user to admin
 */
export async function promoteUserToAdmin(userId: string, promotedBy: string): Promise<SetupResult> {
  try {
    const userStorage = getUserStorage();
    
    // Verify the user exists
    const userResult = await userStorage.getUser(userId);
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Verify the promoter is an admin
    const promoterResult = await userStorage.getUser(promotedBy);
    if (!promoterResult.success || !promoterResult.data || promoterResult.data.role !== 'admin') {
      return {
        success: false,
        error: 'Only admins can promote users'
      };
    }

    // Update user role
    const updateResult = await userStorage.updateUser(userId, {
      role: 'admin',
      updated_at: new Date().toISOString(),
      metadata: {
        ...userResult.data.metadata,
        promoted_to_admin_by: promotedBy,
        promoted_to_admin_at: new Date().toISOString()
      }
    });

    if (!updateResult.success) {
      return {
        success: false,
        error: `Failed to promote user: ${updateResult.error}`
      };
    }

    return {
      success: true,
      adminUserId: userId
    };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return {
      success: false,
      error: `Promotion failed: ${error}`
    };
  }
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userStorage = getUserStorage();
    const userResult = await userStorage.getUser(userId);
    return userResult.success && userResult.data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get all admin users
 */
export async function getAdminUsers() {
  try {
    const userStorage = getUserStorage();
    return await userStorage.getAllUsers({ role: 'admin' });
  } catch (error) {
    console.error('Error getting admin users:', error);
    return {
      success: false,
      error: `Failed to get admin users: ${error}`,
      data: { items: [], total: 0, hasMore: false }
    };
  }
}
