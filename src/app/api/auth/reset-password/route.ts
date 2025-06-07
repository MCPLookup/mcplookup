// Reset Password API
// Handles password reset with token verification

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getPasswordResetToken,
  deletePasswordResetToken,
  updateUserPassword,
  getUserByEmail,
  hashPassword
} from '@/lib/auth/storage-adapter'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

function validatePassword(password: string) {
  const errors = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { token, email, password } = resetPasswordSchema.parse(body)

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Get and validate token
    const tokenData = await getPasswordResetToken(email, token)

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await updateUserPassword(email, hashedPassword)

    // Delete the reset token
    await deletePasswordResetToken(tokenData.id)

    return NextResponse.json({
      message: 'Password reset successfully. You can now sign in with your new password.'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(e => e.message)
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Password reset failed. Please try again.' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
