"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Card } from "@chakra-ui/react"
import { InfrastructureFeature, CodeBlock } from "@/components/mcplookup"
import Link from "next/link"

export default function OpenStandardsPage() {
  return (
    <Box minH="100vh" bg="white">
      <Header />

      <Box maxW="6xl" mx="auto" py={16} px={4}>
        <VStack gap={12} textAlign="center">
          {/* Header */}
          <VStack gap={4}>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              🌍 Open Standards for AI Discovery
            </Text>
            <Text fontSize="lg" color="gray.600" maxW="3xl" lineHeight="relaxed">
              Building the future of AI tool discovery with open protocols, transparent development, and community collaboration.
              The infrastructure that makes dynamic discovery possible.
            </Text>
          </VStack>

          {/* Why Open Standards Matter */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" w="full" maxW="5xl">
            <Card.Body p={8}>
              <VStack gap={6}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  Why Open Standards Matter
                </Text>

                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
                  <InfrastructureFeature
                    icon="🔓"
                    title="No Vendor Lock-in"
                    description="Open protocols ensure you're never trapped by a single provider's implementation."
                    color="blue"
                  />
                  <InfrastructureFeature
                    icon="🌍"
                    title="Global Interoperability"
                    description="Standards enable different systems to work together seamlessly across the ecosystem."
                    color="green"
                  />
                  <InfrastructureFeature
                    icon="🚀"
                    title="Innovation Acceleration"
                    description="Open standards lower barriers to entry and enable rapid innovation by the community."
                    color="purple"
                  />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Technical Standards */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" w="full" maxW="5xl">
            <Card.Body p={8}>
              <VStack gap={6}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  Open Infrastructure Standards
                </Text>

                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                  <Box bg="blue.50" border="1px solid" borderColor="blue.200" p={6} rounded="lg">
                    <HStack gap={2} mb={3}>
                      <Text fontSize="xl">🔍</Text>
                      <Text fontWeight="semibold" color="blue.900">Discovery Protocol</Text>
                    </HStack>
                    <Text fontSize="sm" color="blue.800" mb={3}>
                      Open API for discovering MCP servers based on capabilities, domains, and natural language queries.
                    </Text>
                    <VStack align="start" gap={1} fontSize="xs" color="blue.700">
                      <Text>• RESTful API endpoints</Text>
                      <Text>• JSON-based responses</Text>
                      <Text>• Standardized metadata format</Text>
                      <Text>• Health monitoring integration</Text>
                    </VStack>
                  </Box>

                  <Box bg="green.50" border="1px solid" borderColor="green.200" p={6} rounded="lg">
                    <HStack gap={2} mb={3}>
                      <Text fontSize="xl">🛡️</Text>
                      <Text fontWeight="semibold" color="green.900">Verification System</Text>
                    </HStack>
                    <Text fontSize="sm" color="green.800" mb={3}>
                      Cryptographic verification using DNS TXT records to prove domain ownership and authenticity.
                    </Text>
                    <VStack align="start" gap={1} fontSize="xs" color="green.700">
                      <Text>• DNS-based verification</Text>
                      <Text>• Cryptographic signatures</Text>
                      <Text>• Trust score calculation</Text>
                      <Text>• Transparent audit trail</Text>
                    </VStack>
                  </Box>
                </Box>

                <Box bg="blue.50" border="1px solid" borderColor="blue.200" rounded="lg" p={6} w="full">
                  <HStack gap={2} mb={3}>
                    <Text fontSize="xl">📖</Text>
                    <Text fontWeight="semibold" color="blue.900">Open Source Implementation</Text>
                  </HStack>
                  <Text fontSize="sm" color="blue.800" mb={3}>
                    All our code is open source and available for inspection, contribution, and forking.
                  </Text>
                  <HStack gap={3}>
                    <Button
                      as="a"
                      href="https://github.com/TSavo/mcplookup.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      colorPalette="blue"
                      size="sm"
                    >
                      View Source Code
                    </Button>
                    <Button
                      as={Link}
                      href="/api/docs"
                      variant="outline"
                      colorPalette="blue"
                      size="sm"
                    >
                      API Documentation
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Technical Examples */}
          <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" w="full" maxW="5xl">
            <Card.Body p={8}>
              <VStack gap={6}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  Technical Examples
                </Text>

                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8} w="full">
                  <VStack align="stretch" gap={4}>
                    <Text fontWeight="semibold" color="gray.900">Discovery API Endpoints</Text>
                    <CodeBlock
                      language="bash"
                      code={`# Search by domain
GET /api/v1/discover?type=domain&q=gmail.com

# Search by capability
GET /api/v1/discover?type=capability&q=email

# AI-powered search
POST /api/v1/discover/smart
{
  "intent": "Find email servers"
}`}
                      theme="dark"
                    />
                  </VStack>

                  <VStack align="stretch" gap={4}>
                    <Text fontWeight="semibold" color="gray.900">Verification Format</Text>
                    <CodeBlock
                      language="bash"
                      code={`# DNS TXT record format
mcplookup-verify=signature:timestamp

# Example
mcplookup-verify=abc123:1703980800

# Verification endpoint
GET /api/v1/verify/domain.com`}
                      theme="dark"
                    />
                  </VStack>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Call to Action */}
          <Box
            bg="gradient-to-r"
            gradientFrom="blue.50"
            gradientTo="purple.50"
            border="2px solid"
            borderColor="blue.200"
            rounded="xl"
            p={8}
            textAlign="center"
            w="full"
            maxW="4xl"
          >
            <VStack gap={6}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.900">
                Join the Open Standards Movement
              </Text>
              <Text color="blue.800" maxW="2xl" lineHeight="relaxed">
                Help us build the future of AI tool discovery with open, transparent, and community-driven standards.
                Contribute to the infrastructure that makes dynamic discovery possible.
              </Text>
              <HStack gap={4} flexDir={{ base: "column", sm: "row" }}>
                <Button
                  as="a"
                  href="https://github.com/TSavo/mcplookup.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  colorPalette="blue"
                  size="lg"
                >
                  🚀 View on GitHub
                </Button>
                <Button
                  as={Link}
                  href="/register"
                  variant="outline"
                  colorPalette="blue"
                  size="lg"
                >
                  📡 Register Your Server
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      <Footer />
    </Box>
  )
}
