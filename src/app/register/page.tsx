"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"

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
  Textarea,
  Spinner,
  Code,
  Badge,
  Icon,
  Field
} from "@chakra-ui/react"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { FaServer, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa"
import { Header } from "@/components/layout/header"
import { useColorModeValue } from "@/components/ui/color-mode"

interface RegistrationData {
  domain: string
  endpoint: string
  capabilities: string[]
  contact_email: string
}

interface VerificationStatus {
  token: string
  verified: boolean
  dns_record: string
}

export default function RegisterPage() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState<RegistrationData>({
    domain: "",
    endpoint: "",
    capabilities: [],
    contact_email: session?.user?.email || ""
  })
  const [capabilityInput, setCapabilityInput] = useState("")
  const [verification, setVerification] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const bgGradient = useColorModeValue(
    "linear-gradient(to bottom right, var(--chakra-colors-green-50), var(--chakra-colors-blue-50))",
    "linear-gradient(to bottom right, var(--chakra-colors-gray-900), var(--chakra-colors-gray-800))"
  )

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCapability = () => {
    if (capabilityInput.trim() && !formData.capabilities.includes(capabilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, capabilityInput.trim()]
      }))
      setCapabilityInput("")
    }
  }

  const removeCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(cap => cap !== capability)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      setError("You must be signed in to register a server")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to register server")
      }

      const data = await response.json()
      setVerification(data)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const checkVerification = async () => {
    if (!verification) return

    try {
      const response = await fetch(`/api/v1/register/verify?domain=${formData.domain}&token=${verification.token}`)
      const data = await response.json()
      
      setVerification(prev => prev ? { ...prev, verified: data.verified } : null)
    } catch (err) {
      console.error("Failed to check verification:", err)
    }
  }

  if (!session) {
    return (
      <Box minH="100vh" css={{ background: bgGradient }}>
        <Header />
        <Container maxW="4xl" py={16}>
          <VStack gap={8} textAlign="center">
            <Heading size="xl">Register MCP Server</Heading>
            <Alert.Root status="warning">
              <Alert.Icon />
              <Alert.Title>Authentication Required</Alert.Title>
              <Alert.Description>
                You must be signed in to register a new MCP server.
              </Alert.Description>
            </Alert.Root>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" css={{ background: bgGradient }}>
      <Header />
      
      <Container maxW="4xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Heading size="xl">Register MCP Server</Heading>
            <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.300" }}>
              Add your Model Context Protocol server to the global registry
            </Text>
          </VStack>

          {!success ? (
            /* Registration Form */
            <Card.Root>
              <Card.Body>
                <form onSubmit={handleSubmit}>
                  <VStack gap={6}>
                    <Field.Root required>
                      <Field.Label>Domain</Field.Label>
                      <Input
                        placeholder="example.com"
                        value={formData.domain}
                        onChange={(e) => handleInputChange("domain", e.target.value)}
                      />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>MCP Endpoint</Field.Label>
                      <Input
                        placeholder="https://example.com/mcp"
                        value={formData.endpoint}
                        onChange={(e) => handleInputChange("endpoint", e.target.value)}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Capabilities</Field.Label>
                      <HStack gap={2}>
                        <Input
                          placeholder="Add capability (e.g., email, calendar)"
                          value={capabilityInput}
                          onChange={(e) => setCapabilityInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCapability())}
                        />
                        <Button onClick={addCapability} disabled={!capabilityInput.trim()}>
                          Add
                        </Button>
                      </HStack>
                      {formData.capabilities.length > 0 && (
                        <HStack gap={2} mt={2} flexWrap="wrap">
                          {formData.capabilities.map((cap) => (
                            <Badge
                              key={cap}
                              colorPalette="blue"
                              variant="solid"
                              cursor="pointer"
                              onClick={() => removeCapability(cap)}
                            >
                              {cap} ×
                            </Badge>
                          ))}
                        </HStack>
                      )}
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>Contact Email</Field.Label>
                      <Input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange("contact_email", e.target.value)}
                      />
                    </Field.Root>

                    {error && (
                      <Alert.Root status="error">
                        <Alert.Icon />
                        <Alert.Title>Error</Alert.Title>
                        <Alert.Description>{error}</Alert.Description>
                      </Alert.Root>
                    )}

                    <Button
                      type="submit"
                      colorPalette="green"
                      size="lg"
                      disabled={loading || !formData.domain || !formData.endpoint}
                      width="full"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" mr={2} />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Icon mr={2}>
                            <FaServer />
                          </Icon>
                          Register Server
                        </>
                      )}
                    </Button>
                  </VStack>
                </form>
              </Card.Body>
            </Card.Root>
          ) : (
            /* Verification Instructions */
            <VStack gap={6} align="stretch">
              <Alert.Root status="success">
                <Alert.Icon />
                <Alert.Title>Registration Submitted!</Alert.Title>
                <Alert.Description>
                  Your server has been registered. Complete DNS verification to make it discoverable.
                </Alert.Description>
              </Alert.Root>

              <Card.Root>
                <Card.Body>
                  <VStack gap={4} align="stretch">
                    <Heading size="md">DNS Verification Required</Heading>
                    
                    <Text>
                      Add the following TXT record to your DNS configuration:
                    </Text>
                    
                    <Box p={4} bg="gray.100" _dark={{ bg: "gray.700" }} borderRadius="md">
                      <VStack gap={2} align="start">
                        <Text fontWeight="semibold">Record Type: TXT</Text>
                        <Text>
                          <strong>Name:</strong> <Code>{verification?.dns_record}</Code>
                        </Text>
                        <Text>
                          <strong>Value:</strong> <Code>{verification?.token}</Code>
                        </Text>
                      </VStack>
                    </Box>

                    <HStack justify="space-between">
                      <HStack>
                        <Icon color={verification?.verified ? "green.500" : "yellow.500"}>
                          {verification?.verified ? <FaCheckCircle /> : <FaClock />}
                        </Icon>
                        <Text>
                          Status: {verification?.verified ? "Verified" : "Pending"}
                        </Text>
                      </HStack>
                      
                      <Button
                        onClick={checkVerification}
                        variant="outline"
                        size="sm"
                      >
                        Check Status
                      </Button>
                    </HStack>

                    {verification?.verified && (
                      <Alert.Root status="success">
                        <Alert.Icon />
                        <Alert.Title>Verification Complete!</Alert.Title>
                        <Alert.Description>
                          Your server is now discoverable in the MCP registry.
                        </Alert.Description>
                      </Alert.Root>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
