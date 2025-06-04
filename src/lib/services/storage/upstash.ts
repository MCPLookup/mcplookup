// Upstash Redis Storage Implementation
// Production-ready serverless NoSQL storage for verification challenges

import { Redis } from '@upstash/redis';
import { IVerificationStorage, VerificationChallengeData } from './interfaces';

/**
 * Upstash Redis Storage Service
 * Provides persistent, serverless storage for verification challenges
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

  /**
   * Store verification challenge with automatic expiration
   */
  async storeChallenge(challenge: VerificationChallengeData): Promise<void> {
    const key = `challenge:${challenge.id}`;
    await this.redis.setex(key, this.TTL_SECONDS, JSON.stringify(challenge));
  }

  /**
   * Retrieve verification challenge by ID
   */
  async getChallenge(challengeId: string): Promise<VerificationChallengeData | null> {
    const key = `challenge:${challengeId}`;
    const data = await this.redis.get(key);
    
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data as string) as VerificationChallengeData;
    } catch (error) {
      console.error('Error parsing challenge data:', error);
      return null;
    }
  }

  /**
   * Delete verification challenge
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    const key = `challenge:${challengeId}`;
    await this.redis.del(key);
  }

  /**
   * Mark challenge as verified
   */
  async markChallengeVerified(id: string): Promise<void> {
    const challenge = await this.getChallenge(id);
    if (challenge) {
      challenge.verified = true;
      await this.storeChallenge(challenge);
    }
  }

  async removeChallenge(id: string): Promise<void> {
    await this.redis.del(`challenge:${id}`);
  }

  async cleanupExpiredChallenges(): Promise<void> {
    // Redis TTL handles expiration automatically, but we can scan for expired challenges
    const keys = await this.redis.keys('challenge:*');
    const now = new Date();

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        try {
          const challenge = JSON.parse(data as string) as VerificationChallengeData;
          if (challenge.expiresAt < now) {
            await this.redis.del(key);
          }
        } catch (error) {
          // Invalid data, remove it
          await this.redis.del(key);
        }
      }
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
  /**
   * Get storage statistics
   */
  async getStats(): Promise<{ totalChallenges: number; memoryUsed: string }> {
    try {
      const keys = await this.redis.keys('challenge:*');
      
      return {
        totalChallenges: keys.length,
        memoryUsed: 'unknown' // Redis info not available in Upstash REST
      };
    } catch (error) {
      console.error('Error getting Redis stats:', error);
      return { totalChallenges: 0, memoryUsed: 'unknown' };
    }
  }
}
