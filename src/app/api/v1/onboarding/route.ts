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
import { apiKeyMiddleware, recordApiUsage } from '@/lib/auth/api-key-middleware'

const UpdateOnboardingSchema = z.object({
  step: z.enum(['welcome', 'domain_verify', 'server_register', 'dashboard_tour', 'training_impact', 'completed']),
  completed: z.boolean().optional().default(false)
})

/**
 * GET /api/v1/onboarding
 * Get user's onboarding state and progress
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Support both session auth and API key auth
    let userId: string | null = null;
    let apiKeyContext = null;

    // Try API key authentication first
    const apiKeyResult = await apiKeyMiddleware(request, {
      required: false,
      permissions: ['analytics:read']
    });

    if (apiKeyResult.response) {
      return apiKeyResult.response;
    }

    if (apiKeyResult.context) {
      userId = apiKeyResult.context.userId;
      apiKeyContext = apiKeyResult.context;
    } else {
      // Fall back to session authentication
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required - provide valid session or API key' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }
    
    const [state, progress, needs] = await Promise.all([
      getUserOnboardingState(userId),
      getOnboardingProgress(userId),
      needsOnboarding(userId)
    ])

    const response = NextResponse.json({
      success: true,
      state,
      progress,
      needsOnboarding: needs,
      user_id: userId
    });

    // Record API usage if authenticated with API key
    if (apiKeyContext) {
      await recordApiUsage(apiKeyContext, request, response, startTime);
    }

    return response;
    
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
  const startTime = Date.now();

  try {
    // Support both session auth and API key auth
    let userId: string | null = null;
    let apiKeyContext = null;

    // Try API key authentication first
    const apiKeyResult = await apiKeyMiddleware(request, {
      required: false,
      permissions: ['analytics:read'] // Onboarding updates are considered analytics
    });

    if (apiKeyResult.response) {
      return apiKeyResult.response;
    }

    if (apiKeyResult.context) {
      userId = apiKeyResult.context.userId;
      apiKeyContext = apiKeyResult.context;
    } else {
      // Fall back to session authentication
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required - provide valid session or API key' },
          { status: 401 }
        );
      }
      userId = session.user.id;
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
    const updatedState = await updateOnboardingStep(userId, step, completed)

    // Get updated progress
    const progress = await getOnboardingProgress(userId)

    const response = NextResponse.json({
      success: true,
      state: updatedState,
      progress,
      message: completed ? `Step '${step}' completed` : `Moved to step '${step}'`
    });

    // Record API usage if authenticated with API key
    if (apiKeyContext) {
      await recordApiUsage(apiKeyContext, request, response, startTime);
    }

    return response;
    
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
