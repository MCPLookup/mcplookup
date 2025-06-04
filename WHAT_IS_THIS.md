# What is MCPLookup.org? 🔍

**MCPLookup.org is the universal discovery service for Model Context Protocol (MCP) servers.** Think of it as the "DNS for AI tools" - it helps AI agents find and connect to the right tools and services they need to help you.

## 🤔 The Problem We Solve

Imagine you're talking to an AI assistant and you say:

> "Check my Gmail and schedule a meeting with the team"

The AI needs to:
1. **Find** a Gmail MCP server that can read emails
2. **Find** a calendar MCP server that can schedule meetings  
3. **Connect** to these servers securely
4. **Use** their tools to complete your request

**Without MCPLookup.org:** The AI has no idea where to find these servers. Developers have to hardcode server locations, and users have to manually configure everything.

**With MCPLookup.org:** The AI simply asks "Where can I find Gmail tools?" and instantly gets back verified, working MCP servers.

## 🧠 What is MCP (Model Context Protocol)?

MCP is like "APIs for AI agents" - it's a standardized way for AI assistants to connect to external tools and services.

### Before MCP:
```
AI Agent → Hardcoded integrations → Gmail, Calendar, etc.
```
- Every AI had to build custom integrations
- No standardization
- Limited tool availability

### With MCP:
```
AI Agent → MCP Protocol → Any MCP Server (Gmail, Calendar, Slack, etc.)
```
- Standardized protocol
- Plug-and-play tools
- Rich ecosystem

## 🌟 What Makes MCPLookup.org Special?

### 1. **Zero Infrastructure Discovery**
- No databases to maintain
- No servers to manage  
- Serverless architecture that scales automatically

### 2. **Multiple Discovery Methods**
- **Registered servers**: Verified through DNS ownership
- **Well-known endpoints**: Auto-discovery via `/.well-known/mcp`
- **DNS TXT records**: Real-time DNS queries for `_mcp` records
- **Health monitoring**: Live endpoint testing

### 3. **Production Ready**
- Built on Next.js 15 + Vercel Edge Functions
- 99.9% uptime with global CDN
- ~100ms response times worldwide
- Comprehensive API with rate limiting

### 4. **Developer Friendly**
- RESTful API that works with any language
- Comprehensive documentation
- TypeScript support with Zod validation
- Open source and extensible

## 🚀 How It Works

### For AI Agents (Discovery):
```bash
# Find Gmail MCP servers
curl https://mcplookup.org/api/v1/discover/domain/gmail.com

# Find all email-capable servers  
curl https://mcplookup.org/api/v1/discover/capability/email

# Search with filters
curl "https://mcplookup.org/api/v1/discover?q=calendar&verified=true"
```

### For Server Owners (Registration):
```bash
# Register your MCP server
curl -X POST https://mcplookup.org/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "mycompany.com",
    "endpoint": "https://mycompany.com/mcp",
    "capabilities": ["email", "calendar"],
    "contact_email": "admin@mycompany.com"
  }'

# Verify ownership via DNS
curl -X POST https://mcplookup.org/api/v1/register/verify/abc123
```

## 🏗️ Architecture: The "One Ring" Approach

MCPLookup.org is designed as **"The One Ring MCP Server"** - a single service that helps you find all other MCP servers.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Agent      │───▶│  MCPLookup.org   │───▶│  Target Server  │
│                 │    │  (Discovery)     │    │  (Gmail, etc.)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Smart Storage Strategy:
- **Production**: Upstash Redis (serverless, global)
- **Development**: In-memory (zero setup)
- **Testing**: Automatic in-memory

### Discovery Methods:
1. **Registry Lookup**: Fast Redis-based search
2. **DNS Discovery**: Real-time `_mcp.domain.com` TXT record queries
3. **Well-known Endpoints**: Check `domain.com/.well-known/mcp`
4. **Health Verification**: Live endpoint testing

## 🎯 Use Cases

### For AI Agent Developers:
- **Dynamic tool discovery**: Find tools based on user intent
- **Capability-based search**: "Find all email servers"
- **Health monitoring**: Only connect to working servers
- **Trust scoring**: Prioritize verified, reliable servers

### For MCP Server Developers:
- **Discoverability**: Make your server findable by AI agents
- **Verification**: Prove domain ownership for trust
- **Health monitoring**: Automatic uptime tracking
- **Analytics**: Usage statistics and performance metrics

### For End Users:
- **Seamless experience**: AI agents automatically find needed tools
- **Security**: Only verified servers are recommended
- **Reliability**: Health-checked servers ensure smooth operation

## 🔮 The Future: Native MCP Server

Currently, MCPLookup.org provides a REST API. We're building a native MCP server that will allow AI agents to use discovery as a tool:

```javascript
// Future: Native MCP integration
const mcpClient = new MCPClient('https://mcplookup.org/mcp');
await mcpClient.connect();

// AI can use discovery as a tool
const servers = await mcpClient.callTool('discover_servers', {
  capability: 'email',
  verified: true
});
```

## 🌍 Open Source & Community

MCPLookup.org is completely open source:
- **GitHub**: [TSavo/mcplookup.org](https://github.com/TSavo/mcplookup.org)
- **License**: MIT (use it anywhere)
- **Contributions**: Welcome and encouraged
- **Self-hosting**: Deploy your own instance

## 🚀 Getting Started

### Try It Now:
1. **Discover servers**: Visit [mcplookup.org/discover](https://mcplookup.org/discover)
2. **API playground**: Check [mcplookup.org/api/docs](https://mcplookup.org/api/docs)
3. **Register your server**: Go to [mcplookup.org/register](https://mcplookup.org/register)

### For Developers:
```bash
# Clone and run locally
git clone https://github.com/TSavo/mcplookup.org
cd mcplookup.org
npm install
npm run dev
```

## 💡 Why "The One Ring"?

Just like Tolkien's One Ring could control all other rings, MCPLookup.org is the one MCP server that helps you find and connect to all other MCP servers. It's the master key to the MCP ecosystem.

---

**Ready to explore?** Start with our [comprehensive documentation](https://mcplookup.org/docs) or jump straight into the [API](https://mcplookup.org/api/docs).
