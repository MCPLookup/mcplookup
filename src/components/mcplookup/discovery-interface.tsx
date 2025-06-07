"use client"

import { useState } from "react"
import { Box, Input, Button, VStack, HStack, Text, Badge, Tabs } from "@chakra-ui/react"

interface SearchMode {
  id: string
  label: string
  placeholder: string
}

interface DiscoveryInterfaceProps {
  searchModes: SearchMode[]
  quickSearches: string[]
}

export function DiscoveryInterface({ searchModes, quickSearches }: DiscoveryInterfaceProps) {
  const [activeMode, setActiveMode] = useState(searchModes[0]?.id || "smart")
  const [searchQuery, setSearchQuery] = useState("")

  const currentMode = searchModes.find(mode => mode.id === activeMode) || searchModes[0]

  return (
    <VStack gap={6} w="full">
      {/* Search Mode Tabs */}
      <Tabs.Root value={activeMode} onValueChange={(details) => setActiveMode(details.value)}>
        <Tabs.List>
          {searchModes.map((mode) => (
            <Tabs.Trigger key={mode.id} value={mode.id}>
              {mode.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {/* Search Input */}
      <Box w="full" position="relative">
        <HStack gap={3}>
          <Input
            placeholder={currentMode.placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="lg"
            bg="white"
            borderColor="gray.300"
            _focus={{ borderColor: "blue.400", shadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
            _hover={{ borderColor: "gray.400" }}
          />
          <Button
            colorPalette="blue"
            size="lg"
            px={8}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            🔍 Discover
          </Button>
        </HStack>
      </Box>

      {/* Quick Searches */}
      <Box w="full">
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
          Quick searches:
        </Text>
        <VStack gap={2} align="stretch">
          {quickSearches.map((search, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              justifyContent="flex-start"
              colorPalette="gray"
              onClick={() => setSearchQuery(search)}
              _hover={{ bg: "gray.50", borderColor: "blue.300" }}
            >
              <Text fontSize="sm" color="gray.600">
                "{search}"
              </Text>
            </Button>
          ))}
        </VStack>
      </Box>

      {/* Search Results Preview */}
      {searchQuery && (
        <Box
          w="full"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          rounded="lg"
          p={4}
        >
          <HStack gap={2} mb={3}>
            <Text fontSize="sm" fontWeight="medium" color="gray.800">
              Live Discovery Results:
            </Text>
            <Badge colorPalette="green" size="sm">
              Real-time
            </Badge>
          </HStack>
          
          <VStack gap={2} align="stretch">
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              rounded="md"
              p={3}
            >
              <HStack justify="space-between">
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    @modelcontextprotocol/server-filesystem
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    File system operations and management
                  </Text>
                </VStack>
                <Badge colorPalette="green" size="sm">
                  ✅ Available
                </Badge>
              </HStack>
            </Box>

            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              rounded="md"
              p={3}
            >
              <HStack justify="space-between">
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    @modelcontextprotocol/server-git
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    Git repository operations and version control
                  </Text>
                </VStack>
                <Badge colorPalette="green" size="sm">
                  ✅ Available
                </Badge>
              </HStack>
            </Box>

            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              Showing 2 of 12 available MCP servers
            </Text>
          </VStack>
        </Box>
      )}
    </VStack>
  )
}
