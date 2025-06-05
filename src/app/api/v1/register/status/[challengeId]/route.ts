// Registration Challenge Status API
// GET /api/v1/register/status/{challengeId} - Get challenge status

import { NextRequest, NextResponse } from 'next/server';
import { createVerificationService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const { challengeId } = await params;
    
    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Initialize verification service
    const verificationService = createVerificationService();
    
    // Get challenge status
    const status = await verificationService.getChallengeStatus(challengeId);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 404 }
      );
    }

    // Return challenge status
    return NextResponse.json({
      challenge_id: status.challenge_id,
      status: status.verified ? 'verified' : 
              (new Date() > new Date(status.expires_at)) ? 'expired' : 'pending',
      created_at: status.created_at,
      expires_at: status.expires_at,
      verified_at: status.verified_at,
      dns_record: status.txt_record_value
    });

  } catch (error) {
    console.error('Challenge status API error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
