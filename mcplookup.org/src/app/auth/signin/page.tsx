"use client"

import { useState } from 'react'
import { SignInButton } from "@/components/auth/signin-button"
import { EmailSignInForm } from "@/components/auth/email-signin-form"
import { EmailSignUpForm } from "@/components/auth/email-signup-form"
import Link from "next/link"
import { Text, Box, HStack, Alert } from "@chakra-ui/react"
import { Divider } from "@chakra-ui/layout"

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSignUpSuccess = (message: string) => {
    setSuccessMessage(message)
    setMode('signin')
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Box maxW="md" mx="auto" py={16} px={4}>
        <Box display="flex" flexDir="column" gap={8}>
          {/* Logo */}
          <Link href="/">
            <Box textAlign="center" cursor="pointer">
              <Text fontSize="5xl" color="orange.500" mb={2}>🔍</Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                MCPLookup
              </Text>
            </Box>
          </Link>

          {/* Auth Card */}
          <Box bg="white" rounded="lg" shadow="md" p={8}>
            <Box display="flex" flexDir="column" gap={6}>
              {successMessage && (
                <Alert.Root status="success">
                  <Alert.Indicator />
                  <Alert.Title fontSize="sm">{successMessage}</Alert.Title>
                </Alert.Root>
              )}

              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </Text>
                <Text color="gray.600" mt={2}>
                  {mode === 'signin'
                    ? 'Sign in to your account to continue'
                    : 'Join MCPLookup.org to get started'
                  }
                </Text>
              </Box>

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
              <Box display="flex" flexDir="column" gap={3}>
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
              </Box>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                By {mode === 'signin' ? 'signing in' : 'creating an account'}, you agree to our Terms of Service and Privacy Policy
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
