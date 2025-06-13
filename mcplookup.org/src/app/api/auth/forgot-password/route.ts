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
import { sendPasswordResetEmail } from '@/lib/services/resend-email'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validate input
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      // Don't reveal whether the email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset email.'
      })
    }

    // Generate password reset token
    const token = generateSecureToken()
    const hashedToken = await hashToken(token)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store password reset token
    await createPasswordResetToken(
      email,
      hashedToken,
      expiresAt
    )

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, token)

    if (!emailResult.success) {
      console.warn('Failed to send password reset email:', emailResult.error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send password reset email. Please try again.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset email.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => e.message)
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Password reset request failed. Please try again.'
      },
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
