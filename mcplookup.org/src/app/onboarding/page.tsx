"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Card } from "@chakra-ui/react"
import { WorkflowStep, InfrastructureFeature } from "@/components/mcplookup"
import { LinkButton } from "@/components/ui/link-button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSkipOnboarding = async () => {
    setLoading(true)
    try {
      // Skip onboarding API call
      await fetch('/api/v1/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      // Still redirect to dashboard
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleStartOnboarding = async () => {
    setLoading(true)
    try {
      // Initialize onboarding
      await fetch('/api/v1/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      router.push('/dashboard?onboarding=true')
    } catch (error) {
      console.error('Error starting onboarding:', error)
      // Still redirect to dashboard with onboarding
      router.push('/dashboard?onboarding=true')
    }
    setLoading(false)
  }

  return (
    <Box minH="100vh" bg="white">
      <Header />

      <Box maxW="6xl" mx="auto" py={20} px={4}>
        <VStack gap={16} textAlign="center">
          {/* Professional Welcome */}
          <Box
            bg="gradient-to-r"
            gradientFrom="blue.600"
            gradientTo="purple.600"
            color="white"
            textAlign="center"
            py={8}
            rounded="xl"
            border="2px solid"
            borderColor="blue.400"
            w="full"
            maxW="4xl"
          >
            <HStack justify="center" gap={4} mb={4}>
              <Text fontSize="4xl">⚡</Text>
              <Text fontSize="3xl" fontWeight="bold">
                Welcome to MCPLookup
              </Text>
              <Text fontSize="4xl">⚡</Text>
            </HStack>
            <Text fontSize="xl" fontWeight="medium" mb={2}>
              <Text as="span" fontWeight="bold">Join the Dynamic Discovery Infrastructure</Text>
            </Text>
            <Text fontSize="sm" opacity={0.9}>
              Your contribution helps build the infrastructure that makes AI tools discoverable
            </Text>
          </Box>

          {/* Welcome Content */}
          <VStack gap={6} maxW="4xl">
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              🎯 Ready to Get Started?
            </Text>
            <Text fontSize="xl" color="gray.600" lineHeight="relaxed">
              <Text as="span" fontWeight="bold">You're about to contribute to the future of AI tool discovery.</Text>
              <br />Let's get you set up to register your MCP servers and join the growing ecosystem.
            </Text>
          </VStack>

          {/* Two Paths */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8} w="full" maxW="5xl">
            {/* Guided Setup */}
            <Card.Root
              bg="white"
              borderWidth="2px"
              borderColor="green.200"
              _hover={{
                borderColor: "green.400",
                transform: "translateY(-4px)",
                shadow: "xl"
              }}
              transition="all 0.3s"
            >
              <Card.Body p={8} textAlign="center">
                <VStack gap={6}>
                  <Text fontSize="6xl">🎯</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    Guided Setup (Recommended)
                  </Text>
                  <Text color="gray.600">
                    <Text as="span" fontWeight="bold">5-minute walkthrough</Text> to get your API keys,
                    register your first MCP server, and understand your infrastructure contribution.
                  </Text>

                  <Box bg="green.50" border="1px solid" borderColor="green.200" rounded="lg" p={4} w="full">
                    <Text fontWeight="bold" color="green.800" mb={2}>🚀 What You'll Do:</Text>
                    <VStack align="start" gap={1} fontSize="sm" color="green.700">
                      <Text>• ⚡ Get free API keys (1 minute)</Text>
                      <Text>• 📡 Register your MCP server (2 minutes)</Text>
                      <Text>• 🔐 Verify domain ownership (2 minutes)</Text>
                      <Text>• 🎯 See your infrastructure impact (30 seconds)</Text>
                    </VStack>
                  </Box>

                  <Button
                    colorPalette="green"
                    size="lg"
                    w="full"
                    onClick={handleStartOnboarding}
                    disabled={loading}
                    _hover={{ transform: "scale(1.02)" }}
                    transition="all 0.2s"
                  >
                    🚀 Start 5-Minute Setup
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Skip to Dashboard */}
            <Card.Root
              bg="white"
              borderWidth="2px"
              borderColor="blue.200"
              _hover={{
                borderColor: "blue.400",
                transform: "translateY(-4px)",
                shadow: "xl"
              }}
              transition="all 0.3s"
            >
              <Card.Body p={8} textAlign="center">
                <VStack gap={6}>
                  <Text fontSize="6xl">⚡</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    Skip to Dashboard
                  </Text>
                  <Text color="gray.600">
                    <Text as="span" fontWeight="bold">I know what I'm doing.</Text> Take me straight to the dashboard
                    where I can manage my servers and infrastructure contributions.
                  </Text>

                  <Box bg="blue.50" border="1px solid" borderColor="blue.200" rounded="lg" p={4} w="full">
                    <Text fontWeight="bold" color="blue.800" mb={2}>💡 Remember:</Text>
                    <VStack align="start" gap={1} fontSize="sm" color="blue.700">
                      <Text>• Get free API keys for server registration</Text>
                      <Text>• Register MCP servers to join the ecosystem</Text>
                      <Text>• Verify domains for higher trust scores</Text>
                      <Text>• Monitor your infrastructure contribution</Text>
                    </VStack>
                  </Box>

                  <Button
                    variant="outline"
                    colorPalette="blue"
                    size="lg"
                    w="full"
                    onClick={handleSkipOnboarding}
                    disabled={loading}
                    _hover={{ transform: "scale(1.02)" }}
                    transition="all 0.2s"
                  >
                    ⚡ Skip to Dashboard
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* Infrastructure Context */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" w="full" maxW="5xl">
            <Card.Body p={8}>
              <VStack gap={6}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900" textAlign="center">
                  ⚡ Why This Infrastructure Matters
                </Text>

                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
                  <InfrastructureFeature
                    icon="🌍"
                    title="Global Impact"
                    description="Your servers become instantly discoverable by AI agents worldwide, strengthening the open ecosystem."
                    color="blue"
                  />
                  <InfrastructureFeature
                    icon="🎯"
                    title="Dynamic Discovery"
                    description="Replace hardcoded server lists with intelligent discovery that adapts as the ecosystem grows."
                    color="green"
                  />
                  <InfrastructureFeature
                    icon="🚀"
                    title="Future Ready"
                    description="When major services adopt MCP, they'll be instantly discoverable through your infrastructure contribution."
                    color="purple"
                  />
                </Box>

                <Box bg="blue.50" border="1px solid" borderColor="blue.300" rounded="lg" p={4} textAlign="center" w="full">
                  <Text color="blue.800" fontWeight="medium">
                    <Text as="span" fontWeight="bold">This is the infrastructure moment for AI tool discovery.</Text>
                    <br />Just like DNS made the web scalable, dynamic discovery makes AI tools scalable.
                    <br />The infrastructure we build now will serve the AI ecosystem for years to come.
                  </Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Quick Links */}
          <VStack gap={4} textAlign="center">
            <Text color="gray.600">
              Want to learn more before starting?
            </Text>
            <HStack gap={4} flexWrap="wrap" justify="center">
              <LinkButton
                href="/open-standards"
                variant="outline"
                size="sm"
              >
                🌍 Open Standards
              </LinkButton>
              <LinkButton
                href="/how-to-use"
                variant="outline"
                size="sm"
              >
                📖 Setup Guide
              </LinkButton>
              <LinkButton
                href="/discover"
                variant="outline"
                size="sm"
              >
                🔍 Explore Ecosystem
              </LinkButton>
            </HStack>
          </VStack>
        </VStack>
      </Box>

      <Footer />
    </Box>
  )
}
