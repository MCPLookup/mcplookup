"use client"

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Icon,
  SimpleGrid,
  Separator,
  Code
} from "@chakra-ui/react"
import { Card } from "@/components/ui/card"
import { 
  FaBook, 
  FaPlug, 
  FaStream, 
  FaCog, 
  FaDatabase, 
  FaShieldAlt, 
  FaCheckCircle,
  FaGlobe,
  FaCode,
  FaServer,
  FaClock,
  FaLock
} from "react-icons/fa"

interface ServerDetailsModalProps {
  server: {
    domain: string
    endpoint: string
    name?: string
    description?: string
    verified: boolean
    health: string
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
        allowed_headers: string[]
        supports_credentials: boolean
      }
      performance?: {
        avg_response_time_ms: number
        supports_compression: boolean
        max_message_size?: number
      }
      security_features?: {
        ssl_required: boolean
        origin_validation: boolean
      }
    }
    openapi_documentation?: {
      discovered_at: string
      spec_url?: string
      openapi_version: string
      spec_format: string
      api_info: {
        title: string
        version: string
        description?: string
        contact?: {
          name?: string
          email?: string
          url?: string
        }
        license?: {
          name: string
          url?: string
        }
      }
      endpoints_summary: {
        total_paths: number
        total_operations: number
        methods: Record<string, number>
        tags: string[]
        has_authentication: boolean
        auth_schemes: string[]
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
}

export function ServerDetailsModal({ server }: ServerDetailsModalProps) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy": return "green"
      case "degraded": return "yellow"
      case "down": return "red"
      default: return "gray"
    }
  }

  return (
    <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
      {/* Header */}
      <Card.Root>
        <Card.Body>
          <VStack gap={4} align="start">
            <HStack justify="space-between" width="full">
              <VStack align="start" gap={1}>
                <Heading size="lg">{server.name || server.domain}</Heading>
                <Text color="gray.600" _dark={{ color: "gray.300" }}>
                  {server.domain}
                </Text>
                <Code fontSize="sm" colorPalette="blue">
                  {server.endpoint}
                </Code>
              </VStack>
              <VStack align="end" gap={2}>
                {server.verified && (
                  <Badge colorPalette="green" variant="solid">
                    ✓ Verified
                  </Badge>
                )}
                <Badge 
                  colorPalette={getHealthColor(server.health)} 
                  variant="outline"
                >
                  {server.health}
                </Badge>
                <Badge colorPalette="purple" variant="outline">
                  Trust: {server.trust_score}/100
                </Badge>
              </VStack>
            </HStack>

            {server.description && (
              <Text fontSize="md" color="gray.700" _dark={{ color: "gray.300" }}>
                {server.description}
              </Text>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Transport Capabilities */}
      {server.transport_capabilities && (
        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon color="blue.500"><FaPlug /></Icon>
              <Heading size="md">Transport Capabilities</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" fontWeight="semibold">Protocol</Text>
                  <Badge colorPalette="blue" variant="outline">
                    {server.transport_capabilities.primary_transport}
                  </Badge>
                </VStack>

                <VStack align="start" gap={2}>
                  <Text fontSize="sm" fontWeight="semibold">HTTP Methods</Text>
                  <HStack gap={1} flexWrap="wrap">
                    {server.transport_capabilities.supported_methods.map((method) => (
                      <Badge key={method} variant="subtle" size="sm">
                        {method}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>

                <VStack align="start" gap={2}>
                  <Text fontSize="sm" fontWeight="semibold">Performance</Text>
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs">
                      Response: {server.transport_capabilities.performance?.avg_response_time_ms || server.response_time_ms}ms
                    </Text>
                    {server.transport_capabilities.performance?.supports_compression && (
                      <Badge colorPalette="green" variant="outline" size="sm">
                        📦 Compression
                      </Badge>
                    )}
                  </VStack>
                </VStack>
              </SimpleGrid>

              <Separator />

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {/* SSE Support */}
                {server.transport_capabilities.sse_support && (
                  <VStack align="start" gap={2}>
                    <HStack gap={2}>
                      <Icon color="blue.500"><FaStream /></Icon>
                      <Text fontSize="sm" fontWeight="semibold">Server-Sent Events</Text>
                    </HStack>
                    <VStack align="start" gap={1}>
                      <HStack gap={2}>
                        <Text fontSize="xs">SSE Support:</Text>
                        <Badge 
                          colorPalette={server.transport_capabilities.sse_support.supports_sse ? "green" : "red"} 
                          variant="outline" 
                          size="sm"
                        >
                          {server.transport_capabilities.sse_support.supports_sse ? "Yes" : "No"}
                        </Badge>
                      </HStack>
                      {server.transport_capabilities.sse_support.supports_sse && (
                        <>
                          <HStack gap={2}>
                            <Text fontSize="xs">GET Streaming:</Text>
                            <Badge 
                              colorPalette={server.transport_capabilities.sse_support.supports_get_streaming ? "green" : "gray"} 
                              variant="outline" 
                              size="sm"
                            >
                              {server.transport_capabilities.sse_support.supports_get_streaming ? "Yes" : "No"}
                            </Badge>
                          </HStack>
                          <HStack gap={2}>
                            <Text fontSize="xs">POST Streaming:</Text>
                            <Badge 
                              colorPalette={server.transport_capabilities.sse_support.supports_post_streaming ? "green" : "gray"} 
                              variant="outline" 
                              size="sm"
                            >
                              {server.transport_capabilities.sse_support.supports_post_streaming ? "Yes" : "No"}
                            </Badge>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </VStack>
                )}

                {/* Session Support */}
                {server.transport_capabilities.session_support && (
                  <VStack align="start" gap={2}>
                    <HStack gap={2}>
                      <Icon color="green.500"><FaCog /></Icon>
                      <Text fontSize="sm" fontWeight="semibold">Session Management</Text>
                    </HStack>
                    <VStack align="start" gap={1}>
                      <HStack gap={2}>
                        <Text fontSize="xs">Sessions:</Text>
                        <Badge 
                          colorPalette={server.transport_capabilities.session_support.supports_sessions ? "green" : "red"} 
                          variant="outline" 
                          size="sm"
                        >
                          {server.transport_capabilities.session_support.supports_sessions ? "Supported" : "Not Supported"}
                        </Badge>
                      </HStack>
                      {server.transport_capabilities.session_support.session_header_name && (
                        <Text fontSize="xs" color="gray.600">
                          Header: {server.transport_capabilities.session_support.session_header_name}
                        </Text>
                      )}
                    </VStack>
                  </VStack>
                )}
              </SimpleGrid>

              {/* CORS Details */}
              {server.transport_capabilities.cors_details && (
                <>
                  <Separator />
                  <VStack align="start" gap={2}>
                    <HStack gap={2}>
                      <Icon color="orange.500"><FaGlobe /></Icon>
                      <Text fontSize="sm" fontWeight="semibold">CORS Configuration</Text>
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} width="full">
                      <VStack align="start" gap={1}>
                        <Text fontSize="xs" fontWeight="semibold">Status:</Text>
                        <Badge 
                          colorPalette={server.transport_capabilities.cors_details.cors_enabled ? "green" : "red"} 
                          variant="outline"
                        >
                          {server.transport_capabilities.cors_details.cors_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </VStack>
                      {server.transport_capabilities.cors_details.cors_enabled && (
                        <>
                          <VStack align="start" gap={1}>
                            <Text fontSize="xs" fontWeight="semibold">Allowed Origins:</Text>
                            <HStack gap={1} flexWrap="wrap">
                              {server.transport_capabilities.cors_details.allowed_origins.slice(0, 3).map((origin, idx) => (
                                <Badge key={idx} variant="subtle" size="sm">
                                  {origin}
                                </Badge>
                              ))}
                              {server.transport_capabilities.cors_details.allowed_origins.length > 3 && (
                                <Text fontSize="xs" color="gray.500">
                                  +{server.transport_capabilities.cors_details.allowed_origins.length - 3} more
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                          <VStack align="start" gap={1}>
                            <Text fontSize="xs" fontWeight="semibold">Allowed Methods:</Text>
                            <HStack gap={1} flexWrap="wrap">
                              {server.transport_capabilities.cors_details.allowed_methods.map((method, idx) => (
                                <Badge key={idx} variant="subtle" size="sm">
                                  {method}
                                </Badge>
                              ))}
                            </HStack>
                          </VStack>
                          <VStack align="start" gap={1}>
                            <Text fontSize="xs" fontWeight="semibold">Credentials:</Text>
                            <Badge 
                              colorPalette={server.transport_capabilities.cors_details.supports_credentials ? "green" : "gray"} 
                              variant="outline" 
                              size="sm"
                            >
                              {server.transport_capabilities.cors_details.supports_credentials ? "Supported" : "Not Supported"}
                            </Badge>
                          </VStack>
                        </>
                      )}
                    </SimpleGrid>
                  </VStack>
                </>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* OpenAPI Documentation */}
      {server.openapi_documentation && (
        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon color="indigo.500"><FaBook /></Icon>
              <Heading size="md">API Documentation</Heading>
              <Badge 
                colorPalette={server.openapi_documentation.validation.is_valid ? "green" : "red"} 
                variant="outline"
              >
                OpenAPI {server.openapi_documentation.openapi_version}
              </Badge>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <VStack gap={2} align="start">
                <Heading size="sm">{server.openapi_documentation.api_info.title}</Heading>
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
                  Version {server.openapi_documentation.api_info.version}
                </Text>
                {server.openapi_documentation.api_info.description && (
                  <Text fontSize="sm">
                    {server.openapi_documentation.api_info.description}
                  </Text>
                )}
              </VStack>

              <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" fontWeight="semibold">Paths</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.500">
                    {server.openapi_documentation.endpoints_summary.total_paths}
                  </Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" fontWeight="semibold">Operations</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    {server.openapi_documentation.endpoints_summary.total_operations}
                  </Text>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" fontWeight="semibold">Authentication</Text>
                  <Badge 
                    colorPalette={server.openapi_documentation.endpoints_summary.has_authentication ? "orange" : "gray"} 
                    variant="outline"
                  >
                    {server.openapi_documentation.endpoints_summary.has_authentication ? "Required" : "None"}
                  </Badge>
                </VStack>
                <VStack align="start" gap={1}>
                  <Text fontSize="xs" fontWeight="semibold">Format</Text>
                  <Badge variant="outline">
                    {server.openapi_documentation.spec_format.toUpperCase()}
                  </Badge>
                </VStack>
              </SimpleGrid>

              {/* HTTP Methods */}
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="semibold">HTTP Methods</Text>
                <HStack gap={2} flexWrap="wrap">
                  {Object.entries(server.openapi_documentation.endpoints_summary.methods).map(([method, count]) => (
                    <Badge key={method} variant="outline" colorPalette="blue">
                      {method}: {count}
                    </Badge>
                  ))}
                </HStack>
              </VStack>

              {/* Tags */}
              {server.openapi_documentation.endpoints_summary.tags.length > 0 && (
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" fontWeight="semibold">API Tags</Text>
                  <HStack gap={1} flexWrap="wrap">
                    {server.openapi_documentation.endpoints_summary.tags.map((tag) => (
                      <Badge key={tag} variant="subtle" colorPalette="gray">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              )}

              {/* Authentication Schemes */}
              {server.openapi_documentation.endpoints_summary.auth_schemes.length > 0 && (
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" fontWeight="semibold">Authentication Schemes</Text>
                  <HStack gap={1} flexWrap="wrap">
                    {server.openapi_documentation.endpoints_summary.auth_schemes.map((scheme) => (
                      <Badge key={scheme} variant="outline" colorPalette="orange">
                        <Icon><FaLock /></Icon> {scheme}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              )}

              {/* Contact & License */}
              {(server.openapi_documentation.api_info.contact || server.openapi_documentation.api_info.license) && (
                <>
                  <Separator />
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    {server.openapi_documentation.api_info.contact && (
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" fontWeight="semibold">Contact</Text>
                        {server.openapi_documentation.api_info.contact.name && (
                          <Text fontSize="xs">{server.openapi_documentation.api_info.contact.name}</Text>
                        )}
                        {server.openapi_documentation.api_info.contact.email && (
                          <Text fontSize="xs" color="blue.500">
                            {server.openapi_documentation.api_info.contact.email}
                          </Text>
                        )}
                        {server.openapi_documentation.api_info.contact.url && (
                          <Text fontSize="xs" color="blue.500">
                            {server.openapi_documentation.api_info.contact.url}
                          </Text>
                        )}
                      </VStack>
                    )}
                    {server.openapi_documentation.api_info.license && (
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" fontWeight="semibold">License</Text>
                        <Badge variant="outline">
                          {server.openapi_documentation.api_info.license.name}
                        </Badge>
                        {server.openapi_documentation.api_info.license.url && (
                          <Text fontSize="xs" color="blue.500">
                            {server.openapi_documentation.api_info.license.url}
                          </Text>
                        )}
                      </VStack>
                    )}
                  </SimpleGrid>
                </>
              )}

              {/* Validation Status */}
              {!server.openapi_documentation.validation.is_valid && (
                <>
                  <Separator />
                  <VStack align="start" gap={2}>
                    <Text fontSize="sm" fontWeight="semibold" color="red.500">
                      Validation Errors
                    </Text>
                    <VStack align="start" gap={1}>
                      {server.openapi_documentation.validation.validation_errors.map((error, idx) => (
                        <Text key={idx} fontSize="xs" color="red.500">
                          • {error}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Tools & Resources */}
      {(server.tools?.length || server.resources?.length) && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          {/* Tools */}
          {server.tools?.length && (
            <Card.Root>
              <Card.Header>
                <HStack gap={2}>
                  <Icon color="blue.500"><FaCog /></Icon>
                  <Heading size="md">Tools ({server.tools.length})</Heading>
                </HStack>
              </Card.Header>
              <Card.Body>
                <VStack gap={3} align="stretch">
                  {server.tools.slice(0, 5).map((tool, idx) => (
                    <VStack key={idx} align="start" gap={1}>
                      <Text fontSize="sm" fontWeight="semibold">{tool.name}</Text>
                      <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                        {tool.description}
                      </Text>
                    </VStack>
                  ))}
                  {server.tools.length > 5 && (
                    <Text fontSize="xs" color="gray.500">
                      +{server.tools.length - 5} more tools
                    </Text>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
          )}

          {/* Resources */}
          {server.resources?.length && (
            <Card.Root>
              <Card.Header>
                <HStack gap={2}>
                  <Icon color="green.500"><FaDatabase /></Icon>
                  <Heading size="md">Resources ({server.resources.length})</Heading>
                </HStack>
              </Card.Header>
              <Card.Body>
                <VStack gap={3} align="stretch">
                  {server.resources.slice(0, 5).map((resource, idx) => (
                    <VStack key={idx} align="start" gap={1}>
                      <Text fontSize="sm" fontWeight="semibold">{resource.name}</Text>
                      <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                        {resource.description}
                      </Text>
                      <Code fontSize="xs" colorPalette="green">
                        {resource.uri}
                      </Code>
                    </VStack>
                  ))}
                  {server.resources.length > 5 && (
                    <Text fontSize="xs" color="gray.500">
                      +{server.resources.length - 5} more resources
                    </Text>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </SimpleGrid>
      )}
    </VStack>
  )
}
