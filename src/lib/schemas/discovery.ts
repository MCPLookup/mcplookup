// Core Zod schemas for the MCPLookup.org discovery service
// Semantically justified fields based on MCP specification research

import { z } from 'zod';

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
  status: z.enum(['healthy', 'degraded', 'down', 'unknown']).describe("Current operational status"),
  uptime_percentage: z.number().min(0).max(100).describe("Uptime over last 30 days"),
  avg_response_time_ms: z.number().min(0).describe("Average response time in milliseconds"),
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
  dns_record: z.string().optional().describe("DNS TXT record value used for verification")
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
  }).optional().describe("Server maintainer information")
});

// ============================================================================
// DISCOVERY REQUEST/RESPONSE SCHEMAS
// ============================================================================

/**
 * Discovery Request Schema
 * Justified: Flexible discovery patterns for different use cases
 */
export const DiscoveryRequestSchema = z.object({
  // ---- PRIMARY SELECTORS ----
  domain: z.string().optional().describe("Exact domain match (e.g., 'github.com')"),
  capability: z.string().optional().describe("Required capability (e.g., 'email_send')"),
  category: CapabilityCategoryEnum.optional().describe("Capability category filter"),
  
  // ---- INTENT-BASED DISCOVERY ----
  intent: z.string().optional().describe("Natural language intent (e.g., 'check my email')"),
  keywords: z.array(z.string()).optional().describe("Search keywords"),
  use_case: z.string().optional().describe("Specific use case description"),
  
  // ---- TECHNICAL FILTERS ----
  auth_types: z.array(z.string()).optional().describe("Acceptable authentication types"),
  transport: z.enum(['streamable_http', 'sse', 'stdio']).optional().describe("Required transport"),
  min_uptime: z.number().min(0).max(100).optional().describe("Minimum uptime percentage"),
  max_response_time: z.number().min(0).optional().describe("Maximum acceptable response time (ms)"),
  cors_required: z.boolean().optional().describe("Requires CORS support"),
  
  // ---- RESPONSE CONTROL ----
  limit: z.number().min(1).max(100).default(10).describe("Maximum number of results"),
  offset: z.number().min(0).default(0).describe("Pagination offset"),
  include_health: z.boolean().default(true).describe("Include real-time health metrics"),
  include_tools: z.boolean().default(true).describe("Include tool definitions"),
  include_resources: z.boolean().default(false).describe("Include resource definitions"),
  sort_by: z.enum(['relevance', 'uptime', 'response_time', 'created_at']).default('relevance').describe("Sort order")
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
  domain: z.string().describe("Domain to register (e.g., 'api.example.com')"),
  endpoint: z.string().url().describe("MCP endpoint URL"),
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
