"use client"

import { Box, Card, Text, VStack, HStack, Button, Badge, List } from "@chakra-ui/react"
import Link from "next/link"

interface UserPathProps {
  icon: string
  title: string
  subtitle: string
  description: string
  currentBenefits?: string[]
  futureBenefits?: string[]
  benefits?: string[]
  examples?: string[]
  workflow?: string[]
  primaryCTA: {
    text: string
    href: string
    className?: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
}

export function UserPath({
  icon,
  title,
  subtitle,
  description,
  currentBenefits,
  futureBenefits,
  benefits,
  examples,
  workflow,
  primaryCTA,
  secondaryCTA
}: UserPathProps) {
  return (
    <Card.Root
      bg="white"
      borderWidth="2px"
      borderColor="gray.200"
      _hover={{ 
        borderColor: "blue.300",
        shadow: "xl",
        transform: "translateY(-4px)"
      }}
      transition="all 0.3s"
      h="full"
    >
      <Card.Header>
        <VStack align="start" gap={3}>
          <Box
            w={12}
            h={12}
            bg="blue.100"
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="2xl">{icon}</Text>
          </Box>
          
          <VStack align="start" gap={1}>
            <Text fontSize="xl" fontWeight="bold" color="gray.900">
              {title}
            </Text>
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
              {subtitle}
            </Text>
          </VStack>
        </VStack>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap={6}>
          <Text color="gray.600" lineHeight="relaxed">
            {description}
          </Text>

          {/* Current Benefits */}
          {currentBenefits && (
            <Box>
              <HStack gap={2} mb={3}>
                <Badge colorPalette="green" size="sm">✅ Available Today</Badge>
              </HStack>
              <List.Root gap={2}>
                {currentBenefits.map((benefit, index) => (
                  <List.Item key={index}>
                    <List.Indicator>•</List.Indicator>
                    <Text fontSize="sm" color="gray.700">{benefit}</Text>
                  </List.Item>
                ))}
              </List.Root>
            </Box>
          )}

          {/* Future Benefits */}
          {futureBenefits && (
            <Box>
              <HStack gap={2} mb={3}>
                <Badge colorPalette="blue" size="sm">🚀 Coming Soon</Badge>
              </HStack>
              <List.Root gap={2}>
                {futureBenefits.map((benefit, index) => (
                  <List.Item key={index}>
                    <List.Indicator>•</List.Indicator>
                    <Text fontSize="sm" color="gray.700">{benefit}</Text>
                  </List.Item>
                ))}
              </List.Root>
            </Box>
          )}

          {/* General Benefits */}
          {benefits && (
            <List.Root gap={2}>
              {benefits.map((benefit, index) => (
                <List.Item key={index}>
                  <List.Indicator>•</List.Indicator>
                  <Text fontSize="sm" color="gray.700">{benefit}</Text>
                </List.Item>
              ))}
            </List.Root>
          )}
        </VStack>
      </Card.Body>

      <Card.Footer>
        <VStack align="stretch" gap={3} w="full">
          <Button
            as={Link}
            href={primaryCTA.href}
            size="lg"
            w="full"
            className={primaryCTA.className}
          >
            {primaryCTA.text}
          </Button>
          
          {secondaryCTA && (
            <Button
              as={Link}
              href={secondaryCTA.href}
              variant="outline"
              size="md"
              w="full"
              colorPalette="gray"
            >
              {secondaryCTA.text}
            </Button>
          )}
        </VStack>
      </Card.Footer>
    </Card.Root>
  )
}
