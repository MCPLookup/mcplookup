"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Box, Text, VStack, HStack, Badge, Button } from "@chakra-ui/react"
import { WorkflowStep, CodeBlock } from "@/components/mcplookup"
import { LinkButton } from "@/components/ui/link-button"
import Link from "next/link"

export default function HowToUsePage() {
  return (
    <Box minH="100vh" bg="white">
      <Header />

      <Box maxW="6xl" mx="auto" py={16} px={4}>
        {/* Hero Section */}
        <VStack gap={12} textAlign="center">
          <VStack gap={6}>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              Enable Dynamic Discovery
            </Text>
            <Text fontSize="lg" color="gray.600" maxW="4xl" lineHeight="relaxed">
              Transform your AI workflow from static configuration to dynamic discovery in minutes.
              Choose the setup method that works best for you.
            </Text>
          </VStack>

          {/* The 3-Step Revolution */}
          <VStack gap={4}>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
              Join the Revolution in 3 Steps
            </Text>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Transform your AI workflow from static to dynamic in minutes
            </Text>
          </VStack>

          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8} w="full" maxW="5xl">
            <WorkflowStep
              number="1"
              title="Install the Bridge"
              description="One command replaces all hardcoded server lists"
              cta="🐳 Get Started"
              ctaLink="#docker-setup"
            />
            <WorkflowStep
              number="2"
              title="Configure Once"
              description="Replace your entire MCP server config with one universal bridge"
              cta="⚙️ Configure"
              ctaLink="#configuration"
            />
            <WorkflowStep
              number="3"
              title="Discover Everything"
              description="Ask for any tool and watch the magic happen"
              cta="🚀 Discover"
              ctaLink="/discover"
            />
          </Box>

          {/* Installation Methods */}
          <VStack gap={4} w="full" maxW="4xl">
            <Text fontSize="xl" fontWeight="semibold" color="gray.900">
              Choose Your Installation Method
            </Text>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
              <Box
                bg="blue.50"
                border="2px solid"
                borderColor="blue.200"
                rounded="xl"
                p={6}
                textAlign="center"
                _hover={{ borderColor: "blue.400", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <Text fontSize="3xl" mb={4}>🐳</Text>
                <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                  Docker (Recommended)
                </Text>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Run the MCP bridge in a container. No local dependencies needed.
                </Text>
                <VStack gap={1} mb={4} fontSize="xs" color="blue.700">
                  <Text>✅ Isolated environment</Text>
                  <Text>✅ Easy deployment</Text>
                  <Text>✅ No dependency conflicts</Text>
                  <Text>✅ Production ready</Text>
                </VStack>
                <LinkButton
                  href="#docker-setup"
                  colorPalette="blue"
                  size="sm"
                  w="full"
                >
                  🐳 Docker Setup
                </LinkButton>
              </Box>

              <Box
                bg="green.50"
                border="2px solid"
                borderColor="green.200"
                rounded="xl"
                p={6}
                textAlign="center"
                _hover={{ borderColor: "green.400", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                <Text fontSize="3xl" mb={4}>📦</Text>
                <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={3}>
                  NPM Package
                </Text>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Install as a Node.js package for direct integration.
                </Text>
                <VStack gap={1} mb={4} fontSize="xs" color="green.700">
                  <Text>✅ Direct integration</Text>
                  <Text>✅ Customizable</Text>
                  <Text>✅ TypeScript support</Text>
                  <Text>✅ Local development</Text>
                </VStack>
                <LinkButton
                  href="#npm-setup"
                  colorPalette="green"
                  size="sm"
                  w="full"
                >
                  📦 NPM Setup
                </LinkButton>
              </Box>
            </Box>
          </VStack>

          {/* Docker Setup */}
          <Box id="docker-setup" w="full" maxW="5xl">
            <VStack gap={8} align="stretch">
              <HStack gap={4} align="center">
                <Text fontSize="3xl">🐳</Text>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.900">
                  Docker Setup (Recommended)
                </Text>
              </HStack>

              <Box
                bg="blue.50"
                borderLeft="4px solid"
                borderColor="blue.400"
                p={4}
                rounded="md"
              >
                <Text color="blue.800" fontWeight="medium">
                  <Text as="span" fontWeight="bold">Easiest way to get started:</Text> Run the MCP bridge in a Docker container with zero local dependencies.
                </Text>
              </Box>

              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <VStack align="stretch" gap={3}>
                  <Text fontWeight="semibold" color="gray.800">📋 Step 1: Get the Bridge</Text>
                  <CodeBlock
                    language="bash"
                    code={`# Clone the repository
git clone https://github.com/TSavo/mcplookup.org
cd mcplookup.org

# Run with Docker Compose
docker-compose -f docker-compose.bridge.yml up -d`}
                    theme="dark"
                  />
                </VStack>

                <VStack align="stretch" gap={3}>
                  <Text fontWeight="semibold" color="gray.800">⚙️ Step 2: Configure Claude Desktop</Text>
                  <CodeBlock
                    language="json"
                    code={`// ~/.config/claude-desktop/config.json
{
  "mcpServers": {
    "universal-bridge": {
      "command": "docker",
      "args": ["exec", "-i", "mcp-universal-bridge", "tsx", "scripts/mcp-bridge.ts"]
    }
  }
}`}
                    theme="dark"
                  />
                </VStack>
              </Box>

              <VStack align="stretch" gap={3}>
                <Text fontWeight="semibold" color="gray.800">🎯 Step 3: Test It Works</Text>
                <Box bg="blue.50" p={4} rounded="lg">
                  <Text color="blue.800" mb={2} fontWeight="medium">
                    In Claude Desktop, try these commands:
                  </Text>
                  <VStack align="start" gap={1} fontSize="sm" color="blue.700">
                    <Text>• "Find filesystem tools"</Text>
                    <Text>• "What development tools are available?"</Text>
                    <Text>• "Show me database connectors"</Text>
                  </VStack>
                </Box>
              </VStack>

              <Box bg="green.50" border="1px solid" borderColor="green.200" rounded="lg" p={4}>
                <Text fontWeight="semibold" color="green.800" mb={2}>✅ Success!</Text>
                <Text color="green.700" fontSize="sm">
                  You now have dynamic access to all MCP servers through the universal bridge running in Docker.
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* NPM Setup */}
          <Box id="npm-setup" w="full" maxW="5xl">
            <VStack gap={8} align="stretch">
              <HStack gap={4} align="center">
                <Text fontSize="3xl">📦</Text>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.900">
                  NPM Package Setup
                </Text>
              </HStack>

              <Box
                bg="green.50"
                borderLeft="4px solid"
                borderColor="green.400"
                p={4}
                rounded="md"
              >
                <Text color="green.800" fontWeight="medium">
                  <Text as="span" fontWeight="bold">For developers:</Text> Install the MCP bridge as a Node.js package for direct integration.
                </Text>
              </Box>

              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <VStack align="stretch" gap={3}>
                  <Text fontWeight="semibold" color="gray.800">📋 Step 1: Install Package</Text>
                  <CodeBlock
                    language="bash"
                    code={`# Install globally
npm install -g @mcplookup/bridge

# Or install locally
npm install @mcplookup/bridge

# Or use npx (no install)
npx @mcplookup/bridge`}
                    theme="dark"
                  />
                </VStack>

                <VStack align="stretch" gap={3}>
                  <Text fontWeight="semibold" color="gray.800">⚙️ Step 2: Configure Claude Desktop</Text>
                  <CodeBlock
                    language="json"
                    code={`// ~/.config/claude-desktop/config.json
{
  "mcpServers": {
    "universal-bridge": {
      "command": "npx",
      "args": ["@mcplookup/bridge"]
    }
  }
}`}
                    theme="dark"
                  />
                </VStack>
              </Box>

              <Box bg="blue.50" border="1px solid" borderColor="blue.200" rounded="lg" p={4}>
                <Text fontWeight="semibold" color="blue.800" mb={2}>💡 Pro Tip</Text>
                <Text color="blue.700" fontSize="sm">
                  The NPM package is perfect for development and custom integrations. You can also import the bridge
                  programmatically in your own Node.js applications.
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Call to Action */}
          <Box
            w="full"
            maxW="4xl"
            bg="gradient-to-r"
            gradientFrom="blue.50"
            gradientTo="purple.50"
            border="2px solid"
            borderColor="blue.200"
            rounded="xl"
            p={8}
            textAlign="center"
          >
            <Text fontSize="2xl" mb={3}>🎉</Text>
            <Text fontSize="xl" fontWeight="semibold" color="gray.900" mb={3}>
              Ready to Enable Dynamic Discovery?
            </Text>
            <Text color="gray.700" mb={6} lineHeight="relaxed">
              Once you have the bridge running, you can discover and connect to any MCP server dynamically.
              No more maintaining hardcoded lists!
            </Text>
            <HStack gap={4} justify="center" flexDir={{ base: "column", sm: "row" }}>
              <LinkButton
                href="/discover"
                colorPalette="blue"
                size="lg"
                px={8}
              >
                🔍 Start Discovering
              </LinkButton>
              <LinkButton
                href="/register"
                variant="outline"
                colorPalette="blue"
                size="lg"
                px={8}
              >
                📡 Register Your Tools
              </LinkButton>
            </HStack>
          </Box>
        </VStack>
      </Box>

      <Footer />
    </Box>

  )
}
