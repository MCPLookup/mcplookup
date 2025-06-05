import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const MCPServerInfo = z
  .object({
    name: z.string(),
    version: z.string(),
    protocolVersion: z.string(),
    capabilities: z
      .object({
        tools: z.boolean(),
        resources: z.boolean(),
        prompts: z.boolean(),
        logging: z.boolean(),
      })
      .partial()
      .passthrough(),
  })
  .partial()
  .passthrough();
const MCPTool = z
  .object({
    name: z.string(),
    description: z.string(),
    inputSchema: z.object({}).partial().passthrough(),
  })
  .partial()
  .passthrough();
const MCPResource = z
  .object({
    uri: z.string(),
    name: z.string(),
    description: z.string(),
    mimeType: z.string(),
  })
  .partial()
  .passthrough();
const TransportCapabilities = z
  .object({
    primary_transport: z.enum(["streamable_http", "sse", "stdio"]),
    supported_methods: z.array(z.string()),
    content_types: z.array(z.string()),
    sse_support: z
      .object({
        supports_sse: z.boolean(),
        supports_get_streaming: z.boolean(),
        supports_post_streaming: z.boolean(),
      })
      .partial()
      .passthrough(),
    session_support: z
      .object({
        supports_sessions: z.boolean(),
        session_header_name: z.string(),
        session_timeout_indicated: z.boolean(),
      })
      .partial()
      .passthrough(),
    resumability: z
      .object({
        supports_event_ids: z.boolean(),
        supports_last_event_id: z.boolean(),
        event_id_format: z.string(),
      })
      .partial()
      .passthrough(),
    connection_limits: z
      .object({
        supports_multiple_connections: z.boolean(),
        max_concurrent_connections: z.number().int(),
      })
      .partial()
      .passthrough(),
    security_features: z
      .object({
        origin_validation: z.boolean(),
        ssl_required: z.boolean(),
        custom_auth_headers: z.array(z.string()),
      })
      .partial()
      .passthrough(),
    performance: z
      .object({
        avg_response_time_ms: z.number(),
        streaming_latency_ms: z.number(),
        supports_compression: z.boolean(),
        max_message_size: z.number().int(),
      })
      .partial()
      .passthrough(),
    cors_details: z
      .object({
        cors_enabled: z.boolean(),
        allowed_origins: z.array(z.string()),
        allowed_methods: z.array(z.string()),
        allowed_headers: z.array(z.string()),
        supports_credentials: z.boolean(),
      })
      .partial()
      .passthrough(),
    rate_limits: z
      .object({
        requests_per_minute: z.number().int(),
        burst_limit: z.number().int(),
        rate_limit_headers: z.array(z.string()),
      })
      .partial()
      .passthrough(),
  })
  .partial()
  .passthrough();
const OpenAPIDocumentation = z
  .object({
    discovered_at: z.string().datetime({ offset: true }),
    spec_url: z.string().url(),
    discovery_method: z.enum([
      "endpoint_scan",
      "manual",
      "header_hint",
      "well_known",
    ]),
    openapi_version: z.string(),
    spec_format: z.enum(["json", "yaml"]),
    api_info: z
      .object({
        title: z.string(),
        version: z.string(),
        description: z.string(),
        contact: z
          .object({
            name: z.string(),
            email: z.string().email(),
            url: z.string().url(),
          })
          .partial()
          .passthrough(),
        license: z
          .object({ name: z.string(), url: z.string().url() })
          .partial()
          .passthrough(),
      })
      .partial()
      .passthrough(),
    servers: z.array(
      z
        .object({
          url: z.string(),
          description: z.string(),
          variables: z.object({}).partial().passthrough(),
        })
        .partial()
        .passthrough()
    ),
    endpoints_summary: z
      .object({
        total_paths: z.number().int(),
        total_operations: z.number().int(),
        methods: z.record(z.number().int()),
        tags: z.array(z.string()),
        has_authentication: z.boolean(),
        auth_schemes: z.array(z.string()),
      })
      .partial()
      .passthrough(),
    spec_hash: z.string(),
    validation: z
      .object({
        is_valid: z.boolean(),
        validation_errors: z.array(z.string()),
        last_validated: z.string().datetime({ offset: true }),
      })
      .partial()
      .passthrough(),
  })
  .partial()
  .passthrough();
const HealthMetrics = z
  .object({
    status: z.enum(["healthy", "degraded", "unhealthy", "unknown"]),
    uptime_percentage: z.number(),
    avg_response_time_ms: z.number(),
    error_rate: z.number(),
    last_check: z.string().datetime({ offset: true }),
    consecutive_failures: z.number().int(),
  })
  .partial()
  .passthrough();
const Verification = z
  .object({
    dns_verified: z.boolean(),
    endpoint_verified: z.boolean(),
    ssl_verified: z.boolean(),
    last_verification: z.string().datetime({ offset: true }),
    verification_method: z.string(),
    verified_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
const MCPServerRecord = z
  .object({
    domain: z.string(),
    endpoint: z.string().url(),
    name: z.string(),
    description: z.string(),
    server_info: MCPServerInfo,
    tools: z.array(MCPTool),
    resources: z.array(MCPResource),
    transport: z.enum(["streamable_http", "sse", "stdio"]),
    transport_capabilities: TransportCapabilities,
    openapi_documentation: OpenAPIDocumentation,
    cors_enabled: z.boolean(),
    health: HealthMetrics,
    verification: Verification,
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    trust_score: z.number().int().gte(0).lte(100),
  })
  .partial()
  .passthrough();
const postRegister_Body = z
  .object({
    domain: z.string(),
    endpoint: z.string().url(),
    contact_email: z.string().email(),
    description: z.string().optional(),
  })
  .passthrough();
const postDiscoversmart_Body = z
  .object({
    query: z.string(),
    max_results: z.number().int().gte(1).lte(50).default(10),
    include_reasoning: z.boolean().default(false),
  })
  .partial()
  .passthrough();
const postOnboarding_Body = z
  .object({
    step: z.enum([
      "welcome",
      "domain_verify",
      "server_register",
      "dashboard_tour",
      "training_impact",
      "completed",
    ]),
    completed: z.boolean().optional().default(false),
  })
  .passthrough();

export const schemas = {
  MCPServerInfo,
  MCPTool,
  MCPResource,
  TransportCapabilities,
  OpenAPIDocumentation,
  HealthMetrics,
  Verification,
  MCPServerRecord,
  postRegister_Body,
  postDiscoversmart_Body,
  postOnboarding_Body,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/discover",
    alias: "getDiscover",
    description: `Find MCP servers using natural language queries, intent-based search, or technical filters.

**Enhanced with Transport Capabilities**: Results now include detailed transport metadata
for intelligent server selection and optimal client connections.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "query",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "intent",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "domain",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "capability",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "category",
        type: "Query",
        schema: z
          .enum([
            "communication",
            "productivity",
            "development",
            "finance",
            "social",
            "storage",
            "other",
          ])
          .optional(),
      },
      {
        name: "transport",
        type: "Query",
        schema: z.enum(["streamable_http", "sse", "stdio"]).optional(),
      },
      {
        name: "cors_required",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "ssl_required",
        type: "Query",
        schema: z.boolean().optional(),
      },
      {
        name: "verified_only",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
      {
        name: "include_health",
        type: "Query",
        schema: z.boolean().optional().default(true),
      },
      {
        name: "include_tools",
        type: "Query",
        schema: z.boolean().optional().default(true),
      },
      {
        name: "include_resources",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(10),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
    ],
    response: z
      .object({
        servers: z.array(MCPServerRecord),
        total: z.number().int(),
        query_analysis: z.object({}).partial().passthrough(),
        transport_summary: z
          .object({
            protocols: z.object({}).partial().passthrough(),
            sse_support: z.number().int(),
            session_support: z.number().int(),
            cors_enabled: z.number().int(),
          })
          .partial()
          .passthrough(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid request parameters`,
        schema: z.void(),
      },
      {
        status: 429,
        description: `Rate limit exceeded`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/discover/smart",
    alias: "postDiscoversmart",
    description: `Advanced discovery using AI to understand natural language queries and provide intelligent server recommendations.
Uses a three-step process: keywords extraction → search → AI narrowing.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postDiscoversmart_Body,
      },
    ],
    response: z
      .object({
        servers: z.array(MCPServerRecord),
        total: z.number().int(),
        query_analysis: z
          .object({
            extracted_keywords: z.array(z.string()),
            detected_capabilities: z.array(z.string()),
            confidence_score: z.number().gte(0).lte(1),
          })
          .partial()
          .passthrough(),
        ai_reasoning: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid request parameters`,
        schema: z.void(),
      },
      {
        status: 429,
        description: `Rate limit exceeded`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/domain-check",
    alias: "getDomainCheck",
    description: `Check if authenticated user can register MCP servers for a domain`,
    requestFormat: "json",
    parameters: [
      {
        name: "domain",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        domain: z.string(),
        user_id: z.string(),
        can_register: z.boolean(),
        verified: z.boolean(),
        message: z.string(),
        action_required: z.string(),
        verification_url: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid domain format`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Authentication required`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/health/:domain",
    alias: "getHealthDomain",
    description: `Get real-time or cached health metrics for a specific MCP server`,
    requestFormat: "json",
    parameters: [
      {
        name: "domain",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "realtime",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: z
      .object({
        domain: z.string(),
        endpoint: z.string(),
        health: HealthMetrics,
        capabilities_working: z.boolean(),
        ssl_valid: z.boolean(),
        trust_score: z.number().int().gte(0).lte(100),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `Server not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Health check failed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/onboarding",
    alias: "getOnboarding",
    description: `Get the current onboarding progress for authenticated user`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        onboarding: z
          .object({
            current_step: z.enum([
              "welcome",
              "domain_verify",
              "server_register",
              "dashboard_tour",
              "training_impact",
              "completed",
            ]),
            progress: z.number().gte(0).lte(100),
            completed_steps: z.array(z.string()),
            needs_onboarding: z.boolean(),
          })
          .partial()
          .passthrough(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication required`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/onboarding",
    alias: "postOnboarding",
    description: `Update the user&#x27;s onboarding step progress`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postOnboarding_Body,
      },
    ],
    response: z
      .object({ success: z.boolean(), message: z.string() })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid step or request data`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Authentication required`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/register",
    alias: "postRegister",
    description: `Register a new MCP server with automatic transport capabilities discovery.

**Enhanced Registration Process**:
1. Validates MCP endpoint and protocol compliance
2. Initiates DNS verification challenge
3. **NEW**: Automatically discovers transport capabilities
4. Creates complete server record with metadata
5. Populates tools and resources

The registration now includes comprehensive transport metadata discovery.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: postRegister_Body,
      },
    ],
    response: z
      .object({
        challenge_id: z.string(),
        dns_record: z.string(),
        verification_token: z.string(),
        instructions: z.string(),
        expires_at: z.string().datetime({ offset: true }),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid registration request`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Server already registered`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `MCP endpoint validation failed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/register/status/:challengeId",
    alias: "getRegisterstatusChallengeId",
    description: `Check the status of a DNS verification challenge`,
    requestFormat: "json",
    parameters: [
      {
        name: "challengeId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        challenge_id: z.string(),
        status: z.enum(["pending", "verified", "expired", "failed"]),
        created_at: z.string().datetime({ offset: true }),
        expires_at: z.string().datetime({ offset: true }),
        verified_at: z.string().datetime({ offset: true }),
        dns_record: z.string(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `Challenge not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/register/verify/:challengeId",
    alias: "postRegisterverifyChallengeId",
    description: `Verify DNS challenge and complete server registration with transport discovery.

**Enhanced Verification**:
- Verifies DNS TXT record
- **NEW**: Discovers transport capabilities automatically
- Creates complete server record with metadata
- Populates tools and resources

After successful verification, the server is fully registered with comprehensive
transport capabilities metadata.
`,
    requestFormat: "json",
    parameters: [
      {
        name: "challengeId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        verified: z.boolean(),
        server_record: MCPServerRecord,
        transport_discovery: z
          .object({
            capabilities_discovered: z.number().int(),
            discovery_time_ms: z.number(),
            methods_tested: z.array(z.string()),
          })
          .partial()
          .passthrough(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid challenge ID`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Challenge not found or expired`,
        schema: z.void(),
      },
      {
        status: 422,
        description: `DNS verification failed`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/verify",
    alias: "postVerify",
    description: `Start domain ownership verification for authenticated user`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ domain: z.string() }).passthrough(),
      },
    ],
    response: z
      .object({
        success: z.boolean(),
        challenge: z
          .object({
            domain: z.string(),
            slug: z.string(),
            txtRecord: z.string(),
            instructions: z.string(),
          })
          .partial()
          .passthrough(),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Invalid domain format`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Authentication required`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/verify",
    alias: "getVerify",
    description: `Get all domain verifications for authenticated user`,
    requestFormat: "json",
    response: z
      .object({
        success: z.boolean(),
        verifications: z.array(
          z
            .object({
              id: z.string(),
              domain: z.string(),
              status: z.enum(["pending", "verified", "expired", "failed"]),
              created_at: z.string().datetime({ offset: true }),
              verified_at: z.string().datetime({ offset: true }),
              last_check_at: z.string().datetime({ offset: true }),
              expires_at: z.string().datetime({ offset: true }),
              failure_reason: z.string(),
            })
            .partial()
            .passthrough()
        ),
      })
      .partial()
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Authentication required`,
        schema: z.void(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
