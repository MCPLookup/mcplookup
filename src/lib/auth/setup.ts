// Auth Setup and Admin Management
// Handles initial setup and admin user management

import { createStorage } from "../services/storage/factory"

export interface SetupStatus {
  setupRequired: boolean
  hasAdminUser: boolean
  totalUsers: number
}

export interface AdminUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
  created_at: string
}

/**
 * Check if initial setup is required
 */
export async function checkSetupStatus(): Promise<SetupStatus> {
  const storage = createStorage()
  
  try {
    // Check if we have any admin users
    const usersResult = await storage.getAll('auth_users')
    
    if (!usersResult.success) {
      return {
        setupRequired: true,
        hasAdminUser: false,
        totalUsers: 0
      }
    }

    const users = usersResult.data.items
    const totalUsers = users.length
    
    // Check if any user is an admin
    const adminUsersResult = await storage.query('auth_admin_users', {})
    const hasAdminUser = adminUsersResult.success && adminUsersResult.data.items.length > 0
    
    return {
      setupRequired: !hasAdminUser,
      hasAdminUser,
      totalUsers
    }
  } catch (error) {
    console.error('Setup status check failed:', error)
    return {
      setupRequired: true,
      hasAdminUser: false,
      totalUsers: 0
    }
  }
}

/**
 * Create the first admin user during setup
 * @deprecated Use bootstrapFirstAdmin from roles.ts instead
 */
export async function createAdminUser(userId: string): Promise<void> {
  const { bootstrapFirstAdmin } = await import('./roles')
  return bootstrapFirstAdmin(userId)
}

/**
 * Check if a user is an admin
 * @deprecated Use isUserAdmin from roles.ts instead
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { isUserAdmin: checkAdmin } = await import('./roles')
  return checkAdmin(userId)
}

/**
 * Get all admin users
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const storage = createStorage()
  
  try {
    const result = await storage.getAll('auth_admin_users')
    
    if (result.success) {
      return result.data.items.filter(user => user.isAdmin)
    }
    
    return []
  } catch (error) {
    console.error('Failed to get admin users:', error)
    return []
  }
}

/**
 * Add admin privileges to a user
 */
export async function promoteToAdmin(userId: string): Promise<void> {
  const storage = createStorage()
  
  try {
    // Get user details
    const userResult = await storage.get('auth_users', userId)
    
    if (!userResult.success || !userResult.data) {
      throw new Error('User not found')
    }

    const user = userResult.data
    
    // Create or update admin record
    const adminUser: AdminUser = {
      id: userId,
      email: user.email,
      name: user.name,
      isAdmin: true,
      created_at: new Date().toISOString()
    }
    
    await storage.set('auth_admin_users', userId, adminUser)
    
    console.log(`User promoted to admin: ${user.email}`)
  } catch (error) {
    console.error('Failed to promote user to admin:', error)
    throw error
  }
}

/**
 * Remove admin privileges from a user
 */
export async function demoteFromAdmin(userId: string): Promise<void> {
  const storage = createStorage()
  
  try {
    // Check if this is the last admin
    const adminUsers = await getAdminUsers()
    
    if (adminUsers.length <= 1) {
      throw new Error('Cannot remove the last admin user')
    }
    
    await storage.delete('auth_admin_users', userId)
    
    console.log(`Admin privileges removed from user: ${userId}`)
  } catch (error) {
    console.error('Failed to demote user from admin:', error)
    throw error
  }
}

/**
 * Get setup statistics
 */
export async function getSetupStats(): Promise<{
  totalUsers: number
  adminUsers: number
  setupComplete: boolean
  setupDate?: string
}> {
  const storage = createStorage()
  
  try {
    const [usersResult, adminUsersResult] = await Promise.all([
      storage.getAll('auth_users'),
      storage.getAll('auth_admin_users')
    ])
    
    const totalUsers = usersResult.success ? usersResult.data.items.length : 0
    const adminUsers = adminUsersResult.success ? adminUsersResult.data.items.length : 0
    
    // Get setup date from first admin user
    let setupDate: string | undefined
    if (adminUsersResult.success && adminUsersResult.data.items.length > 0) {
      const firstAdmin = adminUsersResult.data.items
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
      setupDate = firstAdmin.created_at
    }
    
    return {
      totalUsers,
      adminUsers,
      setupComplete: adminUsers > 0,
      setupDate
    }
  } catch (error) {
    console.error('Failed to get setup stats:', error)
    return {
      totalUsers: 0,
      adminUsers: 0,
      setupComplete: false
    }
  }
}
