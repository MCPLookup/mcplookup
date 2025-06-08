"use client"

import { Box, Card, Text, VStack, HStack, Badge } from "@chakra-ui/react"
import { CodeBlock } from "./code-block"

interface InfrastructureComparisonProps {
  type: "static" | "dynamic"
  title: string
  icon: string
  theme: "problem" | "solution"
  workflow: string[]
  codeExample: string
}

export function InfrastructureComparison({
  type,
  title,
  icon,
  theme,
  workflow,
  codeExample
}: InfrastructureComparisonProps) {
  const themeColors = {
    problem: {
      bg: "red.50",
      border: "red.200",
      iconBg: "red.100",
      iconColor: "red.600",
      textColor: "red.800",
      badgeColor: "red"
    },
    solution: {
      bg: "green.50", 
      border: "green.200",
      iconBg: "green.100",
      iconColor: "green.600",
      textColor: "green.800",
      badgeColor: "green"
    }
  }

  const colors = themeColors[theme]

  return (
    <Card.Root
      bg={colors.bg}
      borderColor={colors.border}
      borderWidth="1px"
      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
      transition="all 0.2s"
    >
      <Card.Header>
        <HStack gap={3}>
          <Box
            w={10}
            h={10}
            bg={colors.iconBg}
            rounded="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xl">{icon}</Text>
          </Box>
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="semibold" color={colors.textColor}>
              {title}
            </Text>
            <Badge colorPalette={colors.badgeColor} size="sm">
              {type === "static" ? "Current Reality" : "MCPLookup Infrastructure"}
            </Badge>
          </VStack>
        </HStack>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap={6}>
          {/* Workflow Steps */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" color={colors.textColor} mb={3}>
              How it works:
            </Text>
            <VStack align="stretch" gap={2}>
              {workflow.map((step, index) => (
                <HStack key={index} gap={3}>
                  <Box
                    w={6}
                    h={6}
                    bg={colors.iconBg}
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Text fontSize="xs" fontWeight="bold" color={colors.iconColor}>
                      {index + 1}
                    </Text>
                  </Box>
                  <Text fontSize="sm" color="gray.700">
                    {step}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Code Example */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" color={colors.textColor} mb={3}>
              Configuration:
            </Text>
            <CodeBlock
              language="json"
              code={codeExample}
              theme="dark"
              maxHeight="200px"
            />
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
