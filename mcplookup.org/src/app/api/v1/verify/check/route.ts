// Domain Verification Check API
// POST /api/v1/verify/check - Check specific verification

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../../auth'
import { 
  checkDomainVerification,
  getUserDomainVerifications 
} from '@/lib/services/dns-verification'
import { z } from 'zod'

const CheckVerificationSchema = z.object({
  verificationId: z.string().min(1)
})

/**
 * POST /api/v1/verify/check
 * Check a specific domain verification
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
    const validation = CheckVerificationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { verificationId } = validation.data
    
    // Verify user owns this verification
    const userVerifications = await getUserDomainVerifications(session.user.id)
    const verification = userVerifications.find(v => v.id === verificationId)
    
    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found or not owned by user' },
        { status: 404 }
      )
    }
    
    // Check DNS
    const isVerified = await checkDomainVerification(verificationId)
    
    // Get updated verification status
    const updatedVerifications = await getUserDomainVerifications(session.user.id)
    const updatedVerification = updatedVerifications.find(v => v.id === verificationId)
    
    return NextResponse.json({
      success: true,
      verified: isVerified,
      verification: updatedVerification ? {
        id: updatedVerification.id,
        domain: updatedVerification.domain,
        status: updatedVerification.status,
        created_at: updatedVerification.created_at,
        verified_at: updatedVerification.verified_at,
        last_check_at: updatedVerification.last_check_at,
        expires_at: updatedVerification.expires_at,
        failure_reason: updatedVerification.failure_reason
      } : null
    })
    
  } catch (error) {
    console.error('Domain verification check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check domain verification',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
