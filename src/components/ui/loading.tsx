"use client"

import { Spinner, Box, Text, VStack, HStack, Progress } from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const MotionBox = motion(Box)
const MotionVStack = motion(VStack)

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  color?: string
  withPulse?: boolean
}

export function LoadingSpinner({
  size = "md",
  color = "blue.500",
  withPulse = false
}: LoadingSpinnerProps) {
  return (
    <MotionBox
      animate={withPulse ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <Spinner
        size={size}
        color={color}
      />
    </MotionBox>
  )
}

interface LoadingOverlayProps {
  message?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  progress?: number
  showProgress?: boolean
}

export function LoadingOverlay({
  message = "Loading...",
  size = "lg",
  progress,
  showProgress = false
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      <MotionBox
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <MotionVStack
          bg="white"
          _dark={{ bg: "gray.800" }}
          p={8}
          rounded="lg"
          shadow="xl"
          gap={4}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <LoadingSpinner size={size} withPulse />
          <Text fontSize="lg" fontWeight="medium">
            {message}
          </Text>
          {showProgress && progress !== undefined && (
            <Box width="200px">
              <Progress value={progress} colorPalette="blue" />
              <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
                {Math.round(progress)}%
              </Text>
            </Box>
          )}
        </MotionVStack>
      </MotionBox>
    </AnimatePresence>
  )
}

interface LoadingCardProps {
  message?: string
  height?: string
  animated?: boolean
}

export function LoadingCard({
  message = "Loading...",
  height = "200px",
  animated = true
}: LoadingCardProps) {
  return (
    <MotionBox
      bg="white"
      _dark={{ bg: "gray.800" }}
      rounded="lg"
      shadow="md"
      p={8}
      height={height}
      display="flex"
      alignItems="center"
      justifyContent="center"
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <MotionVStack
        gap={4}
        initial={animated ? { scale: 0.9 } : {}}
        animate={animated ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <LoadingSpinner size="lg" withPulse />
        <Text color="gray.600" _dark={{ color: "gray.300" }}>
          {message}
        </Text>
      </MotionVStack>
    </MotionBox>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  height?: string
  animated?: boolean
  variant?: "text" | "card" | "avatar" | "custom"
}

export function LoadingSkeleton({
  lines = 3,
  height = "20px",
  animated = true,
  variant = "text"
}: LoadingSkeletonProps) {
  const getSkeletonContent = () => {
    switch (variant) {
      case "card":
        return (
          <MotionVStack gap={4} align="stretch">
            <MotionBox
              height="120px"
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              rounded="md"
              initial={animated ? { opacity: 0.3 } : {}}
              animate={animated ? { opacity: [0.3, 0.7, 0.3] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <MotionBox
              height="20px"
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              rounded="md"
              width="80%"
              initial={animated ? { opacity: 0.3 } : {}}
              animate={animated ? { opacity: [0.3, 0.7, 0.3] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
            <MotionBox
              height="16px"
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              rounded="md"
              width="60%"
              initial={animated ? { opacity: 0.3 } : {}}
              animate={animated ? { opacity: [0.3, 0.7, 0.3] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          </MotionVStack>
        )
      case "avatar":
        return (
          <HStack gap={3}>
            <MotionBox
              width="40px"
              height="40px"
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              rounded="full"
              initial={animated ? { opacity: 0.3 } : {}}
              animate={animated ? { opacity: [0.3, 0.7, 0.3] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <VStack gap={2} align="start" flex={1}>
              <MotionBox
                height="16px"
                bg="gray.200"
                _dark={{ bg: "gray.700" }}
                rounded="md"
                width="70%"
                initial={animated ? { opacity: 0.3 } : {}}
                animate={animated ? { opacity: [0.3, 0.7, 0.3] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
              />
              <MotionBox
                height="14px"
                bg="gray.200"
                _dark={{ bg: "gray.700" }}
                rounded="md"
                width="50%"
                initial={animated ? { opacity: 0.3 } : {}}
                animate={animated ? { opacity: [0.3, 0.7, 0.3] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
            </VStack>
          </HStack>
        )
      default:
        return (
          <VStack gap={3} align="stretch">
            {Array.from({ length: lines }).map((_, index) => (
              <MotionBox
                key={index}
                height={height}
                bg="gray.200"
                _dark={{ bg: "gray.700" }}
                rounded="md"
                initial={animated ? { opacity: 0.3 } : {}}
                animate={animated ? { opacity: [0.3, 0.7, 0.3] } : {}}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.1
                }}
              />
            ))}
          </VStack>
        )
    }
  }

  return getSkeletonContent()
}

// Inline loading for buttons
interface InlineLoadingProps {
  text?: string
  size?: "xs" | "sm" | "md"
  animated?: boolean
}

export function InlineLoading({
  text = "Loading...",
  size = "sm",
  animated = true
}: InlineLoadingProps) {
  return (
    <MotionBox
      display="flex"
      alignItems="center"
      gap={2}
      initial={animated ? { opacity: 0 } : {}}
      animate={animated ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner size={size} />
      <Text fontSize={size}>
        {text}
      </Text>
    </MotionBox>
  )
}

// Page loading component
interface PageLoadingProps {
  title?: string
  subtitle?: string
  animated?: boolean
}

export function PageLoading({
  title = "Loading Page...",
  subtitle = "Please wait while we fetch the content",
  animated = true
}: PageLoadingProps) {
  return (
    <MotionBox
      minH="50vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <MotionVStack
        gap={6}
        textAlign="center"
        initial={animated ? { scale: 0.9 } : {}}
        animate={animated ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <LoadingSpinner size="xl" withPulse />
        <VStack gap={2}>
          <Text fontSize="xl" fontWeight="semibold">
            {title}
          </Text>
          <Text color="gray.600" _dark={{ color: "gray.300" }}>
            {subtitle}
          </Text>
        </VStack>
      </MotionVStack>
    </MotionBox>
  )
}

// Progressive loading with steps
interface ProgressiveLoadingProps {
  steps: string[]
  currentStep: number
  completed?: boolean
}

export function ProgressiveLoading({
  steps,
  currentStep,
  completed = false
}: ProgressiveLoadingProps) {
  return (
    <MotionVStack
      gap={4}
      align="stretch"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Progress
        value={completed ? 100 : (currentStep / steps.length) * 100}
        colorPalette={completed ? "green" : "blue"}
      />
      <VStack gap={2} align="start">
        {steps.map((step, index) => (
          <MotionBox
            key={index}
            display="flex"
            alignItems="center"
            gap={3}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: index <= currentStep ? 1 : 0.5,
              x: 0
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.1
            }}
          >
            <Box
              width="20px"
              height="20px"
              rounded="full"
              bg={
                index < currentStep ? "green.500" :
                index === currentStep ? "blue.500" :
                "gray.300"
              }
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {index < currentStep ? (
                <Text color="white" fontSize="xs">✓</Text>
              ) : index === currentStep ? (
                <LoadingSpinner size="xs" color="white" />
              ) : (
                <Text color="gray.500" fontSize="xs">{index + 1}</Text>
              )}
            </Box>
            <Text
              fontSize="sm"
              color={index <= currentStep ? "gray.900" : "gray.500"}
              _dark={{
                color: index <= currentStep ? "gray.100" : "gray.500"
              }}
            >
              {step}
            </Text>
          </MotionBox>
        ))}
      </VStack>
    </MotionVStack>
  )
}

// Staggered list loading
interface StaggeredListLoadingProps {
  count: number
  variant?: "card" | "text" | "avatar"
}

export function StaggeredListLoading({
  count = 3,
  variant = "card"
}: StaggeredListLoadingProps) {
  return (
    <VStack gap={4} align="stretch">
      {Array.from({ length: count }).map((_, index) => (
        <MotionBox
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <LoadingSkeleton variant={variant} animated />
        </MotionBox>
      ))}
    </VStack>
  )
}

// Search loading with typing effect
interface SearchLoadingProps {
  message?: string
  showDots?: boolean
}

export function SearchLoading({
  message = "Searching",
  showDots = true
}: SearchLoadingProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    if (!showDots) return

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 500)

    return () => clearInterval(interval)
  }, [showDots])

  return (
    <MotionBox
      display="flex"
      alignItems="center"
      gap={3}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner size="sm" withPulse />
      <Text fontSize="md" color="gray.600" _dark={{ color: "gray.300" }}>
        {message}{showDots && dots}
      </Text>
    </MotionBox>
  )
}

export default {
  Spinner: LoadingSpinner,
  Overlay: LoadingOverlay,
  Card: LoadingCard,
  Skeleton: LoadingSkeleton,
  Inline: InlineLoading,
  Page: PageLoading,
  Progressive: ProgressiveLoading,
  StaggeredList: StaggeredListLoading,
  Search: SearchLoading,
}
