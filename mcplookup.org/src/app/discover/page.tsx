"use client"

import React, { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Input, Card } from "@chakra-ui/react"
import { DiscoveryInterface } from "@/components/mcplookup"
import { LinkButton } from "@/components/ui/link-button"
import { mcpClientService } from "@/lib/services/mcp-client"
import Link from "next/link"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface MCPServer {
  domain: string
  endpoint: string
  name?: string
  description?: string
  capabilities: string[]
  verified: boolean
  health: "healthy" | "degraded" | "down"
  trust_score: number
  response_time_ms: number
  tools?: Array<{
    name: string
    description: string
  }>
  resources?: Array<{
    name: string
    description: string
    uri: string
  }>
}

export default function DiscoverPage() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearchResults = (results: any) => {
    // Convert SDK results to MCPServer format
    const convertedServers = (results.servers || []).map((server: any) => ({
      domain: server.domain || server.name,
      endpoint: server.endpoint || `https://${server.domain}/mcp`,
      name: server.name || server.domain,
      description: server.description || '',
      capabilities: server.capabilities?.use_cases || [],
      verified: server.verification?.dns_verified || false,
      health: server.health?.status === 'healthy' ? 'healthy' : 
              server.health?.status === 'degraded' ? 'degraded' : 'down',
      trust_score: server.trust_score || 0,
      response_time_ms: server.health?.avg_response_time_ms || 0,
      tools: server.capabilities?.tools || [],
      resources: server.capabilities?.resources || []
    }))
    
    setServers(convertedServers)
    setError(null)
  }

  const handleSearchError = (errorMessage: string) => {
    setError(errorMessage)
    setServers([])
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy": return "text-green-600 bg-green-100"
      case "degraded": return "text-yellow-600 bg-yellow-100"
      case "down": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Box minH="100vh" bg="white">
      <Header />

      <Box maxW="6xl" mx="auto" py={16} px={4}>
        {/* Header */}
        <VStack gap={12} textAlign="center">
          <VStack gap={4}>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              MCP Server Discovery Engine
            </Text>
            <Text fontSize="lg" color="gray.600" maxW="3xl" lineHeight="relaxed">
              Find Model Context Protocol servers using AI-powered search, domain lookup, or capability matching.
              Discover available tools today and be ready for tomorrow's ecosystem.
            </Text>
          </VStack>

          {/* Enhanced Search Interface */}
          <Box
            w="full"
            maxW="4xl"
            bg="gradient-to-r"
            gradientFrom="blue.50"
            gradientTo="purple.50"
            rounded="2xl"
            p={8}
            border="1px solid"
            borderColor="blue.200"
          >
            <DiscoveryInterface
              searchModes={[
                { id: 'smart', label: '🧠 AI Search', placeholder: 'Find development tools with git support' },
                { id: 'domain', label: '🌐 Domain', placeholder: 'github.com' },
                { id: 'capability', label: '🔧 Capability', placeholder: 'filesystem, database, git' }
              ]}
              quickSearches={[
                'Find filesystem and file management tools',
                'Show me database connectors',
                'What git and version control tools are available?',
                'Find development and coding utilities'
              ]}
              onSearchResults={handleSearchResults}
              onSearchError={handleSearchError}
            />
          </Box>

          {/* API Integration Banner */}
          <Box
            w="full"
            maxW="4xl"
            bg="blue.50"
            border="1px solid"
            borderColor="blue.200"
            rounded="xl"
            p={6}
          >
            <HStack justify="space-between" align="center">
              <HStack gap={3}>
                <Box
                  w={10}
                  h={10}
                  bg="blue.100"
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="blue.600" fontSize="lg">⚡</Text>
                </Box>
                <VStack align="start" gap={1}>
                  <Text fontSize="md" fontWeight="medium" color="blue.900">
                    Free Discovery API
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    Integrate discovery into your applications. No API key required for basic discovery.
                  </Text>
                </VStack>
              </HStack>
              <LinkButton
                href="/api/docs"
                variant="outline"
                colorPalette="blue"
                size="sm"
              >
                View API Docs →
              </LinkButton>
            </HStack>
          </Box>

          {/* Error Display */}
          {error && (
            <Box
              w="full"
              maxW="4xl"
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              rounded="lg"
              p={4}
              textAlign="center"
            >
              <Text color="red.800">{error}</Text>
            </Box>
          )}

          {/* Results */}
          {servers.length > 0 && (
            <VStack gap={6} w="full" align="stretch">
              <Text textAlign="center" color="gray.600">
                Found {servers.length} MCP servers
              </Text>

              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap={6}
                w="full"
              >
                {servers.map((server, index) => (
                  <Card.Root
                    key={server.domain}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    _hover={{
                      borderColor: "blue.300",
                      shadow: "lg",
                      transform: "translateY(-2px)"
                    }}
                    transition="all 0.2s"
                  >
                    <Card.Body p={6}>
                      <VStack align="stretch" gap={4}>
                        {/* Server Header */}
                        <VStack align="stretch" gap={2}>
                          <HStack justify="space-between" align="start">
                            <Text fontSize="md" fontWeight="semibold" color="gray.900" lineClamp={1}>
                              {server.name || server.domain}
                            </Text>
                            {server.verified && (
                              <Badge colorPalette="green" size="sm">✓ Verified</Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600">{server.domain}</Text>
                        </VStack>

                        {/* Description */}
                        {server.description && (
                          <Text fontSize="sm" color="gray.600" lineClamp={2}>
                            {server.description}
                          </Text>
                        )}

                        {/* Health Status */}
                        <HStack gap={2}>
                          <Badge
                            colorPalette={
                              server.health === "healthy" ? "green" :
                              server.health === "degraded" ? "yellow" : "red"
                            }
                            size="sm"
                          >
                            {server.health || 'unknown'}
                          </Badge>
                          {server.response_time_ms && (
                            <Text fontSize="xs" color="gray.500">
                              {server.response_time_ms}ms
                            </Text>
                          )}
                        </HStack>

                        {/* Capabilities */}
                        {server.capabilities && server.capabilities.length > 0 && (
                          <VStack align="stretch" gap={2}>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700">
                              Capabilities:
                            </Text>
                            <HStack gap={1} flexWrap="wrap">
                              {server.capabilities.slice(0, 3).map((cap) => (
                                <Badge key={cap} colorPalette="blue" size="sm">
                                  {cap}
                                </Badge>
                              ))}
                              {server.capabilities.length > 3 && (
                                <Badge colorPalette="blue" size="sm">
                                  +{server.capabilities.length - 3} more
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        )}

                        {/* Tools */}
                        {server.tools && server.tools.length > 0 && (
                          <VStack align="stretch" gap={2}>
                            <Text fontSize="xs" fontWeight="medium" color="gray.700">
                              Tools:
                            </Text>
                            <VStack align="stretch" gap={1}>
                              {server.tools.slice(0, 2).map((tool) => (
                                <Box key={tool.name}>
                                  <Text fontSize="xs" fontWeight="medium">{tool.name}</Text>
                                  {tool.description && (
                                    <Text fontSize="xs" color="gray.500">
                                      {tool.description}
                                    </Text>
                                  )}
                                </Box>
                              ))}
                              {server.tools.length > 2 && (
                                <Text fontSize="xs" color="gray.500">
                                  +{server.tools.length - 2} more tools
                                </Text>
                              )}
                            </VStack>
                          </VStack>
                        )}

                        {/* Endpoint */}
                        <Box pt={2} borderTop="1px solid" borderColor="gray.200">
                          <Text fontSize="xs" color="gray.500" fontFamily="mono" lineClamp={1}>
                            {server.endpoint}
                          </Text>
                        </Box>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Box>
            </VStack>
          )}

          {/* No Results */}
          {!loading && servers.length === 0 && error === null && (
            <Box textAlign="center" py={12}>
              <Text color="gray.600">No servers found. Try a different search term.</Text>
            </Box>
          )}
        </VStack>
      </Box>

      <Footer />
    </Box>
  )
}
