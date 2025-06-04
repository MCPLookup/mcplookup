// Upstash Redis Verification Storage - Production Implementation
// Implements the full IVerificationStorage interface with pagination and error handling

import { Redis } from '@upstash/redis';
import { 
  IVerificationStorage, 
  VerificationChallengeData,
  StorageResult,
  PaginatedResult,
  VerificationStats,
  HealthCheckResult,
  ChallengeQueryOptions,
  createSuccessResult,
  createErrorResult,
  createHealthCheckResult,
  createEmptyPaginatedResult
} from './interfaces.js';

/**
 * Upstash Redis Verification Storage
 * Production-ready implementation with full pagination and error handling
 */
export class UpstashVerificationStorage implements IVerificationStorage {
  private redis: Redis;
  private readonly TTL_SECONDS = 24 * 60 * 60; // 24 hours

  constructor() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Upstash Redis environment variables not configured');
    }

    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  async storeChallenge(challengeId: string, challenge: VerificationChallengeData): Promise<StorageResult<void>> {
    try {
      const key = `challenge:${challengeId}`;
      const domainKey = `domain:${challenge.domain}`;
      
      const pipeline = this.redis.pipeline();
      
      // Store the challenge with TTL
      pipeline.setex(key, this.TTL_SECONDS, JSON.stringify(challenge));
      
      // Add to domain index for efficient domain-based queries
      pipeline.sadd(domainKey, challengeId);
      pipeline.expire(domainKey, this.TTL_SECONDS);
      
      // Add to global challenges set
      pipeline.sadd('challenges:all', challengeId);
      
      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to store challenge: ${error}`, 'UPSTASH_STORE_ERROR');
    }
  }

  async getChallenge(challengeId: string): Promise<StorageResult<VerificationChallengeData | null>> {
    try {
      const key = `challenge:${challengeId}`;
      const data = await this.redis.get(key);
      
      if (!data) {
        return createSuccessResult(null);
      }

      // Upstash Redis client automatically deserializes JSON
      const challenge = typeof data === 'string' ? JSON.parse(data) : data;
      return createSuccessResult(challenge as VerificationChallengeData);
    } catch (error) {
      return createErrorResult(`Failed to get challenge: ${error}`, 'UPSTASH_GET_ERROR');
    }
  }

  async deleteChallenge(challengeId: string): Promise<StorageResult<void>> {
    try {
      // Get challenge first to clean up domain index
      const challengeResult = await this.getChallenge(challengeId);
      
      const pipeline = this.redis.pipeline();
      
      // Remove main challenge
      pipeline.del(`challenge:${challengeId}`);
      
      // Remove from global set
      pipeline.srem('challenges:all', challengeId);
      
      // Remove from domain index if challenge exists
      if (challengeResult.success && challengeResult.data) {
        pipeline.srem(`domain:${challengeResult.data.domain}`, challengeId);
      }
      
      await pipeline.exec();
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to delete challenge: ${error}`, 'UPSTASH_DELETE_ERROR');
    }
  }

  async markChallengeVerified(challengeId: string): Promise<StorageResult<void>> {
    try {
      const challengeResult = await this.getChallenge(challengeId);
      if (!challengeResult.success || !challengeResult.data) {
        return createErrorResult('Challenge not found', 'NOT_FOUND');
      }

      const challenge = challengeResult.data;
      const updatedChallenge = {
        ...challenge,
        verified_at: new Date().toISOString()
      };

      const key = `challenge:${challengeId}`;
      await this.redis.setex(key, this.TTL_SECONDS, JSON.stringify(updatedChallenge));
      
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to mark challenge verified: ${error}`, 'UPSTASH_VERIFY_ERROR');
    }
  }

  async recordVerificationAttempt(challengeId: string, success: boolean, details?: string): Promise<StorageResult<void>> {
    try {
      const challengeResult = await this.getChallenge(challengeId);
      if (!challengeResult.success || !challengeResult.data) {
        return createErrorResult('Challenge not found', 'NOT_FOUND');
      }

      const challenge = challengeResult.data as any;
      const updatedChallenge = {
        ...challenge,
        attempts: (challenge.attempts || 0) + 1,
        last_attempt_at: new Date().toISOString()
      };

      if (success) {
        updatedChallenge.verified_at = new Date().toISOString();
      }

      const key = `challenge:${challengeId}`;
      await this.redis.setex(key, this.TTL_SECONDS, JSON.stringify(updatedChallenge));
      
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(`Failed to record attempt: ${error}`, 'UPSTASH_ATTEMPT_ERROR');
    }
  }

  async getChallengesByDomain(
    domain: string, 
    options?: ChallengeQueryOptions
  ): Promise<StorageResult<PaginatedResult<VerificationChallengeData>>> {
    try {
      const opts = { ...options };
      const domainKey = `domain:${domain}`;
      
      // Get challenge IDs for this domain
      const challengeIds = await this.redis.smembers(domainKey) as string[];
      
      if (challengeIds.length === 0) {
        return createSuccessResult(createEmptyPaginatedResult());
      }

      // Get all challenges
      const keys = challengeIds.map(id => `challenge:${id}`);
      const results = await this.redis.mget(...keys);
      
      let challenges = results
        .filter(result => result !== null)
        .map(result => {
          try {
            return typeof result === 'string' ? JSON.parse(result) : result;
          } catch (error) {
            console.error('Error parsing challenge data:', error);
            return null;
          }
        })
        .filter(challenge => challenge !== null) as VerificationChallengeData[];

      // Apply status filter
      if (opts.status) {
        challenges = challenges.filter(c => {
          switch (opts.status) {
            case 'pending': return !c.verified_at;
            case 'verified': return !!c.verified_at;
            case 'expired': return new Date(c.expires_at) < new Date();
            case 'failed': return (c as any).attempts > 0 && !c.verified_at;
            default: return true;
          }
        });
      }
      
      // Apply date filters
      if (opts.createdAfter) {
        challenges = challenges.filter(c => c.created_at >= opts.createdAfter!);
      }
      if (opts.createdBefore) {
        challenges = challenges.filter(c => c.created_at <= opts.createdBefore!);
      }
      
      // Apply pagination
      const total = challenges.length;
      const start = opts.offset || 0;
      const limit = opts.limit || 50;
      const items = challenges.slice(start, start + limit);
      const hasMore = start + limit < total;
      
      return createSuccessResult({
        items,
        total,
        hasMore,
        nextCursor: hasMore ? String(start + limit) : undefined
      });
    } catch (error) {
      return createErrorResult(`Failed to get challenges by domain: ${error}`, 'UPSTASH_DOMAIN_ERROR');
    }
  }

  async cleanupExpiredChallenges(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>> {
    try {
      // Get all challenge IDs
      const challengeIds = await this.redis.smembers('challenges:all') as string[];
      
      if (challengeIds.length === 0) {
        return createSuccessResult({ removedCount: 0, freedSpace: '0KB' });
      }

      // Get all challenges to check expiration
      const keys = challengeIds.map(id => `challenge:${id}`);
      const results = await this.redis.mget(...keys);
      
      const now = new Date();
      const expiredChallenges: string[] = [];
      
      results.forEach((result, index) => {
        if (result) {
          try {
            const challenge = typeof result === 'string' ? JSON.parse(result) : result;
            if (new Date(challenge.expires_at) < now) {
              expiredChallenges.push(challengeIds[index]);
            }
          } catch (error) {
            // If we can't parse it, consider it expired
            expiredChallenges.push(challengeIds[index]);
          }
        }
      });

      if (!dryRun && expiredChallenges.length > 0) {
        // Delete expired challenges
        for (const challengeId of expiredChallenges) {
          await this.deleteChallenge(challengeId);
        }
      }
      
      return createSuccessResult({
        removedCount: expiredChallenges.length,
        freedSpace: 'N/A' // Upstash doesn't expose storage details
      });
    } catch (error) {
      return createErrorResult(`Cleanup failed: ${error}`, 'UPSTASH_CLEANUP_ERROR');
    }
  }

  async getStats(): Promise<StorageResult<VerificationStats>> {
    try {
      // Get all challenge IDs
      const challengeIds = await this.redis.smembers('challenges:all') as string[];
      
      if (challengeIds.length === 0) {
        return createSuccessResult({
          totalChallenges: 0,
          activeChallenges: 0,
          verifiedChallenges: 0,
          expiredChallenges: 0,
          failedChallenges: 0,
          memoryUsage: { used: '0KB' },
          averageVerificationTime: 0,
          lastUpdated: new Date().toISOString()
        });
      }

      // Get all challenges
      const keys = challengeIds.map(id => `challenge:${id}`);
      const results = await this.redis.mget(...keys);
      
      const challenges = results
        .filter(result => result !== null)
        .map(result => {
          try {
            return typeof result === 'string' ? JSON.parse(result) : result;
          } catch (error) {
            return null;
          }
        })
        .filter(challenge => challenge !== null) as VerificationChallengeData[];

      const now = new Date();
      const activeChallenges = challenges.filter(c => new Date(c.expires_at) > now && !c.verified_at);
      const verifiedChallenges = challenges.filter(c => !!c.verified_at);
      const expiredChallenges = challenges.filter(c => new Date(c.expires_at) < now);
      const failedChallenges = challenges.filter(c => (c as any).attempts > 0 && !c.verified_at);
      
      const verificationTimes = verifiedChallenges
        .filter(c => c.verified_at)
        .map(c => new Date(c.verified_at!).getTime() - new Date(c.created_at).getTime());
      
      const avgVerificationTime = verificationTimes.length > 0 
        ? verificationTimes.reduce((sum, time) => sum + time, 0) / verificationTimes.length / 1000 // Convert to seconds
        : 0;
      
      return createSuccessResult({
        totalChallenges: challenges.length,
        activeChallenges: activeChallenges.length,
        verifiedChallenges: verifiedChallenges.length,
        expiredChallenges: expiredChallenges.length,
        failedChallenges: failedChallenges.length,
        memoryUsage: {
          used: 'N/A' // Upstash doesn't expose memory usage
        },
        averageVerificationTime: Math.round(avgVerificationTime),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      return createErrorResult(`Failed to get stats: ${error}`, 'UPSTASH_STATS_ERROR');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.redis.ping();
      const latency = Date.now() - startTime;
      const healthy = result === 'PONG';
      
      return createHealthCheckResult(healthy, latency, {
        provider: 'upstash',
        region: 'global',
        connection: healthy ? 'active' : 'failed'
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      return createHealthCheckResult(false, latency, {
        provider: 'upstash',
        error: String(error)
      });
    }
  }

  getProviderInfo() {
    return {
      name: 'upstash',
      version: '1.0.0',
      capabilities: ['persistence', 'global-replication', 'auto-scaling', 'production-ready']
    };
  }
}
