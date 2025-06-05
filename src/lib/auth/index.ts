// Auth.js v5 Complete Implementation
// Centralized exports for all authentication utilities

// =============================================================================
// SERVER-SIDE AUTH (for server components, API routes, server actions)
// =============================================================================

export {
  getServerSession,
  getCurrentUser,
  isAuthenticated,
  requireAuth,
  requireAuthAPI,
  isAdmin,
  requireAdmin,
  requireAdminAPI,
  getUserRole,
  hasPermission,
  requirePermission,
  requirePermissionAPI,
  createAuthMiddleware,
  auth
} from './server'

// =============================================================================
// CLIENT-SIDE AUTH (for React components, client-side code)
// =============================================================================

export {
  useAuth,
  useSignIn,
  useSignOut,
  useRequireAuth,
  useAuthRole,
  withAuth,
  withRole,
  useSession,
  SessionProvider
} from './client'

// =============================================================================
// CORE AUTH FUNCTIONS (from main auth config)
// =============================================================================

export { signIn, signOut } from '../../../auth'

// =============================================================================
// TYPES
// =============================================================================

export type { User } from './server'
export type { AuthState } from './client'
export type { Session } from 'next-auth'

// =============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// =============================================================================

/**
 * AUTH.JS V5 USAGE GUIDE
 * 
 * 1. SERVER COMPONENTS & API ROUTES:
 * ```typescript
 * import { getCurrentUser, requireAuth, requireAuthAPI } from '@/lib/auth'
 * 
 * // In server components
 * export default async function ProfilePage() {
 *   const user = await getCurrentUser()
 *   if (!user) redirect('/auth/signin')
 *   return <div>Hello {user.name}</div>
 * }
 * 
 * // Or use requireAuth for automatic redirect
 * export default async function DashboardPage() {
 *   const session = await requireAuth()
 *   return <div>Welcome {session.user.name}</div>
 * }
 * 
 * // In API routes
 * export async function GET(request: NextRequest) {
 *   const authResult = await requireAuthAPI(request)
 *   if (authResult instanceof NextResponse) return authResult
 *   
 *   const { user } = authResult
 *   return NextResponse.json({ message: `Hello ${user.name}` })
 * }
 * ```
 * 
 * 2. CLIENT COMPONENTS:
 * ```typescript
 * 'use client'
 * import { useAuth, useSignIn, useSignOut } from '@/lib/auth'
 * 
 * export function ProfileComponent() {
 *   const { user, isAuthenticated, isLoading } = useAuth()
 *   const { signIn } = useSignIn()
 *   const { signOut } = useSignOut()
 * 
 *   if (isLoading) return <div>Loading...</div>
 *   if (!isAuthenticated) return <button onClick={() => signIn()}>Sign In</button>
 *   
 *   return (
 *     <div>
 *       <p>Hello {user.name}</p>
 *       <button onClick={() => signOut()}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 * 
 * 3. MIDDLEWARE:
 * ```typescript
 * // middleware.ts
 * export { auth as middleware } from '@/lib/auth'
 * ```
 * 
 * 4. PROTECTING COMPONENTS:
 * ```typescript
 * import { withAuth, withRole } from '@/lib/auth'
 * 
 * // Require authentication
 * const ProtectedComponent = withAuth(MyComponent)
 * 
 * // Require admin role
 * const AdminComponent = withRole(MyComponent, 'admin')
 * ```
 * 
 * 5. SERVER ACTIONS:
 * ```typescript
 * 'use server'
 * import { requireAuth } from '@/lib/auth'
 * 
 * export async function updateProfile(formData: FormData) {
 *   const session = await requireAuth()
 *   // Update user profile...
 * }
 * ```
 */

// =============================================================================
// ENVIRONMENT SETUP REMINDER
// =============================================================================

/**
 * REQUIRED ENVIRONMENT VARIABLES:
 * 
 * AUTH_SECRET=your-secret-key-here
 * AUTH_GITHUB_ID=your-github-oauth-id
 * AUTH_GITHUB_SECRET=your-github-oauth-secret
 * AUTH_GOOGLE_ID=your-google-oauth-id
 * AUTH_GOOGLE_SECRET=your-google-oauth-secret
 * 
 * Generate AUTH_SECRET with: npx auth secret
 */

// =============================================================================
// PROVIDER SETUP
// =============================================================================

/**
 * OAUTH PROVIDER SETUP:
 * 
 * 1. GitHub:
 *    - Go to GitHub Settings > Developer settings > OAuth Apps
 *    - Create new OAuth App
 *    - Homepage URL: http://localhost:3000 (dev) or your domain
 *    - Authorization callback URL: http://localhost:3000/api/auth/callback/github
 * 
 * 2. Google:
 *    - Go to Google Cloud Console > APIs & Services > Credentials
 *    - Create OAuth 2.0 Client ID
 *    - Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
 */
