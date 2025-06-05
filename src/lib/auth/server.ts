// Server-side authentication utilities for Auth.js v5
// Use these in server components, API routes, and server actions

import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import type { Session } from "next-auth"

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date | null;
}

/**
 * Get current session (server-side)
 * Use in server components and API routes
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    return await auth()
  } catch (error) {
    console.error('Get server session error:', error)
    return null
  }
}

/**
 * Get current user (server-side)
 * Returns user data or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id || '',
      email: session.user.email || '',
      name: session.user.name || '',
      image: session.user.image || undefined,
      emailVerified: session.user.emailVerified || null
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession()
  return !!session?.user
}

/**
 * Require authentication (server-side)
 * Redirects to sign-in if not authenticated
 * Use in server components and page components
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  return session
}

/**
 * Require authentication for API routes
 * Returns user data or error response
 */
export async function requireAuthAPI(request: NextRequest): Promise<
  { user: User } | NextResponse
> {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const user: User = {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    image: session.user.image || undefined,
    emailVerified: session.user.emailVerified || null
  }

  return { user }
}

/**
 * Check if user has admin role (server-side)
 * Basic implementation - can be extended based on your role system
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  // Basic admin check - customize based on your needs
  // For now, checking if email ends with @mcplookup.org
  return user.email.endsWith('@mcplookup.org')
}

/**
 * Require admin role (server-side)
 * Redirects to home if not admin
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  
  const adminCheck = await isAdmin()
  if (!adminCheck) {
    redirect('/')
  }
  
  return session
}

/**
 * Require admin role for API routes
 * Returns user data or error response
 */
export async function requireAdminAPI(request: NextRequest): Promise<
  { user: User } | NextResponse
> {
  const authResult = await requireAuthAPI(request)
  
  if (authResult instanceof NextResponse) {
    return authResult // Return auth error
  }

  const adminCheck = await isAdmin()
  if (!adminCheck) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  return authResult
}

/**
 * Get user role (server-side)
 * Returns user role or null if not authenticated
 */
export async function getUserRole(): Promise<string | null> {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  // Basic role determination - customize based on your needs
  if (await isAdmin()) {
    return 'admin'
  }

  return 'user'
}

/**
 * Check if user has specific permission (server-side)
 * Basic implementation - extend based on your permission system
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const role = await getUserRole()
  
  if (!role) {
    return false
  }

  // Basic permission check
  switch (permission) {
    case 'admin':
      return role === 'admin'
    case 'user':
      return role === 'user' || role === 'admin'
    case 'register_server':
      return role === 'user' || role === 'admin'
    case 'manage_users':
      return role === 'admin'
    case 'view_admin_panel':
      return role === 'admin'
    default:
      return false
  }
}

/**
 * Require specific permission (server-side)
 * Redirects to appropriate page if permission denied
 */
export async function requirePermission(permission: string): Promise<Session> {
  const session = await requireAuth()
  
  const hasAccess = await hasPermission(permission)
  if (!hasAccess) {
    if (permission === 'admin' || permission.startsWith('admin_')) {
      redirect('/')
    } else {
      redirect('/auth/signin')
    }
  }
  
  return session
}

/**
 * Require specific permission for API routes
 * Returns user data or error response
 */
export async function requirePermissionAPI(
  request: NextRequest,
  permission: string
): Promise<{ user: User } | NextResponse> {
  const authResult = await requireAuthAPI(request)
  
  if (authResult instanceof NextResponse) {
    return authResult // Return auth error
  }

  const hasAccess = await hasPermission(permission)
  if (!hasAccess) {
    return NextResponse.json(
      { error: `Permission '${permission}' required` },
      { status: 403 }
    )
  }

  return authResult
}

/**
 * Create auth middleware for API routes
 * Returns a middleware function that checks authentication
 */
export function createAuthMiddleware(options?: {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requiredPermission?: string;
}) {
  return async function authMiddleware(
    request: NextRequest,
    handler: (request: NextRequest, user: User) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      let authResult: { user: User } | NextResponse

      if (options?.requireAdmin) {
        authResult = await requireAdminAPI(request)
      } else if (options?.requiredPermission) {
        authResult = await requirePermissionAPI(request, options.requiredPermission)
      } else if (options?.requireAuth !== false) {
        authResult = await requireAuthAPI(request)
      } else {
        // No auth required, but get user if available
        const user = await getCurrentUser()
        if (user) {
          authResult = { user }
        } else {
          authResult = { user: { id: '', email: '', name: '' } }
        }
      }

      if (authResult instanceof NextResponse) {
        return authResult // Return error response
      }

      return await handler(request, authResult.user)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Re-export the auth function for middleware use
export { auth } from "../../../auth"
