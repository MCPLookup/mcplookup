// Core Zod schemas for the MCPLookup.org discovery service
// Semantically justified fields based on MCP specification research

import { z } from 'zod';
import { SecureURLSchema, SecureDomainSchema } from '../security/url-validation';

// ============================================================================
// MCP PROTOCOL SCHEMAS (Based on MCP Specification)
// ============================================================================

/**
 * MCP Tool Definition
 * Source: MCP tools/list response format
 */
export const MCPToolSchema = z.object({
  name: z.string().describe("Unique tool identifier within the server"),
  description: z.string().describe("Human-readable description of what the tool does"),
  inputSchema: z.record(z.any()).describe("JSON Schema defining tool parameters")
});

/**
 * MCP Resource Definition  
 * Source: MCP resources/list response format
 */
export const MCPResourceSchema = z.object({
  uri: z.string().describe("Unique resource identifier (URI)"),
  name: z.string().describe("Human-readable resource name"),
  description: z.string().optional().describe("Resource description"),
  mimeType: z.string().optional().describe("MIME type for binary resources")
});

/**
 * MCP Server Info
 * Source: MCP initialize response
 */
export const MCPServerInfoSchema = z.object({
  name: z.string().describe("Server name from MCP initialize"),
  version: z.string().describe("Server version"),
  protocolVersion: z.string().describe("Supported MCP protocol version"),
  capabilities: z.object({
    tools: z.boolean().optional().describe("Supports tools"),
    resources: z.boolean().optional().describe("Supports resources"),
    prompts: z.boolean().optional().describe("Supports prompts"),
    logging: z.boolean().optional().describe("Supports logging")
  }).optional().describe("Server capabilities from MCP spec")
});

/**
 * OpenAPI Documentation Schema
 * Captures OpenAPI/Swagger documentation exposed by MCP servers
 */
export const OpenAPIDocumentationSchema = z.object({
  // Discovery metadata
  discovered_at: z.string().describe("When the OpenAPI spec was discovered"),
  spec_url: z.string().url().optional().describe("URL where the OpenAPI spec was found"),
  discovery_method: z.enum(['endpoint_scan', 'manual', 'header_hint', 'well_known']).describe("How the spec was discovered"),

  // OpenAPI specification details
  openapi_version: z.string().describe("OpenAPI specification version (e.g., '3.0.3')"),
  spec_format: z.enum(['json', 'yaml']).describe("Format of the specification"),

  // API metadata from the spec
  api_info: z.object({
    title: z.string().describe("API title"),
    version: z.string().describe("API version"),
    description: z.string().optional().describe("API description"),
    contact: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      url: z.string().url().optional()
    }).optional().describe("Contact information"),
    license: z.object({
      name: z.string(),
      url: z.string().url().optional()
    }).optional().describe("License information")
  }).describe("API information from OpenAPI spec"),

  // Server information
  servers: z.array(z.object({
    url: z.string().describe("Server URL"),
    description: z.string().optional().describe("Server description"),
    variables: z.record(z.any()).optional().describe("Server variables")
  })).describe("Server definitions from OpenAPI spec"),

  // Endpoints summary
  endpoints_summary: z.object({
    total_paths: z.number().describe("Total number of API paths"),
    total_operations: z.number().describe("Total number of operations"),
    methods: z.record(z.number()).describe("Count by HTTP method"),
    tags: z.array(z.string()).describe("Available tags"),
    has_authentication: z.boolean().describe("Whether API requires authentication"),
    auth_schemes: z.array(z.string()).describe("Authentication scheme types")
  }).describe("Summary of API endpoints and operations"),

  // Full specification (optional, for caching)
  full_spec: z.any().optional().describe("Complete OpenAPI specification (JSON)"),
  spec_hash: z.string().optional().describe("Hash of the specification for change detection"),

  // Validation status
  validation: z.object({
    is_valid: z.boolean().describe("Whether the OpenAPI spec is valid"),
    validation_errors: z.array(z.string()).describe("Validation error messages"),
    last_validated: z.string().describe("Last validation timestamp")
  }).describe("OpenAPI specification validation status")
});

/**
 * Transport Capabilities Schema
 * Detailed metadata about MCP transport capabilities discovered during verification
 */
export const TransportCapabilitiesSchema = z.object({
  // Basic transport detection
  primary_transport: z.enum(['streamable_http', 'sse', 'stdio']).describe("Primary transport protocol"),
  supported_methods: z.array(z.string()).describe("Supported HTTP methods"),
  content_types: z.array(z.string()).describe("Supported content types"),

  // SSE capabilities
  sse_support: z.object({
    supports_sse: z.boolean().describe("Supports Server-Sent Events"),
    supports_get_streaming: z.boolean().describe("Supports GET streaming"),
    supports_post_streaming: z.boolean().describe("Supports POST streaming")
  }).describe("Server-Sent Events capabilities"),

  // Session management
  session_support: z.object({
    supports_sessions: z.boolean().describe("Supports session management"),
    session_header_name: z.string().optional().describe("Session header name"),
    session_timeout_indicated: z.boolean().describe("Indicates session timeout")
  }).describe("Session management capabilities"),

  // Resumability
  resumability: z.object({
    supports_event_ids: z.boolean().describe("Supports event IDs for resumability"),
    supports_last_event_id: z.boolean().describe("Supports Last-Event-ID header"),
    event_id_format: z.string().optional().describe("Event ID format pattern")
  }).describe("Stream resumability capabilities"),

  // Connection capabilities
  connection_limits: z.object({
    supports_multiple_connections: z.boolean().describe("Supports multiple concurrent connections"),
    max_concurrent_connections: z.number().optional().describe("Maximum concurrent connections")
  }).describe("Connection limit information"),

  // Security features
  security_features: z.object({
    origin_validation: z.boolean().describe("Validates request origins"),
    ssl_required: z.boolean().describe("Requires SSL/TLS"),
    custom_auth_headers: z.array(z.string()).describe("Custom authentication headers")
  }).describe("Security feature detection"),

  // Performance metadata
  performance: z.object({
    avg_response_time_ms: z.number().describe("Average response time in milliseconds"),
    streaming_latency_ms: z.number().optional().describe("Streaming latency in milliseconds"),
    supports_compression: z.boolean().describe("Supports response compression"),
    max_message_size: z.number().optional().describe("Maximum message size in bytes")
  }).describe("Performance characteristics"),

  // CORS details
  cors_details: z.object({
    cors_enabled: z.boolean().describe("CORS is enabled"),
    allowed_origins: z.array(z.string()).describe("Allowed origins"),
    allowed_methods: z.array(z.string()).describe("Allowed HTTP methods"),
    allowed_headers: z.array(z.string()).describe("Allowed headers"),
    supports_credentials: z.boolean().describe("Supports credentials")
  }).describe("CORS configuration details"),

  // Rate limiting (if detectable)
  rate_limits: z.object({
    requests_per_minute: z.number().optional().describe("Requests per minute limit"),
    burst_limit: z.number().optional().describe("Burst request limit"),
    rate_limit_headers: z.array(z.string()).describe("Rate limit header names")
  }).optional().describe("Rate limiting information")
});

// ============================================================================
// AUTHENTICATION SCHEMAS (Based on MCP Auth Specification)
// ============================================================================

/**
 * OAuth2 Configuration
 * Source: MCP OAuth 2.1 specification
 */
export const OAuth2ConfigSchema = z.object({
  authorizationUrl: z.string().url().describe("OAuth2 authorization endpoint"),
  tokenUrl: z.string().url().describe("OAuth2 token endpoint"),
  scopes: z.array(z.string()).describe("Available OAuth2 scopes"),
  clientId: z.string().optional().describe("Public client ID if available")
});

/**
 * Authentication Configuration
 * Source: MCP authorization specification
 */
export const AuthConfigSchema = z.object({
  type: z.enum(['none', 'api_key', 'oauth2', 'basic']).describe("Authentication method required"),
  oauth2: OAuth2ConfigSchema.optional().describe("OAuth2 configuration if applicable"),
  apiKeyLocation: z.enum(['header', 'query', 'body']).optional().describe("Where to send API key"),
  apiKeyName: z.string().optional().describe("API key parameter/header name"),
  description: z.string().optional().describe("Auth setup instructions for users")
});

// ============================================================================
// OPERATIONAL SCHEMAS (Justified by reliability requirements)
// ============================================================================

/**
 * Health Metrics
 * Justified: Agents need to select reliable servers
 */
export const HealthMetricsSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']).describe("Current operational status"),
  uptime_percentage: z.number().min(0).max(100).describe("Uptime over last 30 days"),
  avg_response_time_ms: z.number().min(0).describe("Average response time in milliseconds"),
  response_time_ms: z.number().min(0).describe("Current response time in milliseconds").optional(),
  error_rate: z.number().min(0).max(1).describe("Error rate over last 24 hours"),
  last_check: z.string().datetime().describe("ISO 8601 timestamp of last health check"),
  consecutive_failures: z.number().min(0).describe("Current consecutive failed checks")
});

/**
 * Verification Status
 * Justified: Trust establishment for security
 */
export const VerificationSchema = z.object({
  dns_verified: z.boolean().describe("Domain ownership verified via DNS TXT record"),
  endpoint_verified: z.boolean().describe("MCP endpoint responds to protocol checks"),
  ssl_verified: z.boolean().describe("Endpoint uses valid SSL certificate"),
  last_verification: z.string().datetime().describe("Last successful verification timestamp"),
  verification_method: z.string().describe("Method used for verification (e.g., 'dns-txt-challenge')"),
  dns_record: z.string().optional().describe("DNS TXT record value used for verification"),
  verified_at: z.string().datetime().optional().describe("When domain was first verified")
});

// ============================================================================
// CAPABILITY SCHEMAS (Semantic organization for discovery)
// ============================================================================

/**
 * Capability Categories
 * Justified: Semantic organization for agent discovery
 */
export const CapabilityCategoryEnum = z.enum([
  'communication',     // Email, chat, messaging, notifications
  'productivity',      // Calendars, tasks, notes, documents
  'data',             // Databases, APIs, storage, retrieval
  'development',      // Code repositories, CI/CD, deployment
  'content',          // Media creation, editing, publishing
  'integration',      // Webhooks, automation, workflows
  'analytics',        // Metrics, reporting, business intelligence
  'security',         // Authentication, encryption, scanning
  'finance',          // Payments, accounting, transactions
  'ecommerce',        // Shopping, inventory, orders
  'social',           // Social media, community, sharing
  'other'             // Uncategorized capabilities
]);

/**
 * Capability Classification
 * Justified: Enables intent-based discovery
 */
export const CapabilitySchema = z.object({
  category: CapabilityCategoryEnum.describe("Primary capability category"),
  subcategories: z.array(z.string()).describe("Specific capability tags"),
  intent_keywords: z.array(z.string()).describe("Keywords for natural language intent matching"),
  use_cases: z.array(z.string()).describe("Common use case descriptions")
});

// ============================================================================
// DISCOVERY SCHEMAS (Complete server record for one-call efficiency)
// ============================================================================

/**
 * Complete MCP Server Record
 * Justified: All data needed for agent connection in single call
 */
export const MCPServerRecordSchema = z.object({
  // ---- IDENTITY ----
  domain: z.string().describe("Verified domain name (e.g., 'gmail.com')"),
  endpoint: z.string().url().describe("Full MCP HTTP endpoint URL"),
  name: z.string().describe("Human-readable server name"),
  description: z.string().describe("Server description and primary purpose"),
  
  // ---- MCP PROTOCOL DATA ----
  server_info: MCPServerInfoSchema.describe("MCP server information from initialize"),
  tools: z.array(MCPToolSchema).describe("Available tools from tools/list"),
  resources: z.array(MCPResourceSchema).describe("Available resources from resources/list"),
  transport: z.enum(['streamable_http', 'sse', 'stdio']).describe("Supported transport protocol"),
  transport_capabilities: TransportCapabilitiesSchema.optional().describe("Detailed transport capabilities discovered during verification"),
  openapi_documentation: OpenAPIDocumentationSchema.optional().describe("OpenAPI/Swagger documentation exposed by the server"),
  
  // ---- SEMANTIC ORGANIZATION ----
  capabilities: CapabilitySchema.describe("Capability classification for discovery"),
  
  // ---- TECHNICAL REQUIREMENTS ----
  auth: AuthConfigSchema.describe("Authentication requirements and configuration"),
  cors_enabled: z.boolean().describe("Whether CORS is enabled for web clients"),
  rate_limits: z.object({
    requests_per_minute: z.number().optional(),
    requests_per_hour: z.number().optional(),
    burst_limit: z.number().optional()
  }).optional().describe("Rate limiting information if known"),
  
  // ---- OPERATIONAL STATUS ----
  health: HealthMetricsSchema.describe("Current operational health metrics"),
  verification: VerificationSchema.describe("Trust and verification status"),
  
  // ---- METADATA ----
  created_at: z.string().datetime().describe("Registration timestamp"),
  updated_at: z.string().datetime().describe("Last update timestamp"),
  maintainer: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    url: z.string().url().optional()
  }).optional().describe("Server maintainer information"),

  // ---- VERIFICATION TRACKING ----
  verification_status: z.enum(['verified', 'unverified', 'challenged', 'revoked']).optional().describe("Current verification status"),
  consecutive_verification_failures: z.number().optional().describe("Number of consecutive verification failures"),
  marked_unverified_at: z.string().datetime().optional().describe("When server was marked as unverified"),
  verification_failure_reason: z.string().optional().describe("Reason for verification failure"),
  last_verification_check: z.string().datetime().optional().describe("Last time verification was checked"),
  trust_score: z.number().min(0).max(100).optional().describe("Trust score (0-100)")
});

// ============================================================================
// DISCOVERY REQUEST/RESPONSE SCHEMAS
// ============================================================================

/**
 * Flexible Discovery Query Schema
 * Allows agents to express complex search requirements naturally
 */

// Query Expression Types
const QueryExpressionSchema = z.object({
  type: z.enum(['exact', 'fuzzy', 'contains', 'regex', 'semantic']).describe("Matching strategy"),
  value: z.string().describe("Query value"),
  weight: z.number().min(0).max(1).default(1).describe("Importance weight (0-1)"),
  required: z.boolean().default(false).describe("Must match for inclusion")
});

const CapabilityQuerySchema = z.object({
  operator: z.enum(['AND', 'OR', 'NOT']).default('AND').describe("Logical operator"),
  capabilities: z.array(QueryExpressionSchema).describe("Capability expressions"),
  minimum_match: z.number().min(0).max(1).default(0.5).describe("Minimum match score (0-1)")
});

const SimilarityQuerySchema = z.object({
  reference_domain: z.string().describe("Domain to find similar servers to"),
  similarity_threshold: z.number().min(0).max(1).default(0.7).describe("Similarity threshold"),
  exclude_reference: z.boolean().default(true).describe("Exclude the reference domain from results")
});

const PerformanceConstraintsSchema = z.object({
  min_uptime: z.number().min(0).max(100).optional().describe("Minimum uptime percentage"),
  max_response_time: z.number().min(0).optional().describe("Maximum response time (ms)"),
  min_trust_score: z.number().min(0).max(100).optional().describe("Minimum trust score"),
  verified_only: z.boolean().default(true).describe("Only DNS-verified servers"),
  healthy_only: z.boolean().default(true).describe("Only healthy servers")
});

const TechnicalRequirementsSchema = z.object({
  auth_types: z.array(z.string()).optional().describe("Acceptable auth methods"),
  transport: z.enum(['streamable_http', 'sse', 'stdio']).optional().describe("Required transport"),
  cors_support: z.boolean().optional().describe("Requires CORS support"),
  rate_limits: z.object({
    min_requests_per_hour: z.number().optional(),
    max_requests_per_hour: z.number().optional()
  }).optional().describe("Rate limit requirements"),
  api_version: z.string().optional().describe("Required API version pattern")
});

/**
 * Flexible Discovery Request Schema
 * Agents can combine multiple query strategies for precise discovery
 */
export const DiscoveryRequestSchema = z.object({
  // ---- FLEXIBLE QUERY STRATEGIES ----

  // Natural language query (most flexible)
  query: z.string().optional().describe("Natural language query: 'Find email servers like Gmail but faster'"),

  // Exact lookups
  domain: QueryExpressionSchema.optional().describe("Domain matching with strategy"),
  domains: z.array(z.string()).optional().describe("Multiple exact domain lookups"),

  // Capability-based discovery (flexible combinations)
  capabilities: CapabilityQuerySchema.optional().describe("Complex capability requirements"),

  // Similarity-based discovery
  similar_to: SimilarityQuerySchema.optional().describe("Find servers similar to a reference"),

  // Category and keyword search
  categories: z.array(CapabilityCategoryEnum).optional().describe("Multiple category filters"),
  keywords: z.array(QueryExpressionSchema).optional().describe("Keyword search with strategies"),

  // Use case and intent
  use_cases: z.array(z.string()).optional().describe("Multiple use case descriptions"),
  intent: z.string().optional().describe("High-level intent description"),

  // ---- CONSTRAINTS AND FILTERS ----
  performance: PerformanceConstraintsSchema.optional().describe("Performance requirements"),
  technical: TechnicalRequirementsSchema.optional().describe("Technical requirements"),

  // Geographic and temporal
  regions: z.array(z.string()).optional().describe("Preferred geographic regions"),
  exclude_domains: z.array(z.string()).optional().describe("Domains to exclude"),

  // ---- RESPONSE CUSTOMIZATION ----
  limit: z.number().min(1).max(100).default(10).describe("Maximum results"),
  offset: z.number().min(0).default(0).describe("Pagination offset"),

  // Result enrichment
  include: z.object({
    health_metrics: z.boolean().default(true),
    tool_definitions: z.boolean().default(false),
    resource_definitions: z.boolean().default(false),
    usage_statistics: z.boolean().default(false),
    similar_servers: z.boolean().default(false),
    alternative_suggestions: z.boolean().default(true)
  }).optional().describe("What to include in results"),

  // Sorting and ranking
  sort_by: z.enum(['relevance', 'similarity', 'performance', 'popularity', 'trust_score', 'response_time']).default('relevance'),
  ranking_weights: z.object({
    relevance: z.number().min(0).max(1).default(0.4),
    performance: z.number().min(0).max(1).default(0.3),
    trust_score: z.number().min(0).max(1).default(0.2),
    popularity: z.number().min(0).max(1).default(0.1)
  }).optional().describe("Custom ranking weights")
});

/**
 * Discovery Response Schema
 * Justified: Complete response with metadata for pagination and debugging
 */
export const DiscoveryResponseSchema = z.object({
  servers: z.array(MCPServerRecordSchema).describe("Matching MCP servers"),
  pagination: z.object({
    total_count: z.number().describe("Total servers matching criteria"),
    returned_count: z.number().describe("Number of servers in this response"),
    offset: z.number().describe("Current pagination offset"),
    has_more: z.boolean().describe("Whether more results are available")
  }).describe("Pagination information"),
  query_metadata: z.object({
    query_time_ms: z.number().describe("Query execution time in milliseconds"),
    cache_hit: z.boolean().describe("Whether result was served from cache"),
    filters_applied: z.array(z.string()).describe("List of filters that were applied")
  }).describe("Query execution metadata"),
  suggestions: z.array(z.string()).optional().describe("Alternative search suggestions if no results")
});

// ============================================================================
// REGISTRATION SCHEMAS
// ============================================================================

/**
 * Server Registration Request
 * Justified: Minimal data needed to start verification process
 */
export const RegistrationRequestSchema = z.object({
  domain: SecureDomainSchema.describe("Domain to register (e.g., 'api.example.com')"),
  endpoint: SecureURLSchema.describe("MCP endpoint URL"),
  contact_email: z.string().email().describe("Contact email for verification"),
  description: z.string().optional().describe("Server description")
});

/**
 * DNS Verification Challenge
 * Justified: Cryptographic proof of domain ownership
 */
export const VerificationChallengeSchema = z.object({
  challenge_id: z.string().uuid().describe("Unique challenge identifier"),
  domain: z.string().describe("Domain being verified"),
  txt_record_name: z.string().describe("DNS TXT record name to create"),
  txt_record_value: z.string().describe("DNS TXT record value to set"),
  expires_at: z.string().datetime().describe("Challenge expiration time"),
  instructions: z.string().describe("Human-readable setup instructions"),
  status: z.enum(['pending', 'verified', 'failed', 'expired']).optional().describe("Challenge status")
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MCPTool = z.infer<typeof MCPToolSchema>;
export type MCPResource = z.infer<typeof MCPResourceSchema>;
export type MCPServerInfo = z.infer<typeof MCPServerInfoSchema>;
export type TransportCapabilities = z.infer<typeof TransportCapabilitiesSchema>;
export type OpenAPIDocumentation = z.infer<typeof OpenAPIDocumentationSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type HealthMetrics = z.infer<typeof HealthMetricsSchema>;
export type Verification = z.infer<typeof VerificationSchema>;
export type Capability = z.infer<typeof CapabilitySchema>;
export type MCPServerRecord = z.infer<typeof MCPServerRecordSchema>;
export type DiscoveryRequest = z.infer<typeof DiscoveryRequestSchema>;
export type DiscoveryResponse = z.infer<typeof DiscoveryResponseSchema>;
export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;
export type VerificationChallenge = z.infer<typeof VerificationChallengeSchema>;
export type CapabilityCategory = z.infer<typeof CapabilityCategoryEnum>;
