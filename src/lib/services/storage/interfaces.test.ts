import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  isSuccessResult, 
  isErrorResult, 
  createSuccessResult, 
  createErrorResult,
  createHealthCheckResult,
  validatePaginationOptions,
  DEFAULT_PAGINATION,
  DEFAULT_SEARCH_OPTIONS,
  type StorageResult,
  type HealthCheckResult,
  type PaginationOptions,
  type SearchOptions,
  type PaginatedResult,
  type RegistryStats,
  type VerificationStats,
  type VerificationChallengeData,
  type UserProfile,
  type UserSession,
  type BatchOperationResult
} from './interfaces'
import { CapabilityCategory, type MCPServerRecord } from '../../schemas/discovery'

describe('Storage Interfaces', () => {
  describe('Result Type Guards', () => {
    it('should correctly identify success results', () => {
      const successResult = createSuccessResult('test data')
      
      expect(isSuccessResult(successResult)).toBe(true)
      expect(isErrorResult(successResult)).toBe(false)
      expect(successResult.success).toBe(true)
      
      if (isSuccessResult(successResult)) {
        expect(successResult.data).toBe('test data')
      }
    })

    it('should correctly identify error results', () => {
      const errorResult = createErrorResult('test error')
      
      expect(isErrorResult(errorResult)).toBe(true)
      expect(isSuccessResult(errorResult)).toBe(false)
      expect(errorResult.success).toBe(false)
      
      if (isErrorResult(errorResult)) {
        expect(errorResult.error).toBe('test error')
      }
    })

    it('should handle null/undefined data in success results', () => {
      const nullResult = createSuccessResult(null)
      const undefinedResult = createSuccessResult(undefined)
      
      expect(isSuccessResult(nullResult)).toBe(true)
      if (isSuccessResult(nullResult)) {
        expect(nullResult.data).toBeNull()
      }
      
      expect(isSuccessResult(undefinedResult)).toBe(true)
      if (isSuccessResult(undefinedResult)) {
        expect(undefinedResult.data).toBeUndefined()
      }
    })

    it('should handle error codes', () => {
      const errorWithCodeResult = createErrorResult('Database error', 'DB_CONN_FAILED')
      
      expect(isErrorResult(errorWithCodeResult)).toBe(true)
      if (isErrorResult(errorWithCodeResult)) {
        expect(errorWithCodeResult.error).toBe('Database error')
        expect(errorWithCodeResult.code).toBe('DB_CONN_FAILED')
      }
    })
  })

  describe('Health Check Results', () => {
    it('should create valid health check results', () => {
      const healthyResult = createHealthCheckResult(true, 50, { connection: 'active' })
      
      expect(healthyResult.healthy).toBe(true)
      expect(healthyResult.latency).toBe(50)
      expect(healthyResult.details?.connection).toBe('active')
      expect(healthyResult.timestamp).toBeDefined()
      expect(new Date(healthyResult.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should create unhealthy status with minimal data', () => {
      const unhealthyResult = createHealthCheckResult(false)
      
      expect(unhealthyResult.healthy).toBe(false)
      expect(unhealthyResult.latency).toBeUndefined()
      expect(unhealthyResult.details).toBeUndefined()
      expect(unhealthyResult.timestamp).toBeDefined()
    })
  })

  describe('Pagination Validation', () => {    it('should validate and normalize pagination options', () => {
      const options: PaginationOptions = { limit: 25, offset: 100 }
      const validated = validatePaginationOptions(options)
      
      expect(validated.limit).toBe(25)
      expect(validated.offset).toBe(100)
    })

    it('should enforce minimum and maximum limits', () => {
      const tooSmall = validatePaginationOptions({ limit: 0 }) // 0 is falsy, uses default
      const tooLarge = validatePaginationOptions({ limit: 2000 })
      const negative = validatePaginationOptions({ offset: -10 })
      const actualMinimum = validatePaginationOptions({ limit: 1 })
      
      expect(tooSmall.limit).toBe(50) // Uses default when 0
      expect(tooLarge.limit).toBe(1000) // Enforces maximum
      expect(negative.offset).toBe(0) // Enforces minimum offset
      expect(actualMinimum.limit).toBe(1) // Minimum valid limit
    })

    it('should use defaults for undefined values', () => {
      const validated = validatePaginationOptions({})
      
      expect(validated.limit).toBe(DEFAULT_PAGINATION.limit)
      expect(validated.offset).toBe(DEFAULT_PAGINATION.offset)
    })
  })

  describe('Default Constants', () => {
    it('should have sensible default pagination', () => {
      expect(DEFAULT_PAGINATION.limit).toBe(50)
      expect(DEFAULT_PAGINATION.offset).toBe(0)
      expect(DEFAULT_PAGINATION.cursor).toBe('')
    })

    it('should have sensible default search options', () => {
      expect(DEFAULT_SEARCH_OPTIONS.sortBy).toBe('updated_at')
      expect(DEFAULT_SEARCH_OPTIONS.sortOrder).toBe('desc')
      expect(DEFAULT_SEARCH_OPTIONS.includeInactive).toBe(false)
      expect(DEFAULT_SEARCH_OPTIONS.limit).toBe(50)
    })
  })

  describe('MCPServerRecord Type Validation', () => {
    const createMockServer = (): MCPServerRecord => ({
      // Identity
      domain: 'test.example.com',
      endpoint: 'https://test.example.com/.well-known/mcp',
      name: 'Test Server',
      description: 'A test MCP server',

      // MCP Protocol Data
      server_info: {
        name: 'Test Server',
        version: '1.0.0',
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: true,
          resources: false,
          prompts: false,
          logging: false
        }
      },
      tools: [
        {
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      ],
      resources: [],
      transport: 'streamable_http',

      // Semantic Organization
      capabilities: {
        category: 'productivity' as CapabilityCategory,
        subcategories: ['email', 'calendar'],
        intent_keywords: ['email', 'calendar', 'schedule'],
        use_cases: ['Send emails', 'Manage calendar']
      },

      // Technical Requirements
      auth: {
        type: 'none'
      },
      cors_enabled: true,

      // Operational Status
      health: {
        status: 'healthy',
        uptime_percentage: 99.9,
        avg_response_time_ms: 150,
        response_time_ms: 150,
        error_rate: 0.001,
        last_check: new Date().toISOString(),
        consecutive_failures: 0
      },
      verification: {
        dns_verified: true,
        endpoint_verified: true,
        ssl_verified: true,
        last_verification: new Date().toISOString(),
        verification_method: 'dns-txt-challenge'
      },

      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      maintainer: {
        name: 'Test Maintainer',
        email: 'test@example.com'
      }
    })

    it('should create valid MCPServerRecord', () => {
      const server = createMockServer()
      
      expect(server.domain).toBe('test.example.com')
      expect(server.endpoint).toBe('https://test.example.com/.well-known/mcp')
      expect(server.name).toBe('Test Server')
      expect(server.capabilities.category).toBe('productivity')
      expect(server.tools).toHaveLength(1)
      expect(server.tools[0].name).toBe('test_tool')
      expect(server.health.status).toBe('healthy')
      expect(server.verification.dns_verified).toBe(true)
    })

    it('should handle servers with no tools', () => {
      const server = createMockServer()
      server.tools = []
      
      expect(server.tools).toHaveLength(0)
      expect(Array.isArray(server.tools)).toBe(true)
    })

    it('should handle different authentication types', () => {
      const server = createMockServer()
      
      // Test API key auth
      server.auth = {
        type: 'api_key',
        description: 'API key required in X-API-Key header'
      }
      
      expect(server.auth.type).toBe('api_key')
      expect(server.auth.description).toBeDefined()
    })
  })

  describe('VerificationChallengeData Type Validation', () => {
    const createMockChallenge = (): VerificationChallengeData => ({
      // Base VerificationChallenge fields
      challenge_id: 'test-challenge-123',
      domain: 'test.example.com',
      txt_record_name: '_mcp-verify.test.example.com',
      txt_record_value: 'mcp_verify_abc123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      instructions: 'Add this TXT record to your DNS',

      // Extended VerificationChallengeData fields
      endpoint: 'https://test.example.com/.well-known/mcp',
      contact_email: 'admin@test.example.com',
      token: 'verification-token-123',
      created_at: new Date().toISOString()
    })

    it('should create valid VerificationChallengeData', () => {
      const challenge = createMockChallenge()
      
      expect(challenge.challenge_id).toBe('test-challenge-123')
      expect(challenge.domain).toBe('test.example.com')
      expect(challenge.txt_record_name).toBe('_mcp-verify.test.example.com')
      expect(challenge.txt_record_value).toBe('mcp_verify_abc123')
      expect(challenge.endpoint).toBe('https://test.example.com/.well-known/mcp')
      expect(challenge.contact_email).toBe('admin@test.example.com')
      expect(new Date(challenge.expires_at).getTime()).toBeGreaterThan(Date.now())
    })

    it('should handle verified challenges', () => {
      const challenge = createMockChallenge()
      const challengeWithVerification = {
        ...challenge,
        verified_at: new Date().toISOString()
      }
      
      expect(challengeWithVerification.verified_at).toBeDefined()
      expect(new Date(challengeWithVerification.verified_at!).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should handle challenges with attempts', () => {
      const challenge = createMockChallenge()
      const challengeWithAttempts = {
        ...challenge,
        attempts: 2,
        last_attempt_at: new Date().toISOString()
      }
      
      expect(challengeWithAttempts.attempts).toBe(2)
      expect(challengeWithAttempts.last_attempt_at).toBeDefined()
    })
  })

  describe('Statistics Types', () => {
    it('should create valid RegistryStats', () => {
      const stats: RegistryStats = {
        totalServers: 150,
        activeServers: 140,
        categories: {
          'productivity': 45,
          'communication': 30,
          'data': 25,
          'development': 20,
          'content': 15,
          'integration': 10,
          'analytics': 5,
          'security': 8,
          'finance': 6,
          'ecommerce': 4,
          'social': 2,
          'other': 0
        },
        capabilities: {
          'email_send': 30,
          'calendar_manage': 25,
          'file_search': 40
        },
        performance: {
          avgResponseTime: 150,
          cacheHitRate: 0.85
        },
        lastUpdated: new Date().toISOString()
      }
      
      expect(stats.totalServers).toBe(150)
      expect(stats.activeServers).toBe(140)
      expect(Object.keys(stats.categories)).toHaveLength(12)
      expect(stats.categories.productivity).toBe(45)
      expect(stats.performance.avgResponseTime).toBe(150)
      expect(stats.lastUpdated).toBeDefined()
    })

    it('should create valid VerificationStats', () => {
      const stats: VerificationStats = {
        totalChallenges: 500,
        activeChallenges: 25,
        verifiedChallenges: 450,
        expiredChallenges: 20,
        failedChallenges: 5,
        averageVerificationTime: 3600000, // 1 hour in ms
        lastUpdated: new Date().toISOString()
      }
      
      expect(stats.totalChallenges).toBe(500)
      expect(stats.activeChallenges).toBe(25)
      expect(stats.verifiedChallenges).toBe(450)
      expect(stats.expiredChallenges).toBe(20)
      expect(stats.failedChallenges).toBe(5)
      expect(stats.averageVerificationTime).toBe(3600000)
      expect(stats.lastUpdated).toBeDefined()
    })

    it('should validate stats consistency', () => {
      const stats: VerificationStats = {
        totalChallenges: 100,
        activeChallenges: 10,
        verifiedChallenges: 80,
        expiredChallenges: 8,
        failedChallenges: 2,
        lastUpdated: new Date().toISOString()
      }
      
      // Total should equal sum of all statuses
      const statusSum = stats.activeChallenges + stats.verifiedChallenges + stats.expiredChallenges + stats.failedChallenges
      expect(statusSum).toBe(stats.totalChallenges)
    })
  })

  describe('User Types', () => {
    it('should create valid UserProfile', () => {
      const user: UserProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'github',
        provider_id: 'github-123',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        email_verified: true,
        is_active: true,
        preferences: {
          theme: 'dark',
          notifications: true,
          newsletter: false
        }
      }
      
      expect(user.id).toBe('user-123')
      expect(user.email).toBe('test@example.com')
      expect(user.provider).toBe('github')
      expect(user.role).toBe('user')
      expect(user.email_verified).toBe(true)
      expect(user.preferences?.theme).toBe('dark')
    })

    it('should create valid UserSession', () => {
      const session: UserSession = {
        id: 'session-123',
        user_id: 'user-123',
        token: 'token-abc123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        is_active: true
      }
      
      expect(session.id).toBe('session-123')
      expect(session.user_id).toBe('user-123')
      expect(session.token).toBe('token-abc123')
      expect(session.is_active).toBe(true)
      expect(new Date(session.expires_at).getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('Batch Operations', () => {
    it('should create valid BatchOperationResult', () => {
      const result: BatchOperationResult = {
        successful: 8,
        failed: 2,
        errors: [
          { domain: 'fail1.com', error: 'DNS resolution failed' },
          { domain: 'fail2.com', error: 'Invalid endpoint' }
        ]
      }
      
      expect(result.successful).toBe(8)
      expect(result.failed).toBe(2)
      expect(result.errors).toHaveLength(2)
      expect(result.errors[0].domain).toBe('fail1.com')
      expect(result.errors[0].error).toBe('DNS resolution failed')
    })

    it('should handle successful batch with no errors', () => {
      const result: BatchOperationResult = {
        successful: 10,
        failed: 0,
        errors: []
      }
      
      expect(result.successful).toBe(10)
      expect(result.failed).toBe(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Type-safe Storage Results', () => {
    it('should maintain type safety with generic results', () => {
      const stringResult: StorageResult<string> = createSuccessResult('hello')
      const numberResult: StorageResult<number> = createSuccessResult(42)
      const arrayResult: StorageResult<string[]> = createSuccessResult(['a', 'b', 'c'])
      
      if (isSuccessResult(stringResult)) {
        expect(typeof stringResult.data).toBe('string')
        expect(stringResult.data).toBe('hello')
      }
      
      if (isSuccessResult(numberResult)) {
        expect(typeof numberResult.data).toBe('number')
        expect(numberResult.data).toBe(42)
      }
      
      if (isSuccessResult(arrayResult)) {
        expect(Array.isArray(arrayResult.data)).toBe(true)
        expect(arrayResult.data).toHaveLength(3)
      }
    })

    it('should handle complex nested types', () => {
      interface ComplexData {
        id: string
        metadata: {
          version: number
          tags: string[]
        }
      }
      
      const complexData: ComplexData = {
        id: 'test-123',
        metadata: {
          version: 1,
          tags: ['test', 'mock']
        }
      }
      
      const result: StorageResult<ComplexData> = createSuccessResult(complexData)
      
      if (isSuccessResult(result)) {
        expect(result.data.id).toBe('test-123')
        expect(result.data.metadata.version).toBe(1)
        expect(result.data.metadata.tags).toContain('test')
      }
    })
  })

  describe('Error Handling Patterns', () => {
    it('should handle different error types', () => {
      const errorResult = createErrorResult('Connection timeout')
      
      expect(isErrorResult(errorResult)).toBe(true)
      if (isErrorResult(errorResult)) {
        expect(errorResult.error).toBe('Connection timeout')
      }
    })

    it('should handle error objects as strings', () => {
      const error = new Error('Database error')
      const errorResult = createErrorResult(error.message)
      
      expect(isErrorResult(errorResult)).toBe(true)
      if (isErrorResult(errorResult)) {
        expect(errorResult.error).toBe('Database error')
      }
    })

    it('should handle operational vs programming errors', () => {
      const operationalError = createErrorResult('Service unavailable', 'SERVICE_DOWN')
      const programmingError = createErrorResult('Invalid function signature', 'INVALID_PARAMS')
      
      expect(isErrorResult(operationalError)).toBe(true)
      expect(isErrorResult(programmingError)).toBe(true)
      
      if (isErrorResult(operationalError)) {
        expect(operationalError.error).toContain('unavailable')
        expect(operationalError.code).toBe('SERVICE_DOWN')
      }
      
      if (isErrorResult(programmingError)) {
        expect(programmingError.error).toContain('Invalid')
        expect(programmingError.code).toBe('INVALID_PARAMS')
      }
    })
  })
})
