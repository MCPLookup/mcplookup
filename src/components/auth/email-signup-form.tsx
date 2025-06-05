"use client"

import { useState } from 'react'
import { Box, Button, VStack, Text, IconButton, Progress, HStack, Alert } from '@chakra-ui/react'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa'
import { validatePassword, getPasswordStrengthDescription } from '@/lib/auth/password'

interface EmailSignUpFormProps {
  onToggleMode?: () => void
  onSuccess?: (message: string) => void
}

export function EmailSignUpForm({ onToggleMode, onSuccess }: EmailSignUpFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''))

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Real-time password validation
    if (field === 'password') {
      setPasswordValidation(validatePassword(value))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name is too long'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess?.(data.message)
      } else {
        if (data.details && Array.isArray(data.details)) {
          setErrors({ general: data.details.join(', ') })
        } else {
          setErrors({ general: data.error || 'Registration failed' })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'An error occurred during registration. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const strengthInfo = getPasswordStrengthDescription(passwordValidation.score)

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        {errors.general && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title fontSize="sm">{errors.general}</Alert.Title>
          </Alert.Root>
        )}

        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Full Name</FormLabel>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Create a password"
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
          
          {formData.password && (
            <Box mt={2}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.600">Password strength:</Text>
                <Text fontSize="xs" color={strengthInfo.color} fontWeight="medium">
                  {strengthInfo.description}
                </Text>
              </HStack>
              <Progress 
                value={passwordValidation.score} 
                size="sm" 
                colorScheme={
                  passwordValidation.score < 40 ? 'red' : 
                  passwordValidation.score < 70 ? 'yellow' : 'green'
                }
              />
              {passwordValidation.errors.length > 0 && (
                <VStack align="start" mt={2} spacing={1}>
                  {passwordValidation.errors.map((error, index) => (
                    <HStack key={index} spacing={1}>
                      <FaTimes color="#ef4444" size={10} />
                      <Text fontSize="xs" color="red.500">{error}</Text>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          )}
          
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword}>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <InputRightElement>
              <IconButton
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              />
            </InputRightElement>
          </InputGroup>
          
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <HStack mt={1} spacing={1}>
              <FaCheck color="#22c55e" size={12} />
              <Text fontSize="xs" color="green.500">Passwords match</Text>
            </HStack>
          )}
          
          <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="orange"
          width="full"
          size="lg"
          isLoading={isLoading}
          loadingText="Creating account..."
          disabled={!passwordValidation.isValid || formData.password !== formData.confirmPassword}
        >
          Create Account
        </Button>

        {onToggleMode && (
          <Text fontSize="sm" color="gray.600">
            Already have an account?{' '}
            <Text
              as="span"
              color="orange.500"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={onToggleMode}
            >
              Sign in
            </Text>
          </Text>
        )}

        <Text fontSize="xs" color="gray.500" textAlign="center">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
      </VStack>
    </Box>
  )
}

export default EmailSignUpForm
