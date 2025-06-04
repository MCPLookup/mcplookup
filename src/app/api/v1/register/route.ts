// Next.js API Route - Server Registration Endpoint
// Handles MCP server registration with DNS verification

import { NextRequest, NextResponse } from 'next/server';
import { RegistrationRequestSchema, VerificationChallengeSchema } from '@/lib/schemas/discovery';
import { registrationRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';
import { SecureURLSchema, SecureDomainSchema } from '@/lib/security/url-validation';
import { createVerificationService } from '@/lib/services';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await registrationRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    
    // Validate request with enhanced security validation
    const validatedRequest = RegistrationRequestSchema.parse(body);

    // Additional security validation
    SecureURLSchema.parse(validatedRequest.endpoint);
    SecureDomainSchema.parse(validatedRequest.domain);
    
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
    
    const response = NextResponse.json(validatedChallenge, {
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

    return addRateLimitHeaders(response, request);

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
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
