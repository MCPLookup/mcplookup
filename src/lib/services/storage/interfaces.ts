// Storage Interfaces - Unified API for all storage providers
// Thoughtfully designed for consistency, performance, and maintainability

import { MCPServerRecord, CapabilityCategory, VerificationChallenge } from '../../schemas/discovery';

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
 * Paginated response wrapper
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
export interface SearchOptions extends PaginationOptions {
  sortBy?: 'domain' | 'name' | 'updated_at' | 'health_score';
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
}

/**
 * Health check result with detailed information
 */
export interface HealthCheckResult {
  healthy: boolean;
  latency?: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

// =============================================================================
// VERIFICATION STORAGE TYPES
// =============================================================================

/**
 * Verification Challenge Data (extended with storage metadata)
 * Immutable once created, with clear lifecycle tracking
 */
export interface VerificationChallengeData extends VerificationChallenge {
  readonly endpoint: string;
  readonly contact_email: string;
  readonly token: string;
  readonly created_at: string;
  readonly verified_at?: string;
  readonly attempts?: number;
  readonly last_attempt_at?: string;
}

// =============================================================================
// REGISTRY STORAGE TYPES
// =============================================================================

/**
 * Registry statistics with comprehensive metrics
 */
export interface RegistryStats {
  totalServers: number;
  activeServers: number;
  categories: Record<CapabilityCategory, number>;
  capabilities: Record<string, number>;
  memoryUsage?: {
    used: string;
    total?: string;
    percentage?: number;
  };
  performance: {
    avgResponseTime: number;
    cacheHitRate?: number;
  };
  lastUpdated: string;
}

/**
 * Batch operation result for bulk operations
 */
export interface BatchOperationResult {
  successful: number;
  failed: number;
  errors: Array<{ domain: string; error: string }>;
}

/**
 * Registry Storage Interface
 * Thoughtfully designed for scalability, performance, and maintainability
 */
export interface IRegistryStorage {
  // ==========================================================================
  // CORE CRUD OPERATIONS
  // ==========================================================================

  /**
   * Store or update a server record
   * @param domain - Unique domain identifier
   * @param server - Complete server record
   * @returns Promise resolving to operation result
   */
  storeServer(domain: string, server: MCPServerRecord): Promise<StorageResult<void>>;

  /**
   * Retrieve a server by domain
   * @param domain - Domain to lookup
   * @returns Promise resolving to server record or null if not found
   */
  getServer(domain: string): Promise<StorageResult<MCPServerRecord | null>>;

  /**
   * Delete a server and all associated indexes
   * @param domain - Domain to delete
   * @returns Promise resolving to operation result
   */
  deleteServer(domain: string): Promise<StorageResult<void>>;

  // ==========================================================================
  // BULK & BATCH OPERATIONS
  // ==========================================================================

  /**
   * Get all servers with pagination support
   * @param options - Pagination and sorting options
   * @returns Promise resolving to paginated server list
   */
  getAllServers(options?: SearchOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>>;

  /**
   * Store multiple servers in a single atomic operation
   * @param servers - Map of domain to server record
   * @returns Promise resolving to batch operation result
   */
  storeServers(servers: Map<string, MCPServerRecord>): Promise<StorageResult<BatchOperationResult>>;

  // ==========================================================================
  // SEARCH & FILTERING
  // ==========================================================================

  /**
   * Get servers by category with pagination
   * @param category - Capability category to filter by
   * @param options - Search and pagination options
   * @returns Promise resolving to paginated results
   */
  getServersByCategory(
    category: CapabilityCategory,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>>;

  /**
   * Get servers by specific capability
   * @param capability - Specific capability to filter by
   * @param options - Search and pagination options
   * @returns Promise resolving to paginated results
   */
  getServersByCapability(
    capability: string,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>>;

  /**
   * Full-text search across server records
   * @param query - Search query string
   * @param options - Search and pagination options
   * @returns Promise resolving to paginated search results
   */
  searchServers(
    query: string,
    options?: SearchOptions
  ): Promise<StorageResult<PaginatedResult<MCPServerRecord>>>;

  // ==========================================================================
  // MONITORING & MAINTENANCE
  // ==========================================================================

  /**
   * Get comprehensive storage statistics
   * @returns Promise resolving to detailed statistics
   */
  getStats(): Promise<StorageResult<RegistryStats>>;

  /**
   * Perform health check with detailed diagnostics
   * @returns Promise resolving to health check result
   */
  healthCheck(): Promise<HealthCheckResult>;

  /**
   * Clean up expired or invalid records
   * @param dryRun - If true, return what would be cleaned without actually doing it
   * @returns Promise resolving to cleanup result
   */
  cleanup(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>>;
}

// =============================================================================
// VERIFICATION STORAGE TYPES
// =============================================================================

/**
 * Verification statistics with detailed metrics
 */
export interface VerificationStats {
  totalChallenges: number;
  activeChallenges: number;
  verifiedChallenges: number;
  expiredChallenges: number;
  failedChallenges: number;
  memoryUsage?: {
    used: string;
    total?: string;
  };
  averageVerificationTime?: number;
  lastUpdated: string;
}

/**
 * Challenge query options for filtering and pagination
 */
export interface ChallengeQueryOptions extends PaginationOptions {
  status?: 'pending' | 'verified' | 'failed' | 'expired';
  domain?: string;
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * Verification Storage Interface
 * Handles DNS verification challenges with robust lifecycle management
 */
export interface IVerificationStorage {
  // ==========================================================================
  // CORE CHALLENGE OPERATIONS
  // ==========================================================================

  /**
   * Store a new verification challenge
   * @param challengeId - Unique challenge identifier
   * @param challenge - Challenge data with metadata
   * @returns Promise resolving to operation result
   */
  storeChallenge(
    challengeId: string,
    challenge: VerificationChallengeData
  ): Promise<StorageResult<void>>;

  /**
   * Retrieve a challenge by ID
   * @param challengeId - Challenge identifier
   * @returns Promise resolving to challenge data or null if not found
   */
  getChallenge(challengeId: string): Promise<StorageResult<VerificationChallengeData | null>>;

  /**
   * Delete a challenge and cleanup associated data
   * @param challengeId - Challenge identifier
   * @returns Promise resolving to operation result
   */
  deleteChallenge(challengeId: string): Promise<StorageResult<void>>;

  // ==========================================================================
  // CHALLENGE LIFECYCLE MANAGEMENT
  // ==========================================================================

  /**
   * Mark a challenge as verified with timestamp
   * @param challengeId - Challenge identifier
   * @returns Promise resolving to operation result
   */
  markChallengeVerified(challengeId: string): Promise<StorageResult<void>>;

  /**
   * Record a verification attempt (success or failure)
   * @param challengeId - Challenge identifier
   * @param success - Whether the attempt was successful
   * @param details - Optional details about the attempt
   * @returns Promise resolving to operation result
   */
  recordVerificationAttempt(
    challengeId: string,
    success: boolean,
    details?: string
  ): Promise<StorageResult<void>>;

  /**
   * Get challenges by domain with filtering
   * @param domain - Domain to filter by
   * @param options - Query options for filtering and pagination
   * @returns Promise resolving to paginated challenge list
   */
  getChallengesByDomain(
    domain: string,
    options?: ChallengeQueryOptions
  ): Promise<StorageResult<PaginatedResult<VerificationChallengeData>>>;

  // ==========================================================================
  // MAINTENANCE & MONITORING
  // ==========================================================================

  /**
   * Clean up expired challenges automatically
   * @param dryRun - If true, return what would be cleaned without actually doing it
   * @returns Promise resolving to cleanup result
   */
  cleanupExpiredChallenges(
    dryRun?: boolean
  ): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>>;

  /**
   * Get comprehensive verification statistics
   * @returns Promise resolving to detailed statistics
   */
  getStats(): Promise<StorageResult<VerificationStats>>;

  /**
   * Perform health check with detailed diagnostics
   * @returns Promise resolving to health check result
   */
  healthCheck(): Promise<HealthCheckResult>;
}

// =============================================================================
// BASE STORAGE INTERFACE
// =============================================================================

/**
 * Base storage interface with common operations
 * All storage implementations should extend this
 */
export interface IBaseStorage {
  /**
   * Initialize the storage connection/setup
   * @returns Promise resolving to initialization result
   */
  initialize?(): Promise<StorageResult<void>>;

  /**
   * Gracefully close storage connections
   * @returns Promise resolving when cleanup is complete
   */
  disconnect?(): Promise<void>;

  /**
   * Get storage provider information
   * @returns Storage provider details
   */
  getProviderInfo(): {
    name: string;
    version: string;
    capabilities: string[];
  };
}

// =============================================================================
// UTILITY FUNCTIONS & HELPERS
// =============================================================================

/**
 * Create a successful storage result
 */
export function createSuccessResult<T>(data: T): StorageResult<T> {
  return { success: true, data };
}

/**
 * Create a failed storage result
 */
export function createErrorResult<T>(error: string, code?: string): StorageResult<T> {
  return { success: false, error, code };
}

/**
 * Create an empty paginated result
 */
export function createEmptyPaginatedResult<T>(): PaginatedResult<T> {
  return {
    items: [],
    total: 0,
    hasMore: false
  };
}

/**
 * Create a health check result
 */
export function createHealthCheckResult(
  healthy: boolean,
  latency?: number,
  details?: Record<string, unknown>
): HealthCheckResult {
  return {
    healthy,
    latency,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Default pagination options
 */
export const DEFAULT_PAGINATION: Required<PaginationOptions> = {
  limit: 50,
  offset: 0,
  cursor: ''
};

/**
 * Default search options
 */
export const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  ...DEFAULT_PAGINATION,
  sortBy: 'updated_at',
  sortOrder: 'desc',
  includeInactive: false
};

// =============================================================================
// TYPE GUARDS & VALIDATION
// =============================================================================

/**
 * Type guard to check if a result is successful
 */
export function isSuccessResult<T>(result: StorageResult<T>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard to check if a result is an error
 */
export function isErrorResult<T>(result: StorageResult<T>): result is { success: false; error: string; code?: string } {
  return !result.success;
}

/**
 * Validate pagination options
 */
export function validatePaginationOptions(options: PaginationOptions): PaginationOptions {
  return {
    limit: Math.min(Math.max(options.limit || DEFAULT_PAGINATION.limit, 1), 1000),
    offset: Math.max(options.offset || DEFAULT_PAGINATION.offset, 0),
    cursor: options.cursor
  };
}

// =============================================================================
// INTERFACE DOCUMENTATION
// =============================================================================

/**
 * STORAGE INTERFACE DESIGN PRINCIPLES:
 *
 * 1. **Consistency**: All methods return StorageResult<T> for uniform error handling
 * 2. **Pagination**: Large result sets are paginated by default to prevent memory issues
 * 3. **Performance**: Interfaces support efficient operations like batch processing
 * 4. **Monitoring**: Built-in health checks and statistics for observability
 * 5. **Maintenance**: Cleanup methods for automated maintenance tasks
 * 6. **Flexibility**: Optional parameters and extensible options interfaces
 * 7. **Type Safety**: Strong typing with TypeScript for compile-time safety
 * 8. **Documentation**: Comprehensive JSDoc comments for all methods
 */