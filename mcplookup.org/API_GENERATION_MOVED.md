# API Generation Moved to SDK

## 📦 **API Generation Now in [@mcplookup-org/mcp-sdk](https://github.com/MCPLookup-org/mcp-sdk)**

The OpenAPI specification and client generation tools have been moved to the SDK repository for better organization and maintainability.

### **What Was Moved**

- ✅ `openapi.yaml` → `@mcplookup-org/mcp-sdk/spec/openapi.yaml`
- ✅ `openapitools.json` → `@mcplookup-org/mcp-sdk/openapitools.json`
- ✅ `swaggerDef.js` → `@mcplookup-org/mcp-sdk/scripts/build-client.js`
- ✅ Generated client files → `@mcplookup-org/mcp-sdk/src/generated/`
- ✅ OpenAPI scripts → `@mcplookup-org/mcp-sdk/package.json`

### **How to Update API Client**

Instead of generating the client from this repository, use the SDK:

```bash
# Install the SDK
npm install @mcplookup-org/mcp-sdk

# Update from live API
cd node_modules/@mcplookup-org/mcp-sdk
npm run update-spec

# Or use the published SDK directly
import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk';
```

### **Benefits of This Move**

1. **🎯 Single Source of Truth** - API spec and client in one place
2. **🔄 Auto-Generation** - Keep clients up-to-date with live API
3. **📦 Better Distribution** - SDK can be used independently
4. **🧹 Cleaner Separation** - Website focuses on service, SDK on client
5. **🔧 Easier Maintenance** - One place to update API changes

### **For Developers**

If you were using the generated client from this repository, update your imports:

```typescript
// OLD (no longer available)
import { MCPLookupAPIClient } from './src/lib/generated/api-client';

// NEW (use the SDK)
import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk';
```

### **Related Repositories**

- **[@mcplookup-org/mcp-sdk](https://github.com/MCPLookup-org/mcp-sdk)** - API client and utilities
- **[@mcplookup-org/mcp-server](https://github.com/MCPLookup-org/mcp-server)** - Universal MCP bridge
- **[@mcplookup-org/mcpl-cli](https://github.com/MCPLookup-org/mcpl-cli)** - CLI management tool

---

**This change improves the architecture and makes the SDK truly self-contained\!** 🚀
