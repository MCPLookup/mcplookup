# MCPLOOKUP.ORG - README

**🔥 The Universal MCP Discovery Service - The DNS of AI Tools**

[\![Build Status](https://github.com/mcplookup/registry/workflows/CI/badge.svg)](https://github.com/mcplookup/registry/actions)
[\![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[\![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[\![MCP Protocol](https://img.shields.io/badge/MCP-2025--03--26-blue.svg)](https://modelcontextprotocol.io)

---

## 🎯 **THE REVOLUTION: THE END OF HARDCODED LISTS**

**The Problem**: Every AI agent today maintains static, hardcoded lists of tools and services. This is the equivalent of having to manually edit your browser's bookmarks every time a new website is created.

**Our Solution**: **Dynamic Discovery** - AI agents discover tools in real-time, just like web browsers discover websites through DNS.

## 🚀 **MCPL Ecosystem**

The MCPLookup.org platform consists of multiple repositories for different use cases:

### **📚 [@mcplookup-org/mcp-sdk](https://github.com/MCPLookup-org/mcp-sdk)**
**The Official SDK for MCP Development**
- 🔌 **Generated API Client** - Type-safe access to MCPLookup.org discovery service
- 📝 **TypeScript Types** - Complete type definitions for MCP protocols
- 🛠️ **Shared Utilities** - Common functions for response handling, validation, and configuration
- 🔄 **Auto-Generation** - Keep your client up-to-date with the latest API changes

```bash
npm install @mcplookup-org/mcp-sdk
```

### **🌉 [@mcplookup-org/mcp-server](https://github.com/MCPLookup-org/mcp-server)**
**Universal MCP Bridge Server - Dynamic Discovery & Tool Management**
- 🔍 **Dynamic Discovery** - Eliminates hardcoded server lists forever
- 🧠 **AI-Powered Search** - Natural language server recommendations
- 📦 **Server Management** - Install and manage MCP servers
- 🔧 **Tool Invocation** - Call tools from any discovered server

```bash
npm install -g @mcplookup-org/mcp-server
```

### **🖥️ [@mcplookup-org/mcpl-cli](https://github.com/MCPLookup-org/mcpl-cli)**
**Enhanced MCP Server Management CLI**
- 🔍 **Smart Discovery** - Find servers using natural language or technical filters
- 📦 **Easy Installation** - Multiple installation modes (direct, bridge, global)
- 🔧 **Lifecycle Management** - Start, stop, restart, and monitor servers
- 🎨 **Beautiful Interface** - Rich CLI with colors, spinners, and progress bars

```bash
npm install -g @mcplookup-org/mcpl-cli
```

### **🌐 [MCPLookup-org/mcplookup.org](https://github.com/MCPLookup-org/mcplookup.org)**
**The Discovery Service Website & API**
- 🌐 **Web Interface** - Human-friendly server discovery and registration
- 🔌 **REST API** - Programmatic access to the discovery service
- 🔐 **DNS Verification** - Cryptographic proof of domain ownership
- 📊 **Real-time Health** - Live server status and performance metrics

## ⚡ **Quick Start**

### For AI Developers

```typescript
import { MCPLookupAPIClient } from '@mcplookup-org/mcp-sdk';

// Discover MCP servers dynamically
const client = new MCPLookupAPIClient();
const servers = await client.discover({ query: 'filesystem' });
```

### For CLI Users

```bash
# Install the CLI
npm install -g @mcplookup-org/mcpl-cli

# Search for servers
mcpl search "email automation tools"

# Install a server
mcpl install @modelcontextprotocol/server-filesystem
```

### For Service Providers

```bash
# Register your MCP server
curl -X POST https://mcplookup.org/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"domain": "myservice.com", "endpoint": "https://myservice.com/mcp"}'
```

## 🏗️ **Architecture: The Dynamic Discovery Engine**

### **🚀 Zero-Hardcoding Architecture**

```
┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ AI AGENTS       │─▶│ MCPLOOKUP.ORG    │─▶│ MCP SERVERS     │
│                 │  │ DYNAMIC ENGINE   │  │                 │
│ • Claude        │  │ • DNS Discovery  │  │ • gmail.com/mcp │
│ • ChatGPT       │  │ • Well-Known     │  │ • github.com/   │
│ • Custom Agents │  │ • Live Registry  │  │ • ANY domain    │
└─────────────────┘  └──────────────────┘  └─────────────────┘
```

## 🔧 **API Integration**

### Discovery API

```bash
# Find servers by domain
curl https://mcplookup.org/api/v1/discover/domain/gmail.com

# Smart AI-powered search
curl -X POST https://mcplookup.org/api/v1/discover/smart \
  -d '{"query": "I need email automation tools"}'
```

### MCP Server

```bash
# Connect to the discovery MCP server
mcp connect https://mcplookup.org/api/mcp
```

**Available MCP Tools:**
- `discover_mcp_servers` - Find servers by domain/capability/intent
- `register_mcp_server` - Register new servers with verification
- `get_server_health` - Real-time health and performance metrics

## 📚 **Documentation**

### **🚀 Start Here**
- **[🔥 The Future of MCP](THE_FUTURE_OF_MCP.md)** - Our vision for eliminating hardcoded lists
- **[👤 User Guide](USER_GUIDE.md)** - Complete discovery and registration guide
- **[⚡ API Reference](API_SPECIFICATION.md)** - Complete REST API documentation

### **📖 Repository Documentation**
- **[mcp-sdk Documentation](https://github.com/MCPLookup-org/mcp-sdk#readme)** - SDK usage and API reference
- **[mcp-server Documentation](https://github.com/MCPLookup-org/mcp-server#readme)** - Bridge server setup and tools
- **[mcpl-cli Documentation](https://github.com/MCPLookup-org/mcpl-cli#readme)** - CLI commands and usage

### **🔧 Technical Specifications**
- [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) - Complete project overview
- [`MCP_SERVER_SPEC.md`](./MCP_SERVER_SPEC.md) - MCP discovery server details
- [`API_SPEC.md`](./API_SPEC.md) - REST API documentation
- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) - Production deployment

## 🌍 **Open Standards, Not Monopolies**

MCPLookup.org is built on open standards and encourages competition:

✅ **Open Source**: Every line of code is public and forkable  
✅ **Open Standards**: DNS and HTTP standards anyone can implement  
✅ **Open Collaboration**: Working with industry leaders, not against them  
✅ **Open Distribution**: Encouraging alternative implementations  

## 🤝 **Contributing**

### Development Setup

```bash
# Clone and setup
git clone https://github.com/MCPLookup-org/mcplookup.org.git
cd mcplookup.org
npm install
npm run dev
```

### Related Repositories

- **[mcp-sdk](https://github.com/MCPLookup-org/mcp-sdk)** - Shared SDK and utilities
- **[mcp-server](https://github.com/MCPLookup-org/mcp-server)** - Universal MCP bridge server
- **[mcpl-cli](https://github.com/MCPLookup-org/mcpl-cli)** - CLI management tool

## 📄 **License**

MIT License - see [LICENSE](./LICENSE) file for details.

---

**🔥 MCPLookup.org - Making AI tools as discoverable as web pages**

*The professional registry for AI capabilities. Enterprise-grade MCP server discovery.*

---

*Ready to revolutionize AI tool discovery? [Get started now\!](https://mcplookup.org)*
