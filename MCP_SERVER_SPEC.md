# THE ONE RING: MASTER MCP SERVER SPECIFICATION

**The MCP Server that discovers all other MCP servers**  
*The Registry. The Discovery Engine. The One Ring to Rule Them All.*

---

## 🎯 PURPOSE

This is THE MCP server that:
- **AI agents connect to for discovery**
- **Manages the global registry of MCP servers** 
- **Handles DNS verification for domain ownership**
- **Provides intelligent matching and recommendations**

**Endpoint**: `https://mcplookup.org/mcp`

---

## 🔧 MCP SERVER CAPABILITIES

### Server Information
```json
{
  "name": "MCPLookup Registry",
  "version": "1.0.0",
  "protocolVersion": "2025-03-26",
  "capabilities": {
    "tools": {},
    "resources": {},
    "prompts": {}
  },
  "serverInfo": {
    "name": "mcplookup-registry",
    "version": "1.0.0"
  }
}
```

### Available Tools

#### 1. `discover_mcp_servers`
**Find MCP servers by various criteria**

```json
{
  "name": "discover_mcp_servers",
  "description": "Discover MCP servers by domain, capability, or natural language intent. The universal directory for AI tool discovery.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "domain": {
        "type": "string",
        "description": "Specific domain to look up (e.g., 'gmail.com', 'github.com')"
      },
      "capability": {
        "type": "string", 
        "description": "Required capability (e.g., 'email', 'file_storage', 'calendar')"
      },
      "category": {
        "type": "string",
        "enum": ["communication", "productivity", "development", "finance", "social", "storage"],
        "description": "Service category"
      },
      "intent": {
        "type": "string",
        "description": "Natural language description of what you want to do (e.g., 'send emails', 'manage calendar', 'deploy code')"
      },
      "auth_types": {
        "type": "array",
        "items": { "type": "string", "enum": ["none", "api_key", "oauth2", "basic"] },
        "description": "Acceptable authentication methods"
      },
      "verified_only": {
        "type": "boolean",
        "default": true,
        "description": "Only return DNS-verified servers"
      },
      "max_results": {
        "type": "integer",
        "default": 10,
        "minimum": 1,
        "maximum": 100
      }
    }
  }
}
```

**Example Usage:**
```json
// Find Gmail MCP server
{ "domain": "gmail.com" }

// Find all email capabilities
{ "capability": "email" }

// Natural language discovery
{ "intent": "I need to send emails and manage my calendar" }

// Category browsing
{ "category": "communication", "verified_only": true }
```

#### 2. `register_mcp_server`
**Register a new MCP server with DNS verification**

```json
{
  "name": "register_mcp_server",
  "description": "Register a new MCP server in the global registry. Requires DNS verification to prove domain ownership.",
  "inputSchema": {
    "type": "object",
    "required": ["domain", "endpoint"],
    "properties": {
      "domain": {
        "type": "string",
        "pattern": "^[a-z0-9.-]+\\.[a-z]{2,}$",
        "description": "Domain name you control (e.g., 'mycompany.com')"
      },
      "endpoint": {
        "type": "string",
        "format": "uri",
        "description": "Full URL to your MCP server endpoint"
      },
      "capabilities": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of capabilities your server provides"
      },
      "category": {
        "type": "string",
        "enum": ["communication", "productivity", "development", "finance", "social", "storage", "other"]
      },
      "auth_type": {
        "type": "string",
        "enum": ["none", "api_key", "oauth2", "basic"],
        "default": "none"
      },
      "contact_email": {
        "type": "string",
        "format": "email",
        "description": "Contact email for verification and issues"
      },
      "description": {
        "type": "string",
        "maxLength": 500,
        "description": "Brief description of your MCP server's purpose"
      }
    }
  }
}
```

#### 3. `verify_domain_ownership`
**Check DNS verification status**

```json
{
  "name": "verify_domain_ownership", 
  "description": "Check the DNS verification status for a domain registration.",
  "inputSchema": {
    "type": "object",
    "required": ["domain"],
    "properties": {
      "domain": {
        "type": "string",
        "description": "Domain to check verification status"
      }
    }
  }
}
```

#### 4. `get_server_health`
**Get health and performance metrics**

```json
{
  "name": "get_server_health",
  "description": "Get real-time health, performance, and reliability metrics for MCP servers.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "domain": {
        "type": "string",
        "description": "Specific domain to check"
      },
      "domains": {
        "type": "array", 
        "items": { "type": "string" },
        "description": "Multiple domains to check"
      }
    }
  }
}
```

#### 5. `browse_capabilities`
**Explore the capability taxonomy**

```json
{
  "name": "browse_capabilities",
  "description": "Browse and search the taxonomy of available MCP capabilities across all registered servers.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "category": {
        "type": "string",
        "description": "Filter by category"
      },
      "search": {
        "type": "string", 
        "description": "Search capability names and descriptions"
      },
      "popular": {
        "type": "boolean",
        "description": "Show most popular capabilities"
      }
    }
  }
}
```

#### 6. `get_discovery_stats`
**Analytics and usage statistics**

```json
{
  "name": "get_discovery_stats",
  "description": "Get analytics about MCP server discovery patterns and usage statistics.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "timeframe": {
        "type": "string",
        "enum": ["hour", "day", "week", "month"],
        "default": "day"
      },
      "metric": {
        "type": "string", 
        "enum": ["discoveries", "registrations", "health_checks", "popular_domains"],
        "default": "discoveries"
      }
    }
  }
}
```

---

## 🔄 TOOL RESPONSE FORMATS

### Discovery Response
```json
{
  "query": {
    "domain": "gmail.com",
    "timestamp": "2025-06-03T10:00:00Z"
  },
  "results": [
    {
      "domain": "gmail.com",
      "endpoint": "https://gmail.com/mcp",
      "capabilities": ["email_read", "email_send", "email_search", "calendar", "contacts"],
      "category": "communication",
      "auth_type": "oauth2",
      "verified": true,
      "verification_date": "2025-05-15T09:30:00Z",
      "health": {
        "status": "healthy",
        "uptime_percentage": 99.97,
        "avg_response_time_ms": 45,
        "last_check": "2025-06-03T09:55:00Z"
      },
      "trust_score": 98,
      "popularity_rank": 1,
      "description": "Official Gmail MCP server for email and calendar management"
    }
  ],
  "total_results": 1,
  "discovery_time_ms": 23
}
```

### Registration Response
```json
{
  "registration_id": "reg_abc123xyz",
  "domain": "example.com", 
  "status": "pending_verification",
  "verification": {
    "method": "dns_txt_record",
    "record_name": "_mcp-verify.example.com",
    "record_value": "mcp_verify_xyz789abc", 
    "instructions": "Add the above TXT record to your DNS, then verification will complete automatically within 5 minutes.",
    "verification_url": "https://mcplookup.org/verify/reg_abc123xyz"
  },
  "estimated_verification_time": "5 minutes",
  "next_steps": [
    "Add the DNS TXT record",
    "Wait for automatic verification", 
    "Your server will be discoverable once verified"
  ]
}
```

### Health Check Response
```json
{
  "domain": "github.com",
  "health": {
    "status": "healthy",
    "uptime_percentage": 99.99,
    "response_times": {
      "current_ms": 67,
      "avg_24h_ms": 72,
      "p95_24h_ms": 120
    },
    "last_outage": null,
    "checks_performed": 8640,
    "last_check": "2025-06-03T09:58:00Z"
  },
  "capabilities_status": {
    "all_working": true,
    "last_capability_check": "2025-06-03T09:00:00Z"
  },
  "trust_metrics": {
    "trust_score": 95,
    "verification_status": "dns_verified",
    "security_scan": "passed",
    "community_rating": 4.8
  }
}
```

---

## 🎪 SMART DISCOVERY ALGORITHMS

### Intent Matching
```typescript
// Natural language to capability mapping
const intentMatcher = {
  "send emails": ["email_send", "email"],
  "check calendar": ["calendar", "calendar_read"],
  "deploy code": ["deployment", "ci_cd", "docker"],
  "manage files": ["file_storage", "file_management"],
  "social media": ["social_posting", "social_read"]
};

// Context-aware recommendations
function smartDiscovery(intent: string, userHistory?: string[]) {
  const capabilities = extractCapabilities(intent);
  const servers = findServersByCapabilities(capabilities);
  
  // Rank by trust score, performance, and user preferences
  return rankServers(servers, {
    trustScore: 0.4,
    performance: 0.3, 
    userPreference: 0.3
  });
}
```

### Domain Reputation Scoring
```typescript
interface TrustScore {
  dns_verified: number;      // +30 points
  uptime_percentage: number; // 0-30 points
  response_time: number;     // 0-20 points  
  security_scan: number;     // 0-15 points
  community_rating: number;  // 0-5 points
}

// Total: 0-100 trust score
```

---

## 🔐 SECURITY & VALIDATION

### DNS Verification Process
```typescript
async function initiateVerification(domain: string): Promise<VerificationChallenge> {
  const token = generateSecureToken();
  const challenge = {
    domain,
    token,
    record_name: `_mcp-verify.${domain}`,
    record_value: `mcp_verify_${token}`,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
  
  await savePendingVerification(challenge);
  return challenge;
}

async function checkVerification(domain: string, token: string): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(`_mcp-verify.${domain}`);
    const found = records.some(record => 
      record.join('').includes(`mcp_verify_${token}`)
    );
    
    if (found) {
      await markDomainVerified(domain);
      await createPermanentDNSRecord(domain);
    }
    
    return found;
  } catch (error) {
    return false;
  }
}
```

### Rate Limiting
```typescript
// Discovery API rate limits
const rateLimits = {
  anonymous: { requests: 1000, window: '1h' },
  authenticated: { requests: 10000, window: '1h' },
  enterprise: { requests: 100000, window: '1h' }
};
```

---

## 🌐 PROTOCOL COMPLIANCE

### MCP Transport Support
- ✅ **Streamable HTTP** (primary)
- ❌ stdio (not applicable for registry service)
- ❌ SSE (legacy, deprecated)

### JSON-RPC Compliance
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "discover_mcp_servers",
    "arguments": {
      "domain": "gmail.com"
    }
  }
}
```

### Error Handling
```json
{
  "jsonrpc": "2.0", 
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid domain format",
    "data": {
      "domain": "invalid..domain",
      "expected_format": "valid.domain.com"
    }
  }
}
```

---

## 🚀 DEPLOYMENT CONFIGURATION

### Environment Variables
```bash
# Serverless Configuration (all optional)
DNS_RESOLVER_URL=https://cloudflare-dns.com/dns-query
DNS_TIMEOUT_MS=5000

# Health Checks
HEALTH_CHECK_TIMEOUT_MS=10000    # 10 seconds

# Features
ENABLE_AUTO_DISCOVERY=true
ENABLE_ANALYTICS=true

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://mcplookup.org
NEXT_PUBLIC_API_VERSION=v1
```

### Vercel Configuration
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/mcp",
      "destination": "/api/mcp"
    }
  ]
}
```

---

## 📊 MONITORING & ANALYTICS

### Key Metrics to Track
```typescript
interface Metrics {
  // Discovery Performance
  discovery_requests_per_second: number;
  discovery_latency_p95_ms: number;
  cache_hit_rate_percentage: number;
  
  // Registry Health
  total_registered_servers: number;
  verified_servers_percentage: number;
  healthy_servers_percentage: number;
  
  // User Behavior
  top_discovered_domains: string[];
  popular_capabilities: string[];
  intent_matching_accuracy: number;
}
```

### Alerting Thresholds
```yaml
alerts:
  discovery_latency_p95: 
    threshold: 200ms
    severity: warning
  
  healthy_servers_percentage:
    threshold: 95%
    severity: critical
    
  dns_verification_failure_rate:
    threshold: 5%
    severity: warning
```

---

**This is THE MCP server that makes all other MCP servers discoverable.**  
**The registry. The directory. The one ring that rules them all.**

🔥 **Ready to deploy the master?**
