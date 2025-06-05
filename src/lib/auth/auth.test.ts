// Auth.js v5 Implementation Tests
// Tests for server-side and client-side auth utilities

import { describe, it, expect, vi, beforeEach } from 'vitest'

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
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }
      }

      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(mockSession)

      const { getServerSession } = await import('./server')
      const session = await getServerSession()

      expect(session).toEqual(mockSession)
      expect(auth).toHaveBeenCalled()
    })

    it('should return null when not authenticated', async () => {
      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(null)

      const { getServerSession } = await import('./server')
      const session = await getServerSession()

      expect(session).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockRejectedValue(new Error('Auth error'))

      const { getServerSession } = await import('./server')
      const session = await getServerSession()

      expect(session).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return user data when authenticated', async () => {
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg'
        }
      }

      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(mockSession)

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
      vi.mocked(auth).mockResolvedValue(null)

      const { getCurrentUser } = await import('./server')
      const user = await getCurrentUser()

      expect(user).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const mockSession = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' }
      }

      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(mockSession)

      const { isAuthenticated } = await import('./server')
      const result = await isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when user is not authenticated', async () => {
      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(null)

      const { isAuthenticated } = await import('./server')
      const result = await isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('requireAuth', () => {
    it('should return session when authenticated', async () => {
      const mockSession = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' }
      }

      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(mockSession)

      const { requireAuth } = await import('./server')
      const session = await requireAuth()

      expect(session).toEqual(mockSession)
    })

    it('should redirect when not authenticated', async () => {
      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(null)

      const { redirect } = await import('next/navigation')

      const { requireAuth } = await import('./server')
      
      await expect(requireAuth()).rejects.toThrow()
      expect(redirect).toHaveBeenCalledWith('/auth/signin')
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin email', async () => {
      const mockSession = {
        user: {
          id: '1',
          email: 'admin@mcplookup.org',
          name: 'Admin User'
        }
      }

      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(mockSession)

      const { isAdmin } = await import('./server')
      const result = await isAdmin()

      expect(result).toBe(true)
    })

    it('should return false for non-admin email', async () => {
      const mockSession = {
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Regular User'
        }
      }

      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(mockSession)

      const { isAdmin } = await import('./server')
      const result = await isAdmin()

      expect(result).toBe(false)
    })

    it('should return false when not authenticated', async () => {
      const { auth } = await import('../../../auth')
      vi.mocked(auth).mockResolvedValue(null)

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
      const mockSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }
      }

      const { useSession } = await import('next-auth/react')
      vi.mocked(useSession).mockReturnValue({
        data: mockSession,
        status: 'authenticated'
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
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading'
      })

      const { useAuth } = await import('./client')
      const authState = useAuth()

      expect(authState.isAuthenticated).toBe(false)
      expect(authState.isLoading).toBe(true)
      expect(authState.user).toBeNull()
    })

    it('should return unauthenticated state', async () => {
      const { useSession } = await import('next-auth/react')
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      })

      const { useAuth } = await import('./client')
      const authState = useAuth()

      expect(authState.isAuthenticated).toBe(false)
      expect(authState.isLoading).toBe(false)
      expect(authState.user).toBeNull()
    })
  })
})
