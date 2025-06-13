// Auth.js v5 Configuration
// Re-exports the auth configuration for use in API routes and server components

import { config } from '../../../auth';

// Re-export the auth options for compatibility with getServerSession
export const authOptions = config;

// Re-export other auth utilities
export { auth, signIn, signOut } from '../../../auth';
