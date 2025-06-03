# MCPLOOKUP.ORG - README

**🔥 The Universal MCP Discovery Service - The DNS of AI Tools**

[![Build Status](https://github.com/mcplookup/registry/workflows/CI/badge.svg)](https://github.com/mcplookup/registry/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-2025--03--26-blue.svg)](https://modelcontextprotocol.io)

---

## 🎯 **THE REVOLUTION**

**Before**: AI tools require manual installation, configuration, and static setup  
**After**: AI agents dynamically discover and connect to tools in real-time

```
User: "Connect to my Gmail"
AI: → Queries mcplookup.org for Gmail MCP servers
AI: ← Gets live endpoints: https://gmail.com/mcp  
AI: → Connects automatically
AI: "Connected! What would you like to do with Gmail?"
```

**Zero configuration. Zero setup. Pure magic.**

---

## ⚡ **QUICK START**

### For AI Developers
```typescript
// Discover MCP servers dynamically
const discovery = await fetch('https://mcplookup.org/api/v1/discover/domain/gmail.com');
const server = await discovery.json();
// Connect to server.endpoint automatically
```

### For Service Providers  
```bash
# 1. Register your MCP server
curl -X POST https://mcplookup.org/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"domain": "myservice.com", "endpoint": "https://myservice.com/mcp"}'

# 2. Add DNS verification record
# _mcp-verify.myservice.com TXT "mcp_verify_abc123"

# 3. Your service is now discoverable by all AI agents!
```

### For AI Agents (The One Ring MCP Server)
```bash
# Connect to the master MCP server for discovery
mcp connect https://mcplookup.org/mcp
```

---

## 🏗️ **ARCHITECTURE**

### The Master MCP Server
This repository contains **THE MCP server that discovers all other MCP servers**:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI AGENTS     │───▶│  MCPLOOKUP.ORG   │───▶│  MCP SERVERS    │
│                 │    │                  │    │                 │
│ • Claude        │    │ • Discovery API  │    │ • gmail.com/mcp │
│ • ChatGPT       │    │ • DNS Verify     │    │ • github.com/   │
│ • Custom Agents │    │ • Registry DB    │    │ • slack.com/    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

1. **MCP Server**: The "One Ring" that provides discovery tools to AI agents
2. **REST API**: HTTP endpoints for registration and discovery
3. **DNS Verification**: Cryptographic proof of domain ownership
4. **Serverless Registry**: In-memory directory with external API integration
5. **Health Monitoring**: Real-time server status and performance

---

## 🔧 **INSTALLATION**

### Prerequisites
- Node.js 20+
- No database required (serverless architecture)

### Local Development
```bash
# Clone the repository
git clone https://github.com/TSavo/mcplookup.org.git
cd mcplookup.org

# Install dependencies
npm install

# Set up environment (optional)
cp .env.example .env
# Edit .env with your configuration if needed

# Start development server
npm run dev

# Or run the MCP server directly
npm run dev:mcp
```

### Vercel Deployment
```bash
# Deploy to Vercel
npm run build
vercel --prod

# Or use Vercel CLI
vercel deploy --prod

# The MCP server will be available at:
# https://your-app.vercel.app/api/mcp
```

---

## 🎪 **THE ONE RING MCP SERVER**

### Available Tools

#### `discover_mcp_servers`
Find MCP servers by domain, capability, or intent
```json
{
  "name": "discover_mcp_servers",
  "description": "Universal directory for AI tool discovery",
  "inputSchema": {
    "type": "object", 
    "properties": {
      "domain": {"type": "string"},
      "capability": {"type": "string"},
      "intent": {"type": "string"}
    }
  }
}
```

**Examples:**
```bash
# Find Gmail MCP server
{"domain": "gmail.com"}

# Find all email tools  
{"capability": "email"}

# Natural language discovery
{"intent": "I need to send emails and manage calendar"}
```

#### `register_mcp_server`  
Register your MCP server with DNS verification
```json
{
  "name": "register_mcp_server",
  "description": "Register a new MCP server in the global registry",
  "inputSchema": {
    "type": "object",
    "required": ["domain", "endpoint"],
    "properties": {
      "domain": {"type": "string"},
      "endpoint": {"type": "string", "format": "uri"},
      "capabilities": {"type": "array", "items": {"type": "string"}}
    }
  }
}
```

#### `verify_domain_ownership`
Check DNS verification status
```json
{
  "name": "verify_domain_ownership",
  "description": "Check DNS verification status for domain registration"
}
```

---

## 🌐 **REST API**

### Discovery Endpoints

#### Get Server by Domain
```http
GET /api/v1/discover/domain/{domain}

# Example
GET /api/v1/discover/domain/gmail.com
```

**Response:**
```json
{
  "domain": "gmail.com",
  "endpoint": "https://gmail.com/mcp", 
  "capabilities": ["email_read", "email_send", "calendar"],
  "verified": true,
  "trust_score": 98,
  "health": {
    "status": "healthy",
    "uptime_percentage": 99.97,
    "avg_response_time_ms": 45
  }
}
```

#### Search by Capability
```http
GET /api/v1/discover/capability/email?verified=true&limit=10
```

#### Smart Discovery
```http
POST /api/v1/discover/smart
Content-Type: application/json

{
  "intent": "I need to manage my emails and calendar",
  "context": {"auth": "oauth2", "region": "us"}
}
```

### Registration Endpoints

#### Register New Server
```http
POST /api/v1/register
Content-Type: application/json

{
  "domain": "mycompany.com",
  "endpoint": "https://mycompany.com/mcp",
  "capabilities": ["custom_crm", "customer_data"],
  "contact_email": "admin@mycompany.com"
}
```

**Response:**
```json
{
  "registration_id": "reg_abc123xyz",
  "status": "pending_verification",
  "verification": {
    "record_name": "_mcp-verify.mycompany.com",
    "record_value": "mcp_verify_xyz789abc"
  }
}
```

---

## 🔐 **DNS VERIFICATION**

### How It Works
1. **Register**: Submit your domain and MCP endpoint
2. **Challenge**: Receive DNS TXT record to add
3. **Verify**: Add record to your DNS
4. **Approved**: Automatic verification within 5 minutes

### DNS Record Format
```dns
# Verification Record (temporary)
_mcp-verify.example.com.    TXT    "mcp_verify_abc123xyz"

# Service Record (permanent)  
_mcp.example.com.           TXT    "v=mcp1 endpoint=https://example.com/mcp"
```

### Security Features
- **Cryptographic proof** of domain ownership
- **Time-limited challenges** (24-hour expiration)
- **Multi-resolver verification** (prevents DNS cache attacks)
- **Automatic cleanup** of verification records

---

## 📊 **SAMPLE DATA**

The server includes sample MCP servers for demonstration:

| Domain | Capabilities | Auth | Status |
|--------|-------------|------|---------|
| gmail.com | email, calendar, contacts | OAuth2 | ✅ Verified |
| github.com | code_repository, issues, ci_cd | OAuth2 | ✅ Verified |
| slack.com | messaging, channels, files | OAuth2 | ✅ Verified |

---

## 🚀 **DEPLOYMENT**

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DNS_RESOLVER_URL
vercel env add HEALTH_CHECK_TIMEOUT
```

### Environment Variables
```bash
# Optional (serverless architecture)
DNS_RESOLVER_URL=https://cloudflare-dns.com/dns-query
HEALTH_CHECK_TIMEOUT=5000
VERIFICATION_TOKEN_TTL=86400
NEXT_PUBLIC_APP_URL=https://mcplookup.org
```

---

## 🔍 **MONITORING**

### Health Check
```bash
curl http://localhost:3000/health
```

### Metrics (Prometheus)
```bash
curl http://localhost:3000/metrics
```

### Key Metrics
- **Discovery requests/second**: Real-time discovery API usage
- **Verification success rate**: DNS verification performance  
- **Server health percentage**: Registered servers uptime
- **Trust score distribution**: Server reliability metrics

---

## 🧪 **TESTING**

### Run Tests
```bash
# Unit tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Test Coverage
```bash
npm run test:coverage
```

---

## 📚 **DOCUMENTATION**

### Full Specifications
- [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) - Complete project overview
- [`MCP_SERVER_SPEC.md`](./MCP_SERVER_SPEC.md) - The One Ring MCP server details
- [`API_SPEC.md`](./API_SPEC.md) - REST API documentation
- [`DNS_VERIFICATION_SPEC.md`](./DNS_VERIFICATION_SPEC.md) - DNS verification protocol
- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) - Production deployment

### API Documentation
- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI Spec**: http://localhost:3000/openapi.json

---

## 🤝 **CONTRIBUTING**

### Development Setup
```bash
# Fork and clone
git clone https://github.com/your-username/mcplookup-registry.git
cd mcplookup-registry

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run dev
npm test

# Submit PR
git push origin feature/amazing-feature
```

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Tests**: Jest with >90% coverage

---

## 🆘 **SUPPORT**

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community Q&A and ideas
- **Discord**: Real-time chat and support

### Enterprise Support
- **SLA Guarantees**: 99.9% uptime commitment
- **Priority Support**: 24/7 technical assistance  
- **Custom Deployment**: On-premises and private cloud
- **White-label**: Branded discovery service

---

## 📄 **LICENSE**

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🌟 **ROADMAP**

### Phase 1: Core Discovery (Q3 2025) ✅
- [x] MCP server implementation
- [x] DNS verification system
- [x] REST API endpoints
- [x] Basic web interface

### Phase 2: Intelligence (Q4 2025)
- [ ] Smart capability matching
- [ ] Intent-based discovery  
- [ ] Performance analytics
- [ ] Developer dashboard

### Phase 3: Ecosystem (Q1 2026)
- [ ] Well-known endpoint standards
- [ ] Auto-discovery crawling
- [ ] Enterprise features
- [ ] Marketplace integration

---

## 💡 **EXAMPLES**

### AI Agent Integration
```typescript
import { MCPLookup } from '@mcplookup/sdk';

const client = new MCPLookup();

// User: "Check my Gmail"
const gmail = await client.discover.domain('gmail.com');
const mcpClient = new MCPClient(gmail.endpoint);
await mcpClient.connect();

// Now use Gmail tools
const emails = await mcpClient.callTool('read_emails', { limit: 10 });
```

### Service Provider Registration
```typescript
// Register your service
const registration = await fetch('https://mcplookup.org/api/v1/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domain: 'myservice.com',
    endpoint: 'https://myservice.com/mcp',
    capabilities: ['custom_feature', 'data_processing']
  })
});

// Add DNS record and wait for verification
// Your service is now discoverable by all AI agents!
```

---

**🔥 MCPLookup.org - Making AI tools as discoverable as web pages**

**The DNS of intelligence. The registry of AI capabilities. The one ring to rule them all.**

---

*Ready to revolutionize AI tool discovery? [Get started now!](https://mcplookup.org)*
