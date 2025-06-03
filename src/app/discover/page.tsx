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
import { FaSearch, FaServer, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"
import { Header } from "@/components/layout/header"
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

  const bgGradient = useColorModeValue(
    "linear-gradient(to bottom right, var(--chakra-colors-blue-50), var(--chakra-colors-purple-50))",
    "linear-gradient(to bottom right, var(--chakra-colors-gray-900), var(--chakra-colors-gray-800))"
  )

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchType === "domain") {
        params.set("domain", searchQuery)
      } else {
        params.set("capability", searchQuery)
      }

      const response = await fetch(`/api/v1/discover?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to search servers")
      }

      const data = await response.json()
      setServers(Array.isArray(data) ? data : [data])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setServers([])
    } finally {
      setLoading(false)
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
                    onClick={handleSearch}
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
                </HStack>
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

          {/* Results */}
          {servers.length > 0 && (
            <VStack gap={4} align="stretch">
              <Heading size="md">
                Found {servers.length} server{servers.length !== 1 ? "s" : ""}
              </Heading>
              
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
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
