# 🚀 MCPLookup.org Setup Guide

**Dead Simple Setup for Both User Types**

---

## 🎯 **For AI Developers (Add MCP Discovery to Your Agent)**

### **Claude Desktop** ✅ TESTED

1. **Open configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add MCPLookup.org:**
```json
{
  "mcpServers": {
    "mcplookup": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-fetch",
        "https://mcplookup.org/api/mcp"
      ]
    }
  }
}
```

3. **Restart Claude Desktop**
4. **Look for the hammer icon** 🔨 in the input box
5. **Test the connection:**
   - Ask: *"What MCP tools do you have available?"*
   - You should see 6 tools: `discover_mcp_servers`, `register_mcp_server`, etc.
6. **Done!** Your AI can now discover MCP servers dynamically

**🎯 What you get:**
- Dynamic MCP server discovery by domain, capability, or intent
- Real-time health monitoring of discovered servers
- DNS-verified server registry with trust scores
- Natural language server matching

### **Cursor**

1. **Open configuration file:** `~/.cursor/mcp.json`

2. **Add MCPLookup.org:**
```json
{
  "mcpServers": {
    "mcplookup": {
      "url": "https://mcplookup.org/api/mcp"
    }
  }
}
```

3. **Restart Cursor**
4. **Done!** Your AI can now discover MCP servers

### **Windsurf**

1. **Open configuration file:** `~/.codeium/windsurf/mcp_config.json`

2. **Add MCPLookup.org:**
```json
{
  "mcpServers": {
    "mcplookup": {
      "url": "https://mcplookup.org/api/mcp"
    }
  }
}
```

3. **Restart Windsurf**
4. **Done!** Your AI can now discover MCP servers

---

## 🌐 **For MCP Server Providers (Make Your Server Discoverable)**

### **Method 1: Web Registration (Easiest)**

1. **Go to:** [mcplookup.org/register](https://mcplookup.org/register)
2. **Fill out the form:**
   - Domain: `yourcompany.com`
   - Endpoint: `https://yourcompany.com/mcp`
   - Capabilities: `email, calendar, crm`
   - Contact Email: `admin@yourcompany.com`
3. **Click "Register Server"**
4. **Add DNS record:** `_mcp-verify.yourcompany.com TXT "mcp_verify_abc123"`
5. **Wait 5 minutes** for automatic verification
6. **Done!** Your server is now discoverable by all AI agents

### **Method 2: API Registration**

```bash
# 1. Register your server
curl -X POST https://mcplookup.org/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "yourcompany.com",
    "endpoint": "https://yourcompany.com/mcp",
    "capabilities": ["email", "calendar", "crm"],
    "contact_email": "admin@yourcompany.com",
    "description": "Company productivity tools"
  }'

# 2. Add DNS verification record (from response)
# _mcp-verify.yourcompany.com TXT "mcp_verify_abc123"

# 3. Check verification status
curl https://mcplookup.org/api/v1/discover/domain/yourcompany.com
```

### **Method 3: Well-Known Endpoint (Auto-Discovery)**

1. **Create endpoint:** `https://yourcompany.com/.well-known/mcp`

2. **Return JSON:**
```json
{
  "servers": [
    {
      "endpoint": "https://yourcompany.com/api/mcp",
      "capabilities": ["email", "calendar", "crm"],
      "description": "Company productivity tools"
    }
  ]
}
```

3. **Done!** Your server will be auto-discovered

---

## 🎪 **Available MCP Tools**

Once connected, AI agents can use these tools:

### **discover_mcp_servers**
Find MCP servers by domain, capability, or intent
```json
{
  "domain": "gmail.com",
  "capability": "email",
  "intent": "send emails and manage calendar"
}
```

### **register_mcp_server**
Register new servers with DNS verification
```json
{
  "domain": "mycompany.com",
  "endpoint": "https://mycompany.com/mcp",
  "capabilities": ["custom_tool"]
}
```

### **verify_domain_ownership**
Check DNS verification status
```json
{
  "domain": "mycompany.com"
}
```

### **get_server_health**
Real-time health and performance metrics
```json
{
  "domains": ["gmail.com", "github.com"]
}
```

### **browse_capabilities**
Explore available capabilities
```json
{
  "popular": true,
  "category": "communication"
}
```

### **get_discovery_stats**
Analytics and usage patterns
```json
{
  "timeframe": "day",
  "metric": "discoveries"
}
```

---

## ✨ **What Happens Next?**

### **For AI Developers:**
- Your AI can now ask: *"Find me email servers"*
- AI automatically discovers and connects to Gmail, Outlook, etc.
- Zero configuration for new services
- Real-time health checking
- Intent-based matching

### **For MCP Server Providers:**
- Your server appears in all AI agent searches
- Automatic health monitoring
- Global discoverability
- Analytics on usage
- Trust score building

---

## 🆘 **Need Help?**

- **Documentation:** [mcplookup.org/docs](https://mcplookup.org/docs)
- **API Reference:** [mcplookup.org/api/docs](https://mcplookup.org/api/docs)
- **GitHub Issues:** [github.com/TSavo/mcplookup.org/issues](https://github.com/TSavo/mcplookup.org/issues)
- **Community:** [github.com/TSavo/mcplookup.org/discussions](https://github.com/TSavo/mcplookup.org/discussions)

---

**🎯 That's it! You've just connected to the DNS of AI tools.**

**The One Ring to rule them all. 💍**
