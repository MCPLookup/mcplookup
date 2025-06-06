"use client"

import React, { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Input, Card } from "@chakra-ui/react"
import { RegistrationFlow, RegistrationBenefit, CodeBlock } from "@/components/mcplookup"
import { LinkButton } from "@/components/ui/link-button"
import Link from "next/link"

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
  const [formData, setFormData] = useState<RegistrationData>({
    domain: "",
    endpoint: "",
    capabilities: [],
    contact_email: ""
  })
  const [capabilityInput, setCapabilityInput] = useState("")
  const [verification, setVerification] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

  return (
    <Box minH="100vh" bg="gradient-to-br" gradientFrom="green.50" gradientTo="blue.50">
      <Header />

      <Box maxW="6xl" mx="auto" py={16} px={4}>
        <VStack gap={12} textAlign="center">
          {/* Header */}
          <VStack gap={6}>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              Make Your MCP Tools Discoverable
            </Text>
            <Text fontSize="lg" color="gray.600" maxW="3xl" lineHeight="relaxed">
              Join the growing MCP ecosystem by making your tools discoverable to AI agents worldwide.
              Build the infrastructure that major services will join.
            </Text>
          </VStack>

          {/* Registration Flow */}
          <Box w="full" maxW="4xl">
            <RegistrationFlow
              steps={[
                {
                  number: 1,
                  title: "Get Free API Keys",
                  description: "Sign up and generate your free developer API keys",
                  action: "Create Account",
                  href: "/dashboard"
                },
                {
                  number: 2,
                  title: "Register Your Server",
                  description: "Submit your MCP endpoint with capabilities and metadata",
                  action: "Register Server",
                  href: "#registration-form"
                },
                {
                  number: 3,
                  title: "Verify Domain Ownership",
                  description: "Add a DNS TXT record to prove you own the domain",
                  action: "Verify Domain",
                  technical: true
                },
                {
                  number: 4,
                  title: "Go Live",
                  description: "Your server is now discoverable by all AI agents globally",
                  action: "Monitor Usage",
                  href: "/dashboard"
                }
              ]}
            />
          </Box>

          {/* Benefits */}
          <Box
            w="full"
            maxW="4xl"
            bg="gradient-to-r"
            gradientFrom="green.50"
            gradientTo="blue.50"
            border="2px solid"
            borderColor="green.200"
            rounded="xl"
            p={8}
          >
            <VStack gap={6}>
              <Text fontSize="xl" fontWeight="semibold" color="gray.900">
                Why Register Your MCP Server?
              </Text>
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                <RegistrationBenefit
                  icon="🌍"
                  title="Global Reach"
                  description="Instantly discoverable by AI agents worldwide"
                />
                <RegistrationBenefit
                  icon="📊"
                  title="Usage Analytics"
                  description="Monitor connections, performance, and adoption"
                />
                <RegistrationBenefit
                  icon="🛡️"
                  title="Trust & Verification"
                  description="DNS verification builds user confidence"
                />
              </Box>
            </VStack>
          </Box>

          {/* API Key Notice */}
          <Box
            w="full"
            maxW="4xl"
            bg="blue.50"
            border="1px solid"
            borderColor="blue.200"
            rounded="xl"
            p={6}
          >
            <HStack gap={4} align="start">
              <Box
                w={10}
                h={10}
                bg="blue.100"
                rounded="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text color="blue.600" fontSize="lg">🔑</Text>
              </Box>
              <VStack align="start" gap={3} flex={1}>
                <Text fontSize="lg" fontWeight="semibold" color="blue.900">
                  Free API Key Required
                </Text>
                <Text color="blue.800">
                  Server registration requires a free API key. Discovery is free, but registering your own MCP servers
                  needs authentication to prevent spam and ensure quality.
                </Text>
                <HStack gap={3} flexWrap="wrap">
                  <LinkButton
                    href="/dashboard"
                    colorPalette="blue"
                    size="sm"
                  >
                    🔑 Get Free API Keys
                  </LinkButton>
                  <LinkButton
                    href="/discover"
                    variant="outline"
                    colorPalette="blue"
                    size="sm"
                  >
                    🔍 Discover Servers (Free)
                  </LinkButton>
                </HStack>
              </VStack>
            </HStack>
          </Box>

          {!success ? (
            /* Registration Form */
            <Card.Root id="registration-form" w="full" maxW="2xl" bg="white" shadow="lg">
              <Card.Body p={8}>
                <form onSubmit={handleSubmit}>
                  <VStack gap={6} align="stretch">
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Domain *
                      </Text>
                      <Input
                        placeholder="example.com"
                        value={formData.domain}
                        onChange={(e) => handleInputChange("domain", e.target.value)}
                        required
                      />
                    </VStack>

                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        MCP Endpoint *
                      </Text>
                      <Input
                        type="url"
                        placeholder="https://example.com/mcp"
                        value={formData.endpoint}
                        onChange={(e) => handleInputChange("endpoint", e.target.value)}
                        required
                      />
                    </VStack>

                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Capabilities
                      </Text>
                      <HStack gap={2}>
                        <Input
                          placeholder="Add capability (e.g., email, calendar)"
                          value={capabilityInput}
                          onChange={(e) => setCapabilityInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCapability())}
                          flex={1}
                        />
                        <Button
                          onClick={addCapability}
                          disabled={!capabilityInput.trim()}
                          colorPalette="blue"
                          size="sm"
                        >
                          Add
                        </Button>
                      </HStack>
                      {formData.capabilities.length > 0 && (
                        <HStack gap={2} flexWrap="wrap">
                          {formData.capabilities.map((cap) => (
                            <Badge
                              key={cap}
                              colorPalette="blue"
                              cursor="pointer"
                              onClick={() => removeCapability(cap)}
                              _hover={{ bg: "blue.200" }}
                            >
                              {cap} ×
                            </Badge>
                          ))}
                        </HStack>
                      )}
                    </VStack>

                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Contact Email *
                      </Text>
                      <Input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange("contact_email", e.target.value)}
                        required
                      />
                    </VStack>

                    {error && (
                      <Box bg="red.50" border="1px solid" borderColor="red.200" rounded="md" p={4}>
                        <Text color="red.800">
                          <Text as="span" fontWeight="bold">Error:</Text> {error}
                        </Text>
                      </Box>
                    )}

                    <Button
                      type="submit"
                      disabled={loading || !formData.domain || !formData.endpoint}
                      colorPalette="green"
                      size="lg"
                      w="full"
                      fontWeight="medium"
                    >
                      {loading ? "Registering..." : "🖥️ Register Server"}
                    </Button>
                  </VStack>
                </form>
              </Card.Body>
            </Card.Root>
          ) : (
            /* Verification Instructions */
            <VStack gap={6} w="full" maxW="2xl">
              <Box bg="green.50" border="1px solid" borderColor="green.200" rounded="md" p={4} w="full">
                <Text color="green.800">
                  <Text as="span" fontWeight="bold">Registration Submitted!</Text> Your server has been registered. Complete DNS verification to make it discoverable.
                </Text>
              </Box>

              <Card.Root bg="white" shadow="lg" w="full">
                <Card.Body p={8}>
                  <VStack gap={4} align="stretch">
                    <Text fontSize="lg" fontWeight="semibold">DNS Verification Required</Text>

                    <Text>Add the following TXT record to your DNS configuration:</Text>

                    <Box bg="gray.100" p={4} rounded="md">
                      <VStack gap={2} align="stretch">
                        <Text><Text as="span" fontWeight="bold">Record Type:</Text> TXT</Text>
                        <Text>
                          <Text as="span" fontWeight="bold">Name:</Text>{" "}
                          <Text as="code" bg="gray.200" px={1} rounded="sm">{verification?.dns_record}</Text>
                        </Text>
                        <Text>
                          <Text as="span" fontWeight="bold">Value:</Text>{" "}
                          <Text as="code" bg="gray.200" px={1} rounded="sm">{verification?.token}</Text>
                        </Text>
                      </VStack>
                    </Box>

                    <HStack justify="space-between" align="center">
                      <HStack gap={2}>
                        <Text color={verification?.verified ? "green.500" : "yellow.500"}>
                          {verification?.verified ? "✅" : "⏰"}
                        </Text>
                        <Text>Status: {verification?.verified ? "Verified" : "Pending"}</Text>
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
                      <Box bg="green.50" border="1px solid" borderColor="green.200" rounded="md" p={4}>
                        <Text color="green.800">
                          <Text as="span" fontWeight="bold">Verification Complete!</Text> Your server is now discoverable in the MCP registry.
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            </VStack>
          )}
        </VStack>
      </Box>

      <Footer />
    </Box>
  )
}
