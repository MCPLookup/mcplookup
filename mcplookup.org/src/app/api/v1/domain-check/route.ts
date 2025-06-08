// Domain Ownership Check API
// GET /api/v1/domain-check?domain=example.com
// Check if authenticated user can register MCP servers for a domain

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { isUserDomainVerified } from '@/lib/services/dns-verification'
import { z } from 'zod'

const DomainCheckSchema = z.object({
  domain: z.string().min(1).max(255).regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format')
})

/**
 * GET /api/v1/domain-check?domain=example.com
 * Check if authenticated user can register MCP servers for a domain
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
    
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      )
    }
    
    const validation = DomainCheckSchema.safeParse({ domain })
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid domain format',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    // Check if user has verified ownership of this domain
    const domainVerified = await isUserDomainVerified(session.user.id, domain)
    
    return NextResponse.json({
      success: true,
      domain,
      user_id: session.user.id,
      can_register: domainVerified,
      verified: domainVerified,
      message: domainVerified 
        ? `You can register MCP servers for ${domain}`
        : `You must verify ownership of ${domain} before registering MCP servers for it`,
      action_required: domainVerified ? null : 'verify_domain_ownership',
      verification_url: domainVerified ? null : 'https://mcplookup.org/dashboard'
    })
    
  } catch (error) {
    console.error('Domain check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to check domain ownership',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
