"use client"

import { Card as ChakraCard } from "@chakra-ui/react"
import * as React from "react"

export interface CardRootProps extends ChakraCard.RootProps {}
export interface CardBodyProps extends ChakraCard.BodyProps {}
export interface CardHeaderProps extends ChakraCard.HeaderProps {}
export interface CardFooterProps extends ChakraCard.FooterProps {}

export const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>(
  function CardRoot(props, ref) {
    return (
      <ChakraCard.Root
        ref={ref}
        bg="white"
        color="gray.900"
        shadow="sm"
        border="1px solid"
        borderColor="gray.200"
        rounded="lg"
        _dark={{
          bg: "gray.800",
          color: "gray.100",
          borderColor: "gray.700"
        }}
        _hover={{
          shadow: "md",
          transform: "translateY(-1px)"
        }}
        transition="all 0.2s ease"
        className="text-gray-900 dark:text-gray-100"
        {...props}
      />
    )
  }
)

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody(props, ref) {
    return <ChakraCard.Body ref={ref} {...props} />
  }
)

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(props, ref) {
    return <ChakraCard.Header ref={ref} {...props} />
  }
)

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter(props, ref) {
    return <ChakraCard.Footer ref={ref} {...props} />
  }
)

// Export as namespace for dot notation usage
export const Card = {
  Root: CardRoot,
  Body: CardBody,
  Header: CardHeader,
  Footer: CardFooter,
}
