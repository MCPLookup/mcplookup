// Password utilities
// Handles password hashing, verification, and validation

import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'

const SALT_ROUNDS = 12

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  score: number // 0-100
}

export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxLength: number
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    return hash
  } catch (error) {
    console.error('Password hashing failed:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hash)
    return isValid
  } catch (error) {
    console.error('Password verification failed:', error)
    return false
  }
}

/**
 * Validate password strength and requirements
 */
export function validatePassword(
  password: string, 
  requirements: Partial<PasswordRequirements> = {}
): PasswordValidationResult {
  const reqs = { ...DEFAULT_REQUIREMENTS, ...requirements }
  const errors: string[] = []
  let score = 0

  // Length check
  if (password.length < reqs.minLength) {
    errors.push(`Password must be at least ${reqs.minLength} characters long`)
  } else {
    score += 20
  }

  if (password.length > reqs.maxLength) {
    errors.push(`Password must be no more than ${reqs.maxLength} characters long`)
  }

  // Character type requirements
  if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (reqs.requireUppercase) {
    score += 15
  }

  if (reqs.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (reqs.requireLowercase) {
    score += 15
  }

  if (reqs.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (reqs.requireNumbers) {
    score += 15
  }

  if (reqs.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else if (reqs.requireSpecialChars) {
    score += 15
  }

  // Additional scoring for complexity
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.7) {
    score += 10 // Bonus for character diversity
  }

  if (password.length >= 12) {
    score += 10 // Bonus for longer passwords
  }

  // Check for common patterns (reduce score)
  if (/(.)\1{2,}/.test(password)) {
    score -= 10 // Repeated characters
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 20 // Common patterns
    errors.push('Password contains common patterns that make it less secure')
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score))

  return {
    isValid: errors.length === 0,
    errors,
    score
  }
}

/**
 * Generate a secure random token for email verification, password reset, etc.
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = uppercase + lowercase + numbers + special
  
  let password = ''
  
  // Ensure at least one character from each required set
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Check if a password has been compromised (basic check against common passwords)
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'admin123', 'root', 'toor', 'pass', '12345678'
  ]
  
  return commonPasswords.includes(password.toLowerCase())
}

/**
 * Get password strength description
 */
export function getPasswordStrengthDescription(score: number): {
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'
  description: string
  color: string
} {
  if (score < 20) {
    return {
      level: 'very-weak',
      description: 'Very Weak',
      color: '#ef4444' // red-500
    }
  } else if (score < 40) {
    return {
      level: 'weak',
      description: 'Weak',
      color: '#f97316' // orange-500
    }
  } else if (score < 60) {
    return {
      level: 'fair',
      description: 'Fair',
      color: '#eab308' // yellow-500
    }
  } else if (score < 80) {
    return {
      level: 'good',
      description: 'Good',
      color: '#22c55e' // green-500
    }
  } else {
    return {
      level: 'strong',
      description: 'Strong',
      color: '#16a34a' // green-600
    }
  }
}

/**
 * Create a password reset token with expiration
 */
export interface PasswordResetToken {
  token: string
  hashedToken: string
  expiresAt: Date
}

export async function createPasswordResetToken(): Promise<PasswordResetToken> {
  const token = generateSecureToken(32)
  const hashedToken = await hashPassword(token)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
  
  return {
    token,
    hashedToken,
    expiresAt
  }
}

/**
 * Verify a password reset token
 */
export async function verifyPasswordResetToken(
  token: string, 
  hashedToken: string, 
  expiresAt: Date
): Promise<boolean> {
  // Check if token has expired
  if (new Date() > expiresAt) {
    return false
  }
  
  // Verify the token
  return await verifyPassword(token, hashedToken)
}

/**
 * Create an email verification token
 */
export interface EmailVerificationToken {
  token: string
  hashedToken: string
  expiresAt: Date
}

export async function createEmailVerificationToken(): Promise<EmailVerificationToken> {
  const token = generateSecureToken(32)
  const hashedToken = await hashPassword(token)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  
  return {
    token,
    hashedToken,
    expiresAt
  }
}

/**
 * Verify an email verification token
 */
export async function verifyEmailVerificationToken(
  token: string, 
  hashedToken: string, 
  expiresAt: Date
): Promise<boolean> {
  // Check if token has expired
  if (new Date() > expiresAt) {
    return false
  }
  
  // Verify the token
  return await verifyPassword(token, hashedToken)
}
