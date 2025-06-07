"use client"

import { Box, Card, Text, VStack, HStack, Badge, List } from "@chakra-ui/react"

interface MCPToolCategoryProps {
  icon: string
  title: string
  description: string
  tools: string[]
  verified: boolean
}

export function MCPToolCategory({ 
  icon, 
  title, 
  description, 
  tools, 
  verified 
}: MCPToolCategoryProps) {
  return (
    <Card.Root
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      _hover={{ 
        borderColor: "blue.300",
        shadow: "lg",
        transform: "translateY(-2px)"
      }}
      transition="all 0.2s"
      h="full"
    >
      <Card.Header>
        <VStack align="start" gap={3}>
          <HStack gap={3}>
            <Box
              w={10}
              h={10}
              bg="blue.100"
              rounded="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="xl">{icon}</Text>
            </Box>
            
            <VStack align="start" gap={1}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                {title}
              </Text>
              {verified ? (
                <Badge colorPalette="green" size="sm">
                  ✅ Verified Available
                </Badge>
              ) : (
                <Badge colorPalette="blue" size="sm">
                  🚀 Community Built
                </Badge>
              )}
            </VStack>
          </HStack>
          
          <Text fontSize="sm" color="gray.600">
            {description}
          </Text>
        </VStack>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap={3}>
          <Text fontSize="sm" fontWeight="medium" color="gray.800">
            Available tools:
          </Text>
          
          <List.Root gap={2}>
            {tools.map((tool, index) => (
              <List.Item key={index}>
                <List.Indicator>•</List.Indicator>
                <Text fontSize="sm" color="gray.700" fontFamily={tool.startsWith('@') ? 'mono' : 'inherit'}>
                  {tool}
                </Text>
              </List.Item>
            ))}
          </List.Root>
        </VStack>
      </Card.Body>

      <Card.Footer>
        <Box
          w="full"
          bg={verified ? "green.50" : "blue.50"}
          border="1px solid"
          borderColor={verified ? "green.200" : "blue.200"}
          rounded="lg"
          p={3}
          textAlign="center"
        >
          <Text fontSize="xs" color={verified ? "green.700" : "blue.700"}>
            {verified 
              ? "🔍 Discoverable via MCPLookup today"
              : "📡 Register your tools to make them discoverable"
            }
          </Text>
        </Box>
      </Card.Footer>
    </Card.Root>
  )
}
