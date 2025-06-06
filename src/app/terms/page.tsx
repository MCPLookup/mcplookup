"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, Card } from "@chakra-ui/react"

export default function TermsPage() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Header />

      <Box maxW="4xl" mx="auto" py={16} px={4}>
        <Card.Root bg="white" shadow="md">
          <Card.Body p={8}>
            <VStack gap={8} align="stretch">
              {/* Header */}
              <VStack gap={4} textAlign="center">
                <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
                  Terms of Service
                </Text>
                <Text color="gray.600">
                  Last updated: {new Date().toLocaleDateString()}
                </Text>
              </VStack>

              {/* Simplified Terms Content */}
              <VStack gap={6} align="stretch">
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={4}>
                    Fair Use Infrastructure Service
                  </Text>
                  <Text color="gray.700" lineHeight="relaxed">
                    MCPLookup.org provides dynamic discovery infrastructure for Model Context Protocol servers.
                    By using our service, you agree to these terms.
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                    What We Provide
                  </Text>
                  <VStack align="start" gap={2} color="gray.700" pl={4}>
                    <Text>• Discovery of Model Context Protocol (MCP) servers</Text>
                    <Text>• Registration and verification of MCP servers</Text>
                    <Text>• Health monitoring and status reporting</Text>
                    <Text>• API access for programmatic discovery</Text>
                    <Text>• Professional infrastructure for AI agent integration</Text>
                  </VStack>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                    Fair Use Guidelines
                  </Text>
                  <VStack align="start" gap={2} color="gray.700" pl={4}>
                    <Text>• Only register servers you own or control</Text>
                    <Text>• Provide accurate server information</Text>
                    <Text>• Respect API rate limits (reasonable usage)</Text>
                    <Text>• Complete DNS verification for domain ownership</Text>
                    <Text>• Use the service for legitimate MCP discovery</Text>
                  </VStack>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                    API Rate Limits
                  </Text>
                  <VStack align="start" gap={2} color="gray.700" pl={4}>
                    <Text>• Discovery API: 100 requests per minute</Text>
                    <Text>• Registration API: 10 requests per hour</Text>
                    <Text>• Health checks: 50 requests per minute</Text>
                    <Text>• Commercial usage: Contact us for higher limits</Text>
                  </VStack>
                </Box>

                <Box bg="blue.50" border="1px solid" borderColor="blue.200" rounded="md" p={4}>
                  <Text fontWeight="semibold" color="blue.800" mb={2}>
                    Open Source & Community
                  </Text>
                  <Text color="blue.700" fontSize="sm">
                    MCPLookup.org is open source infrastructure. We reserve the right to remove
                    servers that violate these terms, but we're committed to supporting the
                    growing MCP ecosystem fairly and transparently.
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                    Contact Us
                  </Text>
                  <Text color="gray.700" mb={3}>
                    Questions about these terms? We're here to help.
                  </Text>
                  <Box bg="gray.50" rounded="md" p={4}>
                    <VStack align="start" gap={2} color="gray.700">
                      <Text><Text as="span" fontWeight="bold">Email:</Text> legal@mcplookup.org</Text>
                      <Text>
                        <Text as="span" fontWeight="bold">GitHub:</Text>{" "}
                        <Text as="a" href="https://github.com/TSavo/mcplookup.org/issues" color="blue.600" _hover={{ textDecoration: "underline" }}>
                          Report an issue
                        </Text>
                      </Text>
                      <Text>
                        <Text as="span" fontWeight="bold">Website:</Text>{" "}
                        <Text as="a" href="https://mcplookup.org" color="blue.600" _hover={{ textDecoration: "underline" }}>
                          mcplookup.org
                        </Text>
                      </Text>
                    </VStack>
                  </Box>
                </Box>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>

      <Footer />
    </Box>
  )
}
