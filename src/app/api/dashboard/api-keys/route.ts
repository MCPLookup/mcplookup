// Dashboard API Keys Management Endpoint
// Handles CRUD operations for user API keys

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '../../../../auth';
import { apiKeyService } from '@/lib/services/api-keys/service';
import { CreateApiKeyRequest, ApiKeyPermission } from '@/lib/services/api-keys/types';
import { isUserAdmin } from '@/lib/auth/middleware';

// Validation schemas
const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100).describe('API key name'),
  permissions: z.array(z.enum([
    'discovery:read',
    'servers:read', 
    'servers:write',
    'servers:delete',
    'analytics:read',
    'admin:read',
    'admin:write'
  ])).optional().describe('API key permissions'),
  expires_at: z.string().datetime().optional().describe('Expiration date (ISO string)'),
  rate_limit: z.object({
    requests_per_minute: z.number().min(1).max(1000),
    requests_per_hour: z.number().min(1).max(100000),
    requests_per_day: z.number().min(1).max(1000000)
  }).optional().describe('Custom rate limits')
});

/**
 * GET /api/dashboard/api-keys
 * Get all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's API keys
    const result = await apiKeyService.getUserApiKeys(session.user.id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to fetch API keys', details: result.error },
        { status: 500 }
      );
    }

    // Get stats for each API key
    const apiKeysWithStats = await Promise.all(
      result.data.map(async (apiKey) => {
        const statsResult = await apiKeyService.getApiKeyStats(apiKey.id);
        return {
          ...apiKey,
          stats: statsResult.success ? statsResult.data : null
        };
      })
    );

    return NextResponse.json({
      api_keys: apiKeysWithStats,
      total: result.data.length
    });

  } catch (error) {
    console.error('API keys GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/api-keys
 * Create a new API key for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request
    const validatedRequest = CreateApiKeySchema.parse(body);
    
    // Check if user is admin for admin permissions
    const isAdmin = await isUserAdmin(session.user.id);
    const userRole = isAdmin ? 'admin' : 'user';
    
    // Filter out admin permissions for non-admin users
    let permissions = validatedRequest.permissions || [];
    if (!isAdmin) {
      permissions = permissions.filter(p => !p.startsWith('admin:')) as ApiKeyPermission[];
    }

    const createRequest: CreateApiKeyRequest = {
      name: validatedRequest.name,
      permissions,
      rate_limit: validatedRequest.rate_limit,
      expires_at: validatedRequest.expires_at
    };

    // Create the API key
    const result = await apiKeyService.createApiKey(
      session.user.id,
      createRequest,
      userRole
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to create API key', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'API key created successfully',
      api_key: result.data.api_key,
      raw_key: result.data.raw_key,
      warning: 'Store this key securely. It will not be shown again.'
    }, { status: 201 });

  } catch (error) {
    console.error('API keys POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboard/api-keys
 * Revoke an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const apiKeyId = searchParams.get('id');
    
    if (!apiKeyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }

    // Revoke the API key
    const result = await apiKeyService.revokeApiKey(session.user.id, apiKeyId);
    
    if (!result.success) {
      if (result.error.includes('not found')) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }
      
      if (result.error.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized to revoke this API key' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to revoke API key', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'API key revoked successfully'
    });

  } catch (error) {
    console.error('API keys DELETE error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
