// Storage Service Types
// Unified storage interface for different backends

export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StorageService {
  // Basic CRUD operations
  get(collection: string, key: string): Promise<StorageResult>;
  set(collection: string, key: string, value: any): Promise<StorageResult>;
  delete(collection: string, key: string): Promise<StorageResult>;
  
  // Batch operations
  getAll(collection: string): Promise<StorageResult<any[]>>;
  getByPrefix(collection: string, prefix: string): Promise<StorageResult<any[]>>;
  
  // Health check
  healthCheck(): Promise<{ healthy: boolean; details?: any }>;
}

export interface RedisStorageConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

export interface FileStorageConfig {
  basePath: string;
  createDirectories?: boolean;
}

export interface MemoryStorageConfig {
  maxSize?: number;
  ttl?: number;
}

export type StorageConfig = RedisStorageConfig | FileStorageConfig | MemoryStorageConfig;

// Helper function to check if result is successful
export function isSuccessResult<T>(result: StorageResult<T>): result is StorageResult<T> & { success: true; data: T } {
  return result.success === true;
}

// Helper function to create success result
export function createSuccessResult<T>(data: T): StorageResult<T> {
  return { success: true, data };
}

// Helper function to create error result
export function createErrorResult(error: string): StorageResult {
  return { success: false, error };
}
