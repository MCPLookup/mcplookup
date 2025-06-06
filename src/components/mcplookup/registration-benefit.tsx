"use client"

import { Box, Text, VStack } from "@chakra-ui/react"

interface RegistrationBenefitProps {
  icon: string
  title: string
  description: string
}

export function RegistrationBenefit({ icon, title, description }: RegistrationBenefitProps) {
  return (
    <VStack gap={3} textAlign="center">
      <Box
        w={12}
        h={12}
        bg="green.100"
        rounded="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="2xl"
      >
        {icon}
      </Box>
      
      <VStack gap={1}>
        <Text fontSize="md" fontWeight="semibold" color="gray.900">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.600" textAlign="center">
          {description}
        </Text>
      </VStack>
    </VStack>
  )
}
