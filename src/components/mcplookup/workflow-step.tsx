"use client"

import { Box, Card, Text, VStack, Button } from "@chakra-ui/react"
import Link from "next/link"

interface WorkflowStepProps {
  number: string
  title: string
  description: string
  cta: string
  ctaLink: string
}

export function WorkflowStep({ number, title, description, cta, ctaLink }: WorkflowStepProps) {
  return (
    <Card.Root
      bg="white"
      borderWidth="2px"
      borderColor="blue.200"
      _hover={{ 
        borderColor: "blue.400",
        shadow: "xl",
        transform: "translateY(-4px)"
      }}
      transition="all 0.3s"
      h="full"
    >
      <Card.Header>
        <VStack align="center" gap={3}>
          <Box
            w={16}
            h={16}
            bg="gradient-to-br"
            gradientFrom="blue.400"
            gradientTo="purple.500"
            rounded="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontSize="2xl"
            fontWeight="bold"
            shadow="lg"
          >
            {number}
          </Box>
          
          <Text fontSize="xl" fontWeight="bold" color="gray.900" textAlign="center">
            {title}
          </Text>
        </VStack>
      </Card.Header>

      <Card.Body>
        <Text color="gray.600" textAlign="center" lineHeight="relaxed">
          {description}
        </Text>
      </Card.Body>

      <Card.Footer>
        <Button
          as={Link}
          href={ctaLink}
          colorPalette="blue"
          size="lg"
          w="full"
          _hover={{ transform: "translateY(-1px)" }}
          transition="all 0.2s"
        >
          {cta}
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}
