"use client"

import { Box, Card, Text, VStack, HStack, Badge } from "@chakra-ui/react"

interface DiscoveryStep {
  trigger: string
  action: string
  result: string
  icon: string
  realistic?: boolean
}

interface DiscoveryFlowProps {
  steps: DiscoveryStep[]
}

export function DiscoveryFlow({ steps }: DiscoveryFlowProps) {
  return (
    <Box position="relative">
      {/* Connection Lines */}
      <Box
        position="absolute"
        left="50%"
        top="60px"
        bottom="60px"
        w="2px"
        bg="gradient-to-b"
        gradientFrom="blue.200"
        gradientTo="purple.200"
        transform="translateX(-50%)"
        zIndex={0}
      />

      <VStack gap={8} position="relative" zIndex={1}>
        {steps.map((step, index) => (
          <Card.Root
            key={index}
            maxW="2xl"
            bg="white"
            borderWidth="2px"
            borderColor="blue.200"
            shadow="lg"
            _hover={{ shadow: "xl", transform: "scale(1.02)" }}
            transition="all 0.2s"
          >
            <Card.Header>
              <HStack gap={4}>
                <Box
                  w={12}
                  h={12}
                  bg="gradient-to-br"
                  gradientFrom="blue.400"
                  gradientTo="purple.500"
                  rounded="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="xl"
                  fontWeight="bold"
                >
                  {step.icon}
                </Box>
                
                <VStack align="start" gap={1}>
                  <HStack gap={2}>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      Step {index + 1}
                    </Text>
                    {step.realistic && (
                      <Badge colorPalette="green" size="sm">
                        ✅ Available Today
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="blue.600" fontWeight="medium">
                    Real-time dynamic discovery
                  </Text>
                </VStack>
              </HStack>
            </Card.Header>

            <Card.Body>
              <VStack align="stretch" gap={4}>
                {/* Trigger */}
                <Box
                  bg="orange.50"
                  border="1px solid"
                  borderColor="orange.200"
                  rounded="lg"
                  p={4}
                >
                  <Text fontSize="sm" fontWeight="medium" color="orange.800" mb={1}>
                    🗣️ User Input:
                  </Text>
                  <Text fontSize="sm" color="orange.700" fontStyle="italic">
                    "{step.trigger}"
                  </Text>
                </Box>

                {/* Action */}
                <Box
                  bg="blue.50"
                  border="1px solid"
                  borderColor="blue.200"
                  rounded="lg"
                  p={4}
                >
                  <Text fontSize="sm" fontWeight="medium" color="blue.800" mb={1}>
                    ⚡ Infrastructure Action:
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    {step.action}
                  </Text>
                </Box>

                {/* Result */}
                <Box
                  bg="green.50"
                  border="1px solid"
                  borderColor="green.200"
                  rounded="lg"
                  p={4}
                >
                  <Text fontSize="sm" fontWeight="medium" color="green.800" mb={1}>
                    ✅ Result:
                  </Text>
                  <Text fontSize="sm" color="green.700">
                    {step.result}
                  </Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>

      {/* Final Success Indicator */}
      <Box
        mt={8}
        p={6}
        bg="gradient-to-r"
        gradientFrom="green.50"
        gradientTo="blue.50"
        border="2px solid"
        borderColor="green.200"
        rounded="xl"
        textAlign="center"
      >
        <Text fontSize="2xl" mb={2}>🎉</Text>
        <Text fontSize="lg" fontWeight="semibold" color="green.800" mb={2}>
          Dynamic Discovery Complete!
        </Text>
        <Text fontSize="sm" color="green.700">
          No hardcoded configuration. No manual updates. Pure infrastructure magic.
        </Text>
      </Box>
    </Box>
  )
}
