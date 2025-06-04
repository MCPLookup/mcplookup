// Next.js API Route - Server Health Monitoring
// Real-time health checks for MCP servers

import { NextRequest, NextResponse } from 'next/server';
import { getServerlessServices } from '@/lib/services';
import { healthRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  // Apply rate limiting
  const rateLimitResponse = await healthRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { domain } = await params;
    const { searchParams } = new URL(request.url);
    const realtime = searchParams.get('realtime') === 'true';
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Initialize services
    const { registry, health } = getServerlessServices();
    
    // Find server by domain
    const servers = await registry.getServersByDomain(domain);
    
    if (servers.length === 0) {
      return NextResponse.json(
        { error: 'Server not found', domain },
        { status: 404 }
      );
    }

    const server = servers[0];
    
    // Get health metrics
    let healthMetrics = server.health;
    
    if (realtime) {
      try {
        healthMetrics = await health.checkServerHealth(server.endpoint);
      } catch (error) {
        console.warn(`Real-time health check failed for ${domain}:`, error);
        // Fall back to cached health data
      }
    }

    // Additional health checks
    const capabilitiesWorking = await checkCapabilities(server.endpoint);
    const sslValid = await checkSSL(server.endpoint);

    const response = {
      domain: server.domain,
      endpoint: server.endpoint,
      health: healthMetrics,
      capabilities_working: capabilitiesWorking,
      ssl_valid: sslValid,
      trust_score: calculateTrustScore(healthMetrics, capabilitiesWorking, sslValid, server.verification.dns_verified)
    };

    const nextResponse = NextResponse.json(response, {
      headers: {
        'Cache-Control': realtime ? 'no-cache' : 'public, s-maxage=60',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

    return addRateLimitHeaders(nextResponse, request);

  } catch (error) {
    console.error('Health API error:', error);
    
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

/**
 * Check if server capabilities are working
 */
async function checkCapabilities(endpoint: string): Promise<boolean> {
  try {
    const { safeFetch } = await import('@/lib/security/url-validation');

    const response = await safeFetch(`${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.result && Array.isArray(data.result.tools);
  } catch (error) {
    console.warn('Capability check failed:', error);
    return false;
  }
}

/**
 * Check SSL certificate validity
 */
async function checkSSL(endpoint: string): Promise<boolean> {
  try {
    const url = new URL(endpoint);

    // Only check HTTPS endpoints
    if (url.protocol !== 'https:') {
      return false;
    }

    // Simple SSL check by making a request with SSRF protection
    const { safeFetch } = await import('@/lib/security/url-validation');

    const response = await safeFetch(endpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });

    // If we can make the request without SSL errors, SSL is valid
    return true;
  } catch (error) {
    // SSL errors will cause fetch to fail
    console.warn('SSL check failed:', error);
    return false;
  }
}

/**
 * Calculate overall trust score
 */
function calculateTrustScore(
  healthMetrics: any,
  capabilitiesWorking: boolean,
  sslValid: boolean,
  dnsVerified: boolean
): number {
  let score = 0;

  // DNS verification (40 points)
  if (dnsVerified) score += 40;

  // Health status (25 points)
  if (healthMetrics?.status === 'healthy') score += 25;
  else if (healthMetrics?.status === 'degraded') score += 15;
  else if (healthMetrics?.status === 'unhealthy') score += 5;

  // SSL validity (20 points)
  if (sslValid) score += 20;

  // Capabilities working (10 points)
  if (capabilitiesWorking) score += 10;

  // Response time bonus (5 points)
  const responseTime = healthMetrics?.response_time_ms || 1000;
  if (responseTime < 100) score += 5;
  else if (responseTime < 500) score += 3;
  else if (responseTime < 1000) score += 1;

  return Math.min(score, 100);
}


