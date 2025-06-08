// Email Verification API
// Handles email verification for new user accounts

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getEmailVerificationToken,
  deleteEmailVerificationToken,
  markEmailAsVerified,
  getUserByEmail
} from '@/lib/auth/storage-adapter'
import { sendWelcomeEmail } from '@/lib/services/resend-email'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { token, email } = verifyEmailSchema.parse(body)

    // Get and validate token
    const tokenData = await getEmailVerificationToken(email, token)

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
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

    // Mark email as verified
    const updatedUser = await markEmailAsVerified(email)

    // Delete the verification token
    await deleteEmailVerificationToken(tokenData.id)

    // Send welcome email
    const welcomeResult = await sendWelcomeEmail(email, user.name)

    if (!welcomeResult.success) {
      console.warn('Failed to send welcome email:', welcomeResult.error)
    }

    return NextResponse.json({
      message: 'Email verified successfully. You can now sign in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: true
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    
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
      { error: 'Email verification failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle GET requests for email verification links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(
        new URL('/auth/verify-email?error=missing-params', request.url)
      )
    }

    // Validate input
    const validatedData = verifyEmailSchema.parse({ token, email })

    // Get and validate token
    const tokenData = await getEmailVerificationToken(validatedData.email, validatedData.token)

    if (!tokenData) {
      return NextResponse.redirect(
        new URL('/auth/verify-email?error=invalid-token', request.url)
      )
    }

    // Check if user exists
    const user = await getUserByEmail(validatedData.email)
    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/verify-email?error=user-not-found', request.url)
      )
    }

    // Mark email as verified
    await markEmailAsVerified(validatedData.email)

    // Delete the verification token
    await deleteEmailVerificationToken(tokenData.id)

    // Send welcome email
    const welcomeResult = await sendWelcomeEmail(validatedData.email, user.name)

    if (!welcomeResult.success) {
      console.warn('Failed to send welcome email:', welcomeResult.error)
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/verify-email?success=true', request.url)
    )

  } catch (error) {
    console.error('Email verification error:', error)
    
    return NextResponse.redirect(
      new URL('/auth/verify-email?error=verification-failed', request.url)
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
