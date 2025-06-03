"use client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useSession } from "next-auth/react"
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Icon
} from "@chakra-ui/react"
import { Card } from "@/components/ui/card"
import { FaRing, FaSearch, FaPlus, FaGlobe } from "react-icons/fa"
import { FaShield } from "react-icons/fa6"
import { Header } from "@/components/layout/header"
import { SignInButton } from "@/components/auth/signin-button"
import { useColorModeValue } from "@/components/ui/color-mode"
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const bgGradient = useColorModeValue(
    "linear-gradient(to bottom right, var(--chakra-colors-orange-50), var(--chakra-colors-yellow-50))",
    "linear-gradient(to bottom right, var(--chakra-colors-gray-900), var(--chakra-colors-gray-800))"
  )

  return (
    <Box minH="100vh" css={{ background: bgGradient }}>
      <Header />

      <Container maxW="7xl" py={16}>
        {/* Hero Section */}
        <VStack gap={8} textAlign="center" mb={16}>
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
              The One Ring
            </Heading>
          </HStack>

          <Heading size="xl" maxW="4xl">
            Universal MCP Discovery Service
          </Heading>

          <Text fontSize="xl" color="gray.600" _dark={{ color: "gray.300" }} maxW="3xl">
            Discover and register Model Context Protocol servers.
            The central registry that connects AI agents with the tools they need.
          </Text>

          {!session && (
            <VStack gap={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Get started by signing in
              </Text>
              <HStack gap={4}>
                <SignInButton provider="github" width="200px" />
                <SignInButton provider="google" width="200px" />
              </HStack>
            </VStack>
          )}

          {session && (
            <VStack gap={4}>
              <Text fontSize="lg" color="green.600" _dark={{ color: "green.400" }}>
                Welcome back, {session.user?.name}! 👋
              </Text>
              <HStack gap={4}>
                <Link href="/discover">
                  <Button colorPalette="orange" size="lg">
                    <Icon mr={2}>
                      <FaSearch />
                    </Icon>
                    Discover Servers
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg">
                    <Icon mr={2}>
                      <FaPlus />
                    </Icon>
                    Register Server
                  </Button>
                </Link>
              </HStack>
            </VStack>
          )}
        </VStack>

        {/* Features Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={16}>
          <Card.Root>
            <Card.Body textAlign="center">
              <Icon fontSize="2rem" color="blue.500" mb={4}>
                <FaSearch />
              </Icon>
              <Heading size="md" mb={2}>Discovery</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Find MCP servers by domain, capability, or intent
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body textAlign="center">
              <Icon fontSize="2rem" color="green.500" mb={4}>
                <FaPlus />
              </Icon>
              <Heading size="md" mb={2}>Registration</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Register your MCP server with DNS verification
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body textAlign="center">
              <Icon fontSize="2rem" color="purple.500" mb={4}>
                <FaShield />
              </Icon>
              <Heading size="md" mb={2}>Verification</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Cryptographic proof of domain ownership
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body textAlign="center">
              <Icon fontSize="2rem" color="orange.500" mb={4}>
                <FaGlobe />
              </Icon>
              <Heading size="md" mb={2}>Global Registry</Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                Serverless, scalable, open-source platform
              </Text>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* Stats */}
        <Card.Root>
          <Card.Body>
            <VStack gap={4} textAlign="center">
              <Heading size="lg">Registry Statistics</Heading>
              <HStack gap={8} justify="center">
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="orange.500">1,247</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>Registered Servers</Text>
                </VStack>
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.500">98.7%</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>Uptime</Text>
                </VStack>
                <VStack>
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">847</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>Verified Domains</Text>
                </VStack>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  )
}
