import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import { createStorageAdapter } from "./src/lib/auth/storage-adapter"

export const config = {
  adapter: createStorageAdapter(),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // Allow setup routes without authentication
      if (pathname.startsWith('/setup')) {
        return true
      }

      // Check if setup is required
      try {
        const { checkSetupStatus } = await import('./src/lib/auth/setup')
        const setupStatus = await checkSetupStatus()

        // If setup is required and not on setup page, redirect to setup
        if (setupStatus.setupRequired && !pathname.startsWith('/setup')) {
          return Response.redirect(new URL('/setup', nextUrl))
        }

        // If setup is complete and on setup page, redirect to home
        if (!setupStatus.setupRequired && pathname.startsWith('/setup')) {
          return Response.redirect(new URL('/', nextUrl))
        }
      } catch (error) {
        console.error('Setup check failed:', error)
      }

      // Protected routes that require authentication
      const protectedRoutes = ['/dashboard', '/register', '/admin', '/profile']
      const isOnProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

      if (isOnProtectedRoute) {
        if (!isLoggedIn) return false // Redirect to login

        // Check admin routes
        if (pathname.startsWith('/admin')) {
          try {
            const { isUserAdmin } = await import('./src/lib/auth/setup')
            const isAdmin = auth?.user?.id ? await isUserAdmin(auth.user.id) : false
            if (!isAdmin) {
              return Response.redirect(new URL('/', nextUrl))
            }
          } catch (error) {
            console.error('Admin check failed:', error)
            return false
          }
        }

        return true
      }

      return true
    },
    session({ session, user }) {
      // With database sessions, user data comes from the database
      if (user && session.user) {
        session.user.id = user.id
        session.user.email = user.email
        session.user.name = user.name
        session.user.image = user.image
      }
      return session
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
