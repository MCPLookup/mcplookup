// Next.js API Route - Server Registration Endpoint
// Handles MCP server registration with DNS verification

import { NextRequest, NextResponse } from 'next/server';
import { RegistrationRequestSchema, VerificationChallengeSchema } from '@/lib/schemas/discovery';
import { createVerificationService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedRequest = RegistrationRequestSchema.parse(body);
    
    // Initialize verification service
    const verificationService = createVerificationService();
    
    // Validate MCP endpoint before proceeding
    const endpointValid = await verificationService.verifyMCPEndpoint(validatedRequest.endpoint);
    if (!endpointValid) {
      return NextResponse.json(
        { 
          error: 'Invalid MCP endpoint', 
          details: 'The provided endpoint does not respond to MCP protocol requests'
        },
        { status: 400 }
      );
    }
    
    // Initiate DNS verification
    const challenge = await verificationService.initiateDNSVerification(validatedRequest);
    
    // Validate response
    const validatedChallenge = VerificationChallengeSchema.parse(challenge);
    
    return NextResponse.json(validatedChallenge, {
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Registration API error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
