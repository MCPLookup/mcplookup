// Credentials Provider for NextAuth
// Handles email/password authentication

import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail, verifyPassword } from "./storage-adapter"

export const credentialsProvider = CredentialsProvider({
  id: "credentials",
  name: "Email and Password",
  credentials: {
    email: { 
      label: "Email", 
      type: "email", 
      placeholder: "your@email.com" 
    },
    password: { 
      label: "Password", 
      type: "password" 
    }
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Email and password are required")
    }

    try {
      // Get user by email
      const user = await getUserByEmail(credentials.email as string)
      
      if (!user) {
        throw new Error("No user found with this email")
      }

      // Check if user has a password (not a social login user)
      if (!user.password) {
        throw new Error("This account uses social login. Please sign in with your social provider.")
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new Error("Please verify your email before signing in")
      }

      // Verify password
      const isValidPassword = await verifyPassword(credentials.password as string, user.password)
      
      if (!isValidPassword) {
        throw new Error("Invalid password")
      }

      // Return user object (password excluded for security)
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      }
    } catch (error) {
      console.error("Authentication error:", error)
      
      // Return null to indicate authentication failure
      // The error message will be handled by NextAuth
      return null
    }
  }
})
