"use client"

import { Input as ChakraInput } from "@chakra-ui/react"
import * as React from "react"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'outline' | 'flushed' | 'subtle'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ variant = 'outline', size = 'md', ...props }, ref) {
    return <ChakraInput ref={ref} variant={variant} size={size} {...props} />
  }
)

export default Input
