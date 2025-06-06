"use client"

import { Box, Text, VStack } from "@chakra-ui/react"

interface TrustMetricProps {
  value: string
  label: string
  icon?: string
  color?: string
  subtitle?: string
}

export function TrustMetric({ value, label, icon, color = "blue", subtitle }: TrustMetricProps) {
  const colorMap = {
    blue: "blue.600",
    green: "green.600",
    purple: "purple.600",
    orange: "orange.600",
    red: "red.600"
  }

  return (
    <VStack gap={2} textAlign="center">
      {icon && (
        <Text fontSize="2xl" mb={1}>
          {icon}
        </Text>
      )}
      <Text fontSize="3xl" fontWeight="bold" color={colorMap[color as keyof typeof colorMap] || "blue.600"}>
        {value}
      </Text>
      <Text fontSize="sm" color="gray.600" fontWeight="medium">
        {label}
      </Text>
      {subtitle && (
        <Text fontSize="xs" color="gray.500">
          {subtitle}
        </Text>
      )}
    </VStack>
  )
}

interface TrustSectionProps {
  children: React.ReactNode
}

export function TrustSection({ children }: TrustSectionProps) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      rounded="xl"
      p={8}
      shadow="sm"
    >
      <VStack gap={6}>
        <VStack gap={2} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            Trusted by Developers Worldwide
          </Text>
          <Text fontSize="md" color="gray.600">
            Enterprise-grade infrastructure you can rely on
          </Text>
        </VStack>
        
        <Box
          display="grid"
          gridTemplateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
          gap={8}
          w="full"
        >
          {children}
        </Box>
      </VStack>
    </Box>
  )
}
