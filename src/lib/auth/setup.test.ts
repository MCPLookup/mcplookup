// Tests for the setup system
import { describe, it, expect, beforeEach } from 'vitest'
import { checkSetupStatus, createInitialAdmin, promoteUserToAdmin, isUserAdmin } from './setup'
import { getUserStorage } from '../services/storage/storage'

describe('Setup System', () => {
  beforeEach(async () => {
    // Clear storage before each test - use a more thorough approach
    const userStorage = getUserStorage()

    // Get all users and delete them
    let hasMore = true
    while (hasMore) {
      const allUsersResult = await userStorage.getAllUsers({ limit: 100 })
      if (allUsersResult.success && allUsersResult.data.items.length > 0) {
        for (const user of allUsersResult.data.items) {
          await userStorage.deleteUser(user.id)
        }
        hasMore = allUsersResult.data.hasMore
      } else {
        hasMore = false
      }
    }

    // Wait a bit for storage to settle
    await new Promise(resolve => setTimeout(resolve, 10))
  })

  describe('checkSetupStatus', () => {
    it('should indicate setup is required when no users exist', async () => {
      const status = await checkSetupStatus()
      
      expect(status.setupRequired).toBe(true)
      expect(status.hasAdminUser).toBe(false)
      expect(status.totalUsers).toBe(0)
      expect(status.isSetupComplete).toBe(false)
    })

    it('should indicate setup is required when users exist but no admin', async () => {
      const userStorage = getUserStorage()
      
      // Create a regular user
      await userStorage.storeUser('user1', {
        id: 'user1',
        email: 'user@example.com',
        name: 'Regular User',
        provider: 'email',
        provider_id: 'user1',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      const status = await checkSetupStatus()
      
      expect(status.setupRequired).toBe(true)
      expect(status.hasAdminUser).toBe(false)
      expect(status.totalUsers).toBe(1)
      expect(status.isSetupComplete).toBe(false)
    })

    it('should indicate setup is complete when admin user exists', async () => {
      const userStorage = getUserStorage()
      
      // Create an admin user
      await userStorage.storeUser('admin1', {
        id: 'admin1',
        email: 'admin@example.com',
        name: 'Admin User',
        provider: 'email',
        provider_id: 'admin1',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      const status = await checkSetupStatus()
      
      expect(status.setupRequired).toBe(false)
      expect(status.hasAdminUser).toBe(true)
      expect(status.totalUsers).toBe(1)
      expect(status.isSetupComplete).toBe(true)
    })
  })

  describe('createInitialAdmin', () => {
    it('should create an admin user successfully', async () => {
      const result = await createInitialAdmin({
        adminEmail: 'admin@example.com',
        adminName: 'Admin User',
        skipEmailVerification: true
      })

      expect(result.success).toBe(true)
      expect(result.adminUserId).toBeDefined()

      // Verify the user was created with admin role
      const userStorage = getUserStorage()
      const userResult = await userStorage.getUser(result.adminUserId!)
      
      expect(userResult.success).toBe(true)
      expect(userResult.data?.role).toBe('admin')
      expect(userResult.data?.email).toBe('admin@example.com')
    })

    it('should fail if setup is already complete', async () => {
      // First, create an admin user
      await createInitialAdmin({
        adminEmail: 'first@example.com',
        adminName: 'First Admin',
        skipEmailVerification: true
      })

      // Try to create another admin
      const result = await createInitialAdmin({
        adminEmail: 'second@example.com',
        adminName: 'Second Admin',
        skipEmailVerification: true
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('already been completed')
    })

    it('should promote existing user to admin if they exist', async () => {
      const userStorage = getUserStorage()
      
      // Create a regular user first
      await userStorage.storeUser('existing', {
        id: 'existing',
        email: 'existing@example.com',
        name: 'Existing User',
        provider: 'email',
        provider_id: 'existing',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      // Try to create admin with same email
      const result = await createInitialAdmin({
        adminEmail: 'existing@example.com',
        adminName: 'Admin User',
        skipEmailVerification: true
      })

      expect(result.success).toBe(true)
      expect(result.adminUserId).toBe('existing')

      // Verify the user was promoted to admin
      const userResult = await userStorage.getUser('existing')
      expect(userResult.success).toBe(true)
      expect(userResult.data?.role).toBe('admin')
    })
  })

  describe('promoteUserToAdmin', () => {
    it('should promote a user to admin successfully', async () => {
      const userStorage = getUserStorage()
      
      // Create an admin user
      await userStorage.storeUser('admin1', {
        id: 'admin1',
        email: 'admin@example.com',
        name: 'Admin User',
        provider: 'email',
        provider_id: 'admin1',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      // Create a regular user
      await userStorage.storeUser('user1', {
        id: 'user1',
        email: 'user@example.com',
        name: 'Regular User',
        provider: 'email',
        provider_id: 'user1',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      // Promote user to admin
      const result = await promoteUserToAdmin('user1', 'admin1')

      expect(result.success).toBe(true)
      expect(result.adminUserId).toBe('user1')

      // Verify the user was promoted
      const userResult = await userStorage.getUser('user1')
      expect(userResult.success).toBe(true)
      expect(userResult.data?.role).toBe('admin')
    })

    it('should fail if promoter is not an admin', async () => {
      const userStorage = getUserStorage()
      
      // Create two regular users
      await userStorage.storeUser('user1', {
        id: 'user1',
        email: 'user1@example.com',
        name: 'User 1',
        provider: 'email',
        provider_id: 'user1',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      await userStorage.storeUser('user2', {
        id: 'user2',
        email: 'user2@example.com',
        name: 'User 2',
        provider: 'email',
        provider_id: 'user2',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      // Try to promote user1 by user2 (non-admin)
      const result = await promoteUserToAdmin('user1', 'user2')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Only admins can promote users')
    })
  })

  describe('isUserAdmin', () => {
    it('should return true for admin users', async () => {
      const userStorage = getUserStorage()
      
      await userStorage.storeUser('admin1', {
        id: 'admin1',
        email: 'admin@example.com',
        name: 'Admin User',
        provider: 'email',
        provider_id: 'admin1',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      const isAdmin = await isUserAdmin('admin1')
      expect(isAdmin).toBe(true)
    })

    it('should return false for non-admin users', async () => {
      const userStorage = getUserStorage()
      
      await userStorage.storeUser('user1', {
        id: 'user1',
        email: 'user@example.com',
        name: 'Regular User',
        provider: 'email',
        provider_id: 'user1',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        is_active: true
      })

      const isAdmin = await isUserAdmin('user1')
      expect(isAdmin).toBe(false)
    })

    it('should return false for non-existent users', async () => {
      const isAdmin = await isUserAdmin('nonexistent')
      expect(isAdmin).toBe(false)
    })
  })
})
