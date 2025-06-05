// NextAuth Storage Adapter
// Uses our unified storage system for NextAuth database sessions

import type { Adapter } from "next-auth/adapters"
import { createStorage } from "../services/storage/factory"
import type { IStorage } from "../services/storage/unified-storage"

export interface EmailVerificationToken {
  identifier: string // email
  token: string // hashed token
  expires: Date
}

export interface PasswordResetToken {
  identifier: string // email
  token: string // hashed token
  expires: Date
}

export function createStorageAdapter(): Adapter {
  const storage = createStorage()

  return {
    async createUser(user) {
      const id = crypto.randomUUID()
      const userData = {
        id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      await storage.set('auth_users', id, userData)
      return userData
    },

    async getUser(id) {
      const result = await storage.get('auth_users', id)
      return result.success ? result.data : null
    },

    async getUserByEmail(email) {
      const result = await storage.query('auth_users', {
        filters: { email }
      })
      
      if (result.success && result.data.items.length > 0) {
        return result.data.items[0]
      }
      return null
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await storage.query('auth_accounts', {
        filters: { 
          provider,
          providerAccountId 
        }
      })
      
      if (result.success && result.data.items.length > 0) {
        const account = result.data.items[0]
        const userResult = await storage.get('auth_users', account.userId)
        return userResult.success ? userResult.data : null
      }
      return null
    },

    async updateUser(user) {
      const existing = await storage.get('auth_users', user.id!)
      if (!existing.success || !existing.data) {
        throw new Error('User not found')
      }

      const updatedUser = {
        ...existing.data,
        ...user,
        updated_at: new Date().toISOString(),
      }
      
      await storage.set('auth_users', user.id!, updatedUser)
      return updatedUser
    },

    async deleteUser(userId) {
      // Delete user's accounts first
      const accountsResult = await storage.query('auth_accounts', {
        filters: { userId }
      })
      
      if (accountsResult.success) {
        for (const account of accountsResult.data.items) {
          await storage.delete('auth_accounts', `${account.provider}:${account.providerAccountId}`)
        }
      }

      // Delete user's sessions
      const sessionsResult = await storage.query('auth_sessions', {
        filters: { userId }
      })
      
      if (sessionsResult.success) {
        for (const session of sessionsResult.data.items) {
          await storage.delete('auth_sessions', session.sessionToken)
        }
      }

      // Delete user
      await storage.delete('auth_users', userId)
    },

    async linkAccount(account) {
      const accountData = {
        id: `${account.provider}:${account.providerAccountId}`,
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
        created_at: new Date().toISOString(),
      }
      
      await storage.set('auth_accounts', accountData.id, accountData)
      return accountData
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const accountId = `${provider}:${providerAccountId}`
      await storage.delete('auth_accounts', accountId)
    },

    async createSession({ sessionToken, userId, expires }) {
      const sessionData = {
        sessionToken,
        userId,
        expires,
        created_at: new Date().toISOString(),
      }

      await storage.set('auth_sessions', sessionToken, {
        ...sessionData,
        expires: expires.toISOString()
      })

      return {
        sessionToken,
        userId,
        expires
      }
    },

    async getSessionAndUser(sessionToken) {
      const sessionResult = await storage.get('auth_sessions', sessionToken)
      
      if (!sessionResult.success || !sessionResult.data) {
        return null
      }

      const session = sessionResult.data
      
      // Check if session is expired
      if (new Date(session.expires) < new Date()) {
        await storage.delete('auth_sessions', sessionToken)
        return null
      }

      const userResult = await storage.get('auth_users', session.userId)
      
      if (!userResult.success || !userResult.data) {
        return null
      }

      return {
        session: {
          ...session,
          expires: new Date(session.expires)
        },
        user: userResult.data
      }
    },

    async updateSession({ sessionToken, expires }) {
      const sessionResult = await storage.get('auth_sessions', sessionToken)
      
      if (!sessionResult.success || !sessionResult.data) {
        return null
      }

      const updatedSession = {
        ...sessionResult.data,
        expires: expires?.toISOString() || sessionResult.data.expires,
      }
      
      await storage.set('auth_sessions', sessionToken, updatedSession)
      
      return {
        ...updatedSession,
        expires: new Date(updatedSession.expires)
      }
    },

    async deleteSession(sessionToken) {
      await storage.delete('auth_sessions', sessionToken)
    },

    async createVerificationToken({ identifier, expires, token }) {
      const verificationData = {
        identifier,
        token,
        expires,
        created_at: new Date().toISOString(),
      }

      await storage.set('auth_verification_tokens', token, {
        ...verificationData,
        expires: expires.toISOString()
      })

      return {
        identifier,
        token,
        expires
      }
    },

    async useVerificationToken({ identifier, token }) {
      const result = await storage.get('auth_verification_tokens', token)
      
      if (!result.success || !result.data) {
        return null
      }

      const verificationToken = result.data
      
      // Check if token matches identifier and is not expired
      if (verificationToken.identifier !== identifier || 
          new Date(verificationToken.expires) < new Date()) {
        return null
      }

      // Delete the token (one-time use)
      await storage.delete('auth_verification_tokens', token)
      
      return {
        ...verificationToken,
        expires: new Date(verificationToken.expires)
      }
    },
  }
}

// Additional functions for email verification and password reset
export async function createEmailVerificationToken(
  email: string,
  hashedToken: string,
  expiresAt: Date
): Promise<void> {
  const storage = createStorage()
  const tokenData = {
    identifier: email,
    token: hashedToken,
    expires: expiresAt.toISOString(),
    type: 'email_verification',
    created_at: new Date().toISOString(),
  }

  await storage.set('auth_email_verification_tokens', email, tokenData)
}

export async function getEmailVerificationToken(email: string): Promise<EmailVerificationToken | null> {
  const storage = createStorage()
  const result = await storage.get('auth_email_verification_tokens', email)

  if (!result.success || !result.data) {
    return null
  }

  return {
    identifier: result.data.identifier,
    token: result.data.token,
    expires: new Date(result.data.expires)
  }
}

export async function deleteEmailVerificationToken(email: string): Promise<void> {
  const storage = createStorage()
  await storage.delete('auth_email_verification_tokens', email)
}

export async function createPasswordResetToken(
  email: string,
  hashedToken: string,
  expiresAt: Date
): Promise<void> {
  const storage = createStorage()
  const tokenData = {
    identifier: email,
    token: hashedToken,
    expires: expiresAt.toISOString(),
    type: 'password_reset',
    created_at: new Date().toISOString(),
  }

  await storage.set('auth_password_reset_tokens', email, tokenData)
}

export async function getPasswordResetToken(email: string): Promise<PasswordResetToken | null> {
  const storage = createStorage()
  const result = await storage.get('auth_password_reset_tokens', email)

  if (!result.success || !result.data) {
    return null
  }

  return {
    identifier: result.data.identifier,
    token: result.data.token,
    expires: new Date(result.data.expires)
  }
}

export async function deletePasswordResetToken(email: string): Promise<void> {
  const storage = createStorage()
  await storage.delete('auth_password_reset_tokens', email)
}

export async function createUserWithPassword(
  email: string,
  name: string,
  hashedPassword: string,
  emailVerified: boolean = false
): Promise<any> {
  const storage = createStorage()
  const id = crypto.randomUUID()

  const userData = {
    id,
    email,
    name,
    password: hashedPassword,
    emailVerified: emailVerified ? new Date().toISOString() : null,
    provider: 'credentials',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await storage.set('auth_users', id, userData)
  return userData
}

export async function updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
  const storage = createStorage()
  const userResult = await storage.get('auth_users', userId)

  if (!userResult.success || !userResult.data) {
    throw new Error('User not found')
  }

  const updatedUser = {
    ...userResult.data,
    password: hashedPassword,
    updated_at: new Date().toISOString(),
  }

  await storage.set('auth_users', userId, updatedUser)
}

export async function markEmailAsVerified(email: string): Promise<void> {
  const storage = createStorage()
  const userResult = await storage.query('auth_users', {
    filters: { email }
  })

  if (userResult.success && userResult.data.items.length > 0) {
    const user = userResult.data.items[0]
    const updatedUser = {
      ...user,
      emailVerified: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await storage.set('auth_users', user.id, updatedUser)
  }
}
