// Forgot Password API
// Handles password reset requests

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createPasswordResetToken as createToken } from '@/lib/auth/password'
import { 
  createPasswordResetToken,
  getUserByEmail 
} from '@/lib/auth/storage-adapter'
import { emailService } from '@/lib/services/email'

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
    const resetToken = await createToken()
    await createPasswordResetToken(
      email,
      resetToken.hashedToken,
      resetToken.expiresAt
    )

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken.token}&email=${encodeURIComponent(email)}`
    
    const emailSent = await emailService.sendPasswordResetEmail({
      email,
      name: user.name,
      resetUrl,
      expiresIn: '1 hour'
    })

    if (!emailSent) {
      console.warn('Failed to send password reset email')
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
