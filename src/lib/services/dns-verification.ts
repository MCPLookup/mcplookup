// DNS Verification with Random Slugs
// Allows multiple accounts to own the same domain with unique TXT records

import { createStorage } from './storage'
import { isSuccessResult } from './storage/interfaces'
import crypto from 'crypto'

export interface DomainVerification {
  id: string
  userId: string
  domain: string
  slug: string // Random slug for this user's verification
  txtRecord: string // Full TXT record value
  status: 'pending' | 'verified' | 'failed'
  created_at: string
  verified_at?: string
  last_check_at?: string
  failure_reason?: string
  expires_at: string // Verification expires after 90 days
}

export interface VerificationChallenge {
  domain: string
  slug: string
  txtRecord: string
  instructions: string
}

/**
 * Generate a random slug for DNS verification
 * Format: mcplookup-verify-{8-char-random}
 */
function generateVerificationSlug(): string {
  const randomBytes = crypto.randomBytes(4)
  const randomHex = randomBytes.toString('hex')
  return `mcplookup-verify-${randomHex}`
}

/**
 * Create TXT record value
 * Format: mcplookup-verify-{slug}={userId}
 */
function createTxtRecord(slug: string, userId: string): string {
  return `mcplookup-verify-${slug}=${userId}`
}

/**
 * Start domain verification for a user
 * Multiple users can verify the same domain with different slugs
 */
export async function startDomainVerification(
  userId: string, 
  domain: string
): Promise<VerificationChallenge> {
  const storage = createStorage()
  
  // Generate unique slug for this user
  const slug = generateVerificationSlug()
  const txtRecord = createTxtRecord(slug, userId)
  
  // Create verification record
  const verification: DomainVerification = {
    id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    domain: domain.toLowerCase(),
    slug,
    txtRecord,
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
  }
  
  const result = await storage.set('domain_verifications', verification.id, verification)
  
  if (!isSuccessResult(result)) {
    throw new Error(`Failed to create verification: ${result.error}`)
  }
  
  return {
    domain,
    slug,
    txtRecord,
    instructions: `Add this TXT record to your DNS:
    
Name: _mcplookup.${domain}
Value: ${txtRecord}

Multiple users can verify the same domain by adding multiple TXT records with different slugs.
This verification will expire in 90 days.`
  }
}

/**
 * Check DNS for verification
 * Looks for the specific TXT record for this user's slug
 */
export async function checkDomainVerification(verificationId: string): Promise<boolean> {
  const storage = createStorage()
  
  // Get verification record
  const verificationResult = await storage.get('domain_verifications', verificationId)
  if (!verificationResult.success || !verificationResult.data) {
    throw new Error('Verification not found')
  }
  
  const verification = verificationResult.data as DomainVerification
  
  try {
    // Check DNS for TXT record
    const dns = await import('dns').then(m => m.promises)
    const txtRecords = await dns.resolveTxt(`_mcplookup.${verification.domain}`)
    
    // Look for our specific TXT record
    const expectedRecord = verification.txtRecord
    const recordFound = txtRecords.some(record => 
      record.join('').includes(expectedRecord)
    )
    
    // Update verification status
    const now = new Date().toISOString()
    const updatedVerification: DomainVerification = {
      ...verification,
      status: recordFound ? 'verified' : 'failed',
      last_check_at: now,
      verified_at: recordFound ? now : undefined,
      failure_reason: recordFound ? undefined : 'TXT record not found'
    }
    
    await storage.set('domain_verifications', verificationId, updatedVerification)
    
    return recordFound
  } catch (error) {
    // Update with DNS error
    const updatedVerification: DomainVerification = {
      ...verification,
      status: 'failed',
      last_check_at: new Date().toISOString(),
      failure_reason: `DNS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    await storage.set('domain_verifications', verificationId, updatedVerification)
    
    return false
  }
}

/**
 * Get all domain verifications for a user
 */
export async function getUserDomainVerifications(userId: string): Promise<DomainVerification[]> {
  const storage = createStorage()
  
  try {
    const result = await storage.query('domain_verifications', {
      filters: { userId }
    })
    
    if (result.success) {
      return result.data.items as DomainVerification[]
    }
    
    return []
  } catch (error) {
    console.error('Error getting user verifications:', error)
    return []
  }
}

/**
 * Get all verifications for a domain (across all users)
 * Useful for seeing who has verified a domain
 */
export async function getDomainVerifications(domain: string): Promise<DomainVerification[]> {
  const storage = createStorage()
  
  try {
    const result = await storage.query('domain_verifications', {
      filters: { domain: domain.toLowerCase() }
    })
    
    if (result.success) {
      return result.data.items as DomainVerification[]
    }
    
    return []
  } catch (error) {
    console.error('Error getting domain verifications:', error)
    return []
  }
}

/**
 * Check if a user has verified ownership of a domain or its parent domains
 * CRITICAL: You own subdomains of your verified domain, but NOT parent domains
 *
 * Examples:
 * - If you verified "api.example.com", you can register for:
 *   ✅ "api.example.com" (exact match)
 *   ✅ "sub.api.example.com" (subdomain)
 *   ❌ "example.com" (parent domain)
 *   ❌ "other.example.com" (sibling)
 */
export async function isUserDomainVerified(userId: string, targetDomain: string): Promise<boolean> {
  const verifications = await getUserDomainVerifications(userId)
  const target = targetDomain.toLowerCase()

  // Get all verified domains for this user
  const verifiedDomains = verifications
    .filter(v =>
      v.status === 'verified' &&
      new Date(v.expires_at) > new Date() // Not expired
    )
    .map(v => v.domain)

  // Check if user has verified this exact domain or a parent domain
  for (const verifiedDomain of verifiedDomains) {
    if (isDomainOrSubdomain(target, verifiedDomain)) {
      return true
    }
  }

  return false
}

/**
 * Check if targetDomain is the same as or a subdomain of verifiedDomain
 * CRITICAL: This determines domain ownership scope
 *
 * @param targetDomain - Domain user wants to register server for
 * @param verifiedDomain - Domain user has verified ownership of
 * @returns true if targetDomain is verifiedDomain or its subdomain
 */
function isDomainOrSubdomain(targetDomain: string, verifiedDomain: string): boolean {
  // Input validation
  if (!targetDomain || !verifiedDomain) {
    return false
  }

  const target = targetDomain.toLowerCase().trim()
  const verified = verifiedDomain.toLowerCase().trim()

  // Additional validation - must be valid domain format
  if (!isValidDomainFormat(target) || !isValidDomainFormat(verified)) {
    return false
  }

  // Exact match
  if (target === verified) {
    return true
  }

  // Check if target is a subdomain of verified
  // target must end with ".{verified}" and be longer
  if (target.length > verified.length && target.endsWith('.' + verified)) {
    // Additional security: ensure it's a proper subdomain boundary
    // Prevent attacks like "evilexample.com" matching "example.com"
    const beforeDot = target.substring(0, target.length - verified.length - 1)

    // The part before the dot should be a valid subdomain (no dots at the end)
    if (beforeDot.length > 0 && !beforeDot.endsWith('.')) {
      return true
    }
  }

  return false
}

/**
 * Validate domain format to prevent injection attacks
 */
function isValidDomainFormat(domain: string): boolean {
  // Basic domain validation
  if (!domain || domain.length === 0 || domain.length > 253) {
    return false
  }

  // Must not start or end with dot
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return false
  }

  // Must not contain consecutive dots
  if (domain.includes('..')) {
    return false
  }

  // Basic domain regex (simplified but secure)
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/
  return domainRegex.test(domain)
}

/**
 * Get verification status for a user and domain
 */
export async function getVerificationStatus(
  userId: string, 
  domain: string
): Promise<DomainVerification | null> {
  const verifications = await getUserDomainVerifications(userId)
  
  // Find the most recent verification for this domain
  const domainVerifications = verifications
    .filter(v => v.domain === domain.toLowerCase())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  
  return domainVerifications[0] || null
}

/**
 * Clean up expired verifications
 * Should be run periodically
 */
export async function cleanupExpiredVerifications(): Promise<number> {
  const storage = createStorage()
  
  try {
    const result = await storage.query('domain_verifications', {})
    
    if (!result.success) {
      return 0
    }
    
    const now = new Date()
    let cleanedCount = 0
    
    for (const verification of result.data.items as DomainVerification[]) {
      if (new Date(verification.expires_at) < now) {
        await storage.delete('domain_verifications', verification.id)
        cleanedCount++
      }
    }
    
    console.log(`Cleaned up ${cleanedCount} expired domain verifications`)
    return cleanedCount
  } catch (error) {
    console.error('Error cleaning up expired verifications:', error)
    return 0
  }
}

/**
 * Revoke a domain verification
 * User can revoke their own verification
 */
export async function revokeDomainVerification(
  verificationId: string, 
  userId: string
): Promise<void> {
  const storage = createStorage()
  
  // Get verification record
  const verificationResult = await storage.get('domain_verifications', verificationId)
  if (!verificationResult.success || !verificationResult.data) {
    throw new Error('Verification not found')
  }
  
  const verification = verificationResult.data as DomainVerification
  
  // Check ownership
  if (verification.userId !== userId) {
    throw new Error('Cannot revoke verification owned by another user')
  }
  
  // Delete verification
  await storage.delete('domain_verifications', verificationId)
  console.log(`Domain verification revoked: ${verification.domain} for user ${userId}`)
}
