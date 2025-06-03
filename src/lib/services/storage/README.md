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
import { getRegistryStorage } from './storage/storage.js';

// Automatically selects the best provider
const storage = getRegistryStorage();
```

### Explicit Configuration
```typescript
import { StorageFactory } from './storage/storage.js';

// Force Upstash Redis
const storage = StorageFactory.getRegistryStorage({
  provider: 'upstash'
});

// Force in-memory (testing)
const storage = StorageFactory.getRegistryStorage({
  provider: 'memory'
});

// Auto-detect with fallback
const storage = StorageFactory.getRegistryStorage({
  provider: 'auto'
});
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
