"use client"

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react"
import * as React from "react"

export interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode
  state?: "idle" | "loading" | "success" | "error"
  loadingText?: string
  hoverScale?: number
  clickScale?: number
  rippleEffect?: boolean
  glowOnHover?: boolean
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (props, ref) => {
    const { state, loadingText, hoverScale, clickScale, rippleEffect, glowOnHover, ...rest } = props
    return (
      <ChakraButton 
        ref={ref} 
        loading={state === "loading"}
        {...rest}
      />
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
