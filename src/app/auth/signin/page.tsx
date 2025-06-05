"use client"

import { useState } from 'react'
import { SignInButton } from "@/components/auth/signin-button"
import { EmailSignInForm } from "@/components/auth/email-signin-form"
import { EmailSignUpForm } from "@/components/auth/email-signup-form"
import Link from "next/link"
import { Alert, Text, Box, Divider, HStack } from "@chakra-ui/react"

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSignUpSuccess = (message: string) => {
    setSuccessMessage(message)
    setMode('signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/">
            <div className="text-center cursor-pointer">
              <div className="text-5xl text-orange-500 mb-2">🔍</div>
              <h1 className="text-2xl font-bold text-orange-500">
                MCPLookup
              </h1>
            </div>
          </Link>

          {/* Auth Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              {successMessage && (
                <Alert status="success" borderRadius="md">
                  <Text fontSize="sm">{successMessage}</Text>
                </Alert>
              )}

              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {mode === 'signin'
                    ? 'Sign in to your account to continue'
                    : 'Join MCPLookup.org to get started'
                  }
                </p>
              </div>

              {/* Email/Password Form */}
              {mode === 'signin' ? (
                <EmailSignInForm
                  onToggleMode={() => setMode('signup')}
                />
              ) : (
                <EmailSignUpForm
                  onToggleMode={() => setMode('signin')}
                  onSuccess={handleSignUpSuccess}
                />
              )}

              {/* Divider */}
              <HStack>
                <Divider />
                <Text fontSize="sm" color="gray.500" px={3}>
                  or
                </Text>
                <Divider />
              </HStack>

              {/* Social Sign In */}
              <div className="space-y-3">
                <SignInButton
                  provider="github"
                  width="full"
                  size="md"
                />
                <SignInButton
                  provider="google"
                  width="full"
                  size="md"
                />
              </div>

              <p className="text-sm text-gray-500 text-center">
                By {mode === 'signin' ? 'signing in' : 'creating an account'}, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
