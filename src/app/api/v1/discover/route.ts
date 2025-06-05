// Next.js API Route - Main Discovery Endpoint
// Serverless function for MCP server discovery

import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryRequestSchema, DiscoveryResponseSchema } from '@/lib/schemas/discovery';
import { discoveryRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';
import { apiKeyMiddleware, recordApiUsage } from '@/lib/auth/api-key-middleware';

/**
 * @swagger
 * /api/v1/discover:
 *   get:
 *     summary: Discover MCP servers
 *     description: Find MCP servers by domain, capability, intent, or other criteria
 *     parameters:
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Exact domain match (e.g., "gmail.com")
 *       - in: query
 *         name: capability
 *         schema:
 *           type: string
 *         description: Required capability (e.g., "email_send")
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [communication, productivity, data, development, content, integration, analytics, security, finance, ecommerce, social, other]
 *         description: Capability category filter
 *       - in: query
 *         name: intent
 *         schema:
 *           type: string
 *         description: Natural language intent (e.g., "check my email")
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Search keywords (comma-separated)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: Discovery results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscoveryResponse'
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Apply rate limiting
  const rateLimitResponse = await discoveryRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Optional API key authentication (discovery is public but can be enhanced with API key)
  const apiKeyResult = await apiKeyMiddleware(request, {
    required: false,
    permissions: ['discovery:read']
  });

  if (apiKeyResult.response) {
    return apiKeyResult.response;
  }

  try {
    const { searchParams } = request.nextUrl;
    
    // Parse query parameters
    const queryParams = {
      domain: searchParams.get('domain') || undefined,
      capability: searchParams.get('capability') || undefined,
      category: searchParams.get('category') || undefined,
      intent: searchParams.get('intent') || undefined,
      keywords: searchParams.get('keywords')?.split(',').map(k => k.trim()) || undefined,
      use_case: searchParams.get('use_case') || undefined,
      
      // Technical filters
      auth_types: searchParams.get('auth_types')?.split(',').map(a => a.trim()) || undefined,
      transport: searchParams.get('transport') || undefined,
      min_uptime: searchParams.get('min_uptime') ? Number(searchParams.get('min_uptime')) : undefined,
      max_response_time: searchParams.get('max_response_time') ? Number(searchParams.get('max_response_time')) : undefined,
      cors_required: searchParams.get('cors_required') === 'true' ? true : undefined,
      
      // Response control
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
      include_health: searchParams.get('include_health') !== 'false',
      include_tools: searchParams.get('include_tools') !== 'false',
      include_resources: searchParams.get('include_resources') === 'true',
      sort_by: searchParams.get('sort_by') || 'relevance'
    };

    // Validate request
    const validatedRequest = DiscoveryRequestSchema.parse(queryParams);

    // Initialize services using factory
    const { getServerlessServices } = await import('@/lib/services');
    const { discovery } = getServerlessServices();

    // Perform discovery
    const discoveryResponse = await discovery.discoverServers(validatedRequest);

    const response = NextResponse.json(discoveryResponse, {
      headers: {
        'Cache-Control': 'public, s-maxage=60', // Cache for 1 minute
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      }
    });

    // Record API usage if authenticated with API key
    if (apiKeyResult.context) {
      await recordApiUsage(apiKeyResult.context, request, response, startTime);
    }

    return addRateLimitHeaders(response, request);

  } catch (error) {
    console.error('Discovery API error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.message },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
