"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button } from "@chakra-ui/react"
import {
  InfrastructureComparison,
  UserPath,
  WorkflowStep,
  TrustSection,
  TrustMetric,
  DiscoveryFlow,
  MCPToolCategory,
  RegistrationFlow,
  RegistrationBenefit,
  InfrastructureFeature
} from "@/components/mcplookup"
import { LinkButton } from "@/components/ui/link-button"
import Link from "next/link"

export default function HomePage() {
  return (
    <Box minH="100vh" bg="white">
      <Header />

      {/* Hero Section: Professional Infrastructure Focus */}
      <Box as="section" bg="gradient-to-br" gradientFrom="slate.50" gradientTo="blue.50" py={20}>
        <Box maxW="6xl" mx="auto" px={4}>
          <VStack gap={12} textAlign="center">
            <Box
              display="inline-flex"
              alignItems="center"
              bg="orange.100"
              rounded="full"
              px={4}
              py={2}
              mb={6}
            >
              <Text color="orange.700" fontSize="sm" fontWeight="medium">
                ⚡ Dynamic Discovery Infrastructure
              </Text>
            </Box>

            <VStack gap={6}>
              <Text fontSize={{ base: "4xl", md: "6xl" }} fontWeight="bold" color="gray.900" lineHeight="tight">
                AI Tools That
                <Text as="span" display="block" color="blue.600">
                  Discover Themselves
                </Text>
              </Text>

              <Text fontSize={{ base: "lg", md: "xl" }} color="gray.600" maxW="4xl" lineHeight="relaxed">
                The infrastructure that makes AI agents discover and connect to MCP tools dynamically.
                Discover existing tools today, and be ready when major services adopt MCP tomorrow.
                <Text as="span" fontWeight="bold"> No hardcoded lists. Ever.</Text>
              </Text>
            </VStack>

            <HStack gap={4} flexDir={{ base: "column", sm: "row" }}>
              <LinkButton
                href="/discover"
                colorPalette="blue"
                size="lg"
                px={8}
                py={3}
                _hover={{ transform: "translateY(-1px)" }}
                transition="all 0.2s"
              >
                ⚡ Enable Dynamic Discovery
              </LinkButton>
              <LinkButton
                href="/how-to-use"
                variant="outline"
                colorPalette="gray"
                size="lg"
                px={8}
                py={3}
                _hover={{ bg: "gray.50" }}
              >
                🔍 See Available Tools
              </LinkButton>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Dual Path Navigation: Discovery vs Registration */}
      <Box as="section" py={16} bg="white">
        <Box maxW="6xl" mx="auto" px={4}>
          <VStack gap={12} textAlign="center">
            <VStack gap={4}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
                Choose Your Path
              </Text>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Whether you're discovering tools or building them, we've got you covered.
              </Text>
            </VStack>

            <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8} w="full">
              {/* Discovery Path - Majority */}
              <UserPath
                icon="🔍"
                title="I want to discover MCP tools"
                subtitle="For AI developers, researchers, and users"
                description="Find and connect to MCP servers dynamically. No more maintaining hardcoded lists."
                currentBenefits={[
                  "Discover filesystem, database, git MCP tools automatically",
                  "No hardcoded paths or configurations",
                  "Community tools appear automatically",
                  "Your custom MCP servers become discoverable"
                ]}
                futureBenefits={[
                  "When Gmail builds MCP support, it appears automatically",
                  "When Slack adopts MCP, zero config needed",
                  "Any new MCP tool is instantly available"
                ]}
                primaryCTA={{
                  text: "⚡ Enable Dynamic Discovery",
                  href: "/how-to-use",
                  className: "bg-blue-600 hover:bg-blue-700 text-white"
                }}
                secondaryCTA={{
                  text: "📖 Setup Guide",
                  href: "/how-to-use"
                }}
              />

              {/* Registration Path - Minority */}
              <UserPath
                icon="📡"
                title="I want to register my MCP service"
                subtitle="For MCP server developers and service providers"
                description="Make your MCP server discoverable to the entire AI ecosystem. Get analytics and monitoring."
                benefits={[
                  "Your MCP tools become instantly discoverable",
                  "Zero user configuration required",
                  "Join the growing MCP ecosystem",
                  "Be ready when major services adopt MCP"
                ]}
                examples={[
                  "Custom business logic MCP servers",
                  "API integration tools",
                  "Specialized data processors",
                  "Industry-specific tools"
                ]}
                primaryCTA={{
                  text: "🔑 Get API Keys",
                  href: "/dashboard",
                  className: "bg-green-600 hover:bg-green-700 text-white"
                }}
                secondaryCTA={{
                  text: "📋 Registration Guide",
                  href: "/register"
                }}
              />
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* How Dynamic Discovery Works Today */}
      <Box as="section" py={16} bg="white">
        <Box maxW="6xl" mx="auto" px={4}>
          <VStack gap={12} textAlign="center">
            <VStack gap={4}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
                How Dynamic Discovery Works Today
              </Text>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                See real examples with currently available MCP tools
              </Text>
            </VStack>

            <DiscoveryFlow
              steps={[
                {
                  trigger: 'User says: "What development tools are available?"',
                  action: 'AI agent queries MCPLookup discovery infrastructure',
                  result: 'Finds GitHub MCP tools, filesystem tools, database connectors',
                  icon: '🗣️',
                  realistic: true
                },
                {
                  trigger: 'Discovery returns live endpoints',
                  action: 'AI agent connects to available MCP servers',
                  result: 'No hardcoded configuration needed',
                  icon: '🔗',
                  realistic: true
                },
                {
                  trigger: 'Connection established',
                  action: 'AI agent uses tools (file operations, git commands, etc.)',
                  result: 'User gets seamless tool integration',
                  icon: '✅',
                  realistic: true
                }
              ]}
            />

            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8} w="full" maxW="4xl">
              <Box
                bg="green.50"
                rounded="xl"
                p={6}
                border="1px solid"
                borderColor="green.200"
              >
                <Text fontSize="lg" fontWeight="semibold" color="green.800" mb={3}>
                  ✅ Available Today
                </Text>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="green.700">• Development tools (filesystem, git, databases)</Text>
                  <Text fontSize="sm" color="green.700">• Data analysis and processing tools</Text>
                  <Text fontSize="sm" color="green.700">• Custom business logic servers</Text>
                  <Text fontSize="sm" color="green.700">• Community-built MCP tools</Text>
                  <Text fontSize="sm" color="green.700">• Your own MCP servers</Text>
                </VStack>
              </Box>

              <Box
                bg="blue.50"
                rounded="xl"
                p={6}
                border="1px solid"
                borderColor="blue.200"
              >
                <Text fontSize="lg" fontWeight="semibold" color="blue.800" mb={3}>
                  🚀 Coming Soon (When Services Adopt MCP)
                </Text>
                <VStack align="start" gap={2}>
                  <Text fontSize="sm" color="blue.700">• Email services (Gmail, Outlook)</Text>
                  <Text fontSize="sm" color="blue.700">• Communication tools (Slack, Discord)</Text>
                  <Text fontSize="sm" color="blue.700">• Cloud platforms (AWS, Azure, GCP)</Text>
                  <Text fontSize="sm" color="blue.700">• Productivity suites (Office 365, Google Workspace)</Text>
                  <Text fontSize="sm" color="blue.700">• Any service that builds MCP support</Text>
                </VStack>
              </Box>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* From Static Configuration to Dynamic Discovery */}
      <Box as="section" py={16} bg="gray.50">
        <Box maxW="6xl" mx="auto" px={4}>
          <VStack gap={12} textAlign="center">
            <VStack gap={4}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
                From Static Configuration to Dynamic Discovery
              </Text>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Real examples with currently available MCP tools
              </Text>
            </VStack>

            <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8} w="full">
              {/* Static Hell */}
              <InfrastructureComparison
                type="static"
                title="Static Configuration (Current Reality)"
                icon="🔒"
                theme="problem"
                workflow={[
                  "Developer manually configures filesystem MCP server",
                  "Manually adds database connector MCP server",
                  "Manually adds git operations MCP server",
                  "New MCP tools require manual config updates",
                  "Maintenance nightmare grows with each tool"
                ]}
                codeExample={`// Claude Desktop config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"]
    }
    // Must manually add every single tool...
  }
}`}
              />

              {/* Dynamic Paradise */}
              <InfrastructureComparison
                type="dynamic"
                title="Dynamic Discovery (MCPLookup Infrastructure)"
                icon="⚡"
                theme="solution"
                workflow={[
                  "AI agent queries: 'I need file system tools'",
                  "Infrastructure returns available filesystem MCP servers",
                  "AI agent queries: 'I need database tools'",
                  "Infrastructure returns database connectors",
                  "All tools discovered automatically as needed"
                ]}
                codeExample={`// Claude Desktop config.json
{
  "mcpServers": {
    "dynamic-discovery": {
      "command": "npx",
      "args": ["@mcplookup/bridge"]
    }
  }
}
// Discovers filesystem, database, git, and any other
// MCP tools automatically as needed.`}
              />
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Current MCP Ecosystem */}
      <Box as="section" py={16} bg="white">
        <Box maxW="6xl" mx="auto" px={4}>
          <VStack gap={12} textAlign="center">
            <VStack gap={4}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
                Current MCP Ecosystem
              </Text>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Discover and connect to these MCP tools available today
              </Text>
            </VStack>

            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
              <MCPToolCategory
                icon="💻"
                title="Development Tools"
                description="File systems, git operations, databases"
                tools={[
                  "@modelcontextprotocol/server-filesystem",
                  "@modelcontextprotocol/server-git",
                  "@modelcontextprotocol/server-postgres",
                  "@modelcontextprotocol/server-sqlite"
                ]}
                verified={true}
              />

              <MCPToolCategory
                icon="🔧"
                title="Utility Tools"
                description="System operations and integrations"
                tools={[
                  "Custom business logic servers",
                  "API integration tools",
                  "Data processing pipelines",
                  "Workflow automation"
                ]}
                verified={false}
              />

              <MCPToolCategory
                icon="🌟"
                title="Community Tools"
                description="Community-built MCP servers"
                tools={[
                  "Your custom MCP servers",
                  "Open source projects",
                  "Experimental tools",
                  "Specialized integrations"
                ]}
                verified={false}
              />
            </Box>

            <Box
              p={8}
              bg="gradient-to-r"
              gradientFrom="purple.50"
              gradientTo="blue.50"
              border="2px solid"
              borderColor="purple.200"
              rounded="xl"
              textAlign="center"
              maxW="4xl"
            >
              <Text fontSize="2xl" mb={3}>🚀</Text>
              <Text fontSize="xl" fontWeight="semibold" color="gray.900" mb={3}>
                The Future: When Major Services Adopt MCP
              </Text>
              <Text color="gray.700" mb={6} lineHeight="relaxed">
                MCPLookup infrastructure is ready for when Gmail, Slack, GitHub, and other major services
                build MCP servers. When they do, they'll be instantly discoverable with zero configuration changes.
              </Text>
              <Box
                display="inline-flex"
                alignItems="center"
                bg="purple.100"
                rounded="full"
                px={4}
                py={2}
              >
                <Text color="purple.700" fontSize="sm" fontWeight="medium">
                  💡 Be ready for the MCP revolution before it happens
                </Text>
              </Box>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Trust Metrics */}
      <Box as="section" py={16} bg="blue.50">
        <Box maxW="6xl" mx="auto" px={4}>
          <TrustSection>
            <TrustMetric value="500+" label="Registered Servers" />
            <TrustMetric value="99.9%" label="Uptime SLA" />
            <TrustMetric value="<100ms" label="Global Response Time" />
            <TrustMetric value="24/7" label="Health Monitoring" />
          </TrustSection>
        </Box>
      </Box>

      {/* Call to Action Section */}
      <Box as="section" py={16} bg="blue.600">
        <Box maxW="4xl" mx="auto" px={4} textAlign="center">
          <VStack gap={6}>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="white">
              Ready to Enable Dynamic Discovery?
            </Text>
            <Text fontSize="lg" color="blue.100" maxW="2xl" lineHeight="relaxed">
              Join developers building the infrastructure that makes AI tools discoverable.
              Start with available tools today, be ready for the future tomorrow.
            </Text>
            <HStack gap={4} flexDir={{ base: "column", sm: "row" }}>
              <LinkButton
                href="/discover"
                size="lg"
                bg="white"
                color="blue.600"
                _hover={{ bg: "gray.100", transform: "translateY(-1px)" }}
                px={8}
                py={3}
                fontWeight="medium"
                transition="all 0.2s"
              >
                ⚡ Enable Discovery
              </LinkButton>
              <LinkButton
                href="/register"
                variant="outline"
                size="lg"
                borderColor="blue.200"
                color="white"
                _hover={{ bg: "blue.500" }}
                px={8}
                py={3}
              >
                📡 Make Tools Discoverable
              </LinkButton>
            </HStack>
          </VStack>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}
