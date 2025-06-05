"use client"

import React, { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard from "@/components/ui/animated-card"

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
  const [searchType, setSearchType] = useState<"domain" | "capability" | "smart">("smart")
  const [servers, setServers] = useState<MCPServer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const endpoint = searchType === "smart" ? '/api/v1/discover/smart' : '/api/v1/discover'

      let response
      if (searchType === "smart") {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intent: searchQuery,
            context: { max_results: 20 }
          })
        })
      } else {
        const params = new URLSearchParams({
          q: searchQuery,
          type: searchType,
          limit: '20'
        })
        response = await fetch(`${endpoint}?${params}`)
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      setServers(data.servers || [])
    } catch (err) {
      console.error('Search error:', err)
      setError("Failed to search for servers. Please try again.")
      setServers([])
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-5xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover MCP Servers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find Model Context Protocol servers using AI-powered search, domain lookup, or capability matching.
          </p>
        </div>

        {/* Search Interface */}
        <AnimatedCard.Root hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-6">
              <div className="space-y-4">
                {/* Search Type Tabs */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setSearchType("smart")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchType === "smart"
                        ? "bg-slate-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    🧠 AI Search
                  </button>
                  <button
                    onClick={() => setSearchType("domain")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchType === "domain"
                        ? "bg-slate-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    🌐 Domain
                  </button>
                  <button
                    onClick={() => setSearchType("capability")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      searchType === "capability"
                        ? "bg-slate-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    🔧 Capability
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={
                      searchType === "smart"
                        ? "Ask in natural language: 'Find email servers like Gmail'"
                        : searchType === "domain"
                        ? "Enter domain: gmail.com"
                        : "Enter capability: email, calendar, etc."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                  <AnimatedButton
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    variant="solid"
                    size="lg"
                    hoverScale={1.02}
                    className="bg-slate-700 hover:bg-slate-800 text-white px-6"
                  >
                    {loading ? "Searching..." : "🔍 Search"}
                  </AnimatedButton>
                </div>

                {/* Search Type Description */}
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    {searchType === "smart" && "AI-powered search understands natural language queries"}
                    {searchType === "domain" && "Find servers by their domain name"}
                    {searchType === "capability" && "Search by what the server can do"}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

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
