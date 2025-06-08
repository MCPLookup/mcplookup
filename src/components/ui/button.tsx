"use client"

import { Button as ChakraButton } from "@chakra-ui/react"
import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'subtle' | 'surface' | 'plain'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  colorScheme?: string
  loading?: boolean
  loadingText?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'solid', size = 'md', loading, loadingText, ...props }, ref) {
    return (
      <ChakraButton 
        ref={ref} 
        variant={variant} 
        size={size} 
        loading={loading}
        loadingText={loadingText}
        {...props} 
      />
    )
  }
)

export default Button
