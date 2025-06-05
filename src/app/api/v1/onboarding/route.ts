// Onboarding API
// GET /api/v1/onboarding - Get user's onboarding state
// POST /api/v1/onboarding - Update onboarding progress

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { 
  getUserOnboardingState, 
  getOnboardingProgress,
  updateOnboardingStep,
  needsOnboarding
} from '@/lib/onboarding/state'
import { z } from 'zod'

const UpdateOnboardingSchema = z.object({
  step: z.enum(['welcome', 'domain_verify', 'server_register', 'dashboard_tour', 'training_impact', 'completed']),
  completed: z.boolean().optional().default(false)
})

/**
 * GET /api/v1/onboarding
 * Get user's onboarding state and progress
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
    
    const [state, progress, needs] = await Promise.all([
      getUserOnboardingState(session.user.id),
      getOnboardingProgress(session.user.id),
      needsOnboarding(session.user.id)
    ])
    
    return NextResponse.json({
      success: true,
      state,
      progress,
      needsOnboarding: needs,
      user_id: session.user.id
    })
    
  } catch (error) {
    console.error('Get onboarding error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get onboarding state',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/onboarding
 * Update user's onboarding progress
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
    const validation = UpdateOnboardingSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { step, completed } = validation.data
    
    // Update onboarding step
    const updatedState = await updateOnboardingStep(session.user.id, step, completed)
    
    // Get updated progress
    const progress = await getOnboardingProgress(session.user.id)
    
    return NextResponse.json({
      success: true,
      state: updatedState,
      progress,
      message: completed ? `Step '${step}' completed` : `Moved to step '${step}'`
    })
    
  } catch (error) {
    console.error('Update onboarding error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update onboarding',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
