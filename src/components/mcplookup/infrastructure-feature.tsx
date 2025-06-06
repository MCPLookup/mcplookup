"use client"

import { Box, Text, VStack } from "@chakra-ui/react"

interface InfrastructureFeatureProps {
  icon: string
  title: string
  description: string
}

export function InfrastructureFeature({ icon, title, description }: InfrastructureFeatureProps) {
  return (
    <VStack gap={4} textAlign="center" p={6}>
      <Box
        w={16}
        h={16}
        bg="blue.100"
        rounded="2xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="2xl"
        color="blue.600"
      >
        {icon}
      </Box>
      
      <VStack gap={2}>
        <Text fontSize="lg" fontWeight="semibold" color="white">
          {title}
        </Text>
        <Text fontSize="sm" color="blue.100" textAlign="center" lineHeight="relaxed">
          {description}
        </Text>
      </VStack>
    </VStack>
  )
}
