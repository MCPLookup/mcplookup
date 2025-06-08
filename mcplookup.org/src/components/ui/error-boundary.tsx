"use client"

import React from 'react'
import { Box, Button, Heading, Text, VStack, Alert } from '@chakra-ui/react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Box
      minH="400px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <VStack gap={6} textAlign="center" maxW="md">
        <Box color="red.500" fontSize="4xl">
          <FaExclamationTriangle />
        </Box>
        
        <VStack gap={3}>
          <Heading size="lg" color="red.600">
            Something went wrong
          </Heading>
          <Text color="gray.600">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </Text>
        </VStack>

        <VStack gap={3} width="full">
          <Button
            colorPalette="red"
            onClick={resetError}
          >
            <FaRedo />
            Try Again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </VStack>

        {process.env.NODE_ENV === 'development' && (
          <Alert.Root status="error" width="full">
            <Alert.Indicator />
            <VStack align="start" gap={2} flex="1">
              <Alert.Title>Error Details (Development)</Alert.Title>
              <Alert.Description>
                <Text fontSize="sm" fontFamily="mono">
                  {error.message}
                </Text>
                {error.stack && (
                  <Text fontSize="xs" fontFamily="mono" mt={2} color="gray.600">
                    {error.stack}
                  </Text>
                )}
              </Alert.Description>
            </VStack>
          </Alert.Root>
        )}
      </VStack>
    </Box>
  )
}

// Compact error fallback for smaller components
function CompactErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <VStack align="start" gap={2} flex="1">
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>
          Something went wrong. Please try again.
        </Alert.Description>
        <Button size="sm" variant="outline" onClick={resetError}>
          Retry
        </Button>
      </VStack>
    </Alert.Root>
  )
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    // You could also send to error reporting service here
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Error boundary for specific sections
interface SectionErrorBoundaryProps {
  children: React.ReactNode
  title?: string
  compact?: boolean
}

export function SectionErrorBoundary({ 
  children, 
  title = "Section Error",
  compact = false 
}: SectionErrorBoundaryProps) {
  const FallbackComponent = compact ? CompactErrorFallback : DefaultErrorFallback
  
  return (
    <ErrorBoundary fallback={FallbackComponent}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
