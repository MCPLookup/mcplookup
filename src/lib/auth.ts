// Auth.js v5 Implementation - Redirect to New Auth System
// This file now redirects to the comprehensive Auth.js v5 implementation

/**
 * ⚠️  DEPRECATED: This file contains the old placeholder implementation
 *
 * 🎉 NEW: Complete Auth.js v5 implementation is now available!
 *
 * Please use the new auth utilities from:
 * - Server-side: import from '@/lib/auth' or '@/lib/auth/server'
 * - Client-side: import from '@/lib/auth/client'
 *
 * See AUTH_V5_IMPLEMENTATION.md for complete documentation.
 */

// Re-export everything from the new auth implementation
export * from './auth'

// Legacy compatibility exports (deprecated)
export {
  getCurrentUser,
  isAuthenticated,
  requireAuth,
  auth
} from './auth/server'

export {
  useAuth
} from './auth/client'

export {
  signIn,
  signOut
} from '../auth'

// Types
export type { User, AuthState } from './auth/server'
export type { Session } from 'next-auth'

/**
 * Migration Guide:
 *
 * OLD (deprecated):
 * ```typescript
 * import { getCurrentUser } from '@/lib/auth'
 * ```
 *
 * NEW (recommended):
 * ```typescript
 * // For server components/API routes
 * import { getCurrentUser } from '@/lib/auth/server'
 *
 * // For client components
 * import { useAuth } from '@/lib/auth/client'
 *
 * // Or use the unified export
 * import { getCurrentUser, useAuth } from '@/lib/auth'
 * ```
 */
