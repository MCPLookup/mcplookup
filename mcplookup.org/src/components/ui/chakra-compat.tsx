// Chakra UI v3 compatibility fixes
// This file provides backward compatibility wrappers for components that changed in v3

import React from 'react'
import { 
  Alert as ChakraAlert,
  DialogRoot,
  DialogContent, 
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogBackdrop,
  DialogCloseTrigger,
  Button as ChakraButton,
  Stack
} from '@chakra-ui/react'

// Alert wrapper for v3 compatibility with compound components
const AlertComponent = ({ children, status = 'info', className, ...props }: any) => (
  <ChakraAlert.Root status={status} className={className} {...props}>
    {children}
  </ChakraAlert.Root>
)

// Add sub-components to the Alert
AlertComponent.Icon = ChakraAlert.Indicator
AlertComponent.Description = ({ children, className, ...props }: any) => (
  <ChakraAlert.Description className={className} {...props}>
    {children}
  </ChakraAlert.Description>
)

export const Alert = AlertComponent

// Alert description wrapper (for backward compatibility)
export const AlertDescription = ({ children, className, ...props }: any) => (
  <ChakraAlert.Description className={className} {...props}>
    {children}
  </ChakraAlert.Description>
)

// Modal wrapper for v3 compatibility  
export const Modal = {
  Root: DialogRoot,
  Content: DialogContent,
  Header: DialogHeader,
  Body: DialogBody,
  Footer: DialogFooter,
  Title: DialogTitle,
  Backdrop: DialogBackdrop,
  CloseTrigger: DialogCloseTrigger
}

// Button wrapper for leftIcon compatibility
export const Button = ({ leftIcon, children, ...props }: any) => (
  <ChakraButton {...props}>
    {leftIcon && <span style={{ marginRight: '0.5rem' }}>{leftIcon}</span>}
    {children}
  </ChakraButton>
)

// HStack wrapper (now just Stack with direction="row")
export const HStack = ({ children, gap = 2, ...props }: any) => (
  <Stack direction="row" gap={gap} {...props}>
    {children}
  </Stack>
)

// Re-export other components that haven't changed
export {
  Box,
  VStack,
  Text,
  Heading,
  Input,
  Textarea
} from '@chakra-ui/react'
