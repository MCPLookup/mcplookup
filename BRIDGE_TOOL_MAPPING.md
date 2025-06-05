# Bridge Tool Mapping

Auto-generated mapping between REST API endpoints and MCP bridge tools.
Generated on 2025-06-05T06:13:11.199Z

## Overview

This document shows how REST API endpoints are mapped to MCP bridge tools for seamless integration.

## Tool Categories


### Discovery

- `discover_servers_via_api`
- `post_smart_via_api`

### API Bridge

- `get_domain-check_via_api`
- `get_onboarding_via_api`
- `post_onboarding_via_api`
- `post_check_via_api`
- `get_verify_via_api`
- `post_verify_via_api`

### Health

- `check_server_health_via_api`

### User Management

- `get_my_servers_via_api`

### Registration

- `register_server_via_api`
- `get_verify_via_api`
- `register_server_via_api`

### Server Management

- `put_servers_via_api`
- `delete_servers_via_api`


## Detailed Mappings


### `discover_servers_via_api`

**Description**: Serverless function for MCP server discovery
**Category**: Discovery
**REST Endpoint**: `GET /v1/discover`

**Parameters**:
```json
{
  "query": {
    "type": "string",
    "description": "Natural language search query",
    "required": false
  },
  "domain": {
    "type": "string",
    "description": "Specific domain to search for",
    "required": false
  },
  "capability": {
    "type": "string",
    "description": "Required capability",
    "required": false
  },
  "limit": {
    "type": "integer",
    "description": "Maximum number of results",
    "required": false
  },
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('discover_servers_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `post_smart_via_api`

**Description**: Smart AI-powered discovery endpoint Three-step process: keywords → search → AI narrowing
**Category**: Discovery
**REST Endpoint**: `POST /v1/discover/smart`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('post_smart_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `get_domain-check_via_api`

**Description**: Domain Ownership Check API GET /api/v1/domain-check?domain=example.com Check if authenticated user can register MCP servers for a domain
**Category**: API Bridge
**REST Endpoint**: `GET /v1/domain-check`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('get_domain-check_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `check_server_health_via_api`

**Description**: Real-time health checks for MCP servers
**Category**: Health
**REST Endpoint**: `GET /v1/health/{domain}`

**Parameters**:
```json
{
  "domain": {
    "type": "string",
    "description": "domain parameter",
    "required": true
  },
  "realtime": {
    "type": "boolean",
    "description": "Perform real-time health check",
    "required": false
  },
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('check_server_health_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `get_my_servers_via_api`

**Description**: User-Specific Server Management API GET /api/v1/my/servers - List only MY servers Prevents users from seeing servers they don't own
**Category**: User Management
**REST Endpoint**: `GET /v1/my/servers`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('get_my_servers_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `get_onboarding_via_api`

**Description**: Onboarding API GET /api/v1/onboarding - Get user's onboarding state POST /api/v1/onboarding - Update onboarding progress
**Category**: API Bridge
**REST Endpoint**: `GET /v1/onboarding`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('get_onboarding_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `post_onboarding_via_api`

**Description**: Onboarding API GET /api/v1/onboarding - Get user's onboarding state POST /api/v1/onboarding - Update onboarding progress
**Category**: API Bridge
**REST Endpoint**: `POST /v1/onboarding`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('post_onboarding_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `register_server_via_api`

**Description**: Handles MCP server registration with DNS verification
**Category**: Registration
**REST Endpoint**: `POST /v1/register`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('register_server_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `get_verify_via_api`

**Description**: Verifies DNS challenges for domain ownership
**Category**: Registration
**REST Endpoint**: `GET /v1/register/verify/{id}`

**Parameters**:
```json
{
  "id": {
    "type": "string",
    "description": "id parameter",
    "required": true
  },
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('get_verify_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `register_server_via_api`

**Description**: Verifies DNS challenges for domain ownership
**Category**: Registration
**REST Endpoint**: `POST /v1/register/verify/{id}`

**Parameters**:
```json
{
  "id": {
    "type": "string",
    "description": "id parameter",
    "required": true
  },
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('register_server_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `put_servers_via_api`

**Description**: Server Management API with Domain Ownership Validation PUT /api/v1/servers/{domain} - Update server (only if you own the domain) DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)
**Category**: Server Management
**REST Endpoint**: `PUT /v1/servers/{domain}`

**Parameters**:
```json
{
  "domain": {
    "type": "string",
    "description": "domain parameter",
    "required": true
  },
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('put_servers_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `delete_servers_via_api`

**Description**: Server Management API with Domain Ownership Validation PUT /api/v1/servers/{domain} - Update server (only if you own the domain) DELETE /api/v1/servers/{domain} - Delete server (only if you own the domain)
**Category**: Server Management
**REST Endpoint**: `DELETE /v1/servers/{domain}`

**Parameters**:
```json
{
  "domain": {
    "type": "string",
    "description": "domain parameter",
    "required": true
  },
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('delete_servers_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `post_check_via_api`

**Description**: Domain Verification Check API POST /api/v1/verify/check - Check specific verification
**Category**: API Bridge
**REST Endpoint**: `POST /v1/verify/check`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('post_check_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `get_verify_via_api`

**Description**: Domain Verification API POST /api/v1/verify - Start domain verification GET /api/v1/verify - Get user's verifications
**Category**: API Bridge
**REST Endpoint**: `GET /v1/verify`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('get_verify_via_api', {
  // Add parameters here based on the schema above
});
```

---

### `post_verify_via_api`

**Description**: Domain Verification API POST /api/v1/verify - Start domain verification GET /api/v1/verify - Get user's verifications
**Category**: API Bridge
**REST Endpoint**: `POST /v1/verify`

**Parameters**:
```json
{
  "auth_headers": {
    "type": "object",
    "description": "Optional authentication headers",
    "required": false
  }
}
```

**Usage Example**:
```typescript
const result = await bridgeClient.callTool('post_verify_via_api', {
  // Add parameters here based on the schema above
});
```

---


## Integration Guide

### Using Generated Bridge Tools

1. **Import the generated tools**:
```typescript
import { GeneratedBridgeTools } from './src/lib/mcp/bridge-generated';
```

2. **Initialize with your MCP server**:
```typescript
const bridgeTools = new GeneratedBridgeTools(mcpServer);
```

3. **Tools are automatically registered** and available for use.

### Configuration

Bridge configuration is managed in `src/lib/mcp/bridge-config.ts`:

- **API Base URL**: Configure the target API endpoint
- **Enabled Tools**: Control which tools are active
- **Tool Categories**: Organize tools by functionality
- **Endpoint Mappings**: Map tools to REST endpoints

### Regeneration

To regenerate bridge tools after API changes:

```bash
npm run sync:bridge
```

This will:
1. Analyze the current OpenAPI spec
2. Generate new bridge tool implementations
3. Update configuration and mappings
4. Maintain sync between API and bridge

## Tool Count Summary

- **Total Tools**: 15
- **Categories**: 6
- **API Endpoints Covered**: 15
