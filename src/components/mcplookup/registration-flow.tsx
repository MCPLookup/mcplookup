"use client"

import { Box, Card, Text, VStack, HStack, Button, Badge } from "@chakra-ui/react"
import { LinkButton } from "@/components/ui/link-button"
import Link from "next/link"

interface RegistrationStep {
  number: number
  title: string
  description: string
  action: string
  href?: string
  technical?: boolean
}

interface RegistrationFlowProps {
  steps: RegistrationStep[]
}

export function RegistrationFlow({ steps }: RegistrationFlowProps) {
  return (
    <Box position="relative">
      {/* Connection Lines */}
      <Box
        position="absolute"
        left="50%"
        top="80px"
        bottom="80px"
        w="2px"
        bg="gradient-to-b"
        gradientFrom="green.200"
        gradientTo="blue.200"
        transform="translateX(-50%)"
        zIndex={0}
        display={{ base: "none", md: "block" }}
      />

      <VStack gap={6} position="relative" zIndex={1}>
        {steps.map((step, index) => (
          <Card.Root
            key={step.number}
            maxW="2xl"
            w="full"
            bg="white"
            borderWidth="2px"
            borderColor={step.technical ? "orange.200" : "green.200"}
            shadow="md"
            _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <Card.Header>
              <HStack gap={4}>
                <Box
                  w={12}
                  h={12}
                  bg={step.technical ? "orange.100" : "green.100"}
                  rounded="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={step.technical ? "orange.600" : "green.600"}
                  fontSize="xl"
                  fontWeight="bold"
                >
                  {step.number}
                </Box>
                
                <VStack align="start" gap={1}>
                  <HStack gap={2}>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      {step.title}
                    </Text>
                    {step.technical && (
                      <Badge colorPalette="orange" size="sm">
                        🔧 Technical
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Step {step.number} of {steps.length}
                  </Text>
                </VStack>
              </HStack>
            </Card.Header>

            <Card.Body>
              <VStack align="stretch" gap={4}>
                <Text color="gray.700" lineHeight="relaxed">
                  {step.description}
                </Text>

                {step.technical && (
                  <Box
                    bg="orange.50"
                    border="1px solid"
                    borderColor="orange.200"
                    rounded="lg"
                    p={4}
                  >
                    <Text fontSize="sm" fontWeight="medium" color="orange.800" mb={2}>
                      🔧 Technical Requirement:
                    </Text>
                    <Text fontSize="sm" color="orange.700">
                      Add a DNS TXT record to prove domain ownership. We'll provide the exact record value.
                    </Text>
                  </Box>
                )}
              </VStack>
            </Card.Body>

            <Card.Footer>
              {step.href ? (
                <LinkButton
                  href={step.href}
                  colorPalette={step.technical ? "orange" : "green"}
                  size="lg"
                  w="full"
                  _hover={{ transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                >
                  {step.action}
                </LinkButton>
              ) : (
                <Button
                  colorPalette={step.technical ? "orange" : "green"}
                  size="lg"
                  w="full"
                  variant="outline"
                  cursor="default"
                >
                  {step.action}
                </Button>
              )}
            </Card.Footer>
          </Card.Root>
        ))}
      </VStack>

      {/* Success Message */}
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
          Your MCP Server is Now Discoverable!
        </Text>
        <Text fontSize="sm" color="green.700">
          AI agents worldwide can now discover and connect to your tools automatically.
        </Text>
      </Box>
    </Box>
  )
}
