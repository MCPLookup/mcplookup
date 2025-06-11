"use client"

import React, { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack } from "@chakra-ui/react"
import { DiscoveryInterface } from "@/components/mcplookup"
import { LinkButton } from "@/components/ui/link-button"
import { ServerGrid, BaseServer } from "@/components/servers"
import { mcpClientService } from "@/lib/services/mcp-client"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DiscoverPage() {
  const [servers, setServers] = useState<BaseServer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearchResults = (results: any) => {
    // Convert SDK results to BaseServer format
    const convertedServers = (results.servers || []).map((server: any): BaseServer => ({
      id: server.id || server.domain,
      domain: server.domain || server.name,
      name: server.name || server.domain,
      description: server.description || '',
      status: server.health?.status === 'healthy' ? 'active' : 
              server.health?.status === 'degraded' ? 'pending' : 'inactive',
      ownership_status: server.ownership_status || 'unowned',
      type: server.type || 'github',
      github_repo: server.github_repo,
      github_stars: server.github_stars,
      registered_at: server.created_at || new Date().toISOString(),
      language: server.language,
      capabilities: server.capabilities?.use_cases || [],
      author: server.author,
      verification_badges: server.verification?.dns_verified ? ['verified'] : []
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

              <ServerGrid
                servers={servers}
                showEditButton={false}
                loading={loading}
                emptyMessage="No servers found matching your search"
                columns={{ base: 1, md: 2, lg: 3 }}
              />
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
