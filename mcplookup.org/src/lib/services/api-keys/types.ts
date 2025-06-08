// API Key Types and Interfaces
// Defines the data structures for API key management

/**
 * API Key permissions
 */
export type ApiKeyPermission = 
  | 'discovery:read'      // Can use discovery endpoints
  | 'servers:read'        // Can read server information
  | 'servers:write'       // Can register/update servers
  | 'servers:delete'      // Can delete servers
  | 'analytics:read'      // Can access usage analytics
  | 'admin:read'          // Admin read access
  | 'admin:write';        // Admin write access

/**
 * API Key rate limiting configuration
 */
export interface ApiKeyRateLimit {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
}

/**
 * API Key for user authentication
 */
export interface ApiKey {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly key_hash: string; // Hashed version of the API key
  readonly key_prefix: string; // First 8 characters for display (e.g., "mcp_1234...")
  readonly permissions: ApiKeyPermission[];
  readonly last_used_at?: string;
  readonly usage_count: number;
  readonly rate_limit?: ApiKeyRateLimit;
  readonly expires_at?: string;
  readonly is_active: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * API Key usage tracking
 */
export interface ApiKeyUsage {
  readonly id: string;
  readonly api_key_id: string;
  readonly endpoint: string;
  readonly method: string;
  readonly status_code: number;
  readonly response_time_ms: number;
  readonly user_agent?: string;
  readonly ip_address?: string;
  readonly created_at: string;
}

/**
 * API Key creation request
 */
export interface CreateApiKeyRequest {
  name: string;
  permissions: ApiKeyPermission[];
  rate_limit?: ApiKeyRateLimit;
  expires_at?: string; // ISO date string
}

/**
 * API Key creation response (includes the raw key)
 */
export interface CreateApiKeyResponse {
  api_key: ApiKey;
  raw_key: string; // Only returned once during creation
}

/**
 * API Key validation result
 */
export interface ApiKeyValidationResult {
  valid: boolean;
  api_key?: ApiKey;
  error?: string;
  rate_limit_exceeded?: boolean;
}

/**
 * API Key usage statistics
 */
export interface ApiKeyStats {
  total_requests: number;
  requests_today: number;
  requests_this_week: number;
  requests_this_month: number;
  last_used_at?: string;
  most_used_endpoints: Array<{
    endpoint: string;
    count: number;
  }>;
  error_rate: number; // Percentage of failed requests
}

/**
 * Default permissions for different user types
 */
export const DEFAULT_PERMISSIONS: Record<string, ApiKeyPermission[]> = {
  user: ['discovery:read', 'servers:read', 'servers:write', 'analytics:read'],
  admin: ['discovery:read', 'servers:read', 'servers:write', 'servers:delete', 'analytics:read', 'admin:read', 'admin:write']
};

/**
 * Default rate limits for different user types
 */
export const DEFAULT_RATE_LIMITS: Record<string, ApiKeyRateLimit> = {
  user: {
    requests_per_minute: 60,
    requests_per_hour: 1000,
    requests_per_day: 10000
  },
  admin: {
    requests_per_minute: 300,
    requests_per_hour: 10000,
    requests_per_day: 100000
  }
};
