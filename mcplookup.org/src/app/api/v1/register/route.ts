// Next.js API Route - Server Registration Endpoint
// Handles MCP server registration with DNS verification

import { NextRequest, NextResponse } from 'next/server';
import { RegistrationRequestSchema, VerificationChallengeSchema } from '@/lib/schemas/discovery';
import { registerRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';
import { SecureURLSchema, SecureDomainSchema } from '@/lib/security/url-validation';
import { createVerificationService } from '@/lib/services';
import { auth } from '@/auth';
import { isUserDomainVerified } from '@/lib/services/dns-verification';
import { apiKeyMiddleware, recordApiUsage } from '@/lib/auth/api-key-middleware';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Apply rate limiting
  const rateLimitResponse = await registerRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // 🔒 SECURITY: Support both session auth and API key auth for MCP server registration
    let userId: string | null = null;
    let apiKeyContext = null;

    // Bypass auth in test mode
    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
      userId = 'test-user-123';
    } else {
      // Try API key authentication first
      const apiKeyResult = await apiKeyMiddleware(request, {
        required: false,
        permissions: ['servers:write']
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
            {
              error: 'Authentication required',
              details: 'You must be logged in or provide a valid API key to register MCP servers'
            },
            { status: 401 }
          );
        }
        userId = session.user.id;
      }
    }

    const body = await request.json();

    // Validate request with enhanced security validation
    const validatedRequest = RegistrationRequestSchema.parse(body);

    // Additional security validation
    SecureURLSchema.parse(validatedRequest.endpoint);
    SecureDomainSchema.parse(validatedRequest.domain);

    // 🔒 SECURITY: Check if user has verified ownership of this domain (bypass in test mode)
    if (process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
      const domainVerified = await isUserDomainVerified(userId, validatedRequest.domain);
      if (!domainVerified) {
        return NextResponse.json(
          {
            error: 'Domain ownership verification required',
            details: `You must verify ownership of ${validatedRequest.domain} before registering MCP servers for it. Go to your dashboard to verify domain ownership.`,
            action_required: 'verify_domain_ownership',
            domain: validatedRequest.domain
          },
          { status: 403 }
        );
      }
    }
    
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

    // Record API usage if authenticated with API key
    if (apiKeyContext) {
      await recordApiUsage(apiKeyContext, request, response, startTime);
    }

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
