// Auth.js v5 Implementation Tests
// Tests for server-side and client-side auth utilities

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Session } from 'next-auth'

// Mock next-auth
vi.mock('../../../auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn()
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}))

describe('Auth.js v5 Server-side Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getServerSession', () => {
    it('should return session when authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(mockSession)

      const { getServerSession } = await import('./server')
      const session = await getServerSession()

      expect(session).toEqual(mockSession)
      expect(auth).toHaveBeenCalled()
    })

    it('should return null when not authenticated', async () => {
      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(null)

      const { getServerSession } = await import('./server')
      const session = await getServerSession()

      expect(session).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockRejectedValue(new Error('Auth error'))

      const { getServerSession } = await import('./server')
      const session = await getServerSession()

      expect(session).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(mockSession)

      const { getCurrentUser } = await import('./server')
      const user = await getCurrentUser()

      expect(user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        emailVerified: null
      })
    })

    it('should return null when not authenticated', async () => {
      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(null)

      const { getCurrentUser } = await import('./server')
      const user = await getCurrentUser()

      expect(user).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const mockSession: Session = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(mockSession)

      const { isAuthenticated } = await import('./server')
      const result = await isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when user is not authenticated', async () => {
      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(null)

      const { isAuthenticated } = await import('./server')
      const result = await isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('requireAuth', () => {
    it('should return session when authenticated', async () => {
      const mockSession: Session = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(mockSession)

      const { requireAuth } = await import('./server')
      const session = await requireAuth()

      expect(session).toEqual(mockSession)
    })

    it('should redirect when not authenticated', async () => {
      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(null)

      const { redirect } = await import('next/navigation')

      const { requireAuth } = await import('./server')
      
      await expect(requireAuth()).rejects.toThrow()
      expect(redirect).toHaveBeenCalledWith('/auth/signin')
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin email', async () => {
      const mockSession: Session = {
        user: {
          id: '1',
          email: 'admin@mcplookup.org',
          name: 'Admin User'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(mockSession)

      const { isAdmin } = await import('./server')
      const result = await isAdmin()

      expect(result).toBe(true)
    })

    it('should return false for non-admin email', async () => {
      const mockSession: Session = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Regular User'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(mockSession)

      const { isAdmin } = await import('./server')
      const result = await isAdmin()

      expect(result).toBe(false)
    })

    it('should return false when not authenticated', async () => {
      const { auth } = await import('../../../auth')
      const mockedAuth = vi.mocked(auth)
      mockedAuth.mockResolvedValue(null)

      const { isAdmin } = await import('./server')
      const result = await isAdmin()

      expect(result).toBe(false)
    })
  })
})

describe('Auth.js v5 Client-side Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAuth', () => {
    it('should return auth state when authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      const { useSession } = await import('next-auth/react')
      const mockedUseSession = vi.mocked(useSession)
      mockedUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: vi.fn()
      })

      const { useAuth } = await import('./client')
      const authState = useAuth()

      expect(authState.isAuthenticated).toBe(true)
      expect(authState.isLoading).toBe(false)
      expect(authState.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        image: undefined,
        emailVerified: null
      })
    })

    it('should return loading state', async () => {
      const { useSession } = await import('next-auth/react')
      const mockedUseSession = vi.mocked(useSession)
      mockedUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn()
      })

      const { useAuth } = await import('./client')
      const authState = useAuth()

      expect(authState.isAuthenticated).toBe(false)
      expect(authState.isLoading).toBe(true)
      expect(authState.user).toBeNull()
    })

    it('should return unauthenticated state', async () => {
      const { useSession } = await import('next-auth/react')
      const mockedUseSession = vi.mocked(useSession)
      mockedUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn()
      })

      const { useAuth } = await import('./client')
      const authState = useAuth()

      expect(authState.isAuthenticated).toBe(false)
      expect(authState.isLoading).toBe(false)
      expect(authState.user).toBeNull()
    })
  })
})
