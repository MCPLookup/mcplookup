# @mcplookup-org/mcp-server

MCP Bridge Server - Universal MCP client with dynamic discovery and tool management.

## Installation

```bash
npm install -g @mcplookup-org/mcp-server
```

## Usage

### As MCP Server (stdio)

```bash
export MCPLOOKUP_API_KEY=your-api-key
mcp-bridge
```

### As HTTP Server

```bash
export MCPLOOKUP_API_KEY=your-api-key
mcp-bridge --http --port 3000
```

### In Claude Desktop

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

## Features

- 🔍 **Server Discovery**: Search and discover MCP servers
- 🧠 **AI-Powered Search**: Natural language server recommendations  
- 📦 **Server Management**: Install and manage MCP servers
- 🌉 **Bridge Mode**: Dynamic proxy with tool prefixing
- 🔧 **Tool Invocation**: Call tools from any discovered server
- 🏥 **Health Monitoring**: Real-time server health checks

## Available MCP Tools

- `discover_mcp_servers` - Search the server registry
- `discover_smart` - AI-powered server discovery
- `install_mcp_server` - Install servers locally
- `list_managed_servers` - List bridge-managed servers
- `control_mcp_server` - Start/stop/restart servers
- `list_claude_servers` - List direct mode servers
- `invoke_tool` - Call tools from other servers
- `get_server_health` - Health monitoring

## License

MIT
