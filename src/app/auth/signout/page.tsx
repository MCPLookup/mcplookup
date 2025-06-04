"use client"

import React, { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Avatar
} from "@chakra-ui/react"
import { FaSignOutAlt, FaArrowLeft, FaUser } from "react-icons/fa"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import AnimatedCard from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { useColorModeValue } from "@/components/ui/color-mode"

export default function SignOutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
  )

  const handleSignOut = async () => {
    try {
      setLoading(true)
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('Sign out error:', error)
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <Box minH="100vh" css={{ background: bgGradient }}>
        <Header />
        <Container maxW="md" py={16}>
          <VStack gap={8} align="stretch">
            <AnimatedCard.Root>
              <AnimatedCard.Body>
                <VStack gap={4} py={8}>
                  <Text>Loading...</Text>
                </VStack>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </VStack>
        </Container>
        <Footer />
      </Box>
    )
  }

  if (!session) {
    return (
      <Box minH="100vh" css={{ background: bgGradient }}>
        <Header />
        <Container maxW="md" py={16}>
          <VStack gap={8} align="stretch">
            <VStack gap={4} textAlign="center">
              <Heading size="xl" color="white">
                Already Signed Out
              </Heading>
              <Text fontSize="lg" color="whiteAlpha.800">
                You are not currently signed in
              </Text>
            </VStack>

            <AnimatedCard.Root
              hoverScale={1.02}
              hoverY={-4}
              borderOnHover
            >
              <AnimatedCard.Body>
                <VStack gap={6} textAlign="center">
                  <Icon fontSize="4xl" color="gray.400">
                    <FaUser />
                  </Icon>
                  <VStack gap={2}>
                    <Heading size="md">Not Signed In</Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      You are not currently signed in to MCPLookup
                    </Text>
                  </VStack>
                  <HStack gap={4}>
                    <AnimatedButton
                      onClick={() => router.push('/auth/signin')}
                      variant="solid"
                      colorPalette="blue"
                      hoverScale={1.05}
                      rippleEffect
                    >
                      Sign In
                    </AnimatedButton>
                    <AnimatedButton
                      onClick={() => router.push('/')}
                      variant="outline"
                      hoverScale={1.05}
                      rippleEffect
                    >
                      Go Home
                    </AnimatedButton>
                  </HStack>
                </VStack>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </VStack>
        </Container>
        <Footer />
      </Box>
    )
  }

  return (
    <Box minH="100vh" css={{ background: bgGradient }}>
      <Header />
      
      <Container maxW="md" py={16}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Heading size="xl" color="white">
              Sign Out
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.800">
              Are you sure you want to sign out?
            </Text>
          </VStack>

          {/* Sign Out Card */}
          <AnimatedCard.Root
            hoverScale={1.02}
            hoverY={-4}
            borderOnHover
          >
            <AnimatedCard.Body>
              <VStack gap={6}>
                {/* User Info */}
                <VStack gap={4} textAlign="center">
                  <Avatar
                    size="lg"
                    name={session.user?.name || session.user?.email || 'User'}
                    src={session.user?.image || undefined}
                  />
                  <VStack gap={1}>
                    <Heading size="md">
                      {session.user?.name || 'User'}
                    </Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      {session.user?.email}
                    </Text>
                  </VStack>
                </VStack>

                {/* Actions */}
                <VStack gap={3} width="full">
                  <AnimatedButton
                    onClick={handleSignOut}
                    disabled={loading}
                    state={loading ? 'loading' : 'idle'}
                    loadingText="Signing out..."
                    hoverScale={1.05}
                    rippleEffect
                    variant="solid"
                    colorPalette="red"
                    size="lg"
                    width="full"
                  >
                    <HStack gap={3}>
                      <Icon>
                        <FaSignOutAlt />
                      </Icon>
                      <Text>Sign Out</Text>
                    </HStack>
                  </AnimatedButton>

                  <AnimatedButton
                    onClick={() => router.push('/')}
                    disabled={loading}
                    variant="outline"
                    hoverScale={1.05}
                    rippleEffect
                    size="lg"
                    width="full"
                  >
                    Cancel
                  </AnimatedButton>
                </VStack>

                {/* Info */}
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} textAlign="center">
                  You will be redirected to the home page after signing out
                </Text>
              </VStack>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          {/* Back Button */}
          <HStack justify="center">
            <AnimatedButton
              onClick={() => router.push('/')}
              variant="ghost"
              hoverScale={1.05}
              ripileEffect
            >
              <HStack gap={2}>
                <Icon color="whiteAlpha.800">
                  <FaArrowLeft />
                </Icon>
                <Text color="whiteAlpha.800">Back to Home</Text>
              </HStack>
            </AnimatedButton>
          </HStack>
        </VStack>
      </Container>

      <Footer />
    </Box>
  )
}
