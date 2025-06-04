// NextAuth Storage Adapter
// Integrates NextAuth with our storage abstraction system

import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters"
import { randomUUID } from "crypto"
import { createUserStorage } from "../services/storage/storage"
import { UserProfile, UserSession, isSuccessResult } from "../services/storage/interfaces"

/**
 * Create a NextAuth adapter that uses our storage abstraction
 */
export function createStorageAdapter(): Adapter {
  const userStorage = createUserStorage()

  return {
    async createUser(user): Promise<AdapterUser> {
      const userId = randomUUID()
      const now = new Date().toISOString()

      const userProfile: UserProfile = {
        id: userId,
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
        provider: 'email', // Default, will be updated by linkAccount
        provider_id: userId,
        role: 'user',
        created_at: now,
        updated_at: now,
        email_verified: user.emailVerified ? true : false,
        is_active: true,
        preferences: {
          theme: 'system',
          notifications: true,
          newsletter: false
        }
      }

      const result = await userStorage.storeUser(userId, userProfile)
      if (!result.success) {
        throw new Error(`Failed to create user: ${result.error}`)
      }

      return {
        id: userId,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified
      }
    },

    async getUser(id): Promise<AdapterUser | null> {
      const result = await userStorage.getUser(id)
      if (!result.success || !result.data) {
        return null
      }

      const user = result.data
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.email_verified ? new Date() : null
      }
    },

    async getUserByEmail(email): Promise<AdapterUser | null> {
      const result = await userStorage.getUserByEmail(email)
      if (!result.success || !result.data) {
        return null
      }

      const user = result.data
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.email_verified ? new Date() : null
      }
    },

    async getUserByAccount({ providerAccountId, provider }): Promise<AdapterUser | null> {
      const result = await userStorage.getUserByProvider(provider, providerAccountId)
      if (!result.success || !result.data) {
        return null
      }

      const user = result.data
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.email_verified ? new Date() : null
      }
    },

    async updateUser(user): Promise<AdapterUser> {
      const updates: Partial<UserProfile> = {
        name: user.name || undefined,
        image: user.image || undefined,
        email_verified: user.emailVerified ? true : false,
        updated_at: new Date().toISOString()
      }

      if (user.email) {
        updates.email = user.email
      }

      const result = await userStorage.updateUser(user.id, updates)
      if (!result.success) {
        throw new Error(`Failed to update user: ${result.error}`)
      }

      // Return updated user
      const getUserResult = await userStorage.getUser(user.id)
      if (!getUserResult.success || !getUserResult.data) {
        throw new Error('Failed to retrieve updated user')
      }

      const updatedUser = getUserResult.data
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        emailVerified: updatedUser.email_verified ? new Date() : null
      }
    },

    async deleteUser(userId): Promise<void> {
      const result = await userStorage.deleteUser(userId)
      if (!result.success) {
        throw new Error(`Failed to delete user: ${result.error}`)
      }
    },

    async linkAccount(account): Promise<AdapterAccount> {
      // Update user's provider information
      const userResult = await userStorage.getUser(account.userId)
      if (userResult.success && userResult.data) {
        await userStorage.updateUser(account.userId, {
          provider: account.provider as 'github' | 'google' | 'email',
          provider_id: account.providerAccountId,
          updated_at: new Date().toISOString()
        })
      }

      // For our simplified storage, we don't store separate account records
      // The provider info is stored directly in the user profile
      return account
    },

    async unlinkAccount({ providerAccountId, provider }): Promise<void> {
      // Find user by provider and reset to email provider
      const userResult = await userStorage.getUserByProvider(provider, providerAccountId)
      if (userResult.success && userResult.data) {
        await userStorage.updateUser(userResult.data.id, {
          provider: 'email',
          provider_id: userResult.data.id,
          updated_at: new Date().toISOString()
        })
      }
    },

    // For simplicity, we'll use JWT for sessions since our current storage
    // doesn't have efficient session token indexing
    // In production, you'd want to implement proper session storage
    async createSession({ sessionToken, userId, expires }): Promise<AdapterSession> {
      return {
        sessionToken,
        userId,
        expires
      }
    },

    async getSessionAndUser(sessionToken): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      return null
    },

    async updateSession({ sessionToken, expires }): Promise<AdapterSession | null | undefined> {
      return null
    },

    async deleteSession(sessionToken): Promise<void> {
      // No-op for JWT sessions
    },

    async createVerificationToken({ identifier, expires, token }): Promise<VerificationToken> {
      return { identifier, expires, token }
    },

    async useVerificationToken({ identifier, token }): Promise<VerificationToken | null> {
      return null
    }
  }
}
