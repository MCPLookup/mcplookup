"use client"

import React from 'react'
import { useSession } from 'next-auth/react'
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
  Avatar,
  SimpleGrid,
  Badge
} from "@chakra-ui/react"
import { FaServer, FaPlus, FaCog, FaSignOutAlt, FaUser, FaChartBar } from "react-icons/fa"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import AnimatedCard from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { useColorModeValue } from "@/components/ui/color-mode"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
  )

  if (status === "loading") {
    return (
      <Box minH="100vh" css={{ background: bgGradient }}>
        <Header />
        <Container maxW="6xl" py={16}>
          <VStack gap={8} align="stretch">
            <AnimatedCard.Root>
              <AnimatedCard.Body>
                <VStack gap={4} py={8}>
                  <Text>Loading dashboard...</Text>
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
                Access Denied
              </Heading>
              <Text fontSize="lg" color="whiteAlpha.800">
                Please sign in to access your dashboard
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
                    <Heading size="md">Authentication Required</Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      You need to sign in to access your dashboard
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
      
      <Container maxW="6xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Heading size="xl" color="white">
              Dashboard
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.800">
              Manage your MCP servers and account
            </Text>
          </VStack>

          {/* User Info Card */}
          <AnimatedCard.Root
            hoverScale={1.02}
            hoverY={-4}
            borderOnHover
          >
            <AnimatedCard.Body>
              <HStack gap={6} align="center">
                <Avatar
                  size="lg"
                  name={session.user?.name || session.user?.email || 'User'}
                  src={session.user?.image || undefined}
                />
                <VStack align="start" gap={1} flex={1}>
                  <Heading size="md">
                    Welcome back, {session.user?.name || 'User'}!
                  </Heading>
                  <Text color="gray.600" _dark={{ color: "gray.300" }}>
                    {session.user?.email}
                  </Text>
                  <Badge colorPalette="green" variant="outline">
                    Verified Account
                  </Badge>
                </VStack>
                <AnimatedButton
                  onClick={() => router.push('/auth/signout')}
                  variant="outline"
                  colorPalette="red"
                  hoverScale={1.05}
                  rippleEffect
                >
                  <HStack gap={2}>
                    <Icon>
                      <FaSignOutAlt />
                    </Icon>
                    <Text>Sign Out</Text>
                  </HStack>
                </AnimatedButton>
              </HStack>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          {/* Quick Actions */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              glowOnHover
            >
              <AnimatedCard.Body>
                <VStack gap={4} textAlign="center">
                  <Icon fontSize="3xl" color="blue.500">
                    <FaPlus />
                  </Icon>
                  <VStack gap={2}>
                    <Heading size="sm">Register Server</Heading>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                      Add a new MCP server to the registry
                    </Text>
                  </VStack>
                  <AnimatedButton
                    onClick={() => router.push('/register')}
                    variant="solid"
                    colorPalette="blue"
                    size="sm"
                    hoverScale={1.05}
                    rippleEffect
                  >
                    Register
                  </AnimatedButton>
                </VStack>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              glowOnHover
            >
              <AnimatedCard.Body>
                <VStack gap={4} textAlign="center">
                  <Icon fontSize="3xl" color="green.500">
                    <FaServer />
                  </Icon>
                  <VStack gap={2}>
                    <Heading size="sm">My Servers</Heading>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                      View and manage your registered servers
                    </Text>
                  </VStack>
                  <AnimatedButton
                    onClick={() => router.push('/dashboard/servers')}
                    variant="solid"
                    colorPalette="green"
                    size="sm"
                    hoverScale={1.05}
                    rippleEffect
                  >
                    View Servers
                  </AnimatedButton>
                </VStack>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              glowOnHover
            >
              <AnimatedCard.Body>
                <VStack gap={4} textAlign="center">
                  <Icon fontSize="3xl" color="purple.500">
                    <FaChartBar />
                  </Icon>
                  <VStack gap={2}>
                    <Heading size="sm">Analytics</Heading>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                      View server performance and usage stats
                    </Text>
                  </VStack>
                  <AnimatedButton
                    onClick={() => router.push('/dashboard/analytics')}
                    variant="solid"
                    colorPalette="purple"
                    size="sm"
                    hoverScale={1.05}
                    rippleEffect
                  >
                    View Stats
                  </AnimatedButton>
                </VStack>
              </AnimatedCard.Body>
            </AnimatedCard.Root>

            <AnimatedCard.Root
              hoverScale={1.05}
              hoverY={-8}
              borderOnHover
              glowOnHover
            >
              <AnimatedCard.Body>
                <VStack gap={4} textAlign="center">
                  <Icon fontSize="3xl" color="orange.500">
                    <FaCog />
                  </Icon>
                  <VStack gap={2}>
                    <Heading size="sm">Settings</Heading>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                      Manage your account and preferences
                    </Text>
                  </VStack>
                  <AnimatedButton
                    onClick={() => router.push('/dashboard/settings')}
                    variant="solid"
                    colorPalette="orange"
                    size="sm"
                    hoverScale={1.05}
                    rippleEffect
                  >
                    Settings
                  </AnimatedButton>
                </VStack>
              </AnimatedCard.Body>
            </AnimatedCard.Root>
          </SimpleGrid>

          {/* Recent Activity */}
          <AnimatedCard.Root>
            <AnimatedCard.Header>
              <Heading size="md">Recent Activity</Heading>
            </AnimatedCard.Header>
            <AnimatedCard.Body>
              <VStack gap={4} align="stretch">
                <Text color="gray.600" _dark={{ color: "gray.300" }} textAlign="center" py={8}>
                  No recent activity to display
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Register your first MCP server to see activity here
                </Text>
              </VStack>
            </AnimatedCard.Body>
          </AnimatedCard.Root>
        </VStack>
      </Container>

      <Footer />
    </Box>
  )
}
