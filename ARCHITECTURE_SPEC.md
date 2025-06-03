# MCPLOOKUP.ORG - COMPLETE ARCHITECTURE SPECIFICATION

**Technology Stack: TypeScript + Next.js 15 + Vercel + Zod + OpenAPI + Serverless + No-SQL**

---

## 🎯 **CORE ARCHITECTURAL DECISIONS**

### **Tech Stack**
- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes (Serverless Functions)
- **Language**: TypeScript (100%)
- **Validation**: Zod schemas with full type safety
- **API Documentation**: OpenAPI/Swagger auto-generated
- **Deployment**: Vercel (serverless platform)
- **Database**: **NONE** - Fully serverless architecture
- **Storage**: In-memory + DNS + External API discovery
- **Authentication**: Auth.js v5 (serverless-compatible)
- **Open Source**: MIT License

### **Serverless Design Principles**
1. **Zero Infrastructure**: No databases, Redis, or persistent storage
2. **Stateless Functions**: Each API call is independent and self-contained
3. **DNS-Based Verification**: Use TXT records for domain ownership proof
4. **Real-Time Discovery**: Live endpoint testing instead of static registry
5. **In-Memory Caching**: TTL-based caching with automatic expiration
6. **External API Integration**: Leverage existing services (GitHub, etc.)
7. **Pluggable Services**: Modular, replaceable service architecture
8. **One-Call Completeness**: Single request provides all needed data

---

## 🏗️ **PROJECT STRUCTURE**

```
mcplookup.org/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── api/               # API Routes (Serverless)
│   │   │   ├── v1/
│   │   │   │   ├── discover/
│   │   │   │   │   ├── route.ts      # Main discovery endpoint
│   │   │   │   │   ├── domain/[domain]/route.ts
│   │   │   │   │   ├── capability/[capability]/route.ts
│   │   │   │   │   └── intent/route.ts
│   │   │   │   ├── register/
│   │   │   │   │   ├── route.ts      # Server registration
│   │   │   │   │   └── verify/[id]/route.ts
│   │   │   │   ├── health/
│   │   │   │   │   ├── [domain]/route.ts
│   │   │   │   │   └── batch/route.ts
│   │   │   │   └── stats/
│   │   │   │       ├── route.ts      # Analytics
│   │   │   │       └── domains/route.ts
│   │   │   └── mcp/               # The One Ring MCP Server
│   │   │       └── route.ts       # HTTP Streamable endpoint
│   │   ├── discover/              # Discovery UI
│   │   ├── register/              # Registration UI  
│   │   └── docs/                  # API Documentation
│   ├── lib/                       # Core Libraries
│   │   ├── services/              # Pluggable Services
│   │   │   ├── discovery.ts       # Discovery logic
│   │   │   ├── verification.ts    # DNS verification
│   │   │   ├── health.ts          # Health monitoring
│   │   │   ├── registry.ts        # Server registry
│   │   │   └── analytics.ts       # Usage analytics
│   │   ├── mcp/                   # MCP Components
│   │   │   ├── server.ts          # The One Ring server
│   │   │   ├── client.ts          # HTTP client
│   │   │   └── bridge.ts          # stdio-to-HTTP bridge
│   │   ├── schemas/               # Zod Schemas
│   │   │   ├── discovery.ts       # Discovery API schemas
│   │   │   ├── registration.ts    # Registration schemas
│   │   │   └── mcp.ts            # MCP protocol schemas
│   │   ├── types/                 # TypeScript Types
│   │   └── utils/                 # Utilities
│   ├── components/                # React Components
│   └── hooks/                     # React Hooks
├── public/
│   ├── openapi.json              # Generated API spec
│   └── docs/                     # Static documentation
├── tests/
└── docs/                         # Project documentation
```

---

## 🗄️ **SERVERLESS DATA ARCHITECTURE**

### **No Database Required**
This architecture completely eliminates the need for traditional databases:

```typescript
// Instead of SQL databases, we use:
interface ServerlessDataSources {
  // 1. Well-known server registry (in-memory)
  wellKnownServers: MCPServerRecord[];
  
  // 2. DNS TXT records for verification
  dnsVerification: {
    recordName: string;    // _mcplookup-verify.domain.com
    recordValue: string;   // mcplookup-verify=token.timestamp
  };
  
  // 3. Real-time endpoint discovery
  liveDiscovery: {
    endpoint: string;      // https://domain.com/.well-known/mcp-server
    healthCheck: boolean;  // Live connectivity test
  };
  
  // 4. External API integration
  externalSources: {
    github: 'api.github.com';      // Repository discovery
    npm: 'registry.npmjs.org';     // Package discovery
    // Add more sources as needed
  };
}
```

### **Data Flow Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Discovery      │───▶│  In-Memory       │───▶│  Live Testing   │
│  Request        │    │  Registry        │    │  & Validation   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ▲                        │
                                │                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Well-Known     │───▶│  Cache Layer     │◀───│  DNS Queries    │
│  Servers        │    │  (TTL-based)     │    │  & Health       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Storage Strategy**
1. **Static Data**: Well-known servers (Gmail, GitHub, etc.) - hardcoded
2. **Dynamic Discovery**: Real-time `.well-known` endpoint checks
3. **Verification**: DNS TXT records (no persistent storage needed)
4. **Caching**: In-memory with TTL (automatic cleanup)
5. **Health Data**: Live checks only (no historical storage)

---

## 📊 **DATA STRUCTURE SPECIFICATION**

### **MCPServerRecord (Complete Discovery Response)**

Based on MCP specification research and serverless architecture:

```typescript
import { z } from 'zod';

// Core MCP Tool Definition (from MCP spec)
const MCPToolSchema = z.object({
  name: z.string().describe("Unique tool identifier"),
  description: z.string().describe("Human-readable tool description"),
  inputSchema: z.record(z.any()).describe("JSON Schema for tool parameters")
});

// Core MCP Resource Definition (from MCP spec)  
const MCPResourceSchema = z.object({
  uri: z.string().describe("Resource URI"),
  name: z.string().describe("Resource name"),
  description: z.string().optional().describe("Resource description"),
  mimeType: z.string().optional().describe("MIME type if applicable")
});

// Authentication Configuration (from MCP auth spec)
const AuthConfigSchema = z.object({
  type: z.enum(['none', 'api_key', 'oauth2', 'basic']).describe("Authentication method"),
  oauth2: z.object({
    authorizationUrl: z.string().url(),
    tokenUrl: z.string().url(),
    scopes: z.array(z.string())
  }).optional().describe("OAuth2 configuration if applicable"),
  apiKeyLocation: z.enum(['header', 'query']).optional().describe("API key location if applicable"),
  apiKeyName: z.string().optional().describe("API key parameter name")
});

// Health Metrics (justified by operational needs)
const HealthMetricsSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'down', 'unknown']).describe("Current health status"),
  uptime_percentage: z.number().min(0).max(100).describe("30-day uptime percentage"),
  avg_response_time_ms: z.number().min(0).describe("Average response time in milliseconds"),
  last_check: z.string().datetime().describe("ISO 8601 timestamp of last health check"),
  error_rate: z.number().min(0).max(1).describe("Error rate over last 24 hours")
});

// Capability Classification (semantic organization)
const CapabilitySchema = z.object({
  category: z.enum([
    'communication',    // Email, chat, messaging
    'productivity',     // Calendars, tasks, notes
    'data',            // Databases, APIs, storage
    'development',     // Code, git, CI/CD
    'content',         // Documents, media, creation
    'integration',     // Webhooks, automation
    'analytics',       // Metrics, reporting
    'security',        // Auth, encryption, scanning
    'other'
  ]).describe("Primary capability category"),
  subcategories: z.array(z.string()).describe("Specific capability tags"),
  intent_keywords: z.array(z.string()).describe("Natural language intent matching")
});

// Verification Status (trust establishment)
const VerificationSchema = z.object({
  dns_verified: z.boolean().describe("Domain ownership verified via DNS"),
  endpoint_verified: z.boolean().describe("MCP endpoint responds correctly"),
  last_verification: z.string().datetime().describe("Last verification timestamp"),
  verification_method: z.string().describe("Verification method used")
});

// Complete Server Record (one call, all data)
const MCPServerRecordSchema = z.object({
  // Identity
  domain: z.string().describe("Verified domain name"),
  endpoint: z.string().url().describe("MCP HTTP endpoint URL"),
  name: z.string().describe("Human-readable server name"),
  description: z.string().describe("Server description and purpose"),
  
  // Capabilities (complete MCP introspection)
  tools: z.array(MCPToolSchema).describe("Available tools from MCP tools/list"),
  resources: z.array(MCPResourceSchema).describe("Available resources from MCP resources/list"),
  capabilities: CapabilitySchema.describe("Semantic capability classification"),
  
  // Technical Details
  protocol_version: z.string().describe("Supported MCP protocol version"),
  transport: z.enum(['streamable_http', 'sse', 'stdio']).describe("Transport protocol"),
  auth: AuthConfigSchema.describe("Authentication requirements"),
  
  // Operational Status
  health: HealthMetricsSchema.describe("Current operational metrics"),
  verification: VerificationSchema.describe("Trust and verification status"),
  
  // Metadata
  created_at: z.string().datetime().describe("Registration timestamp"),
  updated_at: z.string().datetime().describe("Last update timestamp"),
  version: z.string().describe("Server version if available")
});

// Discovery Request Schema
const DiscoveryRequestSchema = z.object({
  // Primary selectors
  domain: z.string().optional().describe("Exact domain match"),
  capability: z.string().optional().describe("Required capability"),
  category: z.string().optional().describe("Capability category"),
  
  // Intent-based discovery
  intent: z.string().optional().describe("Natural language intent"),
  keywords: z.array(z.string()).optional().describe("Search keywords"),
  
  // Filters
  auth_types: z.array(z.string()).optional().describe("Acceptable auth types"),
  min_uptime: z.number().optional().describe("Minimum uptime percentage"),
  max_response_time: z.number().optional().describe("Maximum response time"),
  
  // Response control
  limit: z.number().min(1).max(100).default(10).describe("Maximum results"),
  include_health: z.boolean().default(true).describe("Include health metrics"),
  include_tools: z.boolean().default(true).describe("Include tool definitions")
});

// Discovery Response Schema
const DiscoveryResponseSchema = z.object({
  servers: z.array(MCPServerRecordSchema).describe("Matching MCP servers"),
  total_count: z.number().describe("Total servers matching criteria"),
  query_time_ms: z.number().describe("Query execution time"),
  suggestions: z.array(z.string()).optional().describe("Alternative search suggestions")
});
```

---

## 🔧 **SERVICE ARCHITECTURE**

### **1. Discovery Service**
```typescript
// src/lib/services/discovery.ts
export class DiscoveryService {
  async discoverServers(request: DiscoveryRequest): Promise<DiscoveryResponse> {
    // Intent matching
    // Capability filtering  
    // Health scoring
    // Result ranking
  }
  
  async discoverByDomain(domain: string): Promise<MCPServerRecord | null> {
    // Direct domain lookup
  }
  
  async discoverByIntent(intent: string): Promise<MCPServerRecord[]> {
    // NLP-based intent matching
  }
}
```

### **2. Verification Service**
```typescript
// src/lib/services/verification.ts
export class VerificationService {
  async initiateDNSVerification(domain: string): Promise<VerificationChallenge> {
    // Generate DNS challenge
  }
  
  async verifyDNSChallenge(challengeId: string): Promise<boolean> {
    // Check DNS TXT record
  }
  
  async verifyMCPEndpoint(endpoint: string): Promise<boolean> {
    // Test MCP connectivity
  }
}
```

### **3. Health Service**
```typescript
// src/lib/services/health.ts
export class HealthService {
  async checkServerHealth(endpoint: string): Promise<HealthMetrics> {
    // Real-time health check
  }
  
  async batchHealthCheck(endpoints: string[]): Promise<Map<string, HealthMetrics>> {
    // Parallel health checking
  }
}
```

---

## 🌟 **THE ONE RING MCP SERVER**

### **Core Tools**

1. **`discover_mcp_servers`**
   - Input: DiscoveryRequest schema
   - Output: DiscoveryResponse with complete server data
   - Purpose: Primary discovery functionality

2. **`register_mcp_server`**  
   - Input: Registration request with domain
   - Output: Verification challenge
   - Purpose: New server registration

3. **`verify_domain_ownership`**
   - Input: Domain and verification token
   - Output: Verification status
   - Purpose: DNS verification check

4. **`get_server_health`**
   - Input: Domain or endpoint
   - Output: Real-time health metrics
   - Purpose: Operational monitoring

---

## 🌉 **STDIO-TO-HTTP BRIDGE**

### **Legacy Compatibility Layer**
```typescript
// src/lib/mcp/bridge.ts
export class MCPBridge {
  async createStdioProxy(httpEndpoint: string): Promise<MCPServer> {
    // Creates stdio MCP server that proxies to HTTP
    // Enables legacy agents to use HTTP servers
  }
}
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Vercel Configuration**
```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/v1/(.*)",
      "destination": "/api/v1/$1"
    }
  ]
}
```

### **Environment Variables**
```
# Public
NEXT_PUBLIC_APP_URL=https://mcplookup.org
NEXT_PUBLIC_API_VERSION=v1

# Private
DNS_RESOLVER_URL=https://cloudflare-dns.com/dns-query
HEALTH_CHECK_TIMEOUT=5000
VERIFICATION_TOKEN_TTL=86400
```

---

This architecture provides:
- ✅ **Serverless scaling** on Vercel
- ✅ **Zero SQL dependencies** 
- ✅ **Complete API responses** in single calls
- ✅ **Semantic data structure** with justified fields
- ✅ **Pluggable services** for easy extension
- ✅ **Legacy compatibility** via stdio bridge
- ✅ **Open source** with MIT license

Ready to implement the revolution? 🚀
