// Next.js API Route - Server Health Monitoring
// Real-time health checks for MCP servers

import { NextRequest, NextResponse } from 'next/server';
import { getServerlessServices } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
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

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': realtime ? 'no-cache' : 'public, s-maxage=60',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================

async function checkCapabilities(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'capability-check',
        method: 'tools/list',
        params: {}
      })
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.jsonrpc === '2.0' && data.result && Array.isArray(data.result.tools);

  } catch {
    return false;
  }
}

async function checkSSL(endpoint: string): Promise<boolean> {
  try {
    const url = new URL(endpoint);

    if (url.protocol !== 'https:') {
      return false;
    }

    const response = await fetch(endpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });

    return response.status < 500;

  } catch {
    return false;
  }
}

function calculateTrustScore(
  health: any,
  capabilitiesWorking: boolean,
  sslValid: boolean,
  verified: boolean
): number {
  let score = 0;

  // Base score for verification
  if (verified) score += 40;

  // Health-based scoring
  switch (health.status) {
    case 'healthy': score += 30; break;
    case 'degraded': score += 15; break;
    case 'down': score += 0; break;
    default: score += 10;
  }

  // Uptime scoring
  score += Math.min(health.uptime_percentage * 0.2, 20);

  // SSL scoring
  if (sslValid) score += 5;

  // Capabilities scoring
  if (capabilitiesWorking) score += 5;

  return Math.min(Math.round(score), 100);
}
