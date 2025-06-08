import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting for testing
// In production, this should use Redis or a proper rate limiting service
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100
};

function getClientId(request: NextRequest): string {
  // Get client IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return clientIp;
}

function isRateLimited(clientId: string, config: RateLimitConfig): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    const resetTime = now + config.windowMs;
    rateLimitStore.set(clientId, { count: 1, resetTime });
    return { limited: false, remaining: config.maxRequests - 1, resetTime };
  }
  
  if (entry.count >= config.maxRequests) {
    return { limited: true, remaining: 0, resetTime: entry.resetTime };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(clientId, entry);
  
  return { limited: false, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime };
}

export async function discoveryRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const config = {
    ...defaultConfig,
    maxRequests: 60 // Discovery endpoint specific limit
  };
  
  const { limited, remaining, resetTime } = isRateLimited(clientId, config);
  
  if (limited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: Math.ceil((resetTime - Date.now()) / 1000) },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
  return null; // No rate limit hit
}

export async function registerRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const config = {
    ...defaultConfig,
    maxRequests: 10 // Registration endpoint specific limit (stricter)
  };
  
  const { limited, remaining, resetTime } = isRateLimited(clientId, config);
  
  if (limited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: Math.ceil((resetTime - Date.now()) / 1000) },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
  return null;
}

export async function healthRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const clientId = getClientId(request);
  const config = {
    ...defaultConfig,
    maxRequests: 120 // Health endpoint specific limit (more lenient)
  };
  
  const { limited, remaining, resetTime } = isRateLimited(clientId, config);
  
  if (limited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: Math.ceil((resetTime - Date.now()) / 1000) },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
  return null;
}

export function addRateLimitHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const clientId = getClientId(request);
  const entry = rateLimitStore.get(clientId);
  
  if (entry) {
    response.headers.set('X-RateLimit-Limit', defaultConfig.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, defaultConfig.maxRequests - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
  }
  
  return response;
}

// Cleanup function to remove expired entries
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [clientId, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(clientId);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
