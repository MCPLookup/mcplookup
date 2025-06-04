# MCPLookup.org API Specification 🔌

Complete REST API reference for MCPLookup.org - the universal MCP server discovery service.

## 📋 Overview

**Base URL**: `https://mcplookup.org/api/v1`  
**Protocol**: HTTPS only  
**Format**: JSON  
**Authentication**: Optional (API keys for enhanced features)

## 🔐 Authentication

Most endpoints are public and require no authentication. Optional API keys provide enhanced features:

```bash
# Optional authentication header
Authorization: Bearer your-api-key-here
```

**Enhanced features with API key:**
- Higher rate limits
- Priority support
- Advanced analytics
- Beta feature access

## 📊 Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Discovery API | 100 requests | per minute |
| Registration API | 10 requests | per hour |
| Health API | 50 requests | per minute |
| Verification API | 5 attempts | per challenge |

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## 🔍 Discovery Endpoints

### GET /discover

Search for MCP servers with optional filters.

**Parameters:**
- `q` (string, optional): Search query
- `domain` (string, optional): Filter by domain
- `capability` (string, optional): Filter by capability
- `verified` (boolean, optional): Only verified servers
- `health` (string, optional): Filter by health status (`healthy`, `degraded`, `down`)
- `min_trust_score` (number, optional): Minimum trust score (0-100)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 10, max: 100)

**Example Request:**
```bash
curl "https://mcplookup.org/api/v1/discover?capability=email&verified=true&limit=20"
```

**Response:**
```json
{
  "servers": [
    {
      "domain": "gmail.com",
      "endpoint": "https://gmail.com/.well-known/mcp",
      "name": "Gmail MCP Server",
      "description": "Access Gmail emails and manage your inbox",
      "capabilities": {
        "category": "productivity",
        "subcategories": ["email", "contacts"],
        "intent_keywords": ["email", "gmail", "inbox", "send"],
        "use_cases": ["Read emails", "Send emails", "Manage contacts"]
      },
      "verification": {
        "dns_verified": true,
        "endpoint_verified": true,
        "ssl_verified": true,
        "last_verification": "2024-01-15T10:30:00Z",
        "verification_method": "dns-txt-challenge"
      },
      "health": {
        "status": "healthy",
        "uptime_percentage": 99.9,
        "avg_response_time_ms": 120,
        "response_time_ms": 115,
        "error_rate": 0.001,
        "last_check": "2024-01-15T10:30:00Z",
        "consecutive_failures": 0
      },
      "trust_score": 95,
      "server_info": {
        "name": "Gmail MCP Server",
        "version": "1.2.0",
        "protocolVersion": "2024-11-05",
        "capabilities": {
          "tools": true,
          "resources": true,
          "prompts": false,
          "logging": true
        }
      },
      "tools": [
        {
          "name": "read_email",
          "description": "Read emails from Gmail inbox",
          "inputSchema": {
            "type": "object",
            "properties": {
              "query": { "type": "string" },
              "limit": { "type": "number" }
            }
          }
        }
      ],
      "auth": {
        "type": "oauth2",
        "required": true
      },
      "cors_enabled": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total_count": 150,
    "page": 1,
    "limit": 20,
    "has_more": true,
    "next_page": 2
  },
  "meta": {
    "query_time_ms": 45,
    "cache_hit": false,
    "discovery_methods": ["registry", "dns", "well-known"]
  }
}
```

### GET /discover/domain/{domain}

Find MCP servers for a specific domain.

**Parameters:**
- `domain` (string, required): Domain to search for

**Example Request:**
```bash
curl https://mcplookup.org/api/v1/discover/domain/gmail.com
```

**Response:** Same format as `/discover` but filtered to the specific domain.

### GET /discover/capability/{capability}

Find servers with a specific capability.

**Parameters:**
- `capability` (string, required): Capability to search for

**Common capabilities:**
- `email` - Email management
- `calendar` - Calendar and scheduling
- `database` - Database operations
- `file_storage` - File management
- `crm` - Customer relationship management
- `analytics` - Data analytics
- `communication` - Chat and messaging
- `productivity` - General productivity tools

**Example Request:**
```bash
curl https://mcplookup.org/api/v1/discover/capability/email
```

## 📝 Registration Endpoints

### POST /register

Register a new MCP server for discovery.

**Request Body:**
```json
{
  "domain": "mycompany.com",
  "endpoint": "https://mycompany.com/api/mcp",
  "name": "My Company MCP Server",
  "description": "Company productivity tools via MCP",
  "capabilities": ["email", "calendar", "crm"],
  "contact_email": "admin@mycompany.com",
  "auth_required": true,
  "cors_enabled": true
}
```

**Required Fields:**
- `domain`: Domain you own
- `endpoint`: MCP server endpoint URL
- `contact_email`: Contact email for verification

**Optional Fields:**
- `name`: Human-readable server name
- `description`: Server description
- `capabilities`: Array of capability strings
- `auth_required`: Whether authentication is required
- `cors_enabled`: Whether CORS is enabled

**Response:**
```json
{
  "challenge_id": "abc123-def456-ghi789",
  "domain": "mycompany.com",
  "txt_record_name": "_mcp-verify.mycompany.com",
  "txt_record_value": "mcp_verify_abc123def456ghi789",
  "expires_at": "2024-01-16T10:30:00Z",
  "instructions": "Add the following DNS TXT record to verify domain ownership:\n\nRecord Type: TXT\nName: _mcp-verify.mycompany.com\nValue: mcp_verify_abc123def456ghi789\n\nAfter adding the record, call the verification endpoint.",
  "verification_url": "https://mcplookup.org/api/v1/register/verify/abc123-def456-ghi789"
}
```

### POST /register/verify/{challenge_id}

Verify domain ownership for server registration.

**Parameters:**
- `challenge_id` (string, required): Challenge ID from registration

**Example Request:**
```bash
curl -X POST https://mcplookup.org/api/v1/register/verify/abc123-def456-ghi789
```

**Success Response:**
```json
{
  "verified": true,
  "domain": "mycompany.com",
  "server_id": "srv_abc123def456",
  "message": "Domain ownership verified successfully. Your server is now discoverable.",
  "discovery_url": "https://mcplookup.org/api/v1/discover/domain/mycompany.com"
}
```

**Error Response:**
```json
{
  "verified": false,
  "error": "DNS_VERIFICATION_FAILED",
  "message": "TXT record not found or incorrect value",
  "expected_record": "_mcp-verify.mycompany.com",
  "expected_value": "mcp_verify_abc123def456ghi789",
  "found_records": [],
  "retry_after": 300
}
```

### GET /register/status/{challenge_id}

Check the status of a registration challenge.

**Parameters:**
- `challenge_id` (string, required): Challenge ID from registration

**Response:**
```json
{
  "challenge_id": "abc123-def456-ghi789",
  "domain": "mycompany.com",
  "status": "pending",
  "expires_at": "2024-01-16T10:30:00Z",
  "dns_check_result": {
    "record_found": false,
    "expected_value": "mcp_verify_abc123def456ghi789",
    "found_values": [],
    "last_check": "2024-01-15T10:25:00Z"
  },
  "endpoint_check_result": {
    "accessible": true,
    "mcp_compliant": true,
    "response_time_ms": 250,
    "last_check": "2024-01-15T10:25:00Z"
  }
}
```

## 🏥 Health Endpoints

### GET /health/{domain}

Get health status for a specific domain's MCP servers.

**Parameters:**
- `domain` (string, required): Domain to check

**Response:**
```json
{
  "domain": "gmail.com",
  "servers": [
    {
      "endpoint": "https://gmail.com/.well-known/mcp",
      "health": {
        "status": "healthy",
        "uptime_percentage": 99.9,
        "avg_response_time_ms": 120,
        "response_time_ms": 115,
        "error_rate": 0.001,
        "last_check": "2024-01-15T10:30:00Z",
        "consecutive_failures": 0
      },
      "history": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "status": "healthy",
          "response_time_ms": 115
        }
      ]
    }
  ]
}
```

## 🔧 Utility Endpoints

### GET /capabilities

List all known capabilities in the system.

**Response:**
```json
{
  "capabilities": [
    {
      "name": "email",
      "description": "Email management and communication",
      "category": "productivity",
      "server_count": 25,
      "examples": ["Gmail", "Outlook", "SendGrid"]
    },
    {
      "name": "calendar",
      "description": "Calendar and scheduling operations",
      "category": "productivity", 
      "server_count": 18,
      "examples": ["Google Calendar", "Outlook Calendar"]
    }
  ]
}
```

### GET /stats

Get system statistics.

**Response:**
```json
{
  "total_servers": 150,
  "verified_servers": 120,
  "healthy_servers": 145,
  "total_capabilities": 25,
  "discovery_requests_24h": 10500,
  "registration_requests_24h": 45,
  "avg_response_time_ms": 125,
  "uptime_percentage": 99.9
}
```

## ❌ Error Responses

All errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional error details"
  },
  "request_id": "req_abc123def456"
}
```

**Common Error Codes:**
- `INVALID_DOMAIN`: Domain format is invalid
- `DOMAIN_NOT_FOUND`: No servers found for domain
- `CAPABILITY_NOT_FOUND`: Unknown capability
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `DNS_VERIFICATION_FAILED`: DNS TXT record verification failed
- `ENDPOINT_NOT_ACCESSIBLE`: MCP endpoint is not reachable
- `INVALID_MCP_RESPONSE`: Endpoint doesn't respond with valid MCP
- `CHALLENGE_EXPIRED`: Verification challenge has expired
- `CHALLENGE_NOT_FOUND`: Invalid challenge ID

## 📈 HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## 🔄 Webhooks (Coming Soon)

Register webhooks to receive notifications about server status changes:

```json
{
  "webhook_url": "https://yourapp.com/webhooks/mcp",
  "events": ["server.health.changed", "server.verified"],
  "domain_filter": "mycompany.com"
}
```

---

**Need help?** Check our [User Guide](USER_GUIDE.md) or [open an issue](https://github.com/TSavo/mcplookup.org/issues).
