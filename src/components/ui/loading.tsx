"use client"

import { Spinner, Box, Text, VStack } from "@chakra-ui/react"

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  color?: string
}

export function LoadingSpinner({
  size = "md",
  color = "blue.500"
}: LoadingSpinnerProps) {
  return (
    <Spinner
      size={size}
      color={color}
    />
  )
}

interface LoadingOverlayProps {
  message?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

export function LoadingOverlay({ 
  message = "Loading...", 
  size = "lg" 
}: LoadingOverlayProps) {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="overlay"
    >
      <VStack
        bg="white"
        p={8}
        rounded="lg"
        shadow="xl"
        gap={4}
      >
        <LoadingSpinner size={size} />
        <Text fontSize="lg" fontWeight="medium">
          {message}
        </Text>
      </VStack>
    </Box>
  )
}

interface LoadingCardProps {
  message?: string
  height?: string
}

export function LoadingCard({ 
  message = "Loading...", 
  height = "200px" 
}: LoadingCardProps) {
  return (
    <Box
      bg="white"
      rounded="lg"
      shadow="md"
      p={8}
      height={height}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack gap={4}>
        <LoadingSpinner size="lg" />
        <Text color="gray.600">
          {message}
        </Text>
      </VStack>
    </Box>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  height?: string
}

export function LoadingSkeleton({ 
  lines = 3, 
  height = "20px" 
}: LoadingSkeletonProps) {
  return (
    <VStack gap={3} align="stretch">
      {Array.from({ length: lines }).map((_, index) => (
        <Box
          key={index}
          height={height}
          bg="gray.200"
          rounded="md"
          opacity={0.7}
        />
      ))}
    </VStack>
  )
}

// Inline loading for buttons
interface InlineLoadingProps {
  text?: string
  size?: "xs" | "sm" | "md"
}

export function InlineLoading({ 
  text = "Loading...", 
  size = "sm" 
}: InlineLoadingProps) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <LoadingSpinner size={size} />
      <Text fontSize={size}>
        {text}
      </Text>
    </Box>
  )
}

// Page loading component
interface PageLoadingProps {
  title?: string
  subtitle?: string
}

export function PageLoading({ 
  title = "Loading Page...", 
  subtitle = "Please wait while we fetch the content" 
}: PageLoadingProps) {
  return (
    <Box
      minH="50vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack gap={6} textAlign="center">
        <LoadingSpinner size="xl" />
        <VStack gap={2}>
          <Text fontSize="xl" fontWeight="semibold">
            {title}
          </Text>
          <Text color="gray.600">
            {subtitle}
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
}

export default {
  Spinner: LoadingSpinner,
  Overlay: LoadingOverlay,
  Card: LoadingCard,
  Skeleton: LoadingSkeleton,
  Inline: InlineLoading,
  Page: PageLoading,
}
