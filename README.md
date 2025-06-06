# @mcplookup-org/mcp-sdk

**🚀 The Official SDK for MCP (Model Context Protocol) Development**

[\![npm version](https://badge.fury.io/js/@mcplookup-org%2Fmcp-sdk.svg)](https://badge.fury.io/js/@mcplookup-org%2Fmcp-sdk)
[\![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[\![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The complete toolkit for building MCP-enabled applications with type-safe API access, shared utilities, and auto-generated clients.**

## 🎯 **What's Inside**

This SDK provides everything you need to build MCP applications:

- **🔌 Generated API Client** - Type-safe access to MCPLookup.org discovery service
- **📝 TypeScript Types** - Complete type definitions for MCP protocols
- **🛠️ Shared Utilities** - Common functions for response handling, validation, and configuration
- **🔄 Auto-Generation** - Keep your client up-to-date with the latest API changes

## ⚡ **Quick Start**

### Installation

```bash
npm install @mcplookup-org/mcp-sdk
```

### Basic Usage

```typescript
import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk';

// Create client
const client = new MCPLookupAPIClient();

// Discover servers
const servers = await client.discover({ 
  query: 'filesystem tools',
  verified_only: true 
});

console.log(`Found ${servers.total} servers:`, servers.servers);
```

### With API Key (for authenticated features)

```typescript
import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk';

const client = new MCPLookupAPIClient(
  'https://mcplookup.org/api/v1',
  'your-api-key'
);

// Register a new server
const registration = await client.register({
  domain: 'mycompany.com',
  endpoint: 'https://mycompany.com/mcp',
  contact_email: 'admin@mycompany.com'
});
```

## 📖 **API Reference**

### MCPLookupAPIClient

The main client class for interacting with the MCPLookup.org API.

#### Constructor

```typescript
new MCPLookupAPIClient(baseUrl?: string, apiKey?: string)
```

- `baseUrl` - API base URL (default: `https://mcplookup.org/api/v1`)
- `apiKey` - Optional API key for authenticated requests

#### Discovery Methods

##### `discover(params)`

Find MCP servers using various search criteria.

```typescript
const servers = await client.discover({
  query: 'email automation',           // Natural language query
  domain: 'gmail.com',                 // Specific domain
  capability: 'email',                 // Specific capability
  category: 'communication',           // Server category
  transport: 'streamable_http',        // Transport protocol
  verified_only: true,                 // Only verified servers
  limit: 10                           // Max results
});
```

**Parameters:**
- `query?: string` - Natural language search query
- `intent?: string` - Specific intent or use case
- `domain?: string` - Filter by domain
- `capability?: string` - Filter by capability
- `category?: string` - Filter by category (`communication`, `productivity`, etc.)
- `transport?: string` - Required transport (`streamable_http`, `sse`, `stdio`)
- `cors_required?: boolean` - Requires CORS support
- `ssl_required?: boolean` - Requires SSL/TLS
- `verified_only?: boolean` - Only verified servers (default: false)
- `include_health?: boolean` - Include health metrics (default: true)
- `include_tools?: boolean` - Include tools list (default: true)
- `include_resources?: boolean` - Include resources list (default: false)
- `limit?: number` - Max results (1-100, default: 10)
- `offset?: number` - Results offset (default: 0)

##### `discoverSmart(params)`

AI-powered discovery using natural language understanding.

```typescript
const servers = await client.discoverSmart({
  query: 'I need tools for managing customer emails and scheduling meetings',
  max_results: 5,
  include_reasoning: true
});
```

**Parameters:**
- `query: string` - Natural language query (required)
- `max_results?: number` - Max results (1-50, default: 10)
- `include_reasoning?: boolean` - Include AI reasoning (default: false)

#### Registration Methods

##### `register(params)`

Register a new MCP server.

```typescript
const registration = await client.register({
  domain: 'mycompany.com',
  endpoint: 'https://mycompany.com/mcp',
  contact_email: 'admin@mycompany.com',
  description: 'Customer management tools'
});
```

**Parameters:**
- `domain: string` - Domain name (must match endpoint domain)
- `endpoint: string` - MCP endpoint URL
- `contact_email: string` - Contact email for verification
- `description?: string` - Optional server description

#### Health Monitoring

##### `getServerHealth(domain, realtime?)`

Get server health metrics.

```typescript
const health = await client.getServerHealth('gmail.com', true);
console.log(`Status: ${health.health.status}`);
console.log(`Uptime: ${health.health.uptime_percentage}%`);
```

**Parameters:**
- `domain: string` - Server domain
- `realtime?: boolean` - Perform real-time check (default: false)

#### Authentication

##### `setApiKey(apiKey)`

Set API key for authenticated requests.

```typescript
client.setApiKey('your-api-key');
```

## 🛠️ **Shared Utilities**

### Response Utilities

```typescript
import { createSuccessResult, createErrorResult } from '@mcplookup-org/mcp-sdk/utils';

// Create standardized responses
const success = createSuccessResult({ message: 'Operation completed' });
const error = createErrorResult('Something went wrong', 'VALIDATION_ERROR');
```

### Configuration Utilities

```typescript
import { readJsonFile, writeJsonFile } from '@mcplookup-org/mcp-sdk/utils';

// Read/write JSON configuration files
const config = await readJsonFile('config.json');
await writeJsonFile('config.json', { updated: true });
```

### Validation Utilities

```typescript
import { validateInstallOptions } from '@mcplookup-org/mcp-sdk/utils';

// Validate installation options
const validation = validateInstallOptions({
  mode: 'bridge',
  autoStart: true
});

if (\!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

## 📝 **TypeScript Types**

The SDK exports comprehensive TypeScript types:

```typescript
import type { 
  MCPServerRecord,
  DiscoveryResponse,
  RegistrationResponse,
  HealthMetrics,
  TransportCapabilities,
  ToolCallResult,
  ManagedServer
} from '@mcplookup-org/mcp-sdk/types';

// Use types in your application
function processServer(server: MCPServerRecord) {
  console.log(`Server: ${server.name}`);
  console.log(`Transport: ${server.transport}`);
  console.log(`Health: ${server.health?.status}`);
}
```

## 🔄 **Auto-Generation**

Keep your SDK up-to-date with the latest API changes:

### Update API Specification

```bash
npm run update-spec
```

This will:
1. Download the latest OpenAPI spec from MCPLookup.org
2. Generate new TypeScript types
3. Rebuild the API client
4. Compile everything

### Manual Generation

```bash
# Generate types from OpenAPI spec
npm run generate-client

# Build the SDK
npm run build
```

## 🏗️ **Development**

### Setup

```bash
git clone https://github.com/MCPLookup-org/mcp-sdk.git
cd mcp-sdk
npm install
```

### Scripts

```bash
npm run build          # Build TypeScript
npm run test           # Run tests
npm run lint           # Lint code
npm run clean          # Clean build artifacts
npm run generate-client # Generate API client
npm run update-spec    # Update from live API
```

### Project Structure

```
mcp-sdk/
├── spec/
│   └── openapi.yaml          # API specification
├── src/
│   ├── generated/            # Auto-generated files
│   │   ├── api-types.ts      # OpenAPI types
│   │   └── api-client.ts     # API client
│   ├── shared/               # Shared utilities
│   │   ├── response-utils.ts # Response helpers
│   │   ├── config-utils.ts   # Config helpers
│   │   └── validation-utils.ts # Validation helpers
│   ├── types.ts              # Core types
│   └── index.ts              # Main exports
├── scripts/
│   └── build-client.js       # Client generation
└── dist/                     # Compiled output
```

## 🔗 **Related Packages**

- **[@mcplookup-org/mcp-server](https://github.com/MCPLookup-org/mcp-server)** - MCP Bridge Server
- **[@mcplookup-org/mcpl-cli](https://github.com/MCPLookup-org/mcpl-cli)** - CLI Management Tool

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 **Support**

- **GitHub Issues**: [Report bugs and request features](https://github.com/MCPLookup-org/mcp-sdk/issues)
- **Documentation**: [Full API documentation](https://mcplookup.org/docs)
- **Community**: [Join our Discord](https://discord.gg/mcplookup)

---

**Built with ❤️ by the MCPLookup.org team**
