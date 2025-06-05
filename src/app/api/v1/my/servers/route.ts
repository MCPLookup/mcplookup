// User-Specific Server Management API
// GET /api/v1/my/servers - List only MY servers
// Prevents users from seeing servers they don't own

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createStorage } from '@/lib/services/storage'
import { isSuccessResult } from '@/lib/services/storage/unified-storage'

/**
 * GET /api/v1/my/servers
 * List only servers owned by the authenticated user
 * SECURITY: Users can only see their own servers
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const storage = createStorage()
    
    // 🔒 SECURITY: Only get servers owned by this user
    const result = await storage.query('mcp_servers', {
      filters: { 
        owner_id: session.user.id,
        // Only include active servers (not deleted)
        status: { $ne: 'deleted' }
      }
    })
    
    if (!isSuccessResult(result)) {
      return NextResponse.json(
        { error: 'Failed to fetch servers' },
        { status: 500 }
      )
    }
    
    // Filter out sensitive data and add computed fields
    const userServers = result.data.items.map((server: any) => ({
      id: server.id,
      domain: server.domain,
      endpoint: server.endpoint,
      name: server.name,
      description: server.description,
      capabilities: server.capabilities || [],
      category: server.category,
      auth_type: server.auth_type,
      status: server.status,
      verified: server.verified || false,
      trust_score: server.trust_score || 0,
      health: server.health || { status: 'unknown' },
      created_at: server.created_at,
      updated_at: server.updated_at,
      last_seen: server.last_seen,
      // Don't expose sensitive fields like verification tokens
    }))
    
    return NextResponse.json({
      success: true,
      servers: userServers,
      total_count: userServers.length,
      user_id: session.user.id
    })
    
  } catch (error) {
    console.error('Get user servers error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get user servers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
