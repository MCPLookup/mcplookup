# API SPECIFICATIONS - MCPLOOKUP.ORG

**REST API + MCP Server Hybrid Architecture**

---

## 🌐 REST API ENDPOINTS

### Authentication
```http
# No auth required for discovery (public service)
# API key required for registration and management
Authorization: Bearer mcp_api_key_xyz123
```

---

## 🔍 DISCOVERY ENDPOINTS

### 1. Domain Lookup
```http
GET /api/v1/discover/domain/{domain}

# Examples
GET /api/v1/discover/domain/gmail.com
GET /api/v1/discover/domain/github.com
```

**Response:**
```json
{
  "domain": "gmail.com",
  "endpoint": "https://gmail.com/mcp",
  "verified": true,
  "verification_date": "2025-05-15T09:30:00Z",
  "capabilities": ["email_read", "email_send", "calendar"],
  "category": "communication",
  "auth_type": "oauth2",
  "health": {
    "status": "healthy",
    "uptime_percentage": 99.97,
    "avg_response_time_ms": 45
  },
  "trust_score": 98,
  "description": "Official Gmail MCP server"
}
```

### 2. Capability Search
```http
GET /api/v1/discover/capability/{capability}
GET /api/v1/discover/capability/email
GET /api/v1/discover/capability/file_storage?verified=true&limit=10
```

**Response:**
```json
{
  "capability": "email",
  "servers": [
    {
      "domain": "gmail.com",
      "endpoint": "https://gmail.com/mcp",
      "trust_score": 98,
      "rank": 1
    },
    {
      "domain": "outlook.com", 
      "endpoint": "https://outlook.com/mcp",
      "trust_score": 95,
      "rank": 2
    }
  ],
  "total_results": 2,
  "query_time_ms": 12
}
```

### 3. Smart Discovery
```http
POST /api/v1/discover/smart
Content-Type: application/json

{
  "intent": "I need to send emails and manage my calendar",
  "context": {
    "user_type": "business",
    "preferred_auth": ["oauth2"],
    "region": "us"
  }
}
```

**Response:**
```json
{
  "intent": "I need to send emails and manage my calendar",
  "matched_capabilities": ["email_send", "email_read", "calendar"],
  "recommendations": [
    {
      "domain": "gmail.com",
      "match_score": 95,
      "reason": "Perfect match for email + calendar, OAuth2 auth"
    },
    {
      "domain": "outlook.com",
      "match_score": 92, 
      "reason": "Strong email + calendar integration"
    }
  ],
  "processing_time_ms": 45
}
```

### 4. Category Browse
```http
GET /api/v1/discover/category/{category}
GET /api/v1/discover/category/communication
GET /api/v1/discover/category/development?verified=true
```

---

## 📝 REGISTRATION ENDPOINTS

### 1. Register New Server
```http
POST /api/v1/register
Content-Type: application/json
Authorization: Bearer mcp_api_key_xyz123

{
  "domain": "mycompany.com",
  "endpoint": "https://mycompany.com/mcp",
  "capabilities": ["custom_crm", "customer_data"],
  "category": "business",
  "auth_type": "api_key",
  "contact_email": "admin@mycompany.com",
  "description": "CRM integration MCP server"
}
```

**Response:**
```json
{
  "registration_id": "reg_abc123xyz",
  "status": "pending_verification",
  "domain": "mycompany.com",
  "verification": {
    "method": "dns_txt_record",
    "record_name": "_mcp-verify.mycompany.com",
    "record_value": "mcp_verify_xyz789abc",
    "instructions": "Add this TXT record to your DNS",
    "check_url": "https://mcplookup.org/api/v1/verify/reg_abc123xyz"
  },
  "expires_at": "2025-06-04T10:00:00Z"
}
```

### 2. Check Verification Status
```http
GET /api/v1/verify/{registration_id}
GET /api/v1/verify/reg_abc123xyz
```

**Response:**
```json
{
  "registration_id": "reg_abc123xyz",
  "domain": "mycompany.com",
  "status": "verified", // "pending", "verified", "failed", "expired"
  "verified_at": "2025-06-03T10:15:00Z",
  "dns_record_found": true,
  "next_steps": "Your server is now discoverable!"
}
```

### 3. Update Registration
```http
PUT /api/v1/servers/{domain}
Content-Type: application/json
Authorization: Bearer mcp_api_key_xyz123

{
  "endpoint": "https://mycompany.com/api/mcp",
  "capabilities": ["custom_crm", "customer_data", "reporting"],
  "description": "Updated CRM integration with reporting"
}
```

---

## 📊 HEALTH & ANALYTICS ENDPOINTS

### 1. Server Health
```http
GET /api/v1/health/{domain}
GET /api/v1/health/gmail.com
```

**Response:**
```json
{
  "domain": "gmail.com",
  "health": {
    "status": "healthy",
    "uptime_percentage": 99.97,
    "response_times": {
      "current_ms": 45,
      "avg_24h_ms": 52,
      "p95_24h_ms": 89
    },
    "last_check": "2025-06-03T10:00:00Z"
  },
  "capabilities_working": true,
  "ssl_valid": true,
  "trust_score": 98
}
```

### 2. Discovery Statistics
```http
GET /api/v1/stats/discovery?timeframe=day
GET /api/v1/stats/popular?limit=10
```

**Response:**
```json
{
  "timeframe": "day",
  "total_discoveries": 45672,
  "unique_domains_discovered": 342,
  "avg_response_time_ms": 34,
  "top_capabilities": [
    { "name": "email", "discoveries": 12503 },
    { "name": "calendar", "discoveries": 8901 },
    { "name": "file_storage", "discoveries": 7234 }
  ],
  "top_domains": [
    { "domain": "gmail.com", "discoveries": 8503 },
    { "domain": "github.com", "discoveries": 6421 }
  ]
}
```

---

## 🔍 SEARCH & BROWSE ENDPOINTS

### 1. Full-Text Search
```http
GET /api/v1/search?q={query}
GET /api/v1/search?q=email+calendar&category=communication
```

### 2. Capability Taxonomy
```http
GET /api/v1/capabilities
GET /api/v1/capabilities?category=communication&popular=true
```

**Response:**
```json
{
  "categories": [
    {
      "name": "communication",
      "capabilities": [
        {
          "name": "email",
          "description": "Email reading, sending, and management",
          "server_count": 12,
          "usage_count": 45670
        },
        {
          "name": "calendar",
          "description": "Calendar and scheduling management", 
          "server_count": 8,
          "usage_count": 23450
        }
      ]
    }
  ]
}
```

---

## 🔧 MANAGEMENT ENDPOINTS

### 1. List My Servers
```http
GET /api/v1/my/servers
Authorization: Bearer mcp_api_key_xyz123
```

### 2. Server Analytics
```http
GET /api/v1/my/servers/{domain}/analytics
Authorization: Bearer mcp_api_key_xyz123
```

**Response:**
```json
{
  "domain": "mycompany.com",
  "analytics": {
    "total_discoveries": 1234,
    "daily_discoveries": 45,
    "avg_response_time": 67,
    "uptime_percentage": 99.5,
    "capability_usage": {
      "custom_crm": 892,
      "customer_data": 342
    }
  }
}
```

---

## 🚨 ERROR RESPONSES

### Standard Error Format
```json
{
  "error": {
    "code": "DOMAIN_NOT_FOUND",
    "message": "No MCP server found for domain 'example.com'",
    "details": {
      "domain": "example.com",
      "suggestions": ["example.org", "sample.com"]
    }
  },
  "timestamp": "2025-06-03T10:00:00Z",
  "request_id": "req_xyz123"
}
```

### Error Codes
```typescript
enum ErrorCodes {
  // Discovery Errors
  DOMAIN_NOT_FOUND = "DOMAIN_NOT_FOUND",
  CAPABILITY_NOT_FOUND = "CAPABILITY_NOT_FOUND", 
  SERVER_UNHEALTHY = "SERVER_UNHEALTHY",
  
  // Registration Errors
  DOMAIN_ALREADY_REGISTERED = "DOMAIN_ALREADY_REGISTERED",
  DNS_VERIFICATION_FAILED = "DNS_VERIFICATION_FAILED",
  INVALID_DOMAIN_FORMAT = "INVALID_DOMAIN_FORMAT",
  
  // Auth Errors
  INVALID_API_KEY = "INVALID_API_KEY",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
}
```

---

## 🔐 RATE LIMITING

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1622548800
X-RateLimit-Window: 3600
```

### Rate Limits by Endpoint
```typescript
const rateLimits = {
  '/api/v1/discover/*': { limit: 1000, window: '1h' },
  '/api/v1/register': { limit: 10, window: '1h' },
  '/api/v1/search': { limit: 500, window: '1h' }
};
```

---

## 📡 WEBHOOKS

### Registration Status Updates
```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "registration.verified",
  "data": {
    "registration_id": "reg_abc123xyz",
    "domain": "mycompany.com",
    "verified_at": "2025-06-03T10:15:00Z"
  }
}
```

### Health Status Changes
```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "server.health_changed",
  "data": {
    "domain": "mycompany.com",
    "old_status": "healthy",
    "new_status": "degraded",
    "timestamp": "2025-06-03T10:20:00Z"
  }
}
```

---

## 🎯 SDK EXAMPLES

### JavaScript/TypeScript
```typescript
import { MCPLookup } from '@mcplookup/sdk';

const client = new MCPLookup();

// Discover servers
const gmail = await client.discover.domain('gmail.com');
const emailServers = await client.discover.capability('email');

// Smart discovery
const matches = await client.discover.smart({
  intent: "send emails",
  context: { auth: 'oauth2' }
});

// Register server
const registration = await client.register({
  domain: 'mycompany.com',
  endpoint: 'https://mycompany.com/mcp',
  apiKey: 'your-api-key'
});
```

### Python
```python
from mcplookup import MCPLookup

client = MCPLookup()

# Discover servers
gmail = client.discover.domain('gmail.com')
email_servers = client.discover.capability('email')

# Register server  
registration = client.register(
    domain='mycompany.com',
    endpoint='https://mycompany.com/mcp',
    api_key='your-api-key'
)
```

---

**The REST API that makes MCP discovery as simple as a web request.**  
**The universal directory for the AI tool ecosystem.**

🚀 **Ready to connect the world's AI tools?**
