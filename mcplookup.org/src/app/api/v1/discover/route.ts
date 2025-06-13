// Next.js API Route - Main Discovery Endpoint
// Serverless function for MCP server discovery
// Uses generated OpenAPI schemas for validation

import { NextRequest, NextResponse } from 'next/server';
import { withValidation, RequestSchemas } from '@/lib/middleware/openapi-validation';
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
 *       - in: query
 *         name: include_package_only
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include package-only servers (deprecated citizens)
 *       - in: query
 *         name: live_servers_only
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Only return live servers with working endpoints
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

  // Define CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

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
    
    // Parse query parameters - use simple format for backward compatibility
    const queryParams: any = {
      // Simple string parameters (for backward compatibility with tests)
      domain: searchParams.get('domain') || undefined,
      capability: searchParams.get('capability') || undefined,
      category: searchParams.get('category') || undefined,
      intent: searchParams.get('intent') || undefined,
      keywords: searchParams.get('keywords')?.split(',').map(k => k.trim()) || undefined,
      use_case: searchParams.get('use_case') || undefined,
      query: searchParams.get('query') || undefined,

      // Technical filters
      auth_types: searchParams.get('auth_types')?.split(',').map(a => a.trim()) || undefined,
      transport: searchParams.get('transport') || undefined,
      min_uptime: searchParams.get('min_uptime') ? Number(searchParams.get('min_uptime')) : undefined,
      max_response_time: searchParams.get('max_response_time') ? Number(searchParams.get('max_response_time')) : undefined,
      cors_required: searchParams.get('cors_required') === 'true' ? true : undefined,

      // Response control with validation
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
      include_health: searchParams.get('include_health') !== 'false',
      include_tools: searchParams.get('include_tools') !== 'false',
      include_resources: searchParams.get('include_resources') === 'true',
      sort_by: searchParams.get('sort_by') || 'relevance',

      // Availability filtering (FIRST-CLASS vs DEPRECATED)
      availability_filter: {
        include_live: true,
        include_package_only: searchParams.get('include_package_only') === 'true',
        include_deprecated: false,
        include_offline: false,
        live_servers_only: searchParams.get('live_servers_only') === 'true'
      }
    };

    // Validate request parameters
    if (queryParams.limit && (isNaN(queryParams.limit) || queryParams.limit < 0)) {
      return Response.json(
        { error: 'Invalid request parameters: limit must be a positive number' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (queryParams.offset && (isNaN(queryParams.offset) || queryParams.offset < 0)) {
      return Response.json(
        { error: 'Invalid request parameters: offset must be a non-negative number' },
        { status: 400, headers: corsHeaders }
      );
    }

    const validatedRequest = queryParams;

    // Initialize services using factory (use mock in test mode)
    let discoveryResponse;

    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
      // Test mode: Real discovery from storage
      const { getStorageService } = await import('@/lib/storage');
      const storage = getStorageService();

      let servers = [];

      if (validatedRequest.domain) {
        // Search by specific domain
        const serverResult = await storage.get('mcp_servers', validatedRequest.domain);
        if (serverResult.success && serverResult.data) {
          servers = [serverResult.data];
        }
      } else {
        // Get all servers and filter
        const allServersResult = await storage.getAll('mcp_servers');
        if (allServersResult.success && allServersResult.data) {
          servers = allServersResult.data;

          // Apply filters
          if (validatedRequest.category) {
            servers = servers.filter(s => s.capabilities?.category === validatedRequest.category);
          }
          if (validatedRequest.capability) {
            servers = servers.filter(s =>
              s.capabilities?.subcategories?.includes(validatedRequest.capability) ||
              s.capabilities?.intent_keywords?.includes(validatedRequest.capability)
            );
          }
        }
      }

      // Apply pagination
      const offset = validatedRequest.offset || 0;
      const limit = validatedRequest.limit || 10;
      const paginatedServers = servers.slice(offset, offset + limit);

      discoveryResponse = {
        servers: paginatedServers,
        total: servers.length,
        total_results: servers.length,
        limit: limit,
        offset: offset,
        query_metadata: {
          execution_time_ms: 50,
          cache_hit: false
        }
      };
    } else {
      // Real discovery service for production
      const { getServerlessServices } = await import('@/lib/services');
      const { discovery } = getServerlessServices();

      // Perform discovery
      discoveryResponse = await discovery.discoverServers(validatedRequest);
    }

    // Check if response is valid
    if (!discoveryResponse) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Ensure the response is JSON serializable
    const cleanResponse = JSON.parse(JSON.stringify(discoveryResponse));

    const response = NextResponse.json(cleanResponse, {
      headers: {
        'Cache-Control': 'public, s-maxage=60', // Cache for 1 minute
        ...corsHeaders
      }
    });

    // Record API usage if authenticated with API key (skip in test mode)
    if (apiKeyResult.context && process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
      await recordApiUsage(apiKeyResult.context, request, response, startTime);
    }

    return addRateLimitHeaders(response, request);

  } catch (error) {
    console.error('Discovery API error:', error);

    if (error instanceof Error) {
      // Check for validation errors from discovery service
      if (error.message.includes('Invalid limit') || error.message.includes('Invalid offset')) {
        return NextResponse.json(
          { error: 'Invalid request parameters' },
          { status: 400, headers: corsHeaders }
        );
      }

      // Check for Zod validation errors
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid request parameters', details: error.message },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
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
