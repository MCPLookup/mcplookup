// Smart AI-powered discovery endpoint
// Three-step process: keywords → search → AI narrowing

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SmartProvider } from '@/lib/services/ai';
import { getServerlessServices } from '@/lib/services';
import { apiKeyMiddleware, recordApiUsage, addRateLimitHeaders as addApiKeyRateLimitHeaders } from '@/lib/auth/api-key-middleware';
import { discoveryRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';

// Request schema
const SmartDiscoveryRequestSchema = z.object({
  intent: z.string().min(1).max(500).describe("Natural language query"),
  context: z.object({
    user_type: z.enum(['personal', 'business', 'developer']).optional(),
    preferred_auth: z.array(z.string()).optional(),
    region: z.string().optional(),
    max_results: z.number().min(1).max(50).default(10)
  }).optional(),

  // Availability filtering (FIRST-CLASS vs DEPRECATED)
  availability_filter: z.object({
    include_live: z.boolean().default(true).describe('Include live servers with working endpoints'),
    include_package_only: z.boolean().default(false).describe('Include package-only servers (deprecated citizens)'),
    include_deprecated: z.boolean().default(false).describe('Include explicitly deprecated servers'),
    include_offline: z.boolean().default(false).describe('Include offline servers'),
    live_servers_only: z.boolean().default(false).describe('Shortcut: only live servers (overrides other flags)')
  }).optional().describe('Server availability filtering')
});

export async function POST(request: NextRequest) {
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
    // Parse request body
    const body = await request.json();
    const { intent, context, availability_filter } = SmartDiscoveryRequestSchema.parse(body);
    
    console.log(`🧠 Smart discovery request: "${intent}"`);
    
    // Initialize AI provider
    const smartAI = new SmartProvider();
    
    // Initialize search services
    const { discovery } = getServerlessServices();
    
    // Define search function that integrates with existing search
    const searchFunction = async (keywords: string[]) => {
      console.log(`🔎 Searching with keywords: ${keywords.join(', ')}`);
      
      // Use existing discovery service
      const searchQuery = keywords.join(' ');
      const discoveryResult = await discovery.discoverServers({
        limit: 50, // Get more results for AI to narrow down
        offset: 0,
        intent: searchQuery, // Use intent for search
        keywords: keywords.slice(0, 5) // Limit keywords
        // Note: availability_filter and other complex properties removed for simplified interface
      });
      
      // Transform to format expected by AI
      return discoveryResult.servers.map(server => ({
        slug: server.domain,
        name: server.name || server.domain,
        description: server.description || `MCP server at ${server.domain}`,
        capabilities: server.capabilities || [],
        tags: [], // Tags not available in current schema
        domain: server.domain
      }));
    };
    
    // Process with AI (three-step approach)
    const aiResult = await smartAI.processQuery(intent, searchFunction);
    
    // Get full server details for selected slugs
    const selectedServers = [];
    for (const slug of aiResult.selectedSlugs) {
      try {
        const serverResult = await discovery.discoverServers({
          domain: slug, // Simplified: just pass the slug as string
          limit: 1,
          offset: 0
        });
        if (serverResult.servers.length > 0) {
          selectedServers.push(serverResult.servers[0]);
        }
      } catch (error) {
        console.warn(`Failed to get details for ${slug}:`, error);
      }
    }
    
    // Limit results based on context
    const maxResults = context?.max_results || 10;
    const limitedServers = selectedServers.slice(0, maxResults);
    
    const processingTime = Date.now() - startTime;
    
    // Build response
    const response = {
      query: intent,
      selectedSlugs: aiResult.selectedSlugs.slice(0, maxResults),
      reasoning: aiResult.reasoning,
      confidence: aiResult.confidence,
      servers: limitedServers,
      metadata: {
        processing_time_ms: processingTime,
        ai_provider: 'smart-provider',
        ai_model: 'multi-provider',
        search_results_count: aiResult.selectedSlugs.length,
        cache_hit: false
      }
    };
    
    console.log(`✅ Smart discovery completed in ${processingTime}ms, selected ${limitedServers.length} servers`);

    const nextResponse = NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
      }
    });

    // Record API usage if authenticated with API key
    if (apiKeyResult.context) {
      await recordApiUsage(apiKeyResult.context, request, nextResponse, startTime);
      await addApiKeyRateLimitHeaders(nextResponse, apiKeyResult.context);
    }

    return addRateLimitHeaders(nextResponse, request);
    
  } catch (error) {
    console.error('Smart discovery error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Smart discovery failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  });
}
