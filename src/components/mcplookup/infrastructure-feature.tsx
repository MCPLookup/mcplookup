"use client"

import { Box, Text, VStack } from "@chakra-ui/react"

interface InfrastructureFeatureProps {
  icon: string
  title: string
  description: string
  color?: string
}

export function InfrastructureFeature({ icon, title, description, color = "blue" }: InfrastructureFeatureProps) {
  const colorMap = {
    blue: { bg: "blue.100", text: "blue.600", title: "gray.900", desc: "gray.600" },
    green: { bg: "green.100", text: "green.600", title: "gray.900", desc: "gray.600" },
    purple: { bg: "purple.100", text: "purple.600", title: "gray.900", desc: "gray.600" },
    orange: { bg: "orange.100", text: "orange.600", title: "gray.900", desc: "gray.600" },
    red: { bg: "red.100", text: "red.600", title: "gray.900", desc: "gray.600" }
  }

  const colors = colorMap[color as keyof typeof colorMap] || colorMap.blue

  return (
    <VStack gap={4} textAlign="center" p={6}>
      <Box
        w={16}
        h={16}
        bg={colors.bg}
        rounded="2xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="2xl"
        color={colors.text}
      >
        {icon}
      </Box>

      <VStack gap={2}>
        <Text fontSize="lg" fontWeight="semibold" color={colors.title}>
          {title}
        </Text>
        <Text fontSize="sm" color={colors.desc} textAlign="center" lineHeight="relaxed">
          {description}
        </Text>
      </VStack>
    </VStack>
  )
}
