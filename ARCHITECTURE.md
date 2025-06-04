# MCPLookup.org Architecture

## 🏗️ System Overview

MCPLookup.org is a universal MCP (Model Context Protocol) discovery service built with a flexible, multi-environment architecture that scales from development to production.

## 🎯 Core Architecture Principles

1. **Environment Flexibility**: Seamless operation across development, testing, and production
2. **Storage Abstraction**: Unified interface with automatic provider selection
3. **Serverless Ready**: Designed for serverless deployment with optional persistence
4. **Type Safety**: Strong TypeScript typing throughout the entire stack
5. **Error Resilience**: Comprehensive error handling with graceful degradation

## 🗄️ Storage Architecture

### Multi-Provider Storage System

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  MCP Server    │  REST API     │  Web Interface             │
│  (Discovery)   │  (HTTP)       │  (Next.js)                 │
├─────────────────────────────────────────────────────────────┤
│                 Storage Abstraction Layer                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  IRegistryStorage  │  IVerificationStorage             │ │
│  │  • StorageResult<T> pattern                            │ │
│  │  • Built-in pagination                                 │ │
│  │  • Batch operations                                    │ │
│  │  │  • Health monitoring                               │ │
│  │  • Cleanup operations                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│              Storage Provider Implementations               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ In-Memory   │  │ Local Redis │  │ Upstash Redis       │  │
│  │ Storage     │  │ (Docker)    │  │ (Production)        │  │
│  │             │  │             │  │                     │  │
│  │ • Fast      │  │ • Persistent│  │ • Global            │  │
│  │ • Testing   │  │ • Realistic │  │ • Serverless        │  │
│  │ • Dev       │  │ • Local Dev │  │ • Auto-scaling      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Automatic Provider Selection

The storage system automatically selects the optimal provider based on environment:

```typescript
// Detection Logic
if (NODE_ENV === 'test') {
  return InMemoryStorage;
} else if (NODE_ENV === 'production' && UPSTASH_CREDENTIALS) {
  return UpstashRedisStorage;
} else if (REDIS_URL) {
  return LocalRedisStorage;
} else {
  return InMemoryStorage; // Fallback
}
```

### Storage Features Matrix

| Feature | In-Memory | Local Redis | Upstash Redis |
|---------|-----------|-------------|---------------|
| **Persistence** | ❌ | ✅ | ✅ |
| **Performance** | 🚀 Fastest | ⚡ Fast | ⚡ Fast |
| **Scalability** | ❌ Single process | ❌ Single instance | ✅ Auto-scaling |
| **Global Distribution** | ❌ | ❌ | ✅ |
| **Zero Config** | ✅ | ❌ Requires Docker | ❌ Requires account |
| **Production Ready** | ❌ | ⚠️ Single point | ✅ |
| **Cost** | Free | Infrastructure | Pay-per-use |

## 🔧 Component Architecture

### 1. MCP Server (The One Ring)

**Location**: `src/server.ts`

The core MCP server that provides discovery tools to AI agents:

```typescript
// Available Tools
- discover_mcp_servers    // Find servers by domain/capability
- register_mcp_server     // Register new servers
- verify_domain_ownership // Check verification status
```

**Features**:
- Real-time server discovery
- DNS verification integration
- Health status monitoring
- Capability-based search

### 2. REST API Layer

**Location**: `src/pages/api/`

Next.js API routes providing HTTP endpoints:

```
/api/v1/discover/
├── domain/[domain]      # Get server by domain
├── capability/[cap]     # Search by capability
└── smart               # Intent-based discovery

/api/v1/register/
├── POST /              # Register new server
└── verify/[id]         # Verify registration

/api/health             # System health check
/api/stats              # System statistics
```

### 3. Storage Abstraction

**Location**: `src/lib/services/storage/`

Unified storage interface with multiple implementations:

#### Core Interfaces

```typescript
interface IRegistryStorage {
  // CRUD with error handling
  storeServer(domain: string, server: MCPServerRecord): Promise<StorageResult<void>>;
  getServer(domain: string): Promise<StorageResult<MCPServerRecord | null>>;
  deleteServer(domain: string): Promise<StorageResult<void>>;
  
  // Paginated bulk operations
  getAllServers(options?: SearchOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>>;
  storeServers(servers: Map<string, MCPServerRecord>): Promise<StorageResult<BatchOperationResult>>;
  
  // Search and filtering
  getServersByCategory(category: CapabilityCategory, options?: SearchOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>>;
  searchServers(query: string, options?: SearchOptions): Promise<StorageResult<PaginatedResult<MCPServerRecord>>>;
  
  // Monitoring and maintenance
  getStats(): Promise<StorageResult<RegistryStats>>;
  healthCheck(): Promise<HealthCheckResult>;
  cleanup(dryRun?: boolean): Promise<StorageResult<{ removedCount: number; freedSpace?: string }>>;
}
```

#### Error Handling Pattern

```typescript
// Consistent error handling across all operations
const result = await storage.storeServer(domain, server);
if (isSuccessResult(result)) {
  // Success path
  console.log('Server stored successfully');
} else {
  // Error path with detailed information
  console.error(`Error ${result.code}: ${result.error}`);
}
```

### 4. DNS Verification System

**Location**: `src/lib/services/dns/`

Cryptographic domain ownership verification:

```
Registration Flow:
1. POST /api/v1/register → Challenge created
2. Add DNS TXT record → _mcp-verify.domain.com
3. System verifies record → Multi-resolver check
4. Server activated → Available for discovery
```

**Security Features**:
- Time-limited challenges (24h TTL)
- Multi-resolver verification
- Cryptographic proof of ownership
- Automatic cleanup

### 5. Health Monitoring

**Location**: `src/lib/services/health/`

Comprehensive system monitoring:

```typescript
// Health Check Results
interface HealthCheckResult {
  healthy: boolean;
  latency?: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

// System Statistics
interface RegistryStats {
  totalServers: number;
  activeServers: number;
  categories: Record<CapabilityCategory, number>;
  performance: {
    avgResponseTime: number;
    cacheHitRate?: number;
  };
  memoryUsage?: {
    used: string;
    percentage?: number;
  };
}
```

## 🌐 Deployment Architecture

### Development Environment

```
Developer Machine
├── Node.js Application (localhost:3000)
├── In-Memory Storage (default)
└── Optional: Local Redis (Docker)
```

### Production Environment (Vercel + Upstash)

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel Edge   │───▶│  Next.js App     │───▶│ Upstash Redis   │
│   Functions     │    │  (Serverless)    │    │ (Global)        │
│                 │    │                  │    │                 │
│ • Global CDN    │    │ • Auto-scaling   │    │ • Multi-region  │
│ • Edge compute  │    │ • Zero cold start│    │ • Auto-backup   │
│ • DDoS protect │    │ • Env variables  │    │ • TLS encrypted │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Environment Configuration

```bash
# Development (In-Memory)
NODE_ENV=development
# No additional configuration needed

# Development (Local Redis)
NODE_ENV=development
REDIS_URL=redis://localhost:6379

# Production (Upstash)
NODE_ENV=production
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
NEXTAUTH_URL=https://mcplookup.org
```

## 🔄 Data Flow

### Server Discovery Flow

```
1. AI Agent Request
   ↓
2. MCP Server Tool Call: discover_mcp_servers
   ↓
3. Storage Layer Query (with caching)
   ↓
4. DNS Well-Known Fallback (if not cached)
   ↓
5. Health Check (real-time)
   ↓
6. Response with Server Details
```

### Server Registration Flow

```
1. Service Provider Registration
   ↓
2. DNS Challenge Generation
   ↓
3. TXT Record Verification (multi-resolver)
   ↓
4. Storage Layer Persistence
   ↓
5. Health Monitoring Activation
   ↓
6. Discovery Availability
```

## 🚀 Performance Characteristics

### Latency Targets

- **In-Memory Storage**: < 1ms
- **Local Redis**: < 5ms
- **Upstash Redis**: < 50ms (global)
- **DNS Verification**: < 2s
- **Health Checks**: < 5s

### Scalability

- **Concurrent Requests**: 10,000+ (Vercel Edge)
- **Storage Operations**: 1,000+ ops/sec (Upstash)
- **Server Registry**: 100,000+ servers
- **Global Availability**: 99.9% uptime

### Caching Strategy

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Edge Cache    │───▶│  Application     │───▶│  Storage        │
│   (Vercel CDN)  │    │  Cache           │    │  (Redis)        │
│                 │    │                  │    │                 │
│ • 60s TTL       │    │ • 300s TTL       │    │ • Persistent    │
│ • Global        │    │ • In-memory      │    │ • Source truth  │
│ • Static assets │    │ • Hot data       │    │ • All data      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔒 Security Architecture

### Authentication & Authorization

- **Public Discovery**: No auth required
- **Server Registration**: DNS ownership proof
- **Admin Operations**: Environment-based access
- **API Rate Limiting**: Built-in protection

### Data Protection

- **TLS Everywhere**: HTTPS/WSS only
- **Input Validation**: Comprehensive sanitization
- **DNS Security**: Multi-resolver verification
- **Secret Management**: Environment variables only

### Threat Mitigation

- **DDoS Protection**: Vercel Edge + rate limiting
- **DNS Poisoning**: Multi-resolver verification
- **Data Injection**: Input validation + TypeScript
- **Unauthorized Access**: DNS ownership proof

This architecture provides a robust, scalable foundation for the universal MCP discovery service while maintaining flexibility across all deployment environments.
