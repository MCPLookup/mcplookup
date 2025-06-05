// Redis Backend - Handles Redis operations
// Can be backed by local Redis or Upstash

import { createClient, RedisClientType } from 'redis';
import { Redis } from '@upstash/redis';
import { StorageBackend } from './storage-backend';

export interface RedisBackendConfig {
  type: 'local' | 'upstash';
  // For local Redis
  redisUrl?: string;
  // For Upstash
  upstashUrl?: string;
  upstashToken?: string;
}

export class RedisBackend implements StorageBackend {
  private client: any;
  private config: RedisBackendConfig;
  private connected = false;

  constructor(config?: RedisBackendConfig) {
    this.config = config || this.detectConfig();
    this.client = this.createClient();
  }

  private detectConfig(): RedisBackendConfig {
    // Auto-detect based on environment variables
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        type: 'upstash',
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN
      };
    } else {
      return {
        type: 'local',
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
      };
    }
  }

  private createClient(): any {
    if (this.config.type === 'upstash') {
      if (!this.config.upstashUrl || !this.config.upstashToken) {
        throw new Error('Upstash URL and token are required for Upstash backend');
      }
      
      return new Redis({
        url: this.config.upstashUrl,
        token: this.config.upstashToken
      });
    } else {
      const client = createClient({
        url: this.config.redisUrl,
        socket: {
          reconnectStrategy: (retries: number) => Math.min(retries * 50, 500)
        }
      });

      client.on('error', (err: Error) => {
        console.error('Redis connection error:', err);
      });

      client.on('connect', () => {
        this.connected = true;
      });

      client.on('disconnect', () => {
        this.connected = false;
      });

      return client;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (this.config.type === 'local' && !this.connected) {
      await (this.client as RedisClientType).connect();
    }
  }

  // ==========================================================================
  // BASIC CRUD OPERATIONS
  // ==========================================================================

  async set(key: string, value: string): Promise<void> {
    await this.ensureConnection();
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnection();
    const result = await this.client.get(key);
    return typeof result === 'string' ? result : result ? String(result) : null;
  }

  async delete(key: string): Promise<void> {
    await this.ensureConnection();
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await this.client.exists(key);
    return result === 1;
  }

  // ==========================================================================
  // SET OPERATIONS
  // ==========================================================================

  async sAdd(key: string, member: string): Promise<void> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      await (this.client as Redis).sadd(key, member);
    } else {
      await (this.client as RedisClientType).sAdd(key, member);
    }
  }

  async sRem(key: string, member: string): Promise<void> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      await (this.client as Redis).srem(key, member);
    } else {
      await (this.client as RedisClientType).sRem(key, member);
    }
  }

  async sMembers(key: string): Promise<string[]> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      return await (this.client as Redis).smembers(key);
    } else {
      return await (this.client as RedisClientType).sMembers(key);
    }
  }

  async sCard(key: string): Promise<number> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      return await (this.client as Redis).scard(key);
    } else {
      return await (this.client as RedisClientType).sCard(key);
    }
  }

  // ==========================================================================
  // SORTED SET OPERATIONS
  // ==========================================================================

  async zAdd(key: string, score: number, member: string): Promise<void> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      await (this.client as Redis).zadd(key, { score, member });
    } else {
      await (this.client as RedisClientType).zAdd(key, { score, value: member });
    }
  }

  async zRem(key: string, member: string): Promise<void> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      await (this.client as Redis).zrem(key, member);
    } else {
      await (this.client as RedisClientType).zRem(key, member);
    }
  }

  async zRangeByScore(key: string, min: number | string, max: number | string): Promise<string[]> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      // Use the correct Upstash Redis API
      const result = await (this.client as any).zrangebyscore(key, min, max);
      return Array.isArray(result) ? result : [];
    } else {
      return await (this.client as RedisClientType).zRangeByScore(key, min, max);
    }
  }

  async zRange(key: string, start: number, stop: number): Promise<string[]> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      return await (this.client as Redis).zrange(key, start, stop);
    } else {
      return await (this.client as RedisClientType).zRange(key, start, stop);
    }
  }

  async zRevRange(key: string, start: number, stop: number): Promise<string[]> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      // Use the correct Upstash Redis API
      const result = await (this.client as any).zrevrange(key, start, stop);
      return Array.isArray(result) ? result : [];
    } else {
      return await (this.client as RedisClientType).zRange(key, start, stop, { REV: true });
    }
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  async mGet(keys: string[]): Promise<(string | null)[]> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      const results = await (this.client as Redis).mget(...keys);
      return results.map(r => typeof r === 'string' ? r : r ? String(r) : null);
    } else {
      return await (this.client as RedisClientType).mGet(keys);
    }
  }

  async mSet(keyValues: Array<{ key: string; value: string }>): Promise<void> {
    await this.ensureConnection();
    if (this.config.type === 'upstash') {
      const pipeline = (this.client as Redis).pipeline();
      for (const { key, value } of keyValues) {
        pipeline.set(key, value);
      }
      await pipeline.exec();
    } else {
      const multi = (this.client as RedisClientType).multi();
      for (const { key, value } of keyValues) {
        multi.set(key, value);
      }
      await multi.exec();
    }
  }

  // ==========================================================================
  // UTILITY OPERATIONS
  // ==========================================================================

  async keys(pattern: string): Promise<string[]> {
    await this.ensureConnection();
    return await this.client.keys(pattern);
  }

  async ping(): Promise<string> {
    await this.ensureConnection();
    const result = await this.client.ping();
    return typeof result === 'string' ? result : String(result);
  }

  getProviderInfo() {
    return {
      name: `redis-${this.config.type}`,
      version: '1.0.0',
      capabilities: ['persistence', 'indexing', 'fast-access', this.config.type]
    };
  }

  async disconnect(): Promise<void> {
    if (this.config.type === 'local' && this.connected) {
      await (this.client as RedisClientType).disconnect();
    }
  }
}
