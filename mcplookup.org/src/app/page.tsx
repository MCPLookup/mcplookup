"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Card } from "@chakra-ui/react"
import { LinkButton } from "@/components/ui/link-button"

export default function HomePage() {
  return (
    <Box minH="100vh" bg="white">
      <Header />

      {/* Hero Section: Clean and Focused */}
      <Box as="section" bg="gradient-to-br" gradientFrom="slate.50" gradientTo="blue.50" py={24}>
        <Box maxW="5xl" mx="auto" px={4}>
          <VStack gap={8} textAlign="center">
            <Badge colorPalette="blue" size="lg" px={4} py={2}>
              ⚡ Dynamic Discovery Infrastructure
            </Badge>

            <VStack gap={4}>
              <Text fontSize={{ base: "4xl", md: "6xl" }} fontWeight="bold" color="gray.900" lineHeight="tight">
                AI Tools That
                <Text as="span" display="block" color="blue.600">
                  Discover Themselves
                </Text>
              </Text>

              <Text fontSize={{ base: "lg", md: "xl" }} color="gray.600" maxW="3xl" lineHeight="relaxed">
                The universal discovery service for MCP tools. No hardcoded lists, no manual configuration.
                <Text as="span" fontWeight="bold" color="blue.700"> Just dynamic discovery.</Text>
              </Text>
            </VStack>

            <HStack gap={4} flexDir={{ base: "column", sm: "row" }}>
              <LinkButton
                href="/discover"
                colorPalette="blue"
                size="lg"
                px={8}
                py={3}
                _hover={{ transform: "translateY(-1px)" }}
                transition="all 0.2s"
              >
                🔍 Discover Tools
              </LinkButton>
              <LinkButton
                href="/how-to-use"
                variant="outline"
                colorPalette="gray"
                size="lg"
                px={8}
                py={3}
                _hover={{ bg: "gray.50" }}
              >
                📖 How It Works
              </LinkButton>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Simple Two-Path Section */}
      <Box as="section" py={16} bg="white">
        <Box maxW="5xl" mx="auto" px={4}>
          <VStack gap={8} textAlign="center">
            <VStack gap={3}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
                Choose Your Path
              </Text>
              <Text fontSize="lg" color="gray.600">
                Whether you're discovering tools or building them
              </Text>
            </VStack>

            <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6} w="full">
              {/* Discovery Path */}
              <Card.Root
                bg="white"
                borderWidth="2px"
                borderColor="blue.200"
                _hover={{
                  borderColor: "blue.400",
                  shadow: "lg",
                  transform: "translateY(-2px)"
                }}
                transition="all 0.3s"
                p={6}
              >
                <VStack gap={4} textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg="blue.100"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="3xl">🔍</Text>
                  </Box>

                  <VStack gap={2}>
                    <Text fontSize="xl" fontWeight="bold" color="gray.900">
                      Discover MCP Tools
                    </Text>
                    <Text fontSize="sm" color="blue.600" fontWeight="medium">
                      For developers and AI users
                    </Text>
                    <Text color="gray.600" textAlign="center">
                      Find and connect to MCP servers automatically. No manual configuration needed.
                    </Text>
                  </VStack>

                  <VStack gap={2} w="full">
                    <LinkButton
                      href="/discover"
                      colorPalette="blue"
                      size="lg"
                      w="full"
                    >
                      🔍 Start Discovering
                    </LinkButton>
                    <LinkButton
                      href="/how-to-use"
                      variant="outline"
                      colorPalette="blue"
                      size="md"
                      w="full"
                    >
                      📖 Setup Guide
                    </LinkButton>
                  </VStack>
                </VStack>
              </Card.Root>

              {/* Registration Path */}
              <Card.Root
                bg="white"
                borderWidth="2px"
                borderColor="green.200"
                _hover={{
                  borderColor: "green.400",
                  shadow: "lg",
                  transform: "translateY(-2px)"
                }}
                transition="all 0.3s"
                p={6}
              >
                <VStack gap={4} textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg="green.100"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="3xl">📡</Text>
                  </Box>

                  <VStack gap={2}>
                    <Text fontSize="xl" fontWeight="bold" color="gray.900">
                      Register Your Tools
                    </Text>
                    <Text fontSize="sm" color="green.600" fontWeight="medium">
                      For MCP server developers
                    </Text>
                    <Text color="gray.600" textAlign="center">
                      Make your MCP server discoverable to the entire AI ecosystem.
                    </Text>
                  </VStack>

                  <VStack gap={2} w="full">
                    <LinkButton
                      href="/register"
                      colorPalette="green"
                      size="lg"
                      w="full"
                    >
                      📡 Register Server
                    </LinkButton>
                    <LinkButton
                      href="/dashboard"
                      variant="outline"
                      colorPalette="green"
                      size="md"
                      w="full"
                    >
                      🔑 Get API Keys
                    </LinkButton>
                  </VStack>
                </VStack>
              </Card.Root>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* How It Works - Simplified */}
      <Box as="section" py={16} bg="gray.50">
        <Box maxW="5xl" mx="auto" px={4}>
          <VStack gap={8} textAlign="center">
            <VStack gap={3}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
                How It Works
              </Text>
              <Text fontSize="lg" color="gray.600">
                Dynamic discovery in three simple steps
              </Text>
            </VStack>

            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
              <VStack gap={4} textAlign="center">
                <Box
                  w={16}
                  h={16}
                  bg="blue.100"
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="2xl">🗣️</Text>
                </Box>
                <VStack gap={2}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    1. Ask for Tools
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    "I need file system tools" or "Show me database connectors"
                  </Text>
                </VStack>
              </VStack>

              <VStack gap={4} textAlign="center">
                <Box
                  w={16}
                  h={16}
                  bg="green.100"
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="2xl">🔍</Text>
                </Box>
                <VStack gap={2}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    2. Discover Automatically
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    MCPLookup finds available tools and returns live endpoints
                  </Text>
                </VStack>
              </VStack>

              <VStack gap={4} textAlign="center">
                <Box
                  w={16}
                  h={16}
                  bg="purple.100"
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="2xl">⚡</Text>
                </Box>
                <VStack gap={2}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    3. Connect & Use
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    AI agent connects automatically. No configuration needed.
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Available Tools */}
      <Box as="section" py={16} bg="white">
        <Box maxW="5xl" mx="auto" px={4}>
          <VStack gap={8} textAlign="center">
            <VStack gap={3}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
                Available MCP Tools
              </Text>
              <Text fontSize="lg" color="gray.600">
                Discover these tools today, with more being added constantly
              </Text>
            </VStack>

            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
              <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" p={6}>
                <VStack gap={4} textAlign="center">
                  <Text fontSize="3xl">💻</Text>
                  <VStack gap={2}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">
                      Development Tools
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      File systems, git operations, databases, and development utilities
                    </Text>
                  </VStack>
                  <Badge colorPalette="green" size="sm">✅ Available Now</Badge>
                </VStack>
              </Card.Root>

              <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" p={6}>
                <VStack gap={4} textAlign="center">
                  <Text fontSize="3xl">🔧</Text>
                  <VStack gap={2}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">
                      Business Tools
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Custom business logic, API integrations, and workflow automation
                    </Text>
                  </VStack>
                  <Badge colorPalette="green" size="sm">✅ Available Now</Badge>
                </VStack>
              </Card.Root>

              <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" p={6}>
                <VStack gap={4} textAlign="center">
                  <Text fontSize="3xl">🌟</Text>
                  <VStack gap={2}>
                    <Text fontSize="lg" fontWeight="bold" color="gray.900">
                      Future Services
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Gmail, Slack, AWS, and other major services when they adopt MCP
                    </Text>
                  </VStack>
                  <Badge colorPalette="blue" size="sm">🚀 Coming Soon</Badge>
                </VStack>
              </Card.Root>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Simple Stats */}
      <Box as="section" py={16} bg="blue.50">
        <Box maxW="5xl" mx="auto" px={4}>
          <VStack gap={8} textAlign="center">
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
              Trusted Infrastructure
            </Text>

            <Box display="grid" gridTemplateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={6} w="full">
              <VStack gap={2}>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">500+</Text>
                <Text fontSize="sm" color="gray.600">Registered Servers</Text>
              </VStack>
              <VStack gap={2}>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">99.9%</Text>
                <Text fontSize="sm" color="gray.600">Uptime SLA</Text>
              </VStack>
              <VStack gap={2}>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">&lt;100ms</Text>
                <Text fontSize="sm" color="gray.600">Response Time</Text>
              </VStack>
              <VStack gap={2}>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">24/7</Text>
                <Text fontSize="sm" color="gray.600">Monitoring</Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Final Call to Action */}
      <Box as="section" py={16} bg="blue.600">
        <Box maxW="4xl" mx="auto" px={4} textAlign="center">
          <VStack gap={6}>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="white">
              Ready to Get Started?
            </Text>
            <Text fontSize="lg" color="blue.100" maxW="2xl" lineHeight="relaxed">
              Join the dynamic discovery infrastructure. Start discovering tools today.
            </Text>
            <HStack gap={4} flexDir={{ base: "column", sm: "row" }}>
              <LinkButton
                href="/discover"
                size="lg"
                bg="white"
                color="blue.600"
                _hover={{ bg: "gray.100", transform: "translateY(-1px)" }}
                px={8}
                py={3}
                fontWeight="medium"
                transition="all 0.2s"
              >
                🔍 Discover Tools
              </LinkButton>
              <LinkButton
                href="/register"
                variant="outline"
                size="lg"
                borderColor="blue.200"
                color="white"
                _hover={{ bg: "blue.500" }}
                px={8}
                py={3}
              >
                📡 Register Your Tools
              </LinkButton>
            </HStack>
          </VStack>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}
