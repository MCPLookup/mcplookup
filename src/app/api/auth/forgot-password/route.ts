// Forgot Password API
// Handles password reset requests

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createPasswordResetToken,
  getUserByEmail,
  generateSecureToken,
  hashToken
} from '@/lib/auth/storage-adapter'
import { sendPasswordReset } from '@/lib/services/resend-email'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      // Don't reveal whether the email exists or not for security
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent a password reset link.'
      })
    }

    // Check if user has a password (credentials account)
    if (!user.password) {
      return NextResponse.json({
        message: 'This account uses social login. Please sign in with your social provider.'
      })
    }

    // Create password reset token
    const token = generateSecureToken()
    const hashedToken = await hashToken(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await createPasswordResetToken(
      email,
      hashedToken,
      expiresAt
    )

    // Send password reset email
    const emailResult = await sendPasswordReset(email, token)

    if (!emailResult.success) {
      console.warn('Failed to send password reset email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
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
      { error: 'Password reset request failed. Please try again.' },
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
