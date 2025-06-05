// Storage Backend Interface
// Defines the contract that all storage backends must implement

export interface StorageBackend {
  // ==========================================================================
  // BASIC CRUD OPERATIONS
  // ==========================================================================
  
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;

  // ==========================================================================
  // SET OPERATIONS (for collections and indexes)
  // ==========================================================================
  
  sAdd(key: string, member: string): Promise<void>;
  sRem(key: string, member: string): Promise<void>;
  sMembers(key: string): Promise<string[]>;
  sCard(key: string): Promise<number>;

  // ==========================================================================
  // SORTED SET OPERATIONS (for numeric/date indexes)
  // ==========================================================================
  
  zAdd(key: string, score: number, member: string): Promise<void>;
  zRem(key: string, member: string): Promise<void>;
  zRangeByScore(key: string, min: number | string, max: number | string): Promise<string[]>;
  zRange(key: string, start: number, stop: number): Promise<string[]>;
  zRevRange(key: string, start: number, stop: number): Promise<string[]>;

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================
  
  mGet(keys: string[]): Promise<(string | null)[]>;
  mSet(keyValues: Array<{ key: string; value: string }>): Promise<void>;

  // ==========================================================================
  // UTILITY OPERATIONS
  // ==========================================================================
  
  keys(pattern: string): Promise<string[]>;
  ping(): Promise<string>;
  getProviderInfo(): {
    name: string;
    version: string;
    capabilities: string[];
  };
}
