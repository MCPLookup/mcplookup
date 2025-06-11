// Official Domain Registration API
// POST /api/v1/register/official - Register official domain-verified MCP servers
// Requires domain ownership verification via DNS TXT records

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { auth } from '@/auth';
import { getServerlessServices } from '@/lib/services';
import { registerRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';
import { SecureURLSchema, SecureDomainSchema } from '@/lib/security/url-validation';

const OfficialRegistrationSchema = z.object({
  // Domain and endpoint
  domain: z.string().min(1).max(253),
  endpoint: z.string().url(),
  
  // Organization details
  organization_name: z.string().min(1).max(200),
  business_email: z.string().email(),
  contact_email: z.string().email(),
  
  // Server details
  description: z.string().min(10).max(1000),
  category: z.enum(['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'analytics', 'security', 'content', 'integration']),
  capabilities: z.array(z.string()).min(1).max(20),
  
  // Optional
  github_repo: z.string().optional(),
  documentation_url: z.string().url().optional(),
  support_url: z.string().url().optional(),
  
  // Internal
  server_type: z.literal('official'),
  requires_domain_verification: z.literal(true)
});

export async function POST(request: NextRequest) {
  console.log('🏢 Official Domain Registration Request');

  try {    // Rate limiting
    const rateLimitResult = await registerRateLimit(request);
    if (rateLimitResult) {
      // Rate limited - return the response directly
      return rateLimitResult;
    }

    // Authentication check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          details: 'You must be logged in to register official domain servers'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request
    const validatedRequest = OfficialRegistrationSchema.parse(body);

    // Additional security validation
    SecureURLSchema.parse(validatedRequest.endpoint);
    SecureDomainSchema.parse(validatedRequest.domain);

    // Validate business email domain matches the registered domain
    const businessEmailDomain = validatedRequest.business_email.split('@')[1];
    if (!validatedRequest.domain.includes(businessEmailDomain) && !businessEmailDomain.includes(validatedRequest.domain.split('.').slice(-2).join('.'))) {
      return NextResponse.json(
        {
          error: 'Business email domain mismatch',
          details: `Business email domain (${businessEmailDomain}) must match the registered domain (${validatedRequest.domain}) or its parent domain.`
        },
        { status: 400 }
      );
    }

    const services = getServerlessServices();

    // Check if domain is already registered
    const existingServers = await services.registry.getServersByDomain(validatedRequest.domain);
    if (existingServers.length > 0) {
      return NextResponse.json(
        {
          error: 'Domain already registered',
          details: `A server is already registered for domain ${validatedRequest.domain}. Use the update API or contact support for domain transfer.`
        },
        { status: 409 }
      );
    }

    // Generate domain verification challenge
    const verificationId = randomUUID();
    const challengeValue = `mcplookup-verification=${verificationId}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification challenge (in a real implementation, this would go to a database)
    const verificationChallenge = {
      verification_id: verificationId,
      domain: validatedRequest.domain,
      user_id: session.user.id,
      organization_name: validatedRequest.organization_name,
      business_email: validatedRequest.business_email,
      contact_email: validatedRequest.contact_email,
      endpoint: validatedRequest.endpoint,
      description: validatedRequest.description,
      category: validatedRequest.category,
      capabilities: validatedRequest.capabilities,
      github_repo: validatedRequest.github_repo,
      documentation_url: validatedRequest.documentation_url,
      support_url: validatedRequest.support_url,
      challenge_value: challengeValue,
      expires_at: expiresAt.toISOString(),
      verified: false,
      created_at: new Date().toISOString()
    };

    // In a real implementation, store this in the database
    console.log('🔐 Generated verification challenge:', verificationChallenge);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Official domain registration initiated. Please complete domain verification.',
        verification_required: true,
        verification_id: verificationId,
        challenge_expires_at: expiresAt.toISOString(),
        dns_record: {
          type: 'TXT',
          name: validatedRequest.domain,
          value: challengeValue
        },
        verification_steps: [
          `Log into your DNS provider (where you manage ${validatedRequest.domain})`,
          `Add a TXT record with the name "${validatedRequest.domain}" and the value provided above`,
          `Wait for DNS propagation (usually 5-30 minutes, up to 24 hours)`,
          `Click "Check Domain Verification" to complete the process`,
          `Once verified, your server will be registered with official domain status`
        ],
        next_steps: {
          verification_url: `/api/v1/register/verify/official/${verificationId}`,
          dashboard_url: `/dashboard/registrations`,
          documentation_url: `/docs/official-registration`
        }
      },
      { status: 202 } // Accepted, pending verification
    );

    return response;

  } catch (error) {
    console.error('Official registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Official domain registration failed. Please try again.' },
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
