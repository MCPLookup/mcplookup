"use client"

import { Alert as ChakraAlert } from "@chakra-ui/react"
import * as React from "react"

export interface AlertRootProps extends ChakraAlert.RootProps {}
export interface AlertIconProps extends ChakraAlert.IndicatorProps {}
export interface AlertTitleProps extends ChakraAlert.TitleProps {}
export interface AlertDescriptionProps extends ChakraAlert.DescriptionProps {}

export const AlertRoot = React.forwardRef<HTMLDivElement, AlertRootProps>(
  function AlertRoot(props, ref) {
    return <ChakraAlert.Root ref={ref} {...props} />
  }
)

export const AlertIcon = React.forwardRef<SVGSVGElement, AlertIconProps>(
  function AlertIcon(props, ref) {
    return <ChakraAlert.Indicator ref={ref} {...props} />
  }
)

export const AlertTitle = React.forwardRef<HTMLDivElement, AlertTitleProps>(
  function AlertTitle(props, ref) {
    return <ChakraAlert.Title ref={ref} {...props} />
  }
)

export const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  function AlertDescription(props, ref) {
    return <ChakraAlert.Description ref={ref} {...props} />
  }
)

// Export as namespace for dot notation usage
export const Alert = {
  Root: AlertRoot,
  Icon: AlertIcon,
  Indicator: AlertIcon,
  Title: AlertTitle,
  Description: AlertDescription,
}
