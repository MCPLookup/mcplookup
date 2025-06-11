// Official Domain Verification API
// POST /api/v1/register/verify/official/[verification_id] - Verify domain ownership for official registration

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dns from 'dns/promises';
import { auth } from '@/auth';
import { getServerlessServices } from '@/lib/services';

interface RouteParams {
  params: Promise<{
    verification_id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { verification_id } = await params;
  console.log('🔐 Official Domain Verification Request:', verification_id);

  try {
    // Authentication check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }    // Get verification challenge from storage
    const services = getServerlessServices();
    const challenge = await services.verification.getChallengeStatus(verification_id);
    
    if (!challenge) {
      return NextResponse.json(
        { error: 'Verification challenge not found' },
        { status: 404 }
      );
    }    // Use verification service to handle the process
    
    // Attempt verification using the verification service
    const verificationResult = await services.verification.verifyDNSChallenge(verification_id);
    
    if (!verificationResult) {
      return NextResponse.json(
        { error: 'Domain verification failed or challenge not found' },
        { status: 400 }
      );
    }

    // If verification succeeded, complete the registration
    const registeredServer = await services.verification.completeVerificationAndRegister(verification_id);

    return NextResponse.json({
      verified: true,
      message: 'Domain verification successful',
      server: {
        domain: registeredServer.domain,
        verification_id,
        status: 'verified'
      }    });

  } catch (error) {
    console.error('🔴 Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
