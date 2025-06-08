# MCP Bridge Authentication Guide

## 🔐 Authentication Options for MCP Bridge

The MCP Bridge supports different authentication methods when making API calls to mcplookup.org. This guide covers how to set up authentication for different use cases.

## 📋 Quick Reference

| Tool | Auth Required | Notes |
|------|---------------|-------|
| `discover_mcp_servers` | ❌ No | Public discovery, no auth needed |
| `connect_and_list_tools` | ❌ No | Connects to any public MCP server |
| `call_tool_on_server` | ❌ No | Calls tools on any MCP server |
| `read_resource_from_server` | ❌ No | Reads resources from any server |
| `discover_and_call_tool` | ❌ No | Discovery + tool calling workflow |
| `bridge_status` | ❌ No | Bridge status information |
| `register_mcp_server` | ✅ **Yes** | Requires authenticated user_id |
| `verify_domain_ownership` | ✅ **Yes** | Requires authenticated user_id |
| `get_server_health` | ❌ No | Public health metrics |
| `browse_capabilities` | ❌ No | Public capability browsing |
| `get_discovery_stats` | ❌ No | Public analytics |
| `list_mcp_tools` | ❌ No | Public tool listing |

## 🚀 Setup Examples

### 1. Anonymous Usage (Discovery Only)

For basic discovery and tool calling, no authentication is needed:

```typescript
import { MCPHttpBridge } from '@/lib/mcp/bridge';

// Create bridge with no authentication
const bridge = new MCPHttpBridge();

// These tools work without authentication
await bridge.server.callTool('discover_mcp_servers', {
  query: 'email servers'
});

await bridge.server.callTool('call_tool_on_server', {
  endpoint: 'https://example.com/mcp',
  tool_name: 'send_email',
  arguments: { to: 'user@example.com', subject: 'Hello' }
});
```

### 2. Session-Based Authentication (Web Apps)

For web applications where users are logged in via Next.js/Auth.js:

```typescript
import { getCurrentUser } from '@/lib/auth/server';
import { MCPHttpBridge } from '@/lib/mcp/bridge';

// Get current session (server-side)
const user = await getCurrentUser();

if (user) {
  const bridge = new MCPHttpBridge(
    'https://mcplookup.org/api/mcp',
    {}, // No auth headers for HTTP endpoint
    {
      type: 'session',
      userId: user.id,
      sessionCookie: request.headers.get('cookie') || ''
    }
  );

  // Now you can register servers
  await bridge.server.callTool('register_mcp_server', {
    domain: 'mycompany.com',
    endpoint: 'https://mycompany.com/mcp',
    capabilities: ['email', 'crm']
  });
}
```

### 3. API Key Authentication (Programmatic)

For scripts, CLI tools, or server-to-server communication:

```typescript
import { MCPHttpBridge } from '@/lib/mcp/bridge';

// Get your API key from https://mcplookup.org/dashboard/api-keys
const API_KEY = process.env.MCPLOOKUP_API_KEY;
const USER_ID = process.env.MCPLOOKUP_USER_ID;

const bridge = new MCPHttpBridge(
  'https://mcplookup.org/api/mcp',
  {}, // No auth headers for HTTP endpoint  
  {
    type: 'api_key',
    token: API_KEY,
    userId: USER_ID
  }
);

// Register your MCP server
await bridge.server.callTool('register_mcp_server', {
  domain: 'myapi.com',
  endpoint: 'https://myapi.com/mcp',
  capabilities: ['data_processing', 'analytics']
});
```

### 4. Bearer Token Authentication

For OAuth2 or custom token-based auth:

```typescript
import { MCPHttpBridge } from '@/lib/mcp/bridge';

const bridge = new MCPHttpBridge(
  'https://mcplookup.org/api/mcp',
  {},
  {
    type: 'bearer',
    token: 'your-jwt-token-here',
    userId: 'user-123'
  }
);
```

## 🔑 Getting Authentication Credentials

### Option 1: Web Dashboard
1. Go to https://mcplookup.org/dashboard
2. Sign in with GitHub, Google, or create an account
3. Navigate to **API Keys** section
4. Generate a new API key
5. Copy your `USER_ID` and `API_KEY`

### Option 2: CLI (Coming Soon)
```bash
# Install the CLI
npm install -g @mcplookup/cli

# Login and get credentials
mcplookup auth login
mcplookup auth whoami
```

## 🛡️ Security Best Practices

### Environment Variables
```bash
# .env.local
MCPLOOKUP_API_KEY=your_api_key_here
MCPLOOKUP_USER_ID=your_user_id_here
```

### Secure Storage
```typescript
// ✅ Good: Use environment variables
const apiKey = process.env.MCPLOOKUP_API_KEY;

// ❌ Bad: Hardcoded credentials
const apiKey = 'sk-12345...'; // Never do this!
```

### Scope Limiting
```typescript
// Only provide authentication for tools that need it
const bridge = new MCPHttpBridge(
  'https://mcplookup.org/api/mcp',
  {},
  user ? {
    type: 'session',
    userId: user.id,
    sessionCookie: cookies
  } : {
    type: 'none' // No auth for discovery-only usage
  }
);
```

## 🔧 Troubleshooting

### Common Authentication Errors

#### "Authentication required"
```json
{
  "error": "Authentication required",
  "message": "This operation requires user authentication"
}
```
**Solution**: Add authentication to your bridge configuration.

#### "Domain ownership verification required"  
```json
{
  "error": "Domain ownership verification required",
  "message": "You must verify ownership of example.com before registering MCP servers for it."
}
```
**Solution**: Verify domain ownership first:
```typescript
await bridge.server.callTool('verify_domain_ownership', {
  domain: 'example.com'
});
```

#### "Invalid user_id"
```json
{
  "error": "Invalid user_id",
  "message": "The provided user_id is not valid or does not exist"
}
```
**Solution**: Check your USER_ID in the dashboard or re-authenticate.

### Testing Authentication

```typescript
// Test your authentication setup
const bridge = new MCPHttpBridge(/* your config */);

// This should return your user info if auth is working
const result = await bridge.server.callTool('bridge_status', {});
console.log('Auth status:', result);
```

## 🔄 Migration Guide

### From Unauthenticated to Authenticated

If you're upgrading from basic discovery to full functionality:

```typescript
// Before: Discovery only
const bridge = new MCPHttpBridge();

// After: Full functionality
const user = await getCurrentUser();
const bridge = new MCPHttpBridge(
  'https://mcplookup.org/api/mcp',
  {},
  user ? {
    type: 'session',
    userId: user.id,
    sessionCookie: request.headers.get('cookie') || ''
  } : { type: 'none' }
);
```

## 📞 Support

- **Documentation**: https://mcplookup.org/docs
- **Issues**: https://github.com/mcplookup/issues  
- **Discord**: https://discord.gg/mcplookup
- **Email**: support@mcplookup.org

---

**Next Steps:**
- [Register your first MCP server](./REGISTRATION_GUIDE.md)
- [Verify domain ownership](./DOMAIN_VERIFICATION.md)
- [Bridge usage examples](../examples/bridge-usage.mjs)
