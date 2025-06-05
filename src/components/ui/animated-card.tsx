"use client"

import { Box, Card as ChakraCard } from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"

const MotionBox = motion(Box)

export interface AnimatedCardProps extends ChakraCard.RootProps {
  children: React.ReactNode
  hoverScale?: number
  hoverY?: number
  clickScale?: number
  staggerDelay?: number
  animateOnMount?: boolean
  exitAnimation?: boolean
  glowOnHover?: boolean
  borderOnHover?: boolean
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  function AnimatedCard({
    children,
    hoverScale = 1.02,
    hoverY = -4,
    clickScale = 0.98,
    staggerDelay = 0,
    animateOnMount = true,
    exitAnimation = false,
    glowOnHover = false,
    borderOnHover = true,
    ...props
  }, ref) {
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPressed, setIsPressed] = React.useState(false)

    const cardVariants = {
      initial: animateOnMount ? {
        opacity: 0,
        y: 20,
        scale: 0.95
      } : {},
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.4,
          delay: staggerDelay,
          ease: "easeOut"
        }
      },
      exit: exitAnimation ? {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: {
          duration: 0.3,
          ease: "easeIn"
        }
      } : {},
      hover: {
        scale: hoverScale,
        y: hoverY,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      },
      tap: {
        scale: clickScale,
        transition: {
          duration: 0.1,
          ease: "easeInOut"
        }
      }
    }

    const glowVariants = {
      initial: { opacity: 0 },
      hover: {
        opacity: glowOnHover ? 0.6 : 0,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }
    }

    return (
      <MotionBox
        ref={ref}
        position="relative"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        whileTap="tap"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onTapStart={() => setIsPressed(true)}
        onTap={() => setIsPressed(false)}
        onTapCancel={() => setIsPressed(false)}
        style={{
          cursor: "pointer"
        }}
      >
        {/* Glow effect */}
        {glowOnHover && (
          <MotionBox
            position="absolute"
            top="-2px"
            left="-2px"
            right="-2px"
            bottom="-2px"
            bg="linear-gradient(45deg, blue.400, purple.400, pink.400)"
            rounded="lg"
            variants={glowVariants}
            initial="initial"
            animate={isHovered ? "hover" : "initial"}
            zIndex={-1}
            filter="blur(8px)"
          />
        )}

        <ChakraCard.Root
          bg="white"
          color="gray.900"
          _dark={{
            bg: "gray.800",
            color: "gray.100",
            borderColor: borderOnHover && isHovered ? "blue.400" : "gray.700"
          }}
          shadow={isHovered ? "lg" : "sm"}
          rounded="lg"
          border="1px solid"
          borderColor={borderOnHover && isHovered ? "blue.400" : "gray.200"}
          transition="all 0.2s ease"
          overflow="hidden"
          className="text-gray-900 dark:text-gray-100"
          {...props}
        >
          {children}
        </ChakraCard.Root>
      </MotionBox>
    )
  }
)

// Animated card body with stagger support
export interface AnimatedCardBodyProps extends ChakraCard.BodyProps {
  children: React.ReactNode
  staggerChildren?: boolean
  staggerDelay?: number
}

export const AnimatedCardBody = React.forwardRef<HTMLDivElement, AnimatedCardBodyProps>(
  function AnimatedCardBody({
    children,
    staggerChildren = false,
    staggerDelay = 0.1,
    ...props
  }, ref) {
    const containerVariants = {
      animate: {
        transition: {
          staggerChildren: staggerChildren ? staggerDelay : 0
        }
      }
    }

    const itemVariants = {
      initial: { opacity: 0, y: 10 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }
    }

    return (
      <ChakraCard.Body ref={ref} {...props}>
        {staggerChildren ? (
          <MotionBox
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {React.Children.map(children, (child, index) => (
              <MotionBox key={index} variants={itemVariants}>
                {child}
              </MotionBox>
            ))}
          </MotionBox>
        ) : (
          children
        )}
      </ChakraCard.Body>
    )
  }
)

// Animated card header
export const AnimatedCardHeader = React.forwardRef<HTMLDivElement, ChakraCard.HeaderProps>(
  function AnimatedCardHeader(props, ref) {
    return <ChakraCard.Header ref={ref} {...props} />
  }
)

// Animated card footer
export const AnimatedCardFooter = React.forwardRef<HTMLDivElement, ChakraCard.FooterProps>(
  function AnimatedCardFooter(props, ref) {
    return <ChakraCard.Footer ref={ref} {...props} />
  }
)

// Export as namespace for dot notation usage
export const AnimatedCardNamespace = {
  Root: AnimatedCard,
  Body: AnimatedCardBody,
  Header: AnimatedCardHeader,
  Footer: AnimatedCardFooter,
}

// Default export with namespace structure
const AnimatedCardWithNamespace = Object.assign(AnimatedCard, {
  Root: AnimatedCard,
  Body: AnimatedCardBody,
  Header: AnimatedCardHeader,
  Footer: AnimatedCardFooter,
})

export default AnimatedCardWithNamespace

// List container for staggered animations
interface AnimatedListProps {
  children: React.ReactNode
  staggerDelay?: number
  direction?: "up" | "down" | "left" | "right"
}

export function AnimatedList({ 
  children, 
  staggerDelay = 0.1,
  direction = "up"
}: AnimatedListProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "down": return { y: -20 }
      case "left": return { x: 20 }
      case "right": return { x: -20 }
      default: return { y: 20 }
    }
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  const itemVariants = {
    initial: {
      opacity: 0,
      ...getInitialPosition()
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  return (
    <MotionBox
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <MotionBox key={index} variants={itemVariants}>
          {child}
        </MotionBox>
      ))}
    </MotionBox>
  )
}
