// API Key Authentication Middleware
// Handles API key validation and permission checking for API routes

import { NextRequest, NextResponse } from 'next/server';
import { apiKeyService } from '../services/api-keys/service';
import { ApiKeyPermission, ApiKey } from '../services/api-keys/types';

/**
 * API Key authentication context
 */
export interface ApiKeyContext {
  apiKey: ApiKey;
  userId: string;
  hasPermission: (permission: ApiKeyPermission) => boolean;
}

/**
 * Extract API key from request headers
 */
function extractApiKey(request: NextRequest): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Check query parameter (less secure, but sometimes needed)
  const apiKeyParam = request.nextUrl.searchParams.get('api_key');
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return undefined;
}

/**
 * Validate API key and return context
 */
export async function validateApiKey(request: NextRequest): Promise<ApiKeyContext | undefined> {
  const rawKey = extractApiKey(request);
  
  if (!rawKey) {
    return undefined;
  }

  const validation = await apiKeyService.validateApiKey(rawKey);
  
  if (!validation.valid || !validation.api_key) {
    return undefined;
  }

  return {
    apiKey: validation.api_key,
    userId: validation.api_key.user_id,
    hasPermission: (permission: ApiKeyPermission) => 
      apiKeyService.hasPermission(validation.api_key!, permission)
  };
}

/**
 * Middleware to require API key authentication
 */
export async function requireApiKey(
  request: NextRequest,
  requiredPermissions: ApiKeyPermission[] = []
): Promise<{ context: ApiKeyContext } | NextResponse> {
  const context = await validateApiKey(request);
  
  if (!context) {
    return NextResponse.json(
      {
        error: 'Authentication required',
        message: 'Valid API key required. Include it in Authorization header as "Bearer your-api-key" or X-API-Key header.'
      },
      { status: 401 }
    );
  }

  // Check required permissions
  for (const permission of requiredPermissions) {
    if (!context.hasPermission(permission)) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          message: `API key lacks required permission: ${permission}`,
          required_permissions: requiredPermissions
        },
        { status: 403 }
      );
    }
  }

  return { context };
}

/**
 * Middleware to optionally authenticate with API key
 * Returns context if valid API key is provided, null otherwise
 */
export async function optionalApiKey(request: NextRequest): Promise<ApiKeyContext | undefined> {
  return await validateApiKey(request);
}

/**
 * Record API usage for analytics
 */
export async function recordApiUsage(
  context: ApiKeyContext,
  request: NextRequest,
  response: NextResponse,
  startTime: number
): Promise<void> {
  try {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const endpoint = request.nextUrl.pathname;
    const method = request.method;
    const statusCode = response.status;
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined;

    await apiKeyService.recordUsage(
      context.apiKey.id,
      endpoint,
      method,
      statusCode,
      responseTime,
      userAgent,
      ipAddress
    );
  } catch (error) {
    console.error('Failed to record API usage:', error);
  }
}

/**
 * Check rate limits for API key using Redis
 */
export async function checkRateLimit(
  context: ApiKeyContext,
  request: NextRequest
): Promise<NextResponse | null> {
  if (!context.apiKey.rate_limit) {
    return null; // No rate limit configured
  }

  try {
    const { createStorage } = await import('../services/storage/factory');
    const storage = createStorage();

    const now = Date.now();
    const minute = Math.floor(now / 60000); // Current minute
    const hour = Math.floor(now / 3600000); // Current hour
    const day = Math.floor(now / 86400000); // Current day

    const limits = context.apiKey.rate_limit;
    const keyPrefix = `rate_limit:${context.apiKey.id}`;

    // Check and increment counters for each time window
    const checks = [
      { key: `${keyPrefix}:minute:${minute}`, limit: limits.requests_per_minute, window: 60 },
      { key: `${keyPrefix}:hour:${hour}`, limit: limits.requests_per_hour, window: 3600 },
      { key: `${keyPrefix}:day:${day}`, limit: limits.requests_per_day, window: 86400 }
    ];

    for (const check of checks) {
      const result = await storage.get('rate_limits', check.key);
      const current = result.success && result.data ? (result.data as any).count || 0 : 0;

      if (current >= check.limit) {
        const resetTime = Math.ceil(now / (check.window * 1000)) * check.window;

        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `API key has exceeded ${check.limit} requests per ${check.window === 60 ? 'minute' : check.window === 3600 ? 'hour' : 'day'}`,
            retry_after: resetTime - Math.floor(now / 1000)
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': check.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTime.toString(),
              'Retry-After': (resetTime - Math.floor(now / 1000)).toString()
            }
          }
        );
      }

      // Increment counter
      await storage.set('rate_limits', check.key, {
        count: current + 1,
        expires_at: new Date((Math.ceil(now / (check.window * 1000)) * check.window) * 1000).toISOString()
      });
    }

    return null; // No rate limit exceeded
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return null; // Allow request if rate limiting fails
  }
}

/**
 * Add rate limit headers to response
 */
export async function addRateLimitHeaders(
  response: NextResponse,
  context: ApiKeyContext
): Promise<NextResponse> {
  if (!context.apiKey.rate_limit) {
    return response;
  }

  try {
    const { createStorage } = await import('../services/storage/factory');
    const storage = createStorage();

    const now = Date.now();
    const hour = Math.floor(now / 3600000);
    const keyPrefix = `rate_limit:${context.apiKey.id}`;
    const hourKey = `${keyPrefix}:hour:${hour}`;

    const result = await storage.get('rate_limits', hourKey);
    const current = result.success && result.data ? (result.data as any).count || 0 : 0;
    const remaining = Math.max(0, context.apiKey.rate_limit.requests_per_hour - current);
    const resetTime = Math.ceil(now / 3600000) * 3600;

    response.headers.set('X-RateLimit-Limit', context.apiKey.rate_limit.requests_per_hour.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());
  } catch (error) {
    console.error('Failed to add rate limit headers:', error);
  }

  return response;
}

/**
 * Complete API key middleware that handles authentication, permissions, and rate limiting
 */
export async function apiKeyMiddleware(
  request: NextRequest,
  options: {
    required?: boolean;
    permissions?: ApiKeyPermission[];
    recordUsage?: boolean;
  } = {}
): Promise<{
  context?: ApiKeyContext;
  response?: NextResponse;
}> {
  const startTime = Date.now();
  
  // Check if API key is required
  if (options.required) {
    const result = await requireApiKey(request, options.permissions);
    if ('context' in result) {
      return { context: result.context };
    } else {
      return { response: result };
    }
  }
  
  // Optional API key
  const context = await optionalApiKey(request);
  
  if (context) {
    // Check rate limits
    const rateLimitResponse = await checkRateLimit(context, request);
    if (rateLimitResponse) {
      return { response: rateLimitResponse };
    }
    
    // Check permissions if specified
    if (options.permissions) {
      for (const permission of options.permissions) {
        if (!context.hasPermission(permission)) {
          return {
            response: NextResponse.json(
              {
                error: 'Insufficient permissions',
                message: `API key lacks required permission: ${permission}`,
                required_permissions: options.permissions
              },
              { status: 403 }
            )
          };
        }
      }
    }
  }
  
  return { context };
}
