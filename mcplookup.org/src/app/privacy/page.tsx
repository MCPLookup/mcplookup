"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, Card } from "@chakra-ui/react"

export default function PrivacyPage() {
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
                  Privacy Policy
                </Text>
                <Text color="gray.600">
                  Last updated: {new Date().toLocaleDateString()}
                </Text>
              </VStack>

              {/* Simplified Privacy Content */}
              <VStack gap={6} align="stretch">
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={4}>
                    Privacy-First Infrastructure
                  </Text>
                  <Text color="gray.700" lineHeight="relaxed">
                    MCPLookup.org is built with privacy by design. We collect minimal data,
                    use serverless architecture, and implement automatic data expiration.
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                    What We Collect
                  </Text>
                  <VStack align="start" gap={2} color="gray.700" pl={4}>
                    <Text>• Domain names and MCP server endpoints (for discovery)</Text>
                    <Text>• Contact emails (for verification only)</Text>
                    <Text>• Basic usage analytics (for service improvement)</Text>
                  </VStack>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                    How We Protect Your Data
                  </Text>
                  <VStack align="start" gap={2} color="gray.700" pl={4}>
                    <Text>• Serverless architecture (no persistent servers to breach)</Text>
                    <Text>• Automatic data expiration (TTL-based)</Text>
                    <Text>• TLS encryption for all data in transit</Text>
                    <Text>• Minimal data storage (only what's needed for discovery)</Text>
                  </VStack>
                </Box>

                <Box bg="blue.50" border="1px solid" borderColor="blue.200" rounded="md" p={4}>
                  <Text fontWeight="semibold" color="blue.800" mb={2}>
                    Zero-Infrastructure Benefits
                  </Text>
                  <VStack align="start" gap={1} color="blue.700" fontSize="sm">
                    <Text>• No traditional databases to breach</Text>
                    <Text>• Automatic scaling and security updates</Text>
                    <Text>• Data automatically expires</Text>
                    <Text>• Minimal attack surface</Text>
                  </VStack>
                </Box>

                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                    Contact Us
                  </Text>
                  <Text color="gray.700" mb={3}>
                    Questions about privacy? We're committed to transparency.
                  </Text>
                  <Box bg="gray.50" rounded="md" p={4}>
                    <VStack align="start" gap={2} color="gray.700">
                      <Text><Text as="span" fontWeight="bold">Email:</Text> privacy@mcplookup.org</Text>
                      <Text>
                        <Text as="span" fontWeight="bold">GitHub:</Text>{" "}
                        <a href="https://github.com/TSavo/mcplookup.org/issues" style={{ color: "#2563eb", textDecoration: "none" }}>
                          Report an issue
                        </a>
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
