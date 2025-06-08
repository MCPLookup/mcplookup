# @mcplookup-org/mcp-server

**🌉 Universal MCP Bridge Server - Dynamic Discovery & Tool Management**

[\![npm version](https://badge.fury.io/js/@mcplookup-org%2Fmcp-server.svg)](https://badge.fury.io/js/@mcplookup-org%2Fmcp-server)
[\![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[\![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The MCP server that eliminates hardcoded server lists forever. Connect to any MCP server dynamically through one universal bridge.**

## 🎯 **What is This?**

The MCP Bridge Server is a **universal MCP client** that provides dynamic discovery and management of other MCP servers. Instead of hardcoding server configurations, AI agents can discover and connect to any MCP server in real-time.

### **Before (Hardcoded Hell)**
```json
{
  "mcpServers": {
    "gmail": {"command": "node", "args": ["gmail-server"]},
    "github": {"command": "node", "args": ["github-server"]},
    "slack": {"command": "node", "args": ["slack-server"]}
    // Must manually add every server...
  }
}
```

### **After (Universal Bridge)**
```json
{
  "mcpServers": {
    "universal-bridge": {
      "command": "mcp-bridge",
      "env": {
        "MCPLOOKUP_API_KEY": "your-api-key"
      }
    }
  }
}
```

**That's it\!** Now Claude has dynamic access to EVERY MCP server in existence.

## ⚡ **Quick Start**

### Installation

```bash
npm install -g @mcplookup-org/mcp-server
```

### Basic Usage

#### As MCP Server (stdio mode)

```bash
export MCPLOOKUP_API_KEY=your-api-key
mcp-bridge
```

#### As HTTP Server

```bash
export MCPLOOKUP_API_KEY=your-api-key
mcp-bridge --http --port 3000
```

### Claude Desktop Integration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "mcplookup-bridge": {
      "command": "mcp-bridge",
      "env": {
        "MCPLOOKUP_API_KEY": "your-api-key"
      }
    }
  }
}
```

Get your API key from [mcplookup.org/dashboard](https://mcplookup.org/dashboard).

## 🔧 **Available MCP Tools**

The bridge server provides these tools to AI agents:

### **🔍 Discovery Tools**

#### `discover_mcp_servers`
Search the server registry using various criteria.

```typescript
// Example usage in Claude
{
  "name": "discover_mcp_servers",
  "arguments": {
    "query": "filesystem tools",
    "verified_only": true,
    "limit": 5
  }
}
```

#### `discover_smart`
AI-powered server discovery using natural language.

```typescript
{
  "name": "discover_smart", 
  "arguments": {
    "query": "I need tools for managing customer emails and scheduling meetings"
  }
}
```

### **📦 Server Management Tools**

#### `install_mcp_server`
Install and configure MCP servers locally.

```typescript
{
  "name": "install_mcp_server",
  "arguments": {
    "package": "@modelcontextprotocol/server-filesystem",
    "mode": "bridge",
    "auto_start": true
  }
}
```

#### `list_managed_servers`
List all bridge-managed servers and their status.

#### `control_mcp_server`
Start, stop, or restart managed servers.

```typescript
{
  "name": "control_mcp_server",
  "arguments": {
    "server_id": "filesystem-server",
    "action": "restart"
  }
}
```

### **🔧 Tool Invocation**

#### `invoke_tool`
Call tools from any discovered or managed server.

```typescript
{
  "name": "invoke_tool",
  "arguments": {
    "server_domain": "gmail.com",
    "tool_name": "send_email",
    "tool_arguments": {
      "to": "user@example.com",
      "subject": "Hello from MCP Bridge",
      "body": "This email was sent via the MCP Bridge\!"
    }
  }
}
```

### **📊 Monitoring Tools**

#### `get_server_health`
Real-time health monitoring for any server.

```typescript
{
  "name": "get_server_health",
  "arguments": {
    "domain": "gmail.com",
    "realtime": true
  }
}
```

#### `list_claude_servers`
List servers configured in Claude Desktop (direct mode).

## 🏗️ **Architecture**

The MCP Bridge Server uses a clean three-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Protocol Layer                      │
│  JSON-RPC │ Tool Calls │ Resource Access │ Streaming      │
├─────────────────────────────────────────────────────────────┤
│                    Bridge Logic Layer                      │
│  Discovery │ Server Management │ Tool Routing │ Health     │
├─────────────────────────────────────────────────────────────┤
│                  Integration Layer                         │
│  MCPLookup API │ Docker Management │ Local Servers        │
└─────────────────────────────────────────────────────────────┘
```

### **Key Components**

- **MCPLookupBridge** - Main bridge server class
- **Discovery Service** - Server discovery and search
- **Server Manager** - Lifecycle management for local servers
- **Tool Router** - Dynamic tool invocation across servers
- **Health Monitor** - Real-time server health tracking

## 🐳 **Docker Support**

The bridge server includes comprehensive Docker support for secure server isolation:

### **Features**
- **Security Hardening** - Read-only filesystem, no new privileges
- **Resource Limits** - Memory, CPU, and process constraints
- **Environment Injection** - Safe variable passing
- **Health Monitoring** - Container health checks
- **Auto-Recovery** - Automatic restart on failure

### **Configuration**
```typescript
{
  "name": "install_mcp_server",
  "arguments": {
    "package": "@company/server",
    "mode": "bridge",
    "docker_options": {
      "memory_limit": "512m",
      "cpu_limit": "0.5",
      "read_only": true,
      "no_new_privileges": true
    }
  }
}
```

## 🔐 **Security**

### **Container Isolation**
- All servers run in isolated Docker containers by default
- Read-only filesystem prevents tampering
- Resource limits prevent resource exhaustion
- No privilege escalation allowed

### **Environment Variables**
- Safe injection of required environment variables
- Automatic escaping and validation
- No exposure of sensitive bridge credentials

### **Network Security**
- Containers run on isolated networks
- Only necessary ports exposed
- SSL/TLS validation for external connections

## 📊 **Performance**

### **Benchmarks**
- **Discovery**: < 500ms average response time
- **Tool Invocation**: < 2s end-to-end latency
- **Server Startup**: < 30s for Docker containers
- **Memory Usage**: < 50MB base footprint
- **Concurrent Servers**: 100+ supported

### **Optimization Features**
- **Connection Pooling** - Reuse connections to frequently accessed servers
- **Response Caching** - Cache discovery results and server metadata
- **Lazy Loading** - Start servers only when needed
- **Health Caching** - Cache health status to reduce API calls

## 🔧 **Configuration**

### **Environment Variables**

#### Required
- `MCPLOOKUP_API_KEY` - Your MCPLookup.org API key

#### Optional
- `MCPLOOKUP_BASE_URL` - API base URL (default: https://mcplookup.org/api/v1)
- `BRIDGE_PORT` - HTTP server port (default: 3000)
- `DOCKER_ENABLED` - Enable Docker support (default: true)
- `HEALTH_CHECK_INTERVAL` - Health check interval in ms (default: 30000)
- `MAX_CONCURRENT_SERVERS` - Max concurrent servers (default: 10)
- `LOG_LEVEL` - Logging level (default: info)

### **Configuration File**

Create `~/.mcpl/bridge-config.json`:

```json
{
  "api_key": "your-api-key",
  "default_mode": "bridge",
  "auto_start": true,
  "docker_options": {
    "memory_limit": "512m",
    "cpu_limit": "0.5"
  },
  "health_monitoring": {
    "enabled": true,
    "interval": 30000,
    "auto_restart": true
  }
}
```

## 🚀 **Deployment**

### **Development**
```bash
git clone https://github.com/MCPLookup-org/mcp-server.git
cd mcp-server
npm install
npm run build
npm start
```

### **Production**
```bash
# Install globally
npm install -g @mcplookup-org/mcp-server

# Run as service
mcp-bridge --http --port 3000

# Or with PM2
pm2 start mcp-bridge --name "mcp-bridge" -- --http --port 3000
```

### **Docker**
```bash
docker run -d \
  --name mcp-bridge \
  -p 3000:3000 \
  -e MCPLOOKUP_API_KEY=your-api-key \
  mcplookup/mcp-server:latest
```

## 🧪 **Testing**

### **Unit Tests**
```bash
npm test
```

### **Integration Tests**
```bash
npm run test:integration
```

### **Health Check**
```bash
curl http://localhost:3000/health
```

## 🔗 **Related Packages**

- **[@mcplookup-org/mcp-sdk](https://github.com/MCPLookup-org/mcp-sdk)** - Shared SDK and utilities
- **[@mcplookup-org/mcpl-cli](https://github.com/MCPLookup-org/mcpl-cli)** - CLI management tool

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 **Support**

- **GitHub Issues**: [Report bugs and request features](https://github.com/MCPLookup-org/mcp-server/issues)
- **Documentation**: [Full documentation](https://mcplookup.org/docs)
- **Community**: [Join our Discord](https://discord.gg/mcplookup)

---

**🌉 Bridging the gap between AI agents and MCP servers**
