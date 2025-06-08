// Role-based Access Control System
// 99.9999% of users have no roles - only admins need admin role

import { createStorage } from '@/lib/services/storage'
import { auth } from '../../../auth'

export type UserRole = 'admin' | null // Most users have null role

export interface AdminUser {
  id: string
  email: string
  name?: string
  isAdmin: true
  created_at: string
  granted_by?: string // Who granted admin access
}

/**
 * Check if user has admin role
 * 99.9999% of users will return false
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const storage = createStorage()
  
  try {
    const result = await storage.get('auth_admin_users', userId)
    return result.success && result.data?.isAdmin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Get current user's role
 * Returns 'admin' or null (99.9999% get null)
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }
  
  const isAdmin = await isUserAdmin(session.user.id)
  return isAdmin ? 'admin' : null
}

/**
 * Grant admin role to a user
 * Only existing admins can grant admin role
 */
export async function grantAdminRole(userId: string, grantedBy: string): Promise<void> {
  const storage = createStorage()
  
  // Verify the granter is admin
  const granterIsAdmin = await isUserAdmin(grantedBy)
  if (!granterIsAdmin) {
    throw new Error('Only admins can grant admin role')
  }
  
  // Get user details
  const userResult = await storage.get('auth_users', userId)
  if (!userResult.success || !userResult.data) {
    throw new Error('User not found')
  }
  
  const user = userResult.data
  
  // Create admin record
  const adminUser: AdminUser = {
    id: userId,
    email: user.email,
    name: user.name,
    isAdmin: true,
    created_at: new Date().toISOString(),
    granted_by: grantedBy
  }
  
  await storage.set('auth_admin_users', userId, adminUser)
  console.log(`Admin role granted to ${user.email} by ${grantedBy}`)
}

/**
 * Revoke admin role from a user
 * Only existing admins can revoke admin role
 */
export async function revokeAdminRole(userId: string, revokedBy: string): Promise<void> {
  const storage = createStorage()
  
  // Verify the revoker is admin
  const revokerIsAdmin = await isUserAdmin(revokedBy)
  if (!revokerIsAdmin) {
    throw new Error('Only admins can revoke admin role')
  }
  
  // Don't allow self-revocation (prevent lockout)
  if (userId === revokedBy) {
    throw new Error('Cannot revoke your own admin role')
  }
  
  await storage.delete('auth_admin_users', userId)
  console.log(`Admin role revoked from user ${userId} by ${revokedBy}`)
}

/**
 * List all admin users
 * Only admins can see this list
 */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const storage = createStorage()
  
  try {
    const result = await storage.query('auth_admin_users', {})
    
    if (result.success) {
      return result.data.items as AdminUser[]
    }
    
    return []
  } catch (error) {
    console.error('Error listing admin users:', error)
    return []
  }
}

/**
 * Check if user has specific permission
 * Most permissions are admin-only
 */
export async function hasPermission(permission: string, userId?: string): Promise<boolean> {
  if (!userId) {
    const session = await auth()
    if (!session?.user?.id) return false
    userId = session.user.id
  }
  
  const isAdmin = await isUserAdmin(userId)
  
  switch (permission) {
    case 'admin:view_dashboard':
    case 'admin:manage_users':
    case 'admin:manage_servers':
    case 'admin:view_analytics':
    case 'admin:system_settings':
      return isAdmin
    
    case 'user:register_server':
    case 'user:view_dashboard':
    case 'user:manage_profile':
      return true // All authenticated users can do these
    
    default:
      return false
  }
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<void> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('Authentication required')
  }
  
  const isAdmin = await isUserAdmin(session.user.id)
  if (!isAdmin) {
    throw new Error('Admin role required')
  }
}

/**
 * Bootstrap first admin user during setup
 * Only works if no admins exist yet
 */
export async function bootstrapFirstAdmin(userId: string): Promise<void> {
  const storage = createStorage()
  
  // Check if any admins exist
  const existingAdmins = await listAdminUsers()
  if (existingAdmins.length > 0) {
    throw new Error('Admin users already exist - cannot bootstrap')
  }
  
  // Get user details
  const userResult = await storage.get('auth_users', userId)
  if (!userResult.success || !userResult.data) {
    throw new Error('User not found')
  }
  
  const user = userResult.data
  
  // Create first admin
  const adminUser: AdminUser = {
    id: userId,
    email: user.email,
    name: user.name,
    isAdmin: true,
    created_at: new Date().toISOString(),
    granted_by: 'system_bootstrap'
  }
  
  await storage.set('auth_admin_users', userId, adminUser)
  console.log(`First admin user bootstrapped: ${user.email}`)
}
