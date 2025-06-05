// Domain Verification API
// POST /api/v1/verify - Start domain verification
// GET /api/v1/verify - Get user's verifications

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { 
  startDomainVerification, 
  getUserDomainVerifications,
  checkDomainVerification 
} from '@/lib/services/dns-verification'
import { z } from 'zod'

const StartVerificationSchema = z.object({
  domain: z.string().min(1).max(255).regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format')
})

/**
 * POST /api/v1/verify
 * Start domain verification for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validation = StartVerificationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { domain } = validation.data
    
    // Start verification
    const challenge = await startDomainVerification(session.user.id, domain)
    
    return NextResponse.json({
      success: true,
      challenge: {
        domain: challenge.domain,
        slug: challenge.slug,
        txtRecord: challenge.txtRecord,
        instructions: challenge.instructions
      }
    })
    
  } catch (error) {
    console.error('Domain verification start error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to start domain verification',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/verify
 * Get all domain verifications for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const verifications = await getUserDomainVerifications(session.user.id)
    
    // Filter out sensitive data
    const safeVerifications = verifications.map(v => ({
      id: v.id,
      domain: v.domain,
      status: v.status,
      created_at: v.created_at,
      verified_at: v.verified_at,
      last_check_at: v.last_check_at,
      expires_at: v.expires_at,
      failure_reason: v.failure_reason,
      // Don't expose slug or txtRecord for security
    }))
    
    return NextResponse.json({
      success: true,
      verifications: safeVerifications
    })
    
  } catch (error) {
    console.error('Get verifications error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get verifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
