// Next.js API Route - DNS Verification Endpoint
// Verifies DNS challenges for domain ownership

import { NextRequest, NextResponse } from 'next/server';
import { createVerificationService } from '@/lib/services';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    
    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Initialize verification service
    const verificationService = createVerificationService();
    
    // Verify DNS challenge
    const verified = await verificationService.verifyDNSChallenge(challengeId);
    
    if (verified) {
      const response = {
        verified: true,
        domain: 'example.com', // TODO: Get actual domain from challenge
        verified_at: new Date().toISOString(),
        registration_status: 'verified' as const,
        next_steps: 'Your MCP server has been successfully registered and is now discoverable.'
      };

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else {
      return NextResponse.json(
        { 
          verified: false,
          error: 'DNS verification failed',
          details: 'The required TXT record was not found or is incorrect.'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Verification API error:', error);
    
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    
    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    // Initialize verification service
    const { createVerificationService } = await import('@/lib/services');
    const verificationService = createVerificationService();

    // Get challenge status
    const challenge = await verificationService.getChallengeStatus(challengeId);

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json(challenge, {
      headers: {
        'Cache-Control': 'public, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Verification status API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
  });
}
