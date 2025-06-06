"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Box, Text, VStack, HStack, Badge, Button, Input, Card, Select } from "@chakra-ui/react";
import { LinkButton } from "@/components/ui/link-button";
import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const documentationSections = [
    {
      id: "getting-started",
      title: "🚀 Getting Started",
      description: "New to MCPLookup.org? Learn the basics of dynamic MCP server discovery.",
      items: [
        { title: "What is MCPLookup.org?", href: "/docs/introduction", icon: "🔍", description: "Introduction to dynamic MCP server discovery", difficulty: "Beginner" },
        { title: "Quick Start Guide", href: "/docs/quickstart", icon: "⚡", description: "Get started with MCP discovery in minutes", difficulty: "Beginner" },
        { title: "Architecture Overview", href: "/docs/architecture", icon: "🏗️", description: "System architecture and design principles", difficulty: "Intermediate" },
        { title: "Core Concepts", href: "/docs/concepts", icon: "💡", description: "Key concepts and terminology", difficulty: "Beginner" }
      ]
    },
    {
      id: "user-guides",
      title: "👤 User Guides",
      description: "Step-by-step guides for different user types.",
      items: [
        { title: "Discovering Servers", href: "/docs/discovery", icon: "🔍", description: "Find MCP servers for your needs", difficulty: "Beginner" },
        { title: "Registering Your Server", href: "/docs/registration", icon: "📝", description: "Add your MCP server to the registry", difficulty: "Intermediate" },
        { title: "DNS Verification", href: "/docs/verification", icon: "🔐", description: "Verify domain ownership", difficulty: "Intermediate" },
        { title: "Troubleshooting", href: "/docs/troubleshooting", icon: "🔧", description: "Common issues and solutions", difficulty: "All Levels" }
      ]
    },
    {
      id: "api-reference",
      title: "⚡ API Reference",
      description: "Complete REST API documentation with examples.",
      items: [
        { title: "API Overview", href: "/docs/api", icon: "📋", description: "REST API introduction and basics", difficulty: "Intermediate" },
        { title: "Discovery Endpoints", href: "/docs/api/discovery", icon: "🔍", description: "Find and search MCP servers", difficulty: "Intermediate" },
        { title: "Registration Endpoints", href: "/docs/api/registration", icon: "📝", description: "Register and manage servers", difficulty: "Intermediate" },
        { title: "Interactive API Explorer", href: "/api/docs", icon: "🧪", description: "Live API testing interface", difficulty: "All Levels" }
      ]
    },
    {
      id: "mcp-integration",
      title: "🔗 MCP Integration",
      description: "Native MCP server integration and tools.",
      items: [
        { title: "MCP Discovery Server", href: "/docs/mcp-server", icon: "🔍", description: "Native MCP server for discovery", difficulty: "Advanced" },
        { title: "MCP Tools Reference", href: "/docs/mcp-tools", icon: "🛠️", description: "Available MCP tools and usage", difficulty: "Intermediate" },
        { title: "AI Agent Integration", href: "/docs/ai-integration", icon: "🤖", description: "Integrate with AI agents", difficulty: "Advanced" },
        { title: "SDK Documentation", href: "/docs/sdk", icon: "📦", description: "Official SDKs and libraries", difficulty: "Intermediate" }
      ]
    },
    {
      id: "developers",
      title: "🛠️ Developer Resources",
      description: "For developers contributing to or extending MCPLookup.org.",
      items: [
        { title: "Development Setup", href: "/docs/development", icon: "⚙️", description: "Local development environment", difficulty: "Intermediate" },
        { title: "Contributing Guide", href: "/docs/contributing", icon: "🤝", description: "How to contribute to the project", difficulty: "Intermediate" },
        { title: "Architecture Deep Dive", href: "/docs/architecture-deep", icon: "🏗️", description: "Detailed system architecture", difficulty: "Advanced" },
        { title: "Storage System", href: "/docs/storage", icon: "🗄️", description: "Multi-provider storage architecture", difficulty: "Advanced" }
      ]
    },
    {
      id: "tutorials",
      title: "📚 Tutorials & Examples",
      description: "Step-by-step tutorials and real-world examples.",
      items: [
        { title: "Building Your First Integration", href: "/docs/tutorials/first-integration", icon: "🎯", description: "Complete integration walkthrough", difficulty: "Beginner" },
        { title: "Advanced Discovery Patterns", href: "/docs/tutorials/advanced-discovery", icon: "🔍", description: "Complex discovery scenarios", difficulty: "Advanced" },
        { title: "Production Deployment", href: "/docs/tutorials/deployment", icon: "🚀", description: "Deploy to production", difficulty: "Advanced" },
        { title: "Performance Optimization", href: "/docs/tutorials/performance", icon: "⚡", description: "Optimize for scale", difficulty: "Advanced" }
      ]
    }
  ];

  const filteredSections = documentationSections.filter(section => {
    if (selectedCategory !== "all" && section.id !== selectedCategory) return false;
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return section.title.toLowerCase().includes(searchLower) ||
           section.description.toLowerCase().includes(searchLower) ||
           section.items.some(item =>
             item.title.toLowerCase().includes(searchLower) ||
             item.description.toLowerCase().includes(searchLower)
           );
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "green";
      case "Intermediate": return "yellow";
      case "Advanced": return "red";
      default: return "gray";
    }
  };

  return (
    <Box minH="100vh" bg="white">
      <Header />
      <Box as="main" maxW="6xl" mx="auto" px={4} py={16}>
        <VStack gap={12} textAlign="center">
          {/* Header */}
          <VStack gap={4}>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
              📚 Documentation Hub
            </Text>
            <Text fontSize="lg" color="gray.600" maxW="3xl" lineHeight="relaxed">
              Complete guide to dynamic MCP server discovery infrastructure, from basic usage to advanced integrations and API development.
            </Text>
          </VStack>

          {/* Search and Filter */}
          <Box w="full" maxW="4xl">
            <HStack gap={4} flexDir={{ base: "column", md: "row" }} align="stretch">
              <Box position="relative" flex={1} maxW={{ base: "full", md: "md" }}>
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pl={10}
                />
                <Box
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  pointerEvents="none"
                  color="gray.400"
                >
                  🔍
                </Box>
              </Box>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Categories</option>
                {documentationSections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </HStack>
          </Box>

          {/* Quick Start Cards */}
          <VStack gap={6} w="full" maxW="5xl">
            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
              🚀 Quick Start
            </Text>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} w="full">
              <Link href="/docs/introduction">
                <Card.Root
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _hover={{
                    shadow: "lg",
                    borderColor: "blue.300",
                    bg: "blue.50",
                    transform: "translateY(-2px)"
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                <Card.Body p={6} textAlign="center">
                  <VStack gap={4}>
                    <Text fontSize="4xl">🤔</Text>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      Introduction
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Learn about dynamic MCP server discovery and how it works.
                    </Text>
                    <Button colorPalette="blue" size="sm">
                      📖 Read Introduction
                    </Button>
                  </VStack>
                </Card.Body>
                </Card.Root>
              </Link>

              <Link href="/how-to-use">
                <Card.Root
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _hover={{
                    shadow: "lg",
                    borderColor: "green.300",
                    bg: "green.50",
                    transform: "translateY(-2px)"
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                <Card.Body p={6} textAlign="center">
                  <VStack gap={4}>
                    <Text fontSize="4xl">⚡</Text>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      Quick Start
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Get up and running in minutes with step-by-step installation instructions.
                    </Text>
                    <Button colorPalette="green" size="sm">
                      🚀 Quick Start
                    </Button>
                  </VStack>
                </Card.Body>
                </Card.Root>
              </Link>

              <Link href="/api/docs">
                <Card.Root
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _hover={{
                    shadow: "lg",
                    borderColor: "purple.300",
                    bg: "purple.50",
                    transform: "translateY(-2px)"
                  }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                <Card.Body p={6} textAlign="center">
                  <VStack gap={4}>
                    <Text fontSize="4xl">🔌</Text>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      API Reference
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Complete API documentation with examples and interactive testing tools.
                    </Text>
                    <Button colorPalette="purple" size="sm">
                      🔌 API Docs
                    </Button>
                  </VStack>
                </Card.Body>
                </Card.Root>
              </Link>
            </Box>
          </VStack>

          {/* Documentation Sections */}
          <VStack gap={8} w="full" align="stretch">
            {filteredSections.map((section) => (
              <Card.Root key={section.id} bg="white" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                <Box bg="gray.50" px={6} py={4} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontSize="xl" fontWeight="semibold" color="gray.900">
                    {section.title}
                  </Text>
                  <Text color="gray.600" mt={1}>
                    {section.description}
                  </Text>
                </Box>
                <Card.Body p={6}>
                  <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Card.Root
                          bg="white"
                          borderWidth="1px"
                          borderColor="gray.200"
                          _hover={{
                            shadow: "md",
                            borderColor: "blue.300",
                            bg: "blue.50"
                          }}
                          transition="all 0.2s"
                          cursor="pointer"
                        >
                        <Card.Body p={4}>
                          <HStack gap={3} align="start">
                            <Text fontSize="2xl" flexShrink={0}>
                              {item.icon}
                            </Text>
                            <VStack align="start" gap={1} flex={1} minW={0}>
                              <HStack justify="space-between" align="center" w="full">
                                <Text fontWeight="medium" color="gray.900" lineClamp={1}>
                                  {item.title}
                                </Text>
                                <Badge
                                  colorPalette={getDifficultyColor(item.difficulty)}
                                  size="sm"
                                >
                                  {item.difficulty}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600" lineClamp={2}>
                                {item.description}
                              </Text>
                            </VStack>
                          </HStack>
                        </Card.Body>
                        </Card.Root>
                      </Link>
                    ))}
                  </Box>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>

          {/* Help Section */}
          <Box
            bg="gradient-to-r"
            gradientFrom="blue.50"
            gradientTo="purple.50"
            rounded="xl"
            p={8}
            textAlign="center"
            w="full"
            maxW="4xl"
          >
            <VStack gap={4}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                Need Help?
              </Text>
              <Text color="gray.700">
                Can't find what you're looking for? Check out our community resources or contribute to the project.
              </Text>
              <HStack gap={3} flexDir={{ base: "column", sm: "row" }}>
                <LinkButton
                  href="/discover"
                  colorPalette="blue"
                  size="sm"
                >
                  🔍 Try Discovery
                </LinkButton>
                <LinkButton
                  href="https://github.com/TSavo/mcplookup.org"
                  external
                  colorPalette="gray"
                  size="sm"
                >
                  🐙 GitHub
                </LinkButton>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
      <Footer />
    </Box>
  );
}
