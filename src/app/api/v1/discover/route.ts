// Next.js API Route - Main Discovery Endpoint
// Serverless function for MCP server discovery

import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryRequestSchema, DiscoveryResponseSchema } from '@/lib/schemas/discovery';

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
    const discoveryRequest = DiscoveryRequestSchema.parse(queryParams);
    
    // TODO: Implement actual discovery service
    // For now, return mock data
    const mockResponse = {
      servers: [
        {
          domain: "gmail.com",
          endpoint: "https://gmail.com/api/mcp",
          name: "Gmail MCP Server",
          description: "Access and manage Gmail emails, compose messages, and handle attachments",
          server_info: {
            name: "gmail-mcp",
            version: "2.1.0",
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: true,
              resources: true
            }
          },
          tools: [
            {
              name: "list_emails",
              description: "List emails from Gmail inbox",
              inputSchema: {
                type: "object",
                properties: {
                  limit: { type: "number", default: 10 },
                  query: { type: "string", description: "Search query" }
                }
              }
            },
            {
              name: "send_email",
              description: "Send an email through Gmail",
              inputSchema: {
                type: "object",
                properties: {
                  to: { type: "string", format: "email" },
                  subject: { type: "string" },
                  body: { type: "string" }
                },
                required: ["to", "subject", "body"]
              }
            }
          ],
          resources: [
            {
              uri: "gmail://emails/inbox",
              name: "Inbox Emails",
              description: "Current inbox emails",
              mimeType: "application/json"
            }
          ],
          transport: "streamable_http" as const,
          capabilities: {
            category: "communication" as const,
            subcategories: ["email", "messaging"],
            intent_keywords: ["email", "message", "send", "inbox", "gmail"],
            use_cases: ["Send emails", "Read inbox", "Email management"]
          },
          auth: {
            type: "oauth2" as const,
            oauth2: {
              authorizationUrl: "https://accounts.google.com/oauth2/auth",
              tokenUrl: "https://oauth2.googleapis.com/token",
              scopes: ["https://www.googleapis.com/auth/gmail.modify"]
            }
          },
          cors_enabled: true,
          health: {
            status: "healthy" as const,
            uptime_percentage: 99.9,
            avg_response_time_ms: 150,
            error_rate: 0.001,
            last_check: new Date().toISOString(),
            consecutive_failures: 0
          },
          verification: {
            dns_verified: true,
            endpoint_verified: true,
            ssl_verified: true,
            last_verification: new Date().toISOString(),
            verification_method: "dns-txt-challenge",
            dns_record: "_mcp-verify.gmail.com TXT \"v=mcp1 domain=gmail.com token=verified\""
          },
          created_at: "2024-01-15T10:30:00Z",
          updated_at: new Date().toISOString(),
          maintainer: {
            name: "Google",
            url: "https://developers.google.com"
          }
        }
      ],
      pagination: {
        total_count: 1,
        returned_count: 1,
        offset: 0,
        has_more: false
      },
      query_metadata: {
        query_time_ms: 45,
        cache_hit: false,
        filters_applied: discoveryRequest.domain ? ['domain_exact'] : ['all_verified']
      }
    };

    // Validate response
    const validatedResponse = DiscoveryResponseSchema.parse(mockResponse);
    
    return NextResponse.json(validatedResponse, {
      headers: {
        'Cache-Control': 'public, s-maxage=60', // Cache for 1 minute
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
