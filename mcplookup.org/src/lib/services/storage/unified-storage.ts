// Unified Storage Interface - Generic storage operations
// Domain-agnostic storage that works with any data type

// =============================================================================
// COMMON TYPES & UTILITIES
// =============================================================================

/**
 * Standard result wrapper for operations that may fail
 */
export type StorageResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};

/**
 * Pagination parameters for large result sets
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Search and filter options
 */
export interface QueryOptions {
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: PaginationOptions;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  healthy: boolean;
  latency?: number;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  totalProcessed: number;
}

// =============================================================================
// UNIFIED STORAGE INTERFACE
// =============================================================================

/**
 * Unified Storage Interface
 * Generic storage operations that work with any data type
 */
export interface IStorage {
  // ==========================================================================
  // CORE CRUD OPERATIONS
  // ==========================================================================

  /**
   * Store or update a record
   */
  set<T = any>(
    collection: string,
    key: string,
    data: T
  ): Promise<StorageResult<void>>;

  /**
   * Retrieve a record by key
   */
  get<T = any>(
    collection: string,
    key: string
  ): Promise<StorageResult<T | null>>;

  /**
   * Delete a record by key
   */
  delete(
    collection: string,
    key: string
  ): Promise<StorageResult<void>>;

  /**
   * Check if a record exists
   */
  exists(
    collection: string,
    key: string
  ): Promise<StorageResult<boolean>>;

  // ==========================================================================
  // QUERY OPERATIONS
  // ==========================================================================

  /**
   * Get all records from a collection
   */
  getAll<T = any>(
    collection: string,
    options?: QueryOptions
  ): Promise<StorageResult<PaginatedResult<T>>>;

  /**
   * Query records with filters
   */
  query<T = any>(
    collection: string,
    options: QueryOptions
  ): Promise<StorageResult<PaginatedResult<T>>>;

  /**
   * Search records by text
   */
  search<T = any>(
    collection: string,
    searchText: string,
    options?: QueryOptions
  ): Promise<StorageResult<PaginatedResult<T>>>;

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Store multiple records
   */
  setBatch<T = any>(
    collection: string,
    records: Array<{ key: string; data: T }>
  ): Promise<StorageResult<BatchOperationResult<string>>>;

  /**
   * Delete multiple records
   */
  deleteBatch(
    collection: string,
    keys: string[]
  ): Promise<StorageResult<BatchOperationResult<string>>>;

  // ==========================================================================
  // MAINTENANCE & MONITORING
  // ==========================================================================

  /**
   * Health check
   */
  healthCheck(): Promise<HealthCheckResult>;

  /**
   * Get storage statistics
   */
  getStats(): Promise<StorageResult<{
    collections: Record<string, {
      count: number;
      size: number;
    }>;
    totalSize: number;
    uptime: number;
  }>>;

  /**
   * Clean up expired records
   */
  cleanup(): Promise<StorageResult<{
    deletedCount: number;
    collections: string[];
  }>>;

  // ==========================================================================
  // CONNECTION MANAGEMENT
  // ==========================================================================

  /**
   * Initialize the storage connection
   */
  initialize?(): Promise<StorageResult<void>>;

  /**
   * Close storage connections
   */
  disconnect?(): Promise<void>;

  /**
   * Get provider information
   */
  getProviderInfo(): {
    name: string;
    version: string;
    capabilities: string[];
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createSuccessResult<T>(data: T): StorageResult<T> {
  return { success: true, data };
}

export function createErrorResult<T>(error: string, code?: string): StorageResult<T> {
  return { success: false, error, code };
}

export function isSuccessResult<T>(result: StorageResult<T>): result is { success: true; data: T } {
  return result.success;
}

export function createEmptyPaginatedResult<T>(): PaginatedResult<T> {
  return {
    items: [],
    total: 0,
    hasMore: false
  };
}

export function createHealthCheckResult(
  healthy: boolean,
  latency?: number,
  error?: string,
  details?: Record<string, any>
): HealthCheckResult {
  return { healthy, latency, error, details };
}
