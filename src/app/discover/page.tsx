"use client"

import React, { useState } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  SimpleGrid,
  Icon,
  Badge,
  Spinner
} from "@chakra-ui/react"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Pagination } from "@/components/ui/pagination"
import { LoadingCard, SearchLoading, StaggeredListLoading } from "@/components/ui/loading"
import { AnimatedCardNamespace as AnimatedCard, AnimatedList } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { createAnimatedToast } from "@/components/ui/toaster"
import { FaSearch, FaServer, FaCheckCircle, FaExclamationTriangle, FaFilter, FaTimes, FaCode, FaStream, FaShieldAlt, FaCog, FaBook, FaPlug, FaDatabase } from "react-icons/fa"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useColorModeValue } from "@/components/ui/color-mode"

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
  transport?: string
  transport_capabilities?: {
    primary_transport: string
    supported_methods: string[]
    sse_support?: {
      supports_sse: boolean
      supports_get_streaming: boolean
      supports_post_streaming: boolean
    }
    session_support?: {
      supports_sessions: boolean
      session_header_name?: string
    }
    cors_details?: {
      cors_enabled: boolean
      allowed_origins: string[]
      allowed_methods: string[]
    }
    performance?: {
      avg_response_time_ms: number
      supports_compression: boolean
    }
  }
  openapi_documentation?: {
    discovered_at: string
    spec_url?: string
    openapi_version: string
    api_info: {
      title: string
      version: string
      description?: string
    }
    endpoints_summary: {
      total_paths: number
      total_operations: number
      methods: Record<string, number>
      tags: string[]
      has_authentication: boolean
    }
    validation: {
      is_valid: boolean
      validation_errors: string[]
    }
  }
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
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"domain" | "capability" | "smart">("domain")
  const [servers, setServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [filters, setFilters] = useState({
    verified: false,
    health: "",
    minTrustScore: 0
  })

  const [includeMetadata, setIncludeMetadata] = useState({
    transport_capabilities: true,
    openapi_documentation: true,
    tools: true,
    resources: true,
    health: true
  })
  const [showFilters, setShowFilters] = useState(false)
  const [aiMetadata, setAiMetadata] = useState<any>(null)


  const bgGradient = useColorModeValue(
    "linear-gradient(to bottom right, var(--chakra-colors-blue-50), var(--chakra-colors-purple-50))",
    "linear-gradient(to bottom right, var(--chakra-colors-gray-900), var(--chakra-colors-gray-800))"
  )

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setAiMetadata(null)

    try {
      if (searchType === "smart") {
        // AI-powered smart search
        const response = await fetch('/api/v1/discover/smart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            intent: searchQuery,
            context: {
              user_type: filters.verified ? 'business' : 'personal',
              max_results: itemsPerPage
            },
            include: includeMetadata
          })
        })

        if (!response.ok) {
          throw new Error(`AI search failed: ${response.status}`)
        }

        const data = await response.json()
        setServers(data.servers || [])
        setAiMetadata(data.metadata)
        setTotalItems(data.servers?.length || 0)
        setTotalPages(1) // AI search returns pre-filtered results
        setCurrentPage(1)

        createAnimatedToast.success(
          "🧠 AI Search completed",
          `Found ${data.servers?.length || 0} relevant servers (${Math.round(data.confidence * 100)}% confidence)`
        )
      } else {
        // Traditional keyword search
        const params = new URLSearchParams({
          q: searchQuery,
          type: searchType,
          page: page.toString(),
          limit: itemsPerPage.toString(),
          ...(filters.verified && { verified: 'true' }),
          ...(filters.health && { health: filters.health }),
          ...(filters.minTrustScore > 0 && { min_trust_score: filters.minTrustScore.toString() }),
          ...(includeMetadata.transport_capabilities && { include_transport_capabilities: 'true' }),
          ...(includeMetadata.openapi_documentation && { include_openapi_documentation: 'true' }),
          ...(includeMetadata.tools && { include_tools: 'true' }),
          ...(includeMetadata.resources && { include_resources: 'true' }),
          ...(includeMetadata.health && { include_health: 'true' })
        })

        const response = await fetch(`/api/v1/discover?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.servers) {
          setServers(data.servers)
          setTotalItems(data.pagination?.total_count || data.servers.length)
          setTotalPages(Math.ceil((data.pagination?.total_count || data.servers.length) / itemsPerPage))
          setCurrentPage(page)

          createAnimatedToast.success(
            "Search completed",
            `Found ${data.servers.length} servers`
          )
        } else {
          setServers([])
          setTotalItems(0)
          setTotalPages(1)
          setCurrentPage(1)
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setError("Failed to search for servers. Please try again.")
      setServers([])

      createAnimatedToast.error(
        "Search failed",
        "Unable to search for servers. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    handleSearch(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    handleSearch(1)
  }

  const clearFilters = () => {
    setFilters({
      verified: false,
      health: "",
      minTrustScore: 0
    })
    setCurrentPage(1)
    if (searchQuery.trim()) {
      handleSearch(1)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy": return "green"
      case "degraded": return "yellow"
      case "down": return "red"
      default: return "gray"
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy": return FaCheckCircle
      case "degraded": return FaExclamationTriangle
      case "down": return FaExclamationTriangle
      default: return FaServer
    }
  }

  return (
    <Box minH="100vh" css={{ background: bgGradient }}>
      <Header />
      
      <Container maxW="7xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Heading size="xl">Discover MCP Servers</Heading>
            <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
              Find Model Context Protocol servers by domain, capability, or natural language with AI
            </Text>
          </VStack>

          {/* Universal Bridge Alert */}
          <Card.Root>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <HStack gap={3} align="center">
                  <Text fontSize="2xl">🌉</Text>
                  <Heading size="md" color="orange.600">
                    Stop Hardcoding MCP Servers!
                  </Heading>
                </HStack>

                <Text fontSize="sm" color="gray.700" _dark={{ color: "gray.300" }}>
                  <strong>Replace ALL your hardcoded MCP servers with ONE universal bridge.</strong>
                  Instead of manually configuring each server in Claude Desktop, use our bridge to dynamically
                  discover and connect to any MCP server.
                </Text>

                <HStack gap={4} flexWrap="wrap">
                  <VStack align="start" flex="1" minW="300px">
                    <Text fontSize="sm" fontWeight="semibold" color="red.600">❌ Before (Hardcoded Hell):</Text>
                    <Box bg="red.50" _dark={{ bg: "red.900" }} p={3} rounded="md" fontSize="xs" fontFamily="mono">
                      <Text>{`{`}</Text>
                      <Text ml={2}>{`"mcpServers": {`}</Text>
                      <Text ml={4}>{`"gmail": {"command": "node", "args": ["gmail-server"]},`}</Text>
                      <Text ml={4}>{`"github": {"command": "node", "args": ["github-server"]},`}</Text>
                      <Text ml={4}>{`"slack": {"command": "node", "args": ["slack-server"]}`}</Text>
                      <Text ml={4}>{`// ... manually add 50+ more servers`}</Text>
                      <Text ml={2}>{`}`}</Text>
                      <Text>{`}`}</Text>
                    </Box>
                  </VStack>

                  <VStack align="start" flex="1" minW="300px">
                    <Text fontSize="sm" fontWeight="semibold" color="green.600">✅ After (Universal Bridge):</Text>
                    <Box bg="green.50" _dark={{ bg: "green.900" }} p={3} rounded="md" fontSize="xs" fontFamily="mono">
                      <Text>{`{`}</Text>
                      <Text ml={2}>{`"mcpServers": {`}</Text>
                      <Text ml={4}>{`"universal-bridge": {`}</Text>
                      <Text ml={6}>{`"command": "node",`}</Text>
                      <Text ml={6}>{`"args": ["scripts/mcp-bridge.mjs"]`}</Text>
                      <Text ml={4}>{`}`}</Text>
                      <Text ml={2}>{`}`}</Text>
                      <Text>{`}`}</Text>
                      <Text mt={2} fontSize="xs" color="green.600" fontWeight="semibold">
                        // That's it! Claude now has access to ALL MCP servers
                      </Text>
                    </Box>
                  </VStack>
                </HStack>

                <HStack gap={2} justify="center" flexWrap="wrap">
                  <AnimatedButton
                    size="sm"
                    variant="solid"
                    colorPalette="orange"
                    hoverScale={1.05}
                    rippleEffect
                    onClick={() => window.open('https://github.com/TSavo/mcplookup.org/blob/main/UNIVERSAL_BRIDGE.md', '_blank')}
                  >
                    🌉 Get the Bridge
                  </AnimatedButton>
                  <AnimatedButton
                    size="sm"
                    variant="outline"
                    colorPalette="blue"
                    hoverScale={1.05}
                    onClick={() => window.open('https://github.com/TSavo/mcplookup.org/blob/main/scripts/README.md', '_blank')}
                  >
                    📖 Documentation
                  </AnimatedButton>
                </HStack>

                <Box bg="yellow.50" _dark={{ bg: "yellow.900" }} p={3} rounded="md" border="1px" borderColor="yellow.200">
                  <Text fontSize="xs" color="yellow.800" _dark={{ color: "yellow.200" }} textAlign="center">
                    <strong>⚠️ This bridge shouldn't exist.</strong> Someone else should be solving this.
                    This project succeeds when the bridge dies and MCP clients have native discovery.
                  </Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Search */}
          <Card.Root>
            <Card.Body>
              <VStack gap={4}>
                <HStack gap={2} width="full">
                  <Button
                    variant={searchType === "domain" ? "solid" : "outline"}
                    colorPalette="blue"
                    onClick={() => setSearchType("domain")}
                  >
                    Domain
                  </Button>
                  <Button
                    variant={searchType === "capability" ? "solid" : "outline"}
                    colorPalette="blue"
                    onClick={() => setSearchType("capability")}
                  >
                    Capability
                  </Button>
                  <Button
                    variant={searchType === "smart" ? "solid" : "outline"}
                    colorPalette="purple"
                    onClick={() => setSearchType("smart")}
                  >
                    🧠 AI Smart
                  </Button>
                </HStack>
                
                <HStack gap={2} width="full">
                  <Input
                    placeholder={
                      searchType === "domain"
                        ? "Enter domain (e.g., gmail.com)"
                        : searchType === "capability"
                        ? "Enter capability (e.g., email)"
                        : "Ask in natural language (e.g., 'Find email servers like Gmail but more private')"
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <AnimatedButton
                    onClick={() => handleSearch(1)}
                    disabled={loading || !searchQuery.trim()}
                    state={loading ? "loading" : "idle"}
                    loadingText="Searching..."
                    hoverScale={1.05}
                    rippleEffect
                    variant="solid"
                  >
                    {!loading && (
                      <Icon>
                        <FaSearch />
                      </Icon>
                    )}
                  </AnimatedButton>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Icon>
                      <FaFilter />
                    </Icon>
                  </Button>
                </HStack>

                {/* Filters */}
                {showFilters && (
                  <VStack gap={4} p={4} bg="gray.50" _dark={{ bg: "gray.800" }} rounded="md">
                    <HStack gap={4} width="full" flexWrap="wrap">
                      <VStack align="start">
                        <Text fontSize="sm" fontWeight="semibold">Verified Only</Text>
                        <Button
                          size="sm"
                          variant={filters.verified ? "solid" : "outline"}
                          colorPalette="green"
                          onClick={() => setFilters(prev => ({ ...prev, verified: !prev.verified }))}
                        >
                          {filters.verified ? "✓ Verified" : "All Servers"}
                        </Button>
                      </VStack>

                      <VStack align="start">
                        <Text fontSize="sm" fontWeight="semibold">Health Status</Text>
                        <HStack>
                          {["", "healthy", "degraded", "down"].map((health) => (
                            <Button
                              key={health}
                              size="sm"
                              variant={filters.health === health ? "solid" : "outline"}
                              colorPalette={health === "healthy" ? "green" : health === "degraded" ? "yellow" : health === "down" ? "red" : "gray"}
                              onClick={() => setFilters(prev => ({ ...prev, health }))}
                            >
                              {health || "All"}
                            </Button>
                          ))}
                        </HStack>
                      </VStack>

                      <VStack align="start">
                        <Text fontSize="sm" fontWeight="semibold">Min Trust Score</Text>
                        <HStack>
                          {[0, 50, 70, 90].map((score) => (
                            <Button
                              key={score}
                              size="sm"
                              variant={filters.minTrustScore === score ? "solid" : "outline"}
                              onClick={() => setFilters(prev => ({ ...prev, minTrustScore: score }))}
                            >
                              {score === 0 ? "Any" : `${score}+`}
                            </Button>
                          ))}
                        </HStack>
                      </VStack>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearFilters}
                      >
                        <FaTimes />
                        Clear Filters
                      </Button>
                    </HStack>

                    {/* Metadata Inclusion Options */}
                    <VStack gap={3} align="start" width="full">
                      <Text fontSize="sm" fontWeight="semibold">Include Metadata:</Text>
                      <HStack gap={4} flexWrap="wrap">
                        <HStack gap={2}>
                          <input
                            type="checkbox"
                            checked={includeMetadata.transport_capabilities}
                            onChange={(e) => setIncludeMetadata(prev => ({
                              ...prev,
                              transport_capabilities: e.target.checked
                            }))}
                          />
                          <Text fontSize="sm">Transport Capabilities</Text>
                        </HStack>
                        <HStack gap={2}>
                          <input
                            type="checkbox"
                            checked={includeMetadata.openapi_documentation}
                            onChange={(e) => setIncludeMetadata(prev => ({
                              ...prev,
                              openapi_documentation: e.target.checked
                            }))}
                          />
                          <Text fontSize="sm">OpenAPI Docs</Text>
                        </HStack>
                        <HStack gap={2}>
                          <input
                            type="checkbox"
                            checked={includeMetadata.tools}
                            onChange={(e) => setIncludeMetadata(prev => ({
                              ...prev,
                              tools: e.target.checked
                            }))}
                          />
                          <Text fontSize="sm">Tools</Text>
                        </HStack>
                        <HStack gap={2}>
                          <input
                            type="checkbox"
                            checked={includeMetadata.resources}
                            onChange={(e) => setIncludeMetadata(prev => ({
                              ...prev,
                              resources: e.target.checked
                            }))}
                          />
                          <Text fontSize="sm">Resources</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </VStack>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Error */}
          {error && (
            <Alert.Root status="error">
              <Alert.Icon />
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          {/* Loading State */}
          {loading && (
            <VStack gap={6}>
              <SearchLoading message="Searching for MCP servers" showDots />
              <StaggeredListLoading count={3} variant="card" />
            </VStack>
          )}

          {/* Results */}
          {!loading && servers.length > 0 && (
            <VStack gap={6} align="stretch">
              <VStack gap={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">
                    Found {totalItems} server{totalItems !== 1 ? "s" : ""}
                  </Heading>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                    {searchType === "smart" ? "AI-curated results" : `Page ${currentPage} of ${totalPages}`}
                  </Text>
                </HStack>

                {/* AI Metadata */}
                {aiMetadata && searchType === "smart" && (
                  <Card.Root size="sm">
                    <Card.Body>
                      <VStack gap={2} align="start">
                        <HStack gap={2}>
                          <Text fontSize="sm" fontWeight="semibold">🧠 AI Analysis:</Text>
                          <Badge colorPalette="purple" variant="outline">
                            {Math.round(aiMetadata.confidence * 100)}% confidence
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                          Processed in {aiMetadata.processing_time_ms}ms using {aiMetadata.ai_provider}
                        </Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                )}
              </VStack>

              <AnimatedList staggerDelay={0.1} direction="up">
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                  {servers.map((server, index) => (
                    <AnimatedCard.Root
                      key={server.domain}
                      staggerDelay={index * 0.05}
                      hoverScale={1.03}
                      hoverY={-8}
                      borderOnHover
                      glowOnHover={server.verified}
                    >
                      <AnimatedCard.Body staggerChildren staggerDelay={0.05}>
                        <VStack gap={4} align="start">
                          {/* Header */}
                          <VStack gap={2} align="start" width="full">
                            <HStack justify="space-between" width="full">
                              <VStack align="start" gap={1}>
                                <Heading size="sm">{server.name || server.domain}</Heading>
                                <Text fontSize="xs" color="gray.500">
                                  {server.domain}
                                </Text>
                              </VStack>
                              <VStack align="end" gap={1}>
                                {server.verified && (
                                  <Badge colorPalette="green" variant="solid" size="sm">
                                    ✓ Verified
                                  </Badge>
                                )}
                                <Badge
                                  colorPalette={getHealthColor(server.health)}
                                  variant="outline"
                                  size="sm"
                                >
                                  {server.health}
                                </Badge>
                              </VStack>
                            </HStack>

                            {server.description && (
                              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                                {server.description}
                              </Text>
                            )}
                          </VStack>

                          {/* Transport & Performance */}
                          <VStack gap={2} align="start" width="full">
                            <HStack gap={4} width="full">
                              <HStack gap={1}>
                                <Icon color="blue.500"><FaPlug /></Icon>
                                <Text fontSize="xs" fontWeight="semibold">
                                  {server.transport || 'HTTP'}
                                </Text>
                              </HStack>
                              <HStack gap={1}>
                                <Icon color="green.500"><FaCheckCircle /></Icon>
                                <Text fontSize="xs">
                                  {server.response_time_ms}ms
                                </Text>
                              </HStack>
                              <HStack gap={1}>
                                <Icon color="purple.500"><FaShieldAlt /></Icon>
                                <Text fontSize="xs">
                                  {server.trust_score}/100
                                </Text>
                              </HStack>
                            </HStack>

                            {/* Transport Capabilities */}
                            {server.transport_capabilities && (
                              <HStack gap={1} flexWrap="wrap">
                                {server.transport_capabilities.sse_support?.supports_sse && (
                                  <Badge colorPalette="blue" variant="outline" size="sm">
                                    <Icon><FaStream /></Icon> SSE
                                  </Badge>
                                )}
                                {server.transport_capabilities.session_support?.supports_sessions && (
                                  <Badge colorPalette="green" variant="outline" size="sm">
                                    <Icon><FaCog /></Icon> Sessions
                                  </Badge>
                                )}
                                {server.transport_capabilities.cors_details?.cors_enabled && (
                                  <Badge colorPalette="orange" variant="outline" size="sm">
                                    🌐 CORS
                                  </Badge>
                                )}
                                {server.transport_capabilities.performance?.supports_compression && (
                                  <Badge colorPalette="purple" variant="outline" size="sm">
                                    📦 Gzip
                                  </Badge>
                                )}
                              </HStack>
                            )}
                          </VStack>

                          {/* OpenAPI Documentation */}
                          {server.openapi_documentation && (
                            <VStack gap={2} align="start" width="full">
                              <HStack gap={2}>
                                <Icon color="indigo.500"><FaBook /></Icon>
                                <Text fontSize="sm" fontWeight="semibold">API Documentation</Text>
                                <Badge
                                  colorPalette={server.openapi_documentation.validation.is_valid ? "green" : "red"}
                                  variant="outline"
                                  size="sm"
                                >
                                  {server.openapi_documentation.openapi_version}
                                </Badge>
                              </HStack>
                              <VStack gap={1} align="start" width="full">
                                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                                  {server.openapi_documentation.api_info.title} v{server.openapi_documentation.api_info.version}
                                </Text>
                                <HStack gap={2} fontSize="xs">
                                  <Text>{server.openapi_documentation.endpoints_summary.total_paths} paths</Text>
                                  <Text>•</Text>
                                  <Text>{server.openapi_documentation.endpoints_summary.total_operations} operations</Text>
                                  {server.openapi_documentation.endpoints_summary.has_authentication && (
                                    <>
                                      <Text>•</Text>
                                      <Text color="orange.500">🔐 Auth Required</Text>
                                    </>
                                  )}
                                </HStack>
                                {server.openapi_documentation.endpoints_summary.tags.length > 0 && (
                                  <HStack gap={1} flexWrap="wrap">
                                    {server.openapi_documentation.endpoints_summary.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="subtle" size="sm" colorPalette="gray">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {server.openapi_documentation.endpoints_summary.tags.length > 3 && (
                                      <Text fontSize="xs" color="gray.500">
                                        +{server.openapi_documentation.endpoints_summary.tags.length - 3} more
                                      </Text>
                                    )}
                                  </HStack>
                                )}
                              </VStack>
                            </VStack>
                          )}

                          {/* Tools & Resources */}
                          {(server.tools?.length || server.resources?.length) && (
                            <VStack gap={2} align="start" width="full">
                              <HStack gap={4} width="full">
                                {server.tools?.length && (
                                  <HStack gap={1}>
                                    <Icon color="blue.500"><FaCog /></Icon>
                                    <Text fontSize="xs" fontWeight="semibold">
                                      {server.tools.length} tools
                                    </Text>
                                  </HStack>
                                )}
                                {server.resources?.length && (
                                  <HStack gap={1}>
                                    <Icon color="green.500"><FaDatabase /></Icon>
                                    <Text fontSize="xs" fontWeight="semibold">
                                      {server.resources.length} resources
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                            </VStack>
                          )}

                          {/* MCP Capabilities */}
                          {server.capabilities.length > 0 && (
                            <VStack gap={2} align="start" width="full">
                              <Text fontSize="sm" fontWeight="semibold">
                                MCP Capabilities:
                              </Text>
                              <HStack gap={1} flexWrap="wrap">
                                {server.capabilities.map((cap) => (
                                  <Badge key={cap} variant="outline" size="sm" colorPalette="blue">
                                    {cap}
                                  </Badge>
                                ))}
                              </HStack>
                            </VStack>
                          )}

                          {/* Actions */}
                          <HStack justify="space-between" width="full" pt={2}>
                            <VStack align="start" gap={0}>
                              <Text fontSize="xs" color="gray.500">
                                {server.endpoint}
                              </Text>
                            </VStack>
                            <HStack gap={2}>
                              {server.openapi_documentation?.spec_url && (
                                <AnimatedButton
                                  size="sm"
                                  variant="outline"
                                  colorPalette="indigo"
                                  hoverScale={1.05}
                                  clickScale={0.95}
                                  rippleEffect
                                  onClick={() => window.open(server.openapi_documentation?.spec_url, '_blank')}
                                >
                                  <Icon><FaBook /></Icon>
                                  API Docs
                                </AnimatedButton>
                              )}
                              <AnimatedButton
                                size="sm"
                                variant="solid"
                                colorPalette="blue"
                                hoverScale={1.05}
                                clickScale={0.95}
                                rippleEffect
                              >
                                <Icon><FaPlug /></Icon>
                                Connect
                              </AnimatedButton>
                            </HStack>
                          </HStack>
                        </VStack>
                      </AnimatedCard.Body>
                    </AnimatedCard.Root>
                  ))}
                </SimpleGrid>
              </AnimatedList>

              {/* Pagination */}
              {totalPages > 1 && searchType !== "smart" && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  disabled={loading}
                />
              )}
            </VStack>
          )}

          {/* No Results */}
          {!loading && searchQuery && servers.length === 0 && !error && (
            <Card.Root>
              <Card.Body>
                <VStack gap={4} py={8} textAlign="center">
                  <Text fontSize="4xl">🔍</Text>
                  <VStack gap={2}>
                    <Heading size="md">No servers found</Heading>
                    <Text color="gray.600" _dark={{ color: "gray.300" }}>
                      Try adjusting your search query or filters
                    </Text>
                  </VStack>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </Container>

      <Footer />
    </Box>
  )
}
