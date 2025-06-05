# MCP Tools Environment Variable Setup

## 🔑 **API Key Environment Variables**

Both MCP tools now support API key authentication via environment variables, making it easy to configure authentication without hardcoding keys in your code.

### **Supported Environment Variables**

#### **Primary API Key Variables** (in order of precedence):
1. `MCP_API_KEY` - Specific to MCP tools
2. `MCPLOOKUP_API_KEY` - Specific to MCPLookup.org
3. `API_KEY` - Generic fallback

#### **Custom Authentication Headers**:
- `MCP_AUTH_HEADERS` - JSON string with custom headers

### **Example Environment Configuration**

#### **.env file**:
```bash
# Primary API key (recommended)
MCP_API_KEY=mcp_your_api_key_here

# Alternative naming
MCPLOOKUP_API_KEY=mcp_your_api_key_here

# Custom authentication headers (JSON format)
MCP_AUTH_HEADERS='{"Authorization": "Bearer custom_token", "X-Custom-Header": "value"}'
```

#### **Shell export**:
```bash
export MCP_API_KEY="mcp_your_api_key_here"
export MCPLOOKUP_API_KEY="mcp_your_api_key_here"
```

#### **Docker environment**:
```yaml
environment:
  - MCP_API_KEY=mcp_your_api_key_here
  - MCPLOOKUP_API_KEY=mcp_your_api_key_here
```

## 🌉 **Bridge MCP Usage**

### **Automatic Environment Authentication**
```typescript
import { MCPDiscoveryBridge } from '@mcplookup/bridge';

// Bridge automatically picks up API key from environment
const bridge = new MCPDiscoveryBridge();

// Create bridge with env auth (no API key needed in code)
const server = await bridge.createBridgeForDomainWithEnvAuth('gmail.com');
await server.run();
```

### **Manual API Key (overrides environment)**
```typescript
// Explicit API key overrides environment variables
const server = await bridge.createBridgeWithApiKey('gmail.com', 'mcp_explicit_key');
```

### **Custom Headers with Environment**
```typescript
// Environment: MCP_AUTH_HEADERS='{"X-Custom": "value"}'
const bridge = new MCPHttpBridge('https://server.com'); // Picks up env headers
```

## 🖥️ **MCP Server Route Usage**

### **Client-Side with Environment Variables**
```typescript
// MCP client automatically uses environment API key
const client = new Client({ name: 'my-client', version: '1.0.0' });
const transport = new StreamableHTTPClientTransport(new URL('https://mcplookup.org/api/mcp'));

// No need to set headers - environment variables are used automatically
await client.connect(transport);

const result = await client.callTool({
  name: 'register_mcp_server',
  arguments: { domain: 'example.com', endpoint: 'https://example.com/mcp' }
});
```

### **Manual Headers (overrides environment)**
```typescript
// Explicit headers override environment variables
const transport = new StreamableHTTPClientTransport(
  new URL('https://mcplookup.org/api/mcp'),
  {
    headers: {
      'Authorization': 'Bearer mcp_explicit_key'
    }
  }
);
```

## 🔧 **Tool-Specific Authentication**

### **Public Tools** (No Authentication Required)
- `discover_mcp_servers`
- `browse_capabilities`
- `get_discovery_stats` (basic)
- `list_mcp_tools`

### **Protected Tools** (Require API Key)
- `register_mcp_server` - Requires `servers:write`
- `verify_domain_ownership` - Requires `servers:read`
- `get_server_health` - Requires `servers:read`
- `get_discovery_stats` (detailed) - Requires `analytics:read`

## 📋 **Environment Variable Precedence**

### **Authentication Order**:
1. **Explicit headers** in code (highest priority)
2. **MCP_API_KEY** environment variable
3. **MCPLOOKUP_API_KEY** environment variable
4. **API_KEY** environment variable (lowest priority)

### **Header Merging**:
```typescript
// Environment: MCP_API_KEY=env_key, MCP_AUTH_HEADERS='{"X-Custom": "env_value"}'
const bridge = new MCPHttpBridge('https://server.com', {
  'Authorization': 'Bearer explicit_key',  // Overrides env MCP_API_KEY
  'X-Other': 'explicit_value'              // Merges with env headers
});

// Result headers:
// Authorization: Bearer explicit_key      (explicit wins)
// X-API-Key: explicit_key                 (auto-added from Authorization)
// X-Custom: env_value                     (from environment)
// X-Other: explicit_value                 (explicit addition)
```

## 🚀 **Quick Start Examples**

### **1. Simple Bridge Setup**
```bash
# Set environment
export MCP_API_KEY="mcp_your_key_here"

# Use in code (no hardcoded keys!)
const bridge = new MCPDiscoveryBridge();
const server = await bridge.createBridgeForDomainWithEnvAuth('gmail.com');
await server.run();
```

### **2. MCP Server Tool Call**
```bash
# Set environment
export MCPLOOKUP_API_KEY="mcp_your_key_here"

# Use in code
const client = new Client({ name: 'my-app', version: '1.0.0' });
const transport = new StreamableHTTPClientTransport(new URL('https://mcplookup.org/api/mcp'));
await client.connect(transport);

// Automatically authenticated via environment
const result = await client.callTool({
  name: 'register_mcp_server',
  arguments: { domain: 'myapp.com', endpoint: 'https://myapp.com/mcp' }
});
```

### **3. Docker Compose Setup**
```yaml
version: '3.8'
services:
  mcp-app:
    image: my-mcp-app
    environment:
      - MCP_API_KEY=mcp_your_key_here
      - MCP_AUTH_HEADERS={"X-App-Version": "1.0.0"}
    volumes:
      - ./app:/app
```

## 🔒 **Security Best Practices**

### **✅ Do:**
- Use environment variables for API keys
- Set restrictive file permissions on .env files (`chmod 600 .env`)
- Use different API keys for different environments (dev/staging/prod)
- Rotate API keys regularly
- Use minimal required permissions

### **❌ Don't:**
- Hardcode API keys in source code
- Commit .env files to version control
- Share API keys between applications
- Use admin permissions for regular operations
- Log API keys in application logs

## 🔍 **Debugging Authentication**

### **Check Environment Variables**
```bash
# Verify environment variables are set
echo $MCP_API_KEY
echo $MCPLOOKUP_API_KEY
echo $MCP_AUTH_HEADERS
```

### **Test API Key**
```bash
# Test API key directly
curl -H "Authorization: Bearer $MCP_API_KEY" \
     https://mcplookup.org/api/v1/discover
```

### **Debug Headers**
```typescript
// Log effective headers in bridge
const bridge = new MCPHttpBridge('https://server.com');
console.log('Auth headers:', bridge.authHeaders); // Will show merged headers
```

## 📚 **Integration Examples**

### **Node.js Application**
```javascript
// Load environment variables
require('dotenv').config();

// Bridge automatically uses process.env.MCP_API_KEY
const { MCPDiscoveryBridge } = require('@mcplookup/bridge');
const bridge = new MCPDiscoveryBridge();

async function main() {
  const server = await bridge.createBridgeForDomainWithEnvAuth('gmail.com');
  await server.run();
}
```

### **TypeScript Application**
```typescript
import { MCPDiscoveryBridge } from '@mcplookup/bridge';

// Environment variables automatically loaded
const bridge = new MCPDiscoveryBridge();

const server = await bridge.createBridgeForCapabilityWithEnvAuth('email');
await server.run();
```

Both MCP tools now provide seamless environment variable support, making it easy to deploy secure, authenticated MCP applications without hardcoding sensitive credentials! 🔐✨
