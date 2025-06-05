"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Alert,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

interface EmailSignInFormProps {
  callbackUrl?: string
  onToggleMode?: () => void
}

export function EmailSignInForm({ callbackUrl = '/', onToggleMode }: EmailSignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  const router = useRouter()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')

    // Validation
    if (!email) {
      setEmailError('Email is required')
      return
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    if (!password) {
      setPasswordError('Password is required')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'Please verify your email before signing in') {
          setError('Please verify your email before signing in. Check your inbox for a verification link.')
        } else {
          setError('Invalid email or password')
        }
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An error occurred during sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        {error && (
          <Alert status="error" borderRadius="md">
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <FormControl isInvalid={!!emailError}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          <FormErrorMessage>{emailError}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!passwordError}>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{passwordError}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="orange"
          width="full"
          size="lg"
          isLoading={isLoading}
          loadingText="Signing in..."
        >
          Sign In
        </Button>

        <VStack spacing={2} width="full">
          <Link href="/auth/forgot-password">
            <Text 
              fontSize="sm" 
              color="orange.500" 
              _hover={{ textDecoration: 'underline' }}
              cursor="pointer"
            >
              Forgot your password?
            </Text>
          </Link>

          {onToggleMode && (
            <Text fontSize="sm" color="gray.600">
              Don't have an account?{' '}
              <Text
                as="span"
                color="orange.500"
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
                onClick={onToggleMode}
              >
                Sign up
              </Text>
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  )
}

export default EmailSignInForm
