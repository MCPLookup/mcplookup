"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button, Card } from "@chakra-ui/react"
import { TrustMetric } from "@/components/mcplookup"
import { LinkButton } from "@/components/ui/link-button"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalServers: 89,
    verifiedServers: 67,
    pendingVerifications: 22,
    activeUsers: 892,
    registrationsToday: 23,
    trainingDataSignals: 156420,
    openStandardsAdoption: 78
  })

  const [recentActivity] = useState([
    { type: 'registration', message: 'New server registered: gmail.com/api/mcp', time: '2 minutes ago', severity: 'success' },
    { type: 'verification', message: 'Domain verified: slack.com', time: '5 minutes ago', severity: 'success' },
    { type: 'alert', message: 'Training data milestone: 150k signals reached', time: '12 minutes ago', severity: 'info' },
    { type: 'user', message: 'New user registration: developer@anthropic.com', time: '18 minutes ago', severity: 'success' },
    { type: 'warning', message: 'Server health check failed: dev.example.com', time: '25 minutes ago', severity: 'warning' }
  ])

  return (
    <Box minH="100vh" bg="white">
      <Header />

      <Box maxW="7xl" mx="auto" py={20} px={4}>
        <VStack gap={12} align="stretch">
          {/* Professional Admin Banner */}
          <Box
            bg="gradient-to-r"
            gradientFrom="blue.600"
            gradientTo="purple.600"
            color="white"
            textAlign="center"
            py={6}
            rounded="xl"
            border="2px solid"
            borderColor="blue.400"
          >
            <HStack justify="center" gap={4} mb={3}>
              <Text fontSize="3xl">👑</Text>
              <Text fontSize="2xl" fontWeight="bold">
                Infrastructure Administration
              </Text>
              <Text fontSize="3xl">👑</Text>
            </HStack>
            <Text fontSize="lg" fontWeight="medium">
              <Text as="span" fontWeight="bold">Monitoring Dynamic Discovery Infrastructure</Text>
            </Text>
            <Text fontSize="sm" mt={2} opacity={0.9}>
              Real-time oversight of the MCP ecosystem
            </Text>
          </Box>

          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              🚀 Admin Dashboard
            </Text>
            <Text fontSize="xl" color="gray.600">
              Infrastructure monitoring and management
            </Text>
          </VStack>

          {/* Infrastructure Metrics */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
            <TrustMetric
              value={stats.trainingDataSignals.toLocaleString()}
              label="Discovery Requests"
              icon="🎯"
              color="blue"
              subtitle="Infrastructure usage"
            />
            <TrustMetric
              value={stats.totalServers.toString()}
              label="Total MCP Servers"
              icon="🖥️"
              color="green"
              subtitle={`+${stats.registrationsToday} today`}
            />
            <TrustMetric
              value={stats.verifiedServers.toString()}
              label="Verified Servers"
              icon="✅"
              color="purple"
              subtitle={`${Math.round((stats.verifiedServers/stats.totalServers)*100)}% verified`}
            />
            <TrustMetric
              value={stats.totalUsers.toLocaleString()}
              label="Total Users"
              icon="👥"
              color="orange"
              subtitle={`${stats.activeUsers} active`}
            />
          </Box>

          {/* Admin Actions Grid */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <Link href="/admin/users">
              <Card.Root
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                _hover={{
                  borderColor: "blue.300",
                  transform: "translateY(-2px)",
                  shadow: "lg"
                }}
                transition="all 0.2s"
                cursor="pointer"
              >
              <Card.Body p={6} textAlign="center">
                <VStack gap={4}>
                  <Text fontSize="4xl">👥</Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    User Management
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Manage user accounts and permissions
                  </Text>
                  <Badge colorPalette="blue" size="sm">
                    {stats.totalUsers.toLocaleString()} users
                  </Badge>
                </VStack>
              </Card.Body>
              </Card.Root>
            </Link>

            <Card.Root
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{
                borderColor: "green.300",
                transform: "translateY(-2px)",
                shadow: "lg"
              }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <Card.Body p={6} textAlign="center">
                <VStack gap={4}>
                  <Text fontSize="4xl">🖥️</Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    Server Management
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Monitor and verify MCP servers
                  </Text>
                  <Badge colorPalette="green" size="sm">
                    {stats.totalServers} servers
                  </Badge>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{
                borderColor: "purple.300",
                transform: "translateY(-2px)",
                shadow: "lg"
              }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <Card.Body p={6} textAlign="center">
                <VStack gap={4}>
                  <Text fontSize="4xl">📊</Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    Analytics
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Infrastructure metrics and insights
                  </Text>
                  <Badge colorPalette="purple" size="sm">
                    Real-time data
                  </Badge>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{
                borderColor: "orange.300",
                transform: "translateY(-2px)",
                shadow: "lg"
              }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <Card.Body p={6} textAlign="center">
                <VStack gap={4}>
                  <Text fontSize="4xl">⚙️</Text>
                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                    System Settings
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Configure infrastructure parameters
                  </Text>
                  <Badge colorPalette="orange" size="sm">
                    Admin only
                  </Badge>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* Professional Summary */}
          <Box
            bg="gradient-to-r"
            gradientFrom="blue.50"
            gradientTo="purple.50"
            border="2px solid"
            borderColor="blue.200"
            rounded="xl"
            p={8}
            textAlign="center"
          >
            <VStack gap={6}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.900">
                Infrastructure Administration
              </Text>
              <Text color="blue.800" maxW="2xl" lineHeight="relaxed">
                Monitor and manage the dynamic discovery infrastructure that powers the MCP ecosystem.
                Ensure reliable service delivery and support ecosystem growth.
              </Text>
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                <Box bg="white" p={4} rounded="lg" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {stats.pendingVerifications}
                  </Text>
                  <Text fontSize="sm" color="blue.700">Pending Verifications</Text>
                </Box>
                <Box bg="white" p={4} rounded="lg" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {stats.registrationsToday}
                  </Text>
                  <Text fontSize="sm" color="green.700">Registrations Today</Text>
                </Box>
                <Box bg="white" p={4} rounded="lg" border="1px solid" borderColor="purple.200">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {stats.trainingDataSignals.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="purple.700">Discovery Requests</Text>
                </Box>
              </Box>
              <HStack gap={4} flexWrap="wrap" justify="center">
                <LinkButton
                  href="/admin/users"
                  colorPalette="blue"
                  size="lg"
                >
                  👥 Manage Users
                </LinkButton>
                <Button
                  variant="outline"
                  colorPalette="blue"
                  size="lg"
                >
                  🖥️ Monitor Servers
                </Button>
                <Button
                  variant="outline"
                  colorPalette="purple"
                  size="lg"
                >
                  📊 View Analytics
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      <Footer />
    </Box>
  )
}
