"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Card, Tabs } from "@chakra-ui/react"
import { DashboardWalkthrough } from "@/components/onboarding/dashboard-walkthrough"
import { ApiKeysTab } from "@/components/dashboard/api-keys-tab"
import { ProfileTab } from "@/components/dashboard/profile-tab"
import { TrustMetric, InfrastructureFeature } from "@/components/mcplookup"
import { ServerList, BaseServer } from "@/components/servers"
import { LinkButton } from "@/components/ui/link-button"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

// Force dynamic rendering to avoid static generation issues with useSearchParams
export const dynamic = 'force-dynamic'

function DashboardContent() {
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

  const [userServers, setUserServers] = useState<BaseServer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user's servers from API
  useEffect(() => {
    loadUserServers()
  }, [])

  const loadUserServers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/v1/my/servers')
      if (!response.ok) {
        throw new Error('Failed to load servers')
      }
      
      const data = await response.json()
      if (data.success) {
        // Convert API response to BaseServer format
        const convertedServers: BaseServer[] = data.servers.map((server: any): BaseServer => ({
          id: server.id,
          domain: server.domain,
          name: server.name || server.domain,
          description: server.description || '',
          status: server.status === 'verified' ? 'active' : 
                 server.status === 'pending' ? 'pending' : 'inactive',
          ownership_status: 'owned', // User's own servers
          type: 'github',
          registered_at: server.created_at,
          capabilities: server.capabilities || [],
          author: 'You',
          verification_badges: server.verified ? ['verified'] : []
        }))
        
        setUserServers(convertedServers)
      } else {
        setError(data.error || 'Failed to load servers')
      }
    } catch (err) {
      console.error('Error loading user servers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load servers')
    } finally {
      setLoading(false)
    }
  }

  const handleServerEdit = (server: BaseServer) => {
    // Handle server editing - could open a modal or navigate to edit page
    console.log('Edit server:', server)
  }

  const stats = {
    totalServers: userServers.length,
    totalRequests: 18660,
    averageTrustScore: 85,
    verifiedServers: userServers.filter(s => s.verification_badges?.includes('verified')).length
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
                      <LinkButton
                        href="/register"
                        colorPalette="blue"
                        size="sm"
                      >
                        ➕ Add New Server
                      </LinkButton>
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

                  {error && (
                    <Box
                      bg="red.50"
                      border="1px solid"
                      borderColor="red.200"
                      rounded="lg"
                      p={4}
                      textAlign="center"
                    >
                      <Text color="red.800">{error}</Text>
                      <Button
                        mt={2}
                        variant="outline"
                        colorPalette="red"
                        size="sm"
                        onClick={loadUserServers}
                      >
                        Try Again
                      </Button>
                    </Box>
                  )}

                  <VStack gap={4} align="stretch">
                    <ServerList
                      servers={userServers}
                      currentUserId="current-user-id" // In real app, get from session
                      variant="list"
                      showEditButton={true}
                      onEdit={handleServerEdit}
                      loading={loading}
                      emptyMessage={error ? "Failed to load servers" : "No servers registered yet"}
                    />
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
                        <LinkButton
                          href="/register"
                          colorPalette="blue"
                          size="lg"
                        >
                          📡 Register Another Server
                        </LinkButton>
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
                <ProfileTab />
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
              <LinkButton
                href="/register"
                colorPalette="blue"
                size="lg"
              >
                📡 Register More Servers
              </LinkButton>
              <LinkButton
                href="/how-to-use"
                variant="outline"
                colorPalette="blue"
                size="lg"
              >
                🌉 Setup Bridge
              </LinkButton>
              <LinkButton
                href="/open-standards"
                variant="outline"
                colorPalette="purple"
                size="lg"
              >
                🌍 Learn More
              </LinkButton>
            </HStack>
          </Box>
        </VStack>
      </Box>

      <Footer />
    </Box>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
