# Storage Configuration Examples

The MCPLookup registry uses a flexible storage abstraction that automatically detects and configures the best available storage provider.

## Environment Variables

### Upstash Redis (Recommended for Production)
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Local Redis (Development)
```bash
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

### Testing
```bash
NODE_ENV=test  # Automatically uses in-memory storage
```

## Usage Examples

### Automatic Detection
```typescript
import { getRegistryStorage, getVerificationStorage } from './storage/storage.js';

// Automatically selects the best provider based on environment
const registryStorage = getRegistryStorage();
const verificationStorage = getVerificationStorage();
```

### Explicit Configuration
```typescript
import { getRegistryStorage, getVerificationStorage } from './storage/storage.js';

// Force Upstash Redis (production)
const registryStorage = getRegistryStorage({ provider: 'upstash' });
const verificationStorage = getVerificationStorage({ provider: 'upstash' });

// Force local Redis (development)
const registryStorage = getRegistryStorage({ provider: 'local' });
const verificationStorage = getVerificationStorage({ provider: 'local' });

// Force in-memory (testing)
const registryStorage = getRegistryStorage({ provider: 'memory' });
const verificationStorage = getVerificationStorage({ provider: 'memory' });
```

### Service Level Configuration
```typescript
import { RegistryService } from './registry.js';

// Use specific storage
const registry = new RegistryService({
  provider: 'memory'
});

// Use auto-detection
const registry = new RegistryService(); // Uses auto-detection
```

### Full Application Setup
```typescript
import { ServiceFactory } from './index.js';

// Production setup
const services = ServiceFactory.getInstance({
  storage: { provider: 'upstash' }
}).getAllServices();

// Development setup  
const services = ServiceFactory.getInstance({
  storage: { provider: 'memory' }
}).getAllServices();

// Testing setup
const services = ServiceFactory.getInstance({
  storage: { provider: 'memory' }
}).getAllServices();
```

## Storage Provider Priority

1. **Upstash Redis** - If `UPSTASH_REDIS_REST_URL` is set
2. **Local Redis** - If `REDIS_URL` or `REDIS_HOST` is set
3. **In-Memory** - Default fallback for development/testing

## Benefits

✅ **Zero Code Changes** - Switch storage by changing environment variables  
✅ **Automatic Fallbacks** - Graceful degradation if Redis is unavailable  
✅ **Test-Friendly** - Automatic in-memory storage for tests  
✅ **Production Ready** - Optimized for serverless and traditional deployments  
✅ **Type Safe** - Full TypeScript support with interfaces  

## Storage Interface

All storage providers implement the same interface:

```typescript
interface IRegistryStorage {
  storeServer(domain: string, server: MCPServerRecord): Promise<void>;
  getServer(domain: string): Promise<MCPServerRecord | null>;
  deleteServer(domain: string): Promise<void>;
  getAllServers(): Promise<MCPServerRecord[]>;
  getServersByCategory(category: CapabilityCategory): Promise<MCPServerRecord[]>;
  getServersByCapability(capability: string): Promise<MCPServerRecord[]>;
  searchServers(query: string): Promise<MCPServerRecord[]>;
  getStats(): Promise<{ totalServers: number; categories: Record<string, number> }>;
  healthCheck(): Promise<boolean>;
}
```

This ensures consistent behavior regardless of the underlying storage provider.

## Testing the Storage Abstraction

### Automated Tests
```bash
# Run the full test suite (uses in-memory storage)
npm test

# Run storage-specific tests
npm test src/lib/services/storage/__tests__/storage.test.ts
```

### Manual Testing
```bash
# Test all available storage providers
npm run test:storage

# Test with local Redis (requires Docker)
docker-compose up -d redis
npm run test:storage

# Test with Upstash (requires credentials)
export UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
export UPSTASH_REDIS_REST_TOKEN=your-token
npm run test:storage
```

### Usage Examples

#### Basic Operations
```typescript
import { getRegistryStorage, isSuccessResult } from './storage/storage.js';

const storage = getRegistryStorage();

// Store a server
const storeResult = await storage.storeServer(domain, serverRecord);
if (isSuccessResult(storeResult)) {
  console.log('Server stored successfully');
}

// Get a server
const getResult = await storage.getServer(domain);
if (isSuccessResult(getResult) && getResult.data) {
  console.log('Found server:', getResult.data.server_info?.name);
}
```

#### Paginated Queries
```typescript
// Get servers with pagination
const serversResult = await storage.getAllServers({
  limit: 50,
  offset: 0,
  sortBy: 'updated_at',
  sortOrder: 'desc'
});

if (isSuccessResult(serversResult)) {
  const { items, total, hasMore } = serversResult.data;
  console.log(`Found ${items.length} of ${total} servers`);
}
```

#### Batch Operations
```typescript
// Store multiple servers efficiently
const servers = new Map([
  ['example1.com', server1],
  ['example2.com', server2]
]);

const batchResult = await storage.storeServers(servers);
if (isSuccessResult(batchResult)) {
  const { successful, failed, errors } = batchResult.data;
  console.log(`Stored ${successful} servers, ${failed} failed`);
}
```

#### Advanced Search
```typescript
// Search with filtering and sorting
const searchResult = await storage.searchServers('email calendar', {
  limit: 20,
  sortBy: 'name',
  includeInactive: false
});

if (isSuccessResult(searchResult)) {
  const { items, total } = searchResult.data;
  console.log(`Found ${items.length} matching servers`);
}
```

#### Health Monitoring
```typescript
// Check storage health
const health = await storage.healthCheck();
console.log(`Storage healthy: ${health.healthy}`);
console.log(`Latency: ${health.latency}ms`);
console.log('Details:', health.details);

// Get comprehensive statistics
const statsResult = await storage.getStats();
if (isSuccessResult(statsResult)) {
  const stats = statsResult.data;
  console.log(`Total servers: ${stats.totalServers}`);
  console.log(`Active servers: ${stats.activeServers}`);
  console.log(`Memory usage: ${stats.memoryUsage?.used}`);
  console.log(`Avg response time: ${stats.performance.avgResponseTime}ms`);
}
```

#### Maintenance Operations
```typescript
// Cleanup expired data (dry run first)
const dryRunResult = await storage.cleanup(true);
if (isSuccessResult(dryRunResult)) {
  console.log(`Would remove ${dryRunResult.data.removedCount} records`);
}

// Actual cleanup
const cleanupResult = await storage.cleanup(false);
if (isSuccessResult(cleanupResult)) {
  console.log(`Removed ${cleanupResult.data.removedCount} records`);
  console.log(`Freed ${cleanupResult.data.freedSpace} of storage`);
}
```

#### Error Handling
```typescript
import { isErrorResult } from './storage/interfaces.js';

const result = await storage.searchServers('email');
if (isErrorResult(result)) {
  console.error(`Search failed: ${result.error}`);
  if (result.code) {
    console.error(`Error code: ${result.code}`);
  }
}
```

### Docker Development Setup
```bash
# Start local Redis for development
docker-compose up -d redis

# Verify Redis is running
docker-compose ps

# Access Redis CLI
docker-compose exec redis redis-cli

# Stop Redis
docker-compose down
```

## Storage Provider Comparison

| Feature | In-Memory | Local Redis | Upstash Redis |
|---------|-----------|-------------|---------------|
| **Setup** | Zero config | Docker required | Cloud signup |
| **Persistence** | No | Yes | Yes |
| **Performance** | Fastest | Fast | Fast (global) |
| **Scalability** | Single process | Single instance | Auto-scaling |
| **Cost** | Free | Infrastructure | Pay-per-use |
| **Best for** | Testing/Dev | Local dev | Production |

## Environment Configuration Examples

### Development (In-Memory)
```bash
NODE_ENV=development
# No Redis configuration needed
```

### Development (Local Redis)
```bash
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

### Production (Upstash)
```bash
NODE_ENV=production
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```
