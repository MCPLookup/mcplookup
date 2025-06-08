# 🌉 MCP Universal Bridge

**Eliminate hardcoded MCP server lists. Give Claude dynamic access to ANY MCP server.**

## 🎯 Quick Start

### 1. Install
```bash
npm install @modelcontextprotocol/sdk
```

### 2. Replace Your Entire Claude Config
**Before** (hardcoded servers):
```json
{
  "mcpServers": {
    "gmail": { "command": "node", "args": ["gmail-server"] },
    "github": { "command": "node", "args": ["github-server"] },
    "slack": { "command": "node", "args": ["slack-server"] }
  }
}
```

**After** (universal bridge):
```json
{
  "mcpServers": {
    "universal-bridge": {
      "command": "node",
      "args": ["scripts/mcp-bridge.mjs"]
    }
  }
}
```

### 3. Use Claude Naturally
- "Find email servers" → Claude discovers Gmail, Outlook, etc.
- "Send an email via Gmail" → Claude finds Gmail and sends email
- "What document tools are available?" → Claude discovers and lists all document servers

## 🛠️ How It Works

The bridge provides **meta-tools** that work with any MCP server:

| Tool | Purpose | Example |
|------|---------|---------|
| `discover_mcp_servers` | Find servers | `discover_mcp_servers(capability="email")` |
| `connect_and_list_tools` | Explore server | `connect_and_list_tools(endpoint="...")` |
| `call_tool_on_server` | Use any tool | `call_tool_on_server(endpoint="...", tool_name="send_email")` |
| `discover_and_call_tool` | One-step workflow | `discover_and_call_tool(domain="gmail.com", tool_name="send_email")` |

## 🎯 Benefits

- ✅ **Zero Configuration**: No need to manually add servers
- ✅ **Dynamic Discovery**: Finds servers in real-time
- ✅ **Universal Access**: Can use ANY MCP server
- ✅ **Always Current**: Uses latest server information
- ✅ **Intelligent**: Chooses best server for each task

## 🚀 Usage Examples

### Basic Discovery
```bash
# Start the bridge
node scripts/mcp-bridge.mjs

# Claude can now use:
# discover_mcp_servers(query="email tools")
# discover_mcp_servers(capability="calendar") 
# discover_mcp_servers(domain="github.com")
```

### Direct Server Connection (Legacy Mode)
```bash
# Connect to specific server
node scripts/mcp-bridge.mjs --endpoint https://api.example.com/mcp

# With authentication
node scripts/mcp-bridge.mjs --endpoint https://api.example.com/mcp --auth "Authorization:Bearer token"
```

## 🔧 Advanced Usage

### Multiple Auth Headers
```bash
node scripts/mcp-bridge.mjs \
  --endpoint https://api.example.com/mcp \
  --auth "Authorization:Bearer token123" \
  --auth "X-API-Key:key456"
```

### Domain Discovery
```bash
node scripts/mcp-bridge.mjs --domain gmail.com
```

### Capability Discovery
```bash
node scripts/mcp-bridge.mjs --capability email
```

## 🧪 Testing

```bash
# Test the bridge
npm run bridge:test

# Run examples
npm run bridge:example
```

## 📋 Available Commands

```bash
# Start universal bridge
npm run bridge

# Test bridge functionality  
npm run bridge:test

# View usage examples
npm run bridge:example
```

## 🔮 The Future

This bridge solves the **hardcoded server limitation** in current MCP implementations. It's a stopgap until MCP protocol natively supports:

- Dynamic tool discovery
- Server federation
- Tool chaining

But for now, it gives Claude **true dynamic capabilities**.

---

**Transform Claude from a static tool user into a dynamic service discoverer.**
