"use client"

import { Card as ChakraCard } from "@chakra-ui/react"
import * as React from "react"

export interface CardRootProps extends ChakraCard.RootProps {}
export interface CardBodyProps extends ChakraCard.BodyProps {}
export interface CardHeaderProps extends ChakraCard.HeaderProps {}
export interface CardFooterProps extends ChakraCard.FooterProps {}

export const CardRoot = React.forwardRef<HTMLDivElement, CardRootProps>(
  function CardRoot(props, ref) {
    return <ChakraCard.Root ref={ref} {...props} />
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

// Individual exports for direct import
export const Card = Object.assign(CardRoot, {
  Root: CardRoot,
  Body: CardBody,
  Header: CardHeader,
  Footer: CardFooter,
})

export const CardContent = CardBody  
export const CardTitle = CardHeader
export const CardDescription = CardBody

export default Card
