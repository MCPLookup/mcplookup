"use client"

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Icon
} from "@chakra-ui/react"
import { FaExclamationTriangle, FaArrowLeft, FaRedo } from "react-icons/fa"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Alert } from "@/components/ui/alert"
import { useColorModeValue } from "@/components/ui/color-mode"

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
  )

  const getErrorInfo = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          description: 'There is a problem with the server configuration. Please contact support.',
          suggestion: 'This is likely a temporary issue. Please try again later.'
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in.',
          suggestion: 'Please contact an administrator if you believe this is an error.'
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token has expired or is invalid.',
          suggestion: 'Please try signing in again to get a new verification link.'
        }
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          description: 'An error occurred during the authentication process.',
          suggestion: 'Please try signing in again. If the problem persists, contact support.'
        }
    }
  }

  const errorInfo = getErrorInfo(error)

  return (
    <Box minH="100vh" css={{ background: bgGradient }}>
      <Header />
      
      <Container maxW="md" py={16}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Heading size="xl" color="white">
              Authentication Error
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.800">
              Something went wrong during sign in
            </Text>
          </VStack>

          {/* Error Card */}
          <AnimatedCard.Root
            hoverScale={1.02}
            hoverY={-4}
            borderOnHover
          >
            <AnimatedCard.Body>
              <VStack gap={6}>
                {/* Error Icon */}
                <Icon fontSize="4xl" color="red.500">
                  <FaExclamationTriangle />
                </Icon>

                {/* Error Details */}
                <VStack gap={4} textAlign="center">
                  <VStack gap={2}>
                    <Heading size="md" color="red.600" _dark={{ color: "red.400" }}>
                      {errorInfo.title}
                    </Heading>
                    <Text color="gray.700" _dark={{ color: "gray.300" }}>
                      {errorInfo.description}
                    </Text>
                  </VStack>

                  <Alert.Root status="warning">
                    <Alert.Icon />
                    <Alert.Description>
                      {errorInfo.suggestion}
                    </Alert.Description>
                  </Alert.Root>
                </VStack>

                {/* Error Code */}
                {error && (
                  <Box
                    p={3}
                    bg="gray.100"
                    _dark={{ bg: "gray.700" }}
                    rounded="md"
                    width="full"
                  >
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} textAlign="center">
                      Error Code: <Text as="span" fontFamily="mono" fontWeight="bold">{error}</Text>
                    </Text>
                  </Box>
                )}

                {/* Actions */}
                <VStack gap={3} width="full">
                  <AnimatedButton
                    onClick={() => router.push('/auth/signin')}
                    hoverScale={1.05}
                    rippleEffect
                    variant="solid"
                    colorPalette="blue"
                    size="lg"
                    width="full"
                  >
                    <HStack gap={3}>
                      <Icon>
                        <FaRedo />
                      </Icon>
                      <Text>Try Again</Text>
                    </HStack>
                  </AnimatedButton>

                  <AnimatedButton
                    onClick={() => router.push('/')}
                    variant="outline"
                    hoverScale={1.05}
                    rippleEffect
                    size="lg"
                    width="full"
                  >
                    Go Home
                  </AnimatedButton>
                </VStack>

                {/* Help Text */}
                <VStack gap={2} textAlign="center">
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                    Need help? Contact our support team
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Include the error code above when contacting support
                  </Text>
                </VStack>
              </VStack>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          {/* Back Button */}
          <HStack justify="center">
            <AnimatedButton
              onClick={() => router.push('/')}
              variant="ghost"
              hoverScale={1.05}
              rippleEffect
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
