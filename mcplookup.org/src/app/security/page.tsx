"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Card } from "@chakra-ui/react"
import { InfrastructureFeature } from "@/components/mcplookup"
import { LinkButton } from "@/components/ui/link-button"

export default function SecurityPage() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      <Box maxW="5xl" mx="auto" py={16} px={4}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              🔒 Security & Trust
            </Text>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Our commitment to keeping MCPLookup.org secure and trustworthy for the entire AI ecosystem
            </Text>
          </VStack>

          {/* Security Overview */}
          <Card.Root bg="white" shadow="md">
            <Card.Body p={8}>
              <VStack gap={6} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  Security Overview
                </Text>
                <Text color="gray.700" lineHeight="relaxed">
                  Security is fundamental to MCPLookup.org's mission of providing a trusted discovery
                  service for Model Context Protocol servers. We implement multiple layers of security
                  to protect our users and the integrity of the MCP ecosystem.
                </Text>
                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                  <InfrastructureFeature
                    icon="🔒"
                    title="Encryption"
                    description="All data encrypted in transit"
                    color="green"
                  />
                  <InfrastructureFeature
                    icon="🛡️"
                    title="Verification"
                    description="DNS-based domain ownership"
                    color="blue"
                  />
                  <InfrastructureFeature
                    icon="🔍"
                    title="Monitoring"
                    description="24/7 security monitoring"
                    color="purple"
                  />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Infrastructure Security */}
          <Card.Root bg="white" shadow="md">
            <Card.Body p={8}>
              <VStack gap={6} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  Infrastructure Security
                </Text>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={2}>
                      Serverless Architecture
                    </Text>
                    <Text color="gray.700">
                      Our serverless design eliminates many traditional attack vectors by having no
                      persistent servers to compromise. Each request is handled by isolated functions
                      that automatically scale and terminate.
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={2}>
                      Minimal Data Storage
                    </Text>
                    <Text color="gray.700">
                      We use Upstash Redis (serverless) for registered server metadata only.
                      All data has automatic TTL expiration. No traditional databases,
                      no file system storage, minimal attack surface.
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={2}>
                      Edge Network
                    </Text>
                    <Text color="gray.700">
                      Deployed on Vercel's global edge network with built-in DDoS protection,
                      automatic SSL/TLS certificates, and geographic distribution for resilience.
                    </Text>
                  </Box>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Domain Verification */}
          <Card.Root bg="white" shadow="md">
            <Card.Body p={8}>
              <VStack gap={6} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  Domain Verification
                </Text>
                <Text color="gray.700" lineHeight="relaxed">
                  We use cryptographic DNS verification to ensure only legitimate domain owners
                  can register MCP servers:
                </Text>

                <Box bg="gray.50" rounded="md" p={4}>
                  <Text fontWeight="semibold" color="gray.900" mb={2}>
                    Verification Process:
                  </Text>
                  <VStack align="start" gap={2} color="gray.700">
                    <Text>1. Generate unique cryptographic challenge for each registration</Text>
                    <Text>2. Require TXT record addition to domain's DNS</Text>
                    <Text>3. Verify record exists and matches expected value</Text>
                    <Text>4. Only then allow server to be discoverable</Text>
                  </VStack>
                </Box>

                <Box bg="blue.50" border="1px solid" borderColor="blue.200" rounded="md" p={4}>
                  <Text color="blue.800">
                    <Text as="span" fontWeight="bold">Security Benefit:</Text> This prevents unauthorized users from
                    registering servers for domains they don't control, maintaining trust in
                    the discovery service.
                  </Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Contact */}
          <Box bg="blue.50" rounded="lg" p={6} textAlign="center">
            <VStack gap={4}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.900">
                Security Questions?
              </Text>
              <Text color="blue.700">
                Have questions about our security practices or need to report a security issue?
              </Text>
              <HStack gap={3} flexDir={{ base: "column", sm: "row" }}>
                <LinkButton
                  href="mailto:security@mcplookup.org"
                  external
                  variant="outline"
                  colorPalette="blue"
                  bg="white"
                >
                  📧 security@mcplookup.org
                </LinkButton>
                <LinkButton
                  href="https://github.com/TSavo/mcplookup.org/security"
                  external
                  variant="outline"
                  colorPalette="blue"
                  bg="white"
                >
                  🔒 Security Policy
                </LinkButton>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      <Footer />
    </Box>
  )
}
