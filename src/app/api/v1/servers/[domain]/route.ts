// Server Management API with Domain Ownership Validation
// PUT /api/v1/servers/{domain} - Update server (only if you own the domain)
// DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createStorage } from '@/lib/services/storage'
import { isSuccessResult } from '@/lib/services/storage/unified-storage'
import { isUserDomainVerified } from '@/lib/services/dns-verification'
import { z } from 'zod'

const UpdateServerSchema = z.object({
  endpoint: z.string().url().optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  capabilities: z.array(z.string()).optional(),
  category: z.enum(['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'other']).optional(),
  auth_type: z.enum(['none', 'api_key', 'oauth2', 'basic']).optional(),
  contact_email: z.string().email().optional()
})

/**
 * PUT /api/v1/servers/{domain}
 * Update server - ONLY if user owns the domain
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const domain = params.domain
    
    // 🔒 SECURITY: Verify user owns this domain
    const domainVerified = await isUserDomainVerified(session.user.id, domain)
    if (!domainVerified) {
      return NextResponse.json(
        { 
          error: 'Domain ownership verification required',
          details: `You must verify ownership of ${domain} before updating servers for it`,
          action_required: 'verify_domain_ownership'
        },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validation = UpdateServerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const storage = createStorage()
    
    // 🔒 SECURITY: Find server owned by this user for this domain
    const serverResult = await storage.query('mcp_servers', {
      filters: { 
        domain,
        owner_id: session.user.id,
        status: { $ne: 'deleted' }
      }
    })
    
    if (!isSuccessResult(serverResult) || serverResult.data.items.length === 0) {
      return NextResponse.json(
        { error: 'Server not found or not owned by user' },
        { status: 404 }
      )
    }
    
    const server = serverResult.data.items[0]
    const updateData = validation.data
    
    // Update server with new data
    const updatedServer = {
      ...server,
      ...updateData,
      updated_at: new Date().toISOString(),
      // Preserve critical fields
      id: server.id,
      domain: server.domain,
      owner_id: server.owner_id,
      created_at: server.created_at
    }
    
    const updateResult = await storage.set('mcp_servers', server.id, updatedServer)
    
    if (!isSuccessResult(updateResult)) {
      return NextResponse.json(
        { error: 'Failed to update server' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      server: {
        id: updatedServer.id,
        domain: updatedServer.domain,
        endpoint: updatedServer.endpoint,
        name: updatedServer.name,
        description: updatedServer.description,
        capabilities: updatedServer.capabilities,
        category: updatedServer.category,
        auth_type: updatedServer.auth_type,
        updated_at: updatedServer.updated_at
      }
    })
    
  } catch (error) {
    console.error('Update server error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update server',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/servers/{domain}
 * Delete server - ONLY if user owns the domain
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const domain = params.domain
    
    // 🔒 SECURITY: Verify user owns this domain
    const domainVerified = await isUserDomainVerified(session.user.id, domain)
    if (!domainVerified) {
      return NextResponse.json(
        { 
          error: 'Domain ownership verification required',
          details: `You must verify ownership of ${domain} before deleting servers for it`,
          action_required: 'verify_domain_ownership'
        },
        { status: 403 }
      )
    }
    
    const storage = createStorage()
    
    // 🔒 SECURITY: Find server owned by this user for this domain
    const serverResult = await storage.query('mcp_servers', {
      filters: { 
        domain,
        owner_id: session.user.id,
        status: { $ne: 'deleted' }
      }
    })
    
    if (!isSuccessResult(serverResult) || serverResult.data.items.length === 0) {
      return NextResponse.json(
        { error: 'Server not found or not owned by user' },
        { status: 404 }
      )
    }
    
    const server = serverResult.data.items[0]
    
    // Soft delete - mark as deleted instead of actually removing
    const deletedServer = {
      ...server,
      status: 'deleted',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const deleteResult = await storage.set('mcp_servers', server.id, deletedServer)
    
    if (!isSuccessResult(deleteResult)) {
      return NextResponse.json(
        { error: 'Failed to delete server' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Server for ${domain} has been deleted`,
      deleted_at: deletedServer.deleted_at
    })
    
  } catch (error) {
    console.error('Delete server error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to delete server',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
