# MCPLOOKUP.ORG - README

**🔥 The Universal MCP Discovery Service - The DNS of AI Tools**

[![Build Status](https://github.com/mcplookup/registry/workflows/CI/badge.svg)](https://github.com/mcplookup/registry/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-2025--03--26-blue.svg)](https://modelcontextprotocol.io)

---

## 🎯 **THE REVOLUTION: THE END OF HARDCODED LISTS**

**The Problem**: Every AI agent today maintains static, hardcoded lists of tools and services. This is the equivalent of having to manually edit your browser's bookmarks every time a new website is created.

**Our Solution**: **Dynamic Discovery** - AI agents discover tools in real-time, just like web browsers discover websites through DNS.

### **Before MCPLookup.org (Static Hell)**
```typescript
// Every AI agent needs hardcoded configurations
const HARDCODED_SERVERS = {
  "gmail.com": "https://gmail.com/mcp",
  "slack.com": "https://slack.com/api/mcp",
  "github.com": "https://api.github.com/mcp"
  // Manually maintained forever...
};
```

### **After MCPLookup.org (Dynamic Paradise)**
```typescript
// AI agents discover tools dynamically
const discovery = await fetch('https://mcplookup.org/api/v1/discover/domain/gmail.com');
const server = await discovery.json();
// Connect to server.endpoint automatically - NO HARDCODING!
```

### **The Magic in Action**
```
User: "Connect to my Gmail"
AI: → Queries mcplookup.org for Gmail MCP servers
AI: ← Gets live endpoints: https://gmail.com/mcp
AI: → Connects automatically
AI: "Connected! What would you like to do with Gmail?"
```

**Zero configuration. Zero hardcoding. Zero maintenance. Pure magic.**

> **🔥 This is the future of MCP**: No more static lists. No more manual updates. Just pure, dynamic discovery that scales infinitely.

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

<<<<<<< HEAD
### For AI Agents (The One Ring MCP Server) ✅ LIVE
```bash
# Connect to the master MCP server for discovery
mcp connect https://mcplookup.org/api/mcp
=======
### For AI Agents (MCP Discovery Server)
```bash
# Connect to the discovery MCP server
mcp connect https://mcplookup.org/mcp
>>>>>>> c4afad7 (feat: redesign UI with professional styling and remove 'one ring' references)
```

**Available MCP Tools:**
- `discover_mcp_servers` - Find servers by domain/capability/intent
- `register_mcp_server` - Register new servers with verification
- `verify_domain_ownership` - Check DNS verification status
- `get_server_health` - Real-time health and performance metrics
- `browse_capabilities` - Explore the capability taxonomy
- `get_discovery_stats` - Analytics and usage patterns

---

## 🏗️ **ARCHITECTURE: THE DYNAMIC DISCOVERY ENGINE**

### **🚀 Zero-Hardcoding Architecture**
This repository contains **THE MCP server that eliminates hardcoded lists forever** using **real-time dynamic discovery**:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI AGENTS     │───▶│  MCPLOOKUP.ORG   │───▶│  MCP SERVERS    │
│                 │    │  DYNAMIC ENGINE  │    │                 │
│ • Claude        │    │ • DNS Discovery  │    │ • gmail.com/mcp │
│ • ChatGPT       │    │ • Well-Known     │    │ • github.com/   │
│ • Custom Agents │    │ • Live Registry  │    │ • slack.com/    │
│                 │    │ • Real-time      │    │ • ANY domain    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **🔥 The Four Pillars of Dynamic Discovery**

**1. Verified Registry** - ✅ **LIVE NOW** - Cryptographically proven ownership
```bash
# DNS-verified server registration (WORKING TODAY)
curl https://mcplookup.org/api/v1/discover/domain/gmail.com
# Returns: Verified, live server information
```

**2. Real-Time Health Monitoring** - ✅ **LIVE NOW** - Only connect to working servers
```bash
# Live health status for every server (WORKING TODAY)
curl https://mcplookup.org/api/v1/health/gmail.com
# Returns: Current uptime, response time, capability status
```

**3. DNS-Based Discovery** - 🚧 **COMING SOON** - Like DNS for websites, but for AI tools
```bash
# Real-time DNS queries discover MCP servers (IN DEVELOPMENT)
dig _mcp.gmail.com TXT
# Will return: "v=mcp1 endpoint=https://gmail.com/mcp"
```

**4. Standard Endpoint Discovery** - 🚧 **COMING SOON** - HTTP-based auto-discovery
```bash
# Automatic endpoint discovery (PROPOSED STANDARD)
curl https://gmail.com/mcp
# Will return: {"endpoint": "https://gmail.com/mcp", "capabilities": ["email"]}
```

### Flexible Storage Architecture

**🚀 Multi-Environment Storage Abstraction**
- **Development**: In-memory storage for fast iteration and testing
- **Local Development**: Redis with Docker for persistence and realistic testing
- **Production**: Upstash Redis for serverless, globally distributed storage
- **Automatic Selection**: Environment-based provider detection

### Storage Features

- **Consistent API**: All storage providers implement identical interfaces
- **Error Handling**: `StorageResult<T>` pattern for robust error management
- **Pagination**: Built-in pagination for all bulk operations
- **Batch Operations**: Efficient bulk processing with atomic transactions
- **Health Monitoring**: Real-time diagnostics and performance metrics
- **Cleanup Operations**: Automated maintenance with dry-run support

## 🏗️ **ARCHITECTURE**

<<<<<<< HEAD
MCPLookup.org uses a layered serverless architecture designed for global scale:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INTERFACE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  MCP Server           │  REST API            │  Web Interface              │
│  /api/mcp             │  /api/v1/*           │  Next.js React              │
│  @vercel/mcp-adapter  │  HTTP endpoints      │  Human users                │
│  AI agents            │  Web integrations    │  Registration UI            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  DiscoveryService     │  RegistryService     │  VerificationService        │
│  Orchestrates         │  CRUD operations     │  DNS verification           │
│  server discovery     │  Server management   │  Domain ownership           │
│                       │                      │                             │
│  HealthService        │  IntentService       │  ServiceFactory             │
│  Uptime monitoring    │  NL → capabilities   │  Dependency injection       │
│  Performance metrics  │  AI-powered matching │  Configuration management   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STORAGE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Upstash Redis        │  Local Redis         │  In-Memory                  │
│  Production           │  Development         │  Testing                    │
│  Global replication   │  Docker-based        │  Fast ephemeral             │
│  Serverless scaling   │  Local development   │  Isolated tests             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **🔌 Interface Layer**
- **MCP Server** - Native MCP protocol using `@vercel/mcp-adapter`
- **REST API** - HTTP endpoints for web and programmatic access
- **Web Interface** - React frontend for human users

### **⚙️ Service Layer**
- **DiscoveryService** - Orchestrates server discovery with intent matching
- **RegistryService** - Manages server registration and CRUD operations
- **VerificationService** - Handles DNS verification and domain ownership
- **HealthService** - Monitors server uptime and performance metrics
- **IntentService** - Natural language to capability matching

### **💾 Storage Layer**
- **Auto-Detection** - Automatically selects best provider based on environment
- **Consistent Interface** - All providers implement identical `IRegistryStorage`
- **Error Handling** - `StorageResult<T>` pattern for robust error management
=======
1. **MCP Server**: The central discovery service that provides tools to AI agents
2. **REST API**: HTTP endpoints for registration and discovery (Next.js API routes)
3. **DNS Verification**: Cryptographic proof using TXT records with Redis persistence
4. **Storage Abstraction**: Flexible storage layer with automatic provider selection
5. **Health Monitoring**: Comprehensive monitoring with statistics and cleanup
>>>>>>> c4afad7 (feat: redesign UI with professional styling and remove 'one ring' references)

---

## 🔧 **INSTALLATION**

### Prerequisites
- Node.js 20+
- **Optional**: Docker for local Redis development
- **Optional**: Upstash account for production Redis

### Local Development

#### Option 1: In-Memory Storage (Fastest)
```bash
# Clone the repository
git clone https://github.com/TSavo/mcplookup.org.git
cd mcplookup.org

# Install dependencies
npm install

# Start development server (uses in-memory storage)
npm run dev

# Or run the MCP server directly
npm run dev:mcp
```

#### Option 2: Local Redis with Docker
```bash
# Set up environment for local Redis
cp .env.example .env.local
# Add: REDIS_URL=redis://localhost:6379

# Start Redis with Docker
docker-compose up -d redis

# Start development server
npm run dev

# Test storage providers
npm run test:storage
```

#### Option 3: Production Setup with Upstash
```bash
# Set up environment for Upstash
cp .env.example .env.local
# Add your Upstash credentials:
# UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token

# Start development server
npm run dev
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

## 🌉 **UNIVERSAL MCP BRIDGE - ELIMINATE HARDCODED LISTS** ✅ **COMPLETE**

**🎯 The Problem**: Claude Desktop requires hardcoded server configurations for every MCP server you want to use.

**🚀 Our Solution**: Replace ALL hardcoded servers with ONE universal bridge that dynamically discovers and connects to any MCP server.

🎉 **Status**: **PRODUCTION READY** - All TypeScript compilation errors fixed, ES module compatibility achieved, comprehensive testing complete!

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
      "command": "node",
      "args": ["scripts/mcp-bridge.mjs"]
    }
  }
}
```

**That's it!** Claude now has dynamic access to EVERY MCP server in existence.

### **How Claude Uses It**
- **"Find email servers"** → Bridge discovers Gmail, Outlook, etc.
- **"Send an email via Gmail"** → Bridge finds Gmail and sends email
- **"What document tools are available?"** → Bridge discovers and lists all document servers

### **Bridge Tools for Claude** ✅ **COMPLETE**
- `discover_mcp_servers` - Find servers by domain/capability/query ✅
- `discover_smart` - AI-powered discovery with intent matching ✅
- `register_server` - Register new MCP servers ✅
- `verify_domain` - Start domain ownership verification ✅
- `check_domain_ownership` - Check domain verification status ✅
- `get_server_health` - Real-time server health monitoring ✅
- `get_onboarding_state` - User onboarding progress ✅
- `invoke_tool` - **Universal MCP client** - Call any tool on any server ✅

**📖 Full Documentation**: [UNIVERSAL_BRIDGE.md](UNIVERSAL_BRIDGE.md)

---

## 🔧 **MCP DISCOVERY SERVER**

**Endpoint**: `https://mcplookup.org/api/mcp`
**Implementation**: `@vercel/mcp-adapter` with direct service integration
**Protocol**: Native MCP JSON-RPC over HTTP

### **🔧 Integration Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Agent      │    │  MCP Server     │    │  Service Layer  │
│                 │    │  /api/mcp       │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ MCP Protocol    │───▶│ @vercel/mcp-    │───▶│ DiscoveryService│
│ JSON-RPC        │    │ adapter         │    │ RegistryService │
│                 │    │                 │    │ HealthService   │
│ Tool Calls:     │    │ 6 MCP Tools:    │    │ VerificationSvc │
│ - discover_mcp  │    │ - discover_mcp  │    │                 │
│ - register_mcp  │    │ - register_mcp  │    │ Direct calls    │
│ - get_health    │    │ - get_health    │    │ (no HTTP)       │
│ - etc...        │    │ - etc...        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **🛠️ Available MCP Tools**

#### **1. `discover_mcp_servers`**
Find MCP servers by domain, capability, or natural language intent
```typescript
// Direct service integration
const response = await services.discovery.discoverServers({
  domain: "gmail.com",
  capability: "email",
  intent: "I need to send emails and manage calendar",
  verified_only: true,
  max_results: 10
});
```

#### **2. `register_mcp_server`**
Register new MCP servers with DNS verification
```typescript
const response = await services.verification.initiateRegistration({
  domain: "mycompany.com",
  endpoint: "https://mycompany.com/mcp",
  capabilities: ["custom_tool", "data_processing"],
  contact_email: "admin@mycompany.com"
});
```

#### **3. `verify_domain_ownership`**
Check DNS verification status for domain registration
```typescript
const status = await services.verification.checkDomainVerification("mycompany.com");
```

#### **4. `get_server_health`**
Real-time health and performance metrics for MCP servers
```typescript
const health = await services.health.checkServerHealth(server.endpoint);
```

#### **5. `browse_capabilities`**
Explore the taxonomy of available MCP capabilities
```typescript
const allServers = await services.registry.getAllVerifiedServers();
// Builds capability taxonomy from all registered servers
```

#### **6. `get_discovery_stats`**
Analytics about MCP server discovery patterns and usage
```typescript
// Returns registry overview, popular domains, capability distribution
```

### **⚡ Performance Benefits**
- **Direct Service Calls**: No HTTP overhead between MCP server and services
- **Shared Memory**: Same process space as REST API
- **Serverless Optimized**: Fast cold starts with `getServerlessServices()`
- **Type Safety**: Full TypeScript throughout the stack

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

#### Production (Upstash Redis)
```bash
# Required for production
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
NODE_ENV=production
NEXTAUTH_URL=https://mcplookup.org

# Optional configuration
DNS_RESOLVER_URL=https://cloudflare-dns.com/dns-query
HEALTH_CHECK_TIMEOUT=5000
VERIFICATION_TOKEN_TTL=86400
NEXT_PUBLIC_APP_URL=https://mcplookup.org
```

#### Development (Local Redis)
```bash
# For local Redis development
REDIS_URL=redis://localhost:6379
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

#### Testing (In-Memory)
```bash
# Automatically uses in-memory storage
NODE_ENV=test
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
# Unit tests (uses in-memory storage)
npm test

# Storage abstraction tests
npm run test:storage

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Storage Testing
```bash
# Test all available storage providers
npm run test:storage

# Test with local Redis (requires Docker)
docker-compose up -d redis
npm run test:storage

# Test with Upstash (requires credentials)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io \
UPSTASH_REDIS_REST_TOKEN=your-token \
npm run test:storage
```

### Test Coverage
```bash
npm run test:coverage
```

---

## 📚 **WORLD-CLASS DOCUMENTATION**

### 🚀 **Start Here - Revolutionary Guides**

| Guide | Description | Perfect For |
|-------|-------------|-------------|
| **[🔥 The Future of MCP](THE_FUTURE_OF_MCP.md)** | **Our bold vision for eliminating hardcoded lists** | **Everyone - Start here!** |
| **[🤔 What is this?](WHAT_IS_THIS.md)** | Complete introduction to dynamic discovery | Newcomers to MCP |
| **[👤 User Guide](USER_GUIDE.md)** | Step-by-step discovery, registration, and troubleshooting | All users |
| **[⚡ API Reference](API_SPECIFICATION.md)** | Complete REST API with examples and error codes | Developers |
| **[🛠️ Developer Guide](DEVELOPER_GUIDE.md)** | Architecture, setup, and contribution guide | Contributors |
| **[🔍 Dynamic Discovery Examples](FLEXIBLE_DISCOVERY_EXAMPLES.md)** | Real-world examples of dynamic vs static approaches | AI developers |
| **[❓ FAQ](FAQ.md)** | Frequently asked questions and troubleshooting | Quick answers |

### 📖 **Interactive Documentation**
- **[Live Documentation Hub](https://mcplookup.org/docs)** - Interactive guides and examples
- **[API Playground](https://mcplookup.org/api/docs)** - Live API testing interface

### 🔧 **Technical Specifications**
- [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) - Complete project overview
- [`MCP_SERVER_SPEC.md`](./MCP_SERVER_SPEC.md) - MCP discovery server details
- [`API_SPEC.md`](./API_SPEC.md) - REST API documentation
- [`DNS_VERIFICATION_SPEC.md`](./DNS_VERIFICATION_SPEC.md) - DNS verification protocol
- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) - Production deployment
- [`OAUTH_SETUP.md`](./OAUTH_SETUP.md) - OAuth authentication setup

### 🏗️ **Architecture Documentation**
- [`Storage Architecture`](./src/lib/services/storage/DESIGN.md) - Storage design principles
- [`Storage Interfaces`](./src/lib/services/storage/interfaces.ts) - TypeScript interfaces
- [`Implementation Guide`](./src/lib/services/storage/README.md) - Usage examples
- [`Security Guide`](./SECURITY.md) - Environment and secrets management

### 💡 **Quick Navigation**
- **New to MCP?** → Start with [What is this?](WHAT_IS_THIS.md)
- **Want to discover servers?** → Check the [User Guide](USER_GUIDE.md)
- **Building an integration?** → See [API Reference](API_SPECIFICATION.md)
- **Contributing code?** → Read [Developer Guide](DEVELOPER_GUIDE.md)
- **Have questions?** → Browse the [FAQ](FAQ.md)

---

## 🗄️ **STORAGE ARCHITECTURE**

### **Multi-Tier Storage with Auto-Detection**

The storage system automatically selects the optimal provider based on environment:

```typescript
// Auto-detection logic in src/lib/services/storage/storage.ts
function detectStorageProvider(): 'upstash' | 'local' | 'memory' {
  // Tests always use memory
  if (process.env.NODE_ENV === 'test') {
    return 'memory';
  }

  // Production uses Upstash Redis
  if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL) {
    return 'upstash';
  }

  // Development: Local Redis → Upstash → Memory fallback
  if (process.env.REDIS_URL) return 'local';
  if (process.env.UPSTASH_REDIS_REST_URL) return 'upstash';
  return 'memory';
}
```

### **Storage Provider Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STORAGE ABSTRACTION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  IRegistryStorage         │  IVerificationStorage    │  IUserStorage        │
│  - Server CRUD            │  - DNS challenges        │  - User management   │
│  - Search & filtering     │  - Domain verification   │  - Authentication    │
│  - Batch operations       │  - Cleanup operations    │  - Preferences       │
│  - Health & statistics    │  - Challenge lifecycle   │  - API keys          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROVIDER IMPLEMENTATIONS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  UpstashStorage           │  LocalRedisStorage       │  InMemoryStorage     │
│  Production               │  Development             │  Testing             │
│  - Global replication     │  - Docker Redis          │  - Fast ephemeral    │
│  - Serverless scaling     │  - Local development     │  - Isolated tests    │
│  - REST API based         │  - Traditional Redis     │  - No persistence    │
│  - Auto-failover          │  - Full Redis features   │  - Zero setup        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Storage Features

| Feature | In-Memory | Local Redis | Upstash Redis |
|---------|-----------|-------------|---------------|
| **Development** | ✅ Perfect | ✅ Realistic | ✅ Production-like |
| **Testing** | ✅ Fast | ✅ Persistent | ✅ Cloud-based |
| **Production** | ❌ No persistence | ❌ Single instance | ✅ Globally distributed |
| **Pagination** | ✅ | ✅ | ✅ |
| **Batch Ops** | ✅ | ✅ | ✅ |
| **Health Checks** | ✅ | ✅ | ✅ |
| **Statistics** | ✅ | ✅ | ✅ |

### Usage Examples

```typescript
import { getRegistryStorage, isSuccessResult } from './storage/storage.js';

// Automatic provider selection
const storage = getRegistryStorage();

// Consistent error handling
const result = await storage.storeServer(domain, server);
if (isSuccessResult(result)) {
  console.log('✅ Success');
} else {
  console.error(`❌ Error: ${result.error}`);
}

// Built-in pagination
const servers = await storage.getAllServers({
  limit: 50,
  offset: 0,
  sortBy: 'updated_at',
  sortOrder: 'desc'
});
```

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

## 🌟 **ROADMAP: THE DEATH OF HARDCODED LISTS**

### **Phase 1: Dynamic Discovery Foundation (Q3 2025) ✅ COMPLETE**
- [x] **DNS-based discovery** - Real-time `_mcp.domain.com` TXT record queries
- [x] **Well-known endpoints** - HTTP discovery via `/.well-known/mcp`
- [x] **Verified registry** - Cryptographic domain ownership proof
- [x] **Live health monitoring** - Real-time server status and performance
- [x] **The One Ring MCP Server** - Native MCP protocol for AI agents

### **Phase 2: Intelligent Discovery (Q4 2025) 🚧 IN PROGRESS**
- [x] **Smart capability matching** - Natural language to server mapping
- [x] **Intent-based discovery** - "I need to send emails" → Gmail servers
- [ ] **Performance analytics** - Server reliability and speed metrics
- [ ] **Developer dashboard** - Registration and monitoring interface

### **Phase 3: Universal Ecosystem (Q1 2026) 🎯 PLANNED**
- [ ] **Auto-discovery crawling** - Automatic detection of new MCP servers
- [ ] **Well-known endpoint standards** - Industry-wide adoption protocols
- [ ] **Enterprise features** - Private registries and custom discovery
- [ ] **Marketplace integration** - Monetization and premium services

### **Phase 4: The New Internet of AI (Q2 2026) 🚀 VISION**
- [ ] **Browser-like discovery** - AI agents browse tools like humans browse websites
- [ ] **Semantic search** - "Find tools similar to Slack but for project management"
- [ ] **Real-time capability negotiation** - Dynamic feature discovery and adaptation
- [ ] **Zero-configuration AI** - Agents that configure themselves automatically

> **🎯 End Goal**: Make hardcoded server lists as obsolete as manually typing IP addresses instead of domain names.

---

## 🌍 **OPEN STANDARDS, NOT MONOPOLIES**

### **🚨 The Critical Moment: Information Wants to Be Free**

**We are at the React moment for AI tool discovery.** The first generation of MCP discovery will set the standard for all future generations. **This is why open standards matter more than ever.**

### **🔓 Our Open Philosophy**

**MCPLookup.org is NOT trying to be a monolith.** We are:

✅ **Open Source**: Every line of code is public and forkable
✅ **Open Standards**: DNS and HTTP standards anyone can implement
✅ **Open Collaboration**: Working with industry leaders, not against them
✅ **Open Distribution**: Encouraging alternative implementations and private deployments

### **🤝 We Welcome Competition**

**Build your own MCPLookup.org!** We encourage:
- **Alternative implementations** using our open standards
- **Private deployments** for enterprise and government
- **Competing solutions** that push innovation forward
- **Industry collaboration** to define better standards

**All we ask**: Use open standards so the ecosystem stays interoperable.

### **🎯 The Future: Federated Discovery**

**Not this**: One registry to rule them all
**But this**: A federated ecosystem using open standards

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  MCPLookup.org  │    │ Enterprise.corp │    │ Government.gov  │
│  (Public)       │    │ (Private)       │    │ (Secure)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Open Standards │
                    │ • DNS Discovery │
                    │ • HTTP Endpoints│
                    │ • MCP Protocol  │
                    └─────────────────┘
```

### **💰 The Real Cost: Time and Money**

**Here's the brutal truth**: Right now we're all paying a cost in the form of overhead with hardcoded lists of MCP tools. I made this to solve a problem costing me time. This site will in turn cost me money - money I hope to offset with donations, but that just means more of my time spent solving a problem I don't want to have to solve.

**Major AI industry leaders will eventually get their shit together and make MCP tools easy to use.**

**Until that day?** MCPLookup will continue to take up my time and money. **I win when the problem goes away.**

**So say we all.**

**Information wants to be free. Standards want to be open. Innovation wants to be distributed.**

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

**The professional registry for AI capabilities. Enterprise-grade MCP server discovery.**

---

*Ready to revolutionize AI tool discovery? [Get started now!](https://mcplookup.org)*
#   T e s t   b u i l d   t r i g g e r   -   0 6 / 0 4 / 2 0 2 5   1 2 : 0 8 : 2 3  
 