"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Card, Tabs, Progress } from "@chakra-ui/react"
import { DashboardWalkthrough } from "@/components/onboarding/dashboard-walkthrough"
import { ApiKeysTab } from "@/components/dashboard/api-keys-tab"
import { TrustMetric, InfrastructureFeature } from "@/components/mcplookup"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('servers')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      // Check if onboarding is forced via URL parameter
      const forceOnboarding = searchParams.get('onboarding') === 'true'

      if (forceOnboarding) {
        setShowOnboarding(true)
        setNeedsOnboarding(true)
        return
      }

      // Check if user needs onboarding
      const response = await fetch('/api/v1/onboarding')
      const data = await response.json()

      if (data.success && data.needsOnboarding) {
        setShowOnboarding(true)
        setNeedsOnboarding(true)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setNeedsOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    setNeedsOnboarding(false)
  }

  // Mock data - in real app this would come from API
  const userServers = [
    {
      id: 1,
      domain: "mycompany.com",
      endpoint: "https://api.mycompany.com/mcp",
      status: "healthy",
      verified: true,
      lastSeen: "2 minutes ago",
      capabilities: ["email", "calendar", "crm"],
      trustScore: 92,
      monthlyRequests: 15420
    },
    {
      id: 2,
      domain: "dev.mycompany.com",
      endpoint: "https://dev-api.mycompany.com/mcp",
      status: "warning",
      verified: false,
      lastSeen: "1 hour ago",
      capabilities: ["testing", "development"],
      trustScore: 78,
      monthlyRequests: 3240
    }
  ]

  const stats = {
    totalServers: 2,
    totalRequests: 18660,
    averageTrustScore: 85,
    verifiedServers: 1
  }

  return (
    <Box minH="100vh" bg="white">
      <Header />

      {/* Onboarding Walkthrough */}
      <DashboardWalkthrough
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />

      <Box maxW="7xl" mx="auto" py={20} px={4}>
        {/* Professional Infrastructure Banner */}
        <Box
          bg="gradient-to-r"
          gradientFrom="blue.600"
          gradientTo="purple.600"
          color="white"
          textAlign="center"
          py={6}
          mb={12}
          rounded="xl"
          border="2px solid"
          borderColor="blue.400"
        >
          <HStack justify="center" gap={3} mb={2}>
            <Text fontSize="2xl">⚡</Text>
            <Text fontSize="xl" fontWeight="bold">
              INFRASTRUCTURE CONTROL CENTER
            </Text>
            <Text fontSize="2xl">⚡</Text>
          </HStack>
          <Text fontSize="sm" opacity={0.9}>
            Monitor your contribution to the dynamic discovery infrastructure
          </Text>
        </Box>

        {/* Header */}
        <VStack gap={12} textAlign="center">
          <VStack gap={4}>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              🚀 Developer Dashboard
            </Text>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Manage your MCP servers, monitor health, and track discovery metrics
            </Text>
          </VStack>

          {/* Stats Overview */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6} w="full">
            <TrustMetric
              value={stats.totalServers.toString()}
              label="Registered Servers"
              icon="🖥️"
              color="blue"
            />
            <TrustMetric
              value={stats.totalRequests.toLocaleString()}
              label="Monthly Requests"
              icon="📊"
              color="green"
            />
            <TrustMetric
              value={stats.averageTrustScore.toString()}
              label="Avg Trust Score"
              icon="⭐"
              color="orange"
            />
            <TrustMetric
              value={stats.verifiedServers.toString()}
              label="Verified Servers"
              icon="✅"
              color="purple"
            />
          </Box>

          {/* Tab Navigation */}
          <Box w="full">
            <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)} variant="enclosed">
              <Tabs.List>
                <Tabs.Trigger value="servers">
                  <HStack gap={2}>
                    <Text>🖥️ My Servers</Text>
                    <Badge colorPalette="gray" size="sm">{stats.totalServers}</Badge>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="domains">
                  <HStack gap={2}>
                    <Text>🌐 Domains</Text>
                    <Badge colorPalette="gray" size="sm">2</Badge>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="api-keys">🔑 API Keys</Tabs.Trigger>
                <Tabs.Trigger value="analytics">📊 Analytics</Tabs.Trigger>
                <Tabs.Trigger value="profile">👤 Profile</Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="servers">
                <VStack gap={6} align="stretch">
                  <HStack justify="space-between" align="center">
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                      My MCP Servers
                    </Text>
                    <HStack gap={3}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        🔄 Refresh Status
                      </Button>
                      <Button
                        as={Link}
                        href="/register"
                        colorPalette="blue"
                        size="sm"
                      >
                        ➕ Add New Server
                      </Button>
                    </HStack>
                  </HStack>

                  {/* Infrastructure Impact Alert */}
                  <Box
                    bg="gradient-to-r"
                    gradientFrom="blue.50"
                    gradientTo="purple.50"
                    border="2px solid"
                    borderColor="blue.300"
                    rounded="lg"
                    p={4}
                  >
                    <HStack gap={3} align="start">
                      <Text fontSize="2xl">⚡</Text>
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold" color="blue.800">
                          Infrastructure Impact
                        </Text>
                        <Text color="blue.700" fontSize="sm">
                          <Text as="span" fontWeight="bold">Your servers are strengthening the dynamic discovery infrastructure.</Text>
                          {" "}Every registered server makes AI tools more discoverable and reduces dependency on hardcoded lists.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  <VStack gap={4} align="stretch">
                    {userServers.map((server) => (
                      <Card.Root
                        key={server.id}
                        bg="white"
                        borderWidth="1px"
                        borderColor="gray.200"
                        _hover={{
                          borderColor: "blue.300",
                          shadow: "lg",
                          transform: "translateY(-1px)"
                        }}
                        transition="all 0.2s"
                      >
                        <Card.Body p={6}>
                          <VStack align="stretch" gap={4}>
                            <HStack justify="space-between" align="start">
                              <VStack align="start" gap={2} flex={1}>
                                <HStack gap={3} align="center">
                                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                                    {server.domain}
                                  </Text>
                                  {server.verified && (
                                    <Badge colorPalette="green" size="sm">✅ Verified</Badge>
                                  )}
                                  <Badge
                                    colorPalette={server.status === 'healthy' ? 'green' : 'yellow'}
                                    size="sm"
                                  >
                                    <Box
                                      w={2}
                                      h={2}
                                      rounded="full"
                                      bg={server.status === 'healthy' ? 'green.500' : 'yellow.500'}
                                      mr={2}
                                      animation={server.status === 'healthy' ? 'pulse 2s infinite' : undefined}
                                    />
                                    {server.status === 'healthy' ? 'Healthy' : 'Warning'}
                                  </Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600" fontFamily="mono" bg="gray.50" px={2} py={1} rounded="md">
                                  {server.endpoint}
                                </Text>
                              </VStack>
                              <HStack gap={2}>
                                <Button variant="outline" size="sm">📊 Analytics</Button>
                                <Button variant="outline" size="sm">⚙️ Settings</Button>
                              </HStack>
                            </HStack>

                            <Box display="grid" gridTemplateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
                              <Box bg="gray.50" p={3} rounded="lg">
                                <Text fontSize="xs" color="gray.500" mb={1}>Last Seen</Text>
                                <Text fontWeight="medium" fontSize="sm">{server.lastSeen}</Text>
                              </Box>
                              <Box bg="gray.50" p={3} rounded="lg">
                                <Text fontSize="xs" color="gray.500" mb={1}>Trust Score</Text>
                                <HStack gap={2} align="center">
                                  <Text fontWeight="medium" fontSize="sm">{server.trustScore}/100</Text>
                                  <Progress
                                    value={server.trustScore}
                                    size="sm"
                                    w={12}
                                    colorPalette={
                                      server.trustScore >= 90 ? 'green' :
                                      server.trustScore >= 70 ? 'yellow' : 'red'
                                    }
                                  />
                                </HStack>
                              </Box>
                              <Box bg="gray.50" p={3} rounded="lg">
                                <Text fontSize="xs" color="gray.500" mb={1}>Monthly Requests</Text>
                                <Text fontWeight="medium" fontSize="sm">{server.monthlyRequests.toLocaleString()}</Text>
                              </Box>
                              <Box bg="gray.50" p={3} rounded="lg">
                                <Text fontSize="xs" color="gray.500" mb={1}>Discovery Impact</Text>
                                <Text fontWeight="medium" fontSize="sm" color="green.600">
                                  {server.verified ? 'High' : 'Medium'}
                                </Text>
                              </Box>
                            </Box>

                            <VStack align="stretch" gap={2}>
                              <Text fontSize="xs" color="gray.500">Capabilities:</Text>
                              <HStack gap={2} flexWrap="wrap">
                                {server.capabilities.map((cap) => (
                                  <Badge key={cap} colorPalette="blue" size="sm">
                                    {cap}
                                  </Badge>
                                ))}
                              </HStack>
                            </VStack>

                            <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                              <HStack justify="space-between" align="center">
                                <HStack gap={2}>
                                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                    Infrastructure Contribution:
                                  </Text>
                                  <Badge
                                    colorPalette={server.verified ? 'green' : 'yellow'}
                                    size="sm"
                                  >
                                    {server.verified ? '🎯 Active' : '⏳ Pending'}
                                  </Badge>
                                </HStack>
                                {!server.verified && (
                                  <Button
                                    colorPalette="orange"
                                    size="sm"
                                  >
                                    🚀 Verify Now
                                  </Button>
                                )}
                              </HStack>
                            </Box>
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </VStack>

                  {/* Add Server CTA */}
                  <Card.Root
                    bg="gradient-to-r"
                    gradientFrom="blue.50"
                    gradientTo="purple.50"
                    border="2px solid"
                    borderColor="blue.200"
                    _hover={{
                      borderColor: "blue.400",
                      transform: "translateY(-2px)"
                    }}
                    transition="all 0.2s"
                  >
                    <Card.Body p={8} textAlign="center">
                      <VStack gap={4}>
                        <Text fontSize="4xl">➕</Text>
                        <Text fontSize="xl" fontWeight="bold" color="gray.900">
                          Register More Servers
                        </Text>
                        <Text color="gray.600">
                          Every additional server strengthens the dynamic discovery infrastructure.
                        </Text>
                        <Button
                          as={Link}
                          href="/register"
                          colorPalette="blue"
                          size="lg"
                        >
                          📡 Register Another Server
                        </Button>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="api-keys">
                <ApiKeysTab />
              </Tabs.Content>

              <Tabs.Content value="analytics">
                <VStack gap={6} align="stretch">
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                    Analytics & Infrastructure Impact
                  </Text>

                  <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                    <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
                      <Card.Body p={6}>
                        <HStack justify="space-between" align="center" mb={4}>
                          <Text fontSize="lg" fontWeight="bold" color="gray.900">
                            📈 Discovery Trends
                          </Text>
                          <Badge colorPalette="green" size="sm">Live</Badge>
                        </HStack>
                        <VStack gap={4} align="stretch">
                          <HStack justify="space-between">
                            <Text color="gray.600">This Week</Text>
                            <Text fontWeight="medium" color="green.600">+23% requests</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.600">Top Capability</Text>
                            <Text fontWeight="medium">email (67%)</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.600">Peak Hours</Text>
                            <Text fontWeight="medium">9-11 AM UTC</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.600">Infrastructure Impact</Text>
                            <Text fontWeight="medium" color="blue.600">High</Text>
                          </HStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <Card.Root bg="white" borderWidth="1px" borderColor="gray.200">
                      <Card.Body p={6}>
                        <HStack justify="space-between" align="center" mb={4}>
                          <Text fontSize="lg" fontWeight="bold" color="gray.900">
                            🎯 Performance Metrics
                          </Text>
                          <Badge colorPalette="blue" size="sm">Real-time</Badge>
                        </HStack>
                        <VStack gap={4} align="stretch">
                          <HStack justify="space-between">
                            <Text color="gray.600">Avg Response Time</Text>
                            <Text fontWeight="medium" color="green.600">127ms</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.600">Uptime</Text>
                            <Text fontWeight="medium" color="green.600">99.8%</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.600">Error Rate</Text>
                            <Text fontWeight="medium" color="green.600">0.2%</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.600">Discovery Success</Text>
                            <Text fontWeight="medium" color="green.600">94.3%</Text>
                          </HStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  </Box>
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="domains">
                <VStack gap={6} align="stretch">
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                    Domain Management
                  </Text>
                  <Text color="gray.600">
                    Domain verification coming soon. Focus on server registration for now.
                  </Text>
                </VStack>
              </Tabs.Content>

              <Tabs.Content value="profile">
                <VStack gap={6} align="stretch">
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                    Profile & Settings
                  </Text>
                  <Text color="gray.600">
                    Profile management coming soon. Your servers are already contributing to the infrastructure.
                  </Text>
                </VStack>
              </Tabs.Content>
            </Tabs.Root>
          </Box>

          {/* Professional Call to Action */}
          <Box
            bg="gradient-to-r"
            gradientFrom="blue.50"
            gradientTo="purple.50"
            border="2px solid"
            borderColor="blue.400"
            rounded="xl"
            p={8}
            maxW="5xl"
            mx="auto"
            textAlign="center"
          >
            <HStack justify="center" gap={3} mb={4}>
              <Text fontSize="3xl">⚡</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.800">
                Infrastructure Impact Dashboard
              </Text>
              <Text fontSize="3xl">⚡</Text>
            </HStack>
            <Text fontSize="lg" color="blue.700" mb={6} lineHeight="relaxed">
              <Text as="span" fontWeight="bold">Your servers are strengthening the dynamic discovery infrastructure.</Text>
              <br />Every registered server makes AI tools more discoverable and reduces dependency on hardcoded lists.
            </Text>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
              <Box bg="white" p={4} rounded="lg" border="1px solid" borderColor="blue.200">
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">{stats.totalServers}</Text>
                <Text fontSize="sm" color="blue.700">Your Servers</Text>
              </Box>
              <Box bg="white" p={4} rounded="lg" border="1px solid" borderColor="green.200">
                <Text fontSize="2xl" fontWeight="bold" color="green.600">{stats.totalRequests.toLocaleString()}</Text>
                <Text fontSize="sm" color="green.700">Discovery Requests</Text>
              </Box>
              <Box bg="white" p={4} rounded="lg" border="1px solid" borderColor="purple.200">
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">{stats.averageTrustScore}%</Text>
                <Text fontSize="sm" color="purple.700">Trust Score</Text>
              </Box>
            </Box>
            <HStack gap={4} justify="center" flexWrap="wrap">
              <Button
                as={Link}
                href="/register"
                colorPalette="blue"
                size="lg"
              >
                📡 Register More Servers
              </Button>
              <Button
                as={Link}
                href="/how-to-use"
                variant="outline"
                colorPalette="blue"
                size="lg"
              >
                🌉 Setup Bridge
              </Button>
              <Button
                as={Link}
                href="/open-standards"
                variant="outline"
                colorPalette="purple"
                size="lg"
              >
                🌍 Learn More
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Box>

      <Footer />
    </Box>
  )
}
