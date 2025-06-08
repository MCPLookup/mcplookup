// In-Memory Backend - Handles in-memory operations
// Indexing operations are no-ops (just use arrays/sets)

import { StorageBackend } from './storage-backend';

export class MemoryBackend implements StorageBackend {
  private data = new Map<string, string>();
  private sets = new Map<string, Set<string>>();
  private sortedSets = new Map<string, Map<string, number>>();

  // ==========================================================================
  // BASIC CRUD OPERATIONS
  // ==========================================================================

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
    this.sets.delete(key);
    this.sortedSets.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.data.has(key);
  }

  // ==========================================================================
  // SET OPERATIONS (for collections and indexes)
  // ==========================================================================

  async sAdd(key: string, member: string): Promise<void> {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    this.sets.get(key)!.add(member);
  }

  async sRem(key: string, member: string): Promise<void> {
    const set = this.sets.get(key);
    if (set) {
      set.delete(member);
      if (set.size === 0) {
        this.sets.delete(key);
      }
    }
  }

  async sMembers(key: string): Promise<string[]> {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  async sCard(key: string): Promise<number> {
    const set = this.sets.get(key);
    return set ? set.size : 0;
  }

  // ==========================================================================
  // SORTED SET OPERATIONS (for numeric/date indexes)
  // ==========================================================================

  async zAdd(key: string, score: number, member: string): Promise<void> {
    if (!this.sortedSets.has(key)) {
      this.sortedSets.set(key, new Map());
    }
    this.sortedSets.get(key)!.set(member, score);
  }

  async zRem(key: string, member: string): Promise<void> {
    const sortedSet = this.sortedSets.get(key);
    if (sortedSet) {
      sortedSet.delete(member);
      if (sortedSet.size === 0) {
        this.sortedSets.delete(key);
      }
    }
  }

  async zRangeByScore(key: string, min: number | string, max: number | string): Promise<string[]> {
    const sortedSet = this.sortedSets.get(key);
    if (!sortedSet) return [];

    const minScore = typeof min === 'string' ? (min === '-inf' ? -Infinity : parseFloat(min)) : min;
    const maxScore = typeof max === 'string' ? (max === '+inf' ? Infinity : parseFloat(max)) : max;

    return Array.from(sortedSet.entries())
      .filter(([_, score]) => score >= minScore && score <= maxScore)
      .sort(([, a], [, b]) => a - b)
      .map(([member]) => member);
  }

  async zRange(key: string, start: number, stop: number): Promise<string[]> {
    const sortedSet = this.sortedSets.get(key);
    if (!sortedSet) return [];

    const sorted = Array.from(sortedSet.entries())
      .sort(([, a], [, b]) => a - b)
      .map(([member]) => member);

    const actualStop = stop === -1 ? sorted.length : stop + 1;
    return sorted.slice(start, actualStop);
  }

  async zRevRange(key: string, start: number, stop: number): Promise<string[]> {
    const sortedSet = this.sortedSets.get(key);
    if (!sortedSet) return [];

    const sorted = Array.from(sortedSet.entries())
      .sort(([, a], [, b]) => b - a) // Reverse order
      .map(([member]) => member);

    const actualStop = stop === -1 ? sorted.length : stop + 1;
    return sorted.slice(start, actualStop);
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  async mGet(keys: string[]): Promise<(string | null)[]> {
    return keys.map(key => this.data.get(key) || null);
  }

  async mSet(keyValues: Array<{ key: string; value: string }>): Promise<void> {
    for (const { key, value } of keyValues) {
      this.data.set(key, value);
    }
  }

  // ==========================================================================
  // UTILITY OPERATIONS
  // ==========================================================================

  async keys(pattern: string): Promise<string[]> {
    // Simple pattern matching - just support * wildcard
    if (pattern === '*') {
      return Array.from(this.data.keys());
    }
    
    // Convert Redis pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  getProviderInfo() {
    return {
      name: 'memory',
      version: '1.0.0',
      capabilities: ['fast-access', 'testing', 'development']
    };
  }

  // ==========================================================================
  // MEMORY-SPECIFIC OPERATIONS
  // ==========================================================================

  clear(): void {
    this.data.clear();
    this.sets.clear();
    this.sortedSets.clear();
  }

  getStats() {
    return {
      dataKeys: this.data.size,
      setKeys: this.sets.size,
      sortedSetKeys: this.sortedSets.size,
      totalMemoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    
    // Estimate data size
    for (const [key, value] of Array.from(this.data.entries())) {
      size += key.length * 2 + value.length * 2; // UTF-16 characters
    }

    // Estimate sets size
    for (const [key, set] of Array.from(this.sets.entries())) {
      size += key.length * 2;
      for (const member of set) {
        size += member.length * 2;
      }
    }

    // Estimate sorted sets size
    for (const [key, sortedSet] of Array.from(this.sortedSets.entries())) {
      size += key.length * 2;
      for (const [member] of Array.from(sortedSet.entries())) {
        size += member.length * 2 + 8; // 8 bytes for number
      }
    }
    
    return size;
  }
}
