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
import { LoadingCard, InlineLoading } from "@/components/ui/loading"
import { toaster } from "@/components/ui/toaster"
import { FaSearch, FaServer, FaCheckCircle, FaExclamationTriangle, FaFilter, FaTimes } from "react-icons/fa"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useColorModeValue } from "@/components/ui/color-mode"

interface MCPServer {
  domain: string
  endpoint: string
  capabilities: string[]
  verified: boolean
  health: "healthy" | "degraded" | "down"
  trust_score: number
  response_time_ms: number
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"domain" | "capability">("domain")
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
  const [showFilters, setShowFilters] = useState(false)

  const bgGradient = useColorModeValue(
    "linear-gradient(to bottom right, var(--chakra-colors-blue-50), var(--chakra-colors-purple-50))",
    "linear-gradient(to bottom right, var(--chakra-colors-gray-900), var(--chakra-colors-gray-800))"
  )

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: searchType,
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.verified && { verified: 'true' }),
        ...(filters.health && { health: filters.health }),
        ...(filters.minTrustScore > 0 && { min_trust_score: filters.minTrustScore.toString() })
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

        toaster.create({
          title: "Search completed",
          description: `Found ${data.servers.length} servers`,
          type: "success",
          duration: 3000,
        })
      } else {
        setServers([])
        setTotalItems(0)
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError("Failed to search for servers. Please try again.")
      setServers([])

      toaster.create({
        title: "Search failed",
        description: "Unable to search for servers. Please try again.",
        type: "error",
        duration: 5000,
      })
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
              Find Model Context Protocol servers by domain or capability
            </Text>
          </VStack>

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
                </HStack>
                
                <HStack gap={2} width="full">
                  <Input
                    placeholder={
                      searchType === "domain" 
                        ? "Enter domain (e.g., gmail.com)" 
                        : "Enter capability (e.g., email)"
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button
                    colorPalette="blue"
                    onClick={() => handleSearch(1)}
                    disabled={loading || !searchQuery.trim()}
                  >
                    {loading ? (
                      <Spinner size="sm" />
                    ) : (
                      <Icon>
                        <FaSearch />
                      </Icon>
                    )}
                  </Button>
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
            <LoadingCard message="Searching for MCP servers..." height="300px" />
          )}

          {/* Results */}
          {!loading && servers.length > 0 && (
            <VStack gap={6} align="stretch">
              <HStack justify="space-between" align="center">
                <Heading size="md">
                  Found {totalItems} server{totalItems !== 1 ? "s" : ""}
                </Heading>
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                  Page {currentPage} of {totalPages}
                </Text>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {servers.map((server) => (
                  <Card.Root key={server.domain}>
                    <Card.Body>
                      <VStack gap={3} align="start">
                        <HStack justify="space-between" width="full">
                          <Heading size="sm">{server.domain}</Heading>
                          {server.verified && (
                            <Badge colorPalette="green" variant="solid">
                              Verified
                            </Badge>
                          )}
                        </HStack>

                        <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                          {server.endpoint}
                        </Text>

                        <HStack>
                          <Icon color={`${getHealthColor(server.health)}.500`}>
                            {React.createElement(getHealthIcon(server.health))}
                          </Icon>
                          <Text fontSize="sm" textTransform="capitalize">
                            {server.health}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            ({server.response_time_ms}ms)
                          </Text>
                        </HStack>

                        <VStack gap={2} align="start" width="full">
                          <Text fontSize="sm" fontWeight="semibold">
                            Capabilities:
                          </Text>
                          <HStack gap={1} flexWrap="wrap">
                            {server.capabilities.map((cap) => (
                              <Badge key={cap} variant="outline" size="sm">
                                {cap}
                              </Badge>
                            ))}
                          </HStack>
                        </VStack>

                        <HStack justify="space-between" width="full">
                          <Text fontSize="sm">
                            Trust Score: <strong>{server.trust_score}/100</strong>
                          </Text>
                          <Button size="sm" variant="outline">
                            Connect
                          </Button>
                        </HStack>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </SimpleGrid>

              {/* Pagination */}
              {totalPages > 1 && (
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
