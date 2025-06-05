// Authentication and Authorization Middleware
// Provides role-based access control and setup detection

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { checkSetupStatus } from './setup';
import { isUserAdmin } from './roles';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name?: string;
    role: 'admin' | null; // 99.9999% of users have null role
  } | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setupRequired: boolean;
}

/**
 * Get authentication context for the current request
 */
export async function getAuthContext(): Promise<AuthContext> {
  try {
    const session = await auth();
    const setupStatus = await checkSetupStatus();
    
    if (!session?.user) {
      return {
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        setupRequired: setupStatus.setupRequired
      };
    }

    const isAdmin = session.user.id ? await isUserAdmin(session.user.id) : false;

    return {
      user: {
        id: session.user.id!,
        email: session.user.email!,
        name: session.user.name || undefined,
        role: isAdmin ? 'admin' : null // 99.9999% get null
      },
      isAuthenticated: true,
      isAdmin,
      setupRequired: setupStatus.setupRequired
    };
  } catch (error) {
    console.error('Error getting auth context:', error);
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      setupRequired: true
    };
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const authContext = await getAuthContext();
  
  if (!authContext.isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return null;
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authContext = await getAuthContext();
  
  if (!authContext.isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (!authContext.isAdmin) {
    return new NextResponse('Forbidden: Admin access required', { status: 403 });
  }

  return null;
}

/**
 * Middleware to handle setup requirements
 */
export async function requireSetup(request: NextRequest): Promise<NextResponse | null> {
  const authContext = await getAuthContext();
  
  // If setup is required and we're not on the setup page, redirect
  if (authContext.setupRequired && !request.nextUrl.pathname.startsWith('/setup')) {
    const setupUrl = new URL('/setup', request.url);
    return NextResponse.redirect(setupUrl);
  }

  // If setup is complete and we're on the setup page, redirect to home
  if (!authContext.setupRequired && request.nextUrl.pathname.startsWith('/setup')) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return null;
}

/**
 * Combined middleware for admin routes with setup check
 */
export async function adminMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // First check setup requirements
  const setupResponse = await requireSetup(request);
  if (setupResponse) return setupResponse;

  // Then check admin requirements
  return await requireAdmin(request);
}

/**
 * Combined middleware for authenticated routes with setup check
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // First check setup requirements
  const setupResponse = await requireSetup(request);
  if (setupResponse) return setupResponse;

  // Then check auth requirements
  return await requireAuth(request);
}

/**
 * Utility to check if current user can access admin features
 */
export async function canAccessAdmin(): Promise<boolean> {
  try {
    const authContext = await getAuthContext();
    return authContext.isAdmin && !authContext.setupRequired;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

/**
 * Utility to get user role for display purposes
 */
export async function getUserRole(): Promise<'user' | 'admin' | 'moderator' | null> {
  try {
    const authContext = await getAuthContext();
    return authContext.user?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Route protection configuration
 */
export const PROTECTED_ROUTES = {
  // Routes that require authentication
  AUTH_REQUIRED: [
    '/dashboard',
    '/register',
    '/profile'
  ],
  
  // Routes that require admin role
  ADMIN_REQUIRED: [
    '/admin',
    '/admin/users',
    '/admin/servers',
    '/admin/settings',
    '/admin/analytics'
  ],
  
  // Routes that should redirect if setup is incomplete
  SETUP_SENSITIVE: [
    '/admin',
    '/dashboard',
    '/register'
  ]
};

/**
 * Check if a path requires specific permissions
 */
export function getRoutePermissions(pathname: string) {
  return {
    requiresAuth: PROTECTED_ROUTES.AUTH_REQUIRED.some(route => pathname.startsWith(route)),
    requiresAdmin: PROTECTED_ROUTES.ADMIN_REQUIRED.some(route => pathname.startsWith(route)),
    setupSensitive: PROTECTED_ROUTES.SETUP_SENSITIVE.some(route => pathname.startsWith(route))
  };
}
