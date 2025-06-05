// Client-side authentication utilities for Auth.js v5
// Use these in React components and client-side code

"use client"

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import type { Session } from "next-auth"

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
}

/**
 * Client-side authentication hook
 * Wraps useSession from next-auth/react with additional utilities
 */
export function useAuth(): AuthState {
  const { data: session, status } = useSession()
  
  const user: User | null = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    image: session.user.image || undefined,
    emailVerified: session.user.emailVerified || null
  } : null

  return {
    user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    session
  }
}

/**
 * Client-side sign in function
 * Wraps signIn from next-auth/react with better error handling
 */
export function useSignIn() {
  const router = useRouter()

  const signIn = useCallback(async (
    provider?: string,
    options?: {
      email?: string;
      password?: string;
      redirectTo?: string;
      redirect?: boolean;
    }
  ) => {
    try {
      const result = await nextAuthSignIn(provider, {
        email: options?.email,
        password: options?.password,
        redirectTo: options?.redirectTo || "/dashboard",
        redirect: options?.redirect !== false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }, [])

  return { signIn }
}

/**
 * Client-side sign out function
 * Wraps signOut from next-auth/react with better error handling
 */
export function useSignOut() {
  const signOut = useCallback(async (options?: { redirectTo?: string }) => {
    try {
      await nextAuthSignOut({
        redirectTo: options?.redirectTo || "/"
      })
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }, [])

  return { signOut }
}

/**
 * Hook to require authentication on client-side
 * Redirects to sign-in if not authenticated
 */
export function useRequireAuth(): AuthState {
  const auth = useAuth()
  const router = useRouter()

  if (!auth.isLoading && !auth.isAuthenticated) {
    router.push('/auth/signin')
  }

  return auth
}

/**
 * Hook to check if user has specific role/permission
 */
export function useAuthRole(requiredRole?: string): {
  hasRole: boolean;
  isLoading: boolean;
  user: User | null;
} {
  const { user, isLoading } = useAuth()
  
  // For now, we'll implement basic admin check
  // This can be extended based on your role system
  const hasRole = requiredRole === 'admin' 
    ? user?.email?.endsWith('@mcplookup.org') || false
    : true

  return {
    hasRole,
    isLoading,
    user
  }
}

/**
 * Component wrapper that requires authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    loadingComponent?: React.ComponentType;
  }
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    if (isLoading) {
      return options?.loadingComponent ? (
        <options.loadingComponent />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      router.push(options?.redirectTo || '/auth/signin')
      return null
    }

    return <Component {...props} />
  }
}

/**
 * Component wrapper that requires specific role
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string,
  options?: {
    redirectTo?: string;
    unauthorizedComponent?: React.ComponentType;
  }
) {
  return function RoleProtectedComponent(props: P) {
    const { hasRole, isLoading, user } = useAuthRole(requiredRole)
    const router = useRouter()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (!user) {
      router.push('/auth/signin')
      return null
    }

    if (!hasRole) {
      if (options?.unauthorizedComponent) {
        return <options.unauthorizedComponent />
      }
      
      router.push(options?.redirectTo || '/')
      return null
    }

    return <Component {...props} />
  }
}

// Re-export useful types and functions from next-auth/react
export { useSession, SessionProvider } from "next-auth/react"
export type { Session } from "next-auth"
