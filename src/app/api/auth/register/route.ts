// User Registration API
// Handles email/password user registration with email verification

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { 
  createUserWithPassword, 
  createEmailVerificationToken,
  getUserByEmail 
} from '@/lib/auth/storage-adapter'
import { emailProviderService as emailService } from '@/lib/services/email-providers'
import { createEmailVerificationToken as createToken } from '@/lib/auth/password'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Validate password strength
    const passwordValidation = validatePassword(validatedData.password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user (unverified)
    const user = await createUserWithPassword(
      validatedData.email,
      validatedData.name,
      hashedPassword,
      false // email not verified yet
    )

    // Create email verification token
    const verificationToken = await createToken()
    await createEmailVerificationToken(
      validatedData.email,
      verificationToken.hashedToken,
      verificationToken.expiresAt
    )

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken.token}&email=${encodeURIComponent(validatedData.email)}`
    
    const emailSent = await emailService.sendVerificationEmail({
      email: validatedData.email,
      name: validatedData.name,
      verificationUrl,
      expiresIn: '24 hours'
    })

    if (!emailSent) {
      console.warn('Failed to send verification email, but user was created')
    }

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false
      },
      emailSent
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
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
      { error: 'Registration failed. Please try again.' },
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
