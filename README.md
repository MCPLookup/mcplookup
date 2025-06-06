# @mcplookup-org/mcp-sdk

Shared SDK and utilities for MCP (Model Context Protocol) development.

## Installation

```bash
npm install @mcplookup-org/mcp-sdk
```

## Usage

### API Client

```typescript
import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk/client';

const client = new MCPLookupAPIClient('https://mcplookup.org/api/v1', 'your-api-key');
const servers = await client.discover({ query: 'filesystem' });
```

### Types

```typescript
import { ToolCallResult, ManagedServer } from '@mcplookup-org/mcp-sdk/types';
```

### Utilities

```typescript
import { createSuccessResult, validateInstallOptions } from '@mcplookup-org/mcp-sdk/utils';
```

## License

MIT
