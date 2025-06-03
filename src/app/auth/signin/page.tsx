"use client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon
} from "@chakra-ui/react"
import { Card } from "@/components/ui/card"
import { FaRing } from "react-icons/fa"
import { SignInButton } from "@/components/auth/signin-button"
import { useColorModeValue } from "@/components/ui/color-mode"

export default function SignInPage() {
  const bgGradient = useColorModeValue(
    "linear-gradient(to bottom right, var(--chakra-colors-orange-50), var(--chakra-colors-yellow-50))",
    "linear-gradient(to bottom right, var(--chakra-colors-gray-900), var(--chakra-colors-gray-800))"
  )

  return (
    <Box minH="100vh" css={{ background: bgGradient }}>
      <Container maxW="md" py={16}>
        <VStack gap={8}>
          {/* Logo */}
          <VStack gap={4} textAlign="center">
            <HStack gap={3}>
              <Icon fontSize="3rem" color="orange.500">
                <FaRing />
              </Icon>
              <Heading 
                size="2xl" 
                css={{
                  background: "linear-gradient(to right, var(--chakra-colors-orange-400), var(--chakra-colors-yellow-400))",
                  backgroundClip: "text",
                  color: "transparent"
                }}
              >
                MCPLookup
              </Heading>
            </HStack>
            
            <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
              Universal MCP Discovery Service
            </Text>
          </VStack>

          {/* Sign In Card */}
          <Card.Root width="full">
            <Card.Body>
              <VStack gap={6}>
                <VStack gap={2} textAlign="center">
                  <Heading size="lg">Sign In</Heading>
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    Choose your preferred authentication method
                  </Text>
                </VStack>

                <VStack gap={4} width="full">
                  <SignInButton provider="github" width="full" />
                  <SignInButton provider="google" width="full" />
                </VStack>

                <Text fontSize="sm" color="gray.500" textAlign="center">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>
    </Box>
  )
}
