# GitHub-Search-Driven Discovery Architecture

## Overview

The discovery service has been redesigned to use GitHub search as the primary source for MCP servers, with Redis caching and background processing for optimal performance and user experience.

## Architecture Flow

### 1. Search Request
```
User Query → Discovery Service → GitHub Search (cached) → Database Lookup → Response
```

### 2. Cache Strategy
- **GitHub search results**: Cached for 1 week in Redis
- **Cache key**: Base64 encoded search query
- **Cache hit**: Return existing servers immediately, queue missing for background discovery
- **Cache miss**: Search GitHub, cache results, process as new

### 3. Response Strategy
- **≥3 existing servers**: Return immediately + queue missing for background discovery
- **<3 existing servers**: Return "indexing" message + queue all for priority discovery

### 4. Background Processing
- **Priority queue**: New searches with <3 results
- **Background queue**: Missing repos from successful searches
- **Worker interval**: 30 seconds (configurable)
- **Batch size**: 5 repos per batch (configurable)

## Key Components

### DiscoveryService
- `discoverServers()`: Main entry point
- `getCachedGitHubResults()`: Redis cache lookup
- `searchGitHubAndCache()`: GitHub search + caching
- `loadExistingServersFromRepos()`: Database lookup
- `queueReposForDiscovery()`: Background queue management

### DiscoveryWorker
- `processDiscoveryQueue()`: Process queued repos
- `processRepoForDiscovery()`: Individual repo processing
- `isValidMCPServer()`: MCP server validation

### Redis Schema
```
github_search:{base64_query} → CachedSearchResult
discovery_queue → Sorted Set (priority score, repo data)
```

## API Endpoints

### Search
```
POST /api/discover/search
{
  "q": "search query",
  "limit": 10,
  "offset": 0
}
```

**Response Types:**
1. **Success** (≥3 results):
```json
{
  "servers": [...],
  "pagination": {...},
  "query_metadata": {
    "status": "success",
    "cached_search": true,
    "background_discovery_queued": 5
  }
}
```

2. **Indexing** (<3 results):
```json
{
  "servers": [...],
  "pagination": {...},
  "query_metadata": {
    "status": "indexing",
    "message": "Currently indexing and discovering good results. Try again in 5 minutes.",
    "retry_after_seconds": 300,
    "queued_for_discovery": 10
  }
}
```

### Queue Management
```
GET /api/admin/discovery-queue     # Get queue status
POST /api/admin/discovery-queue    # Manually process queue
```

## Setup

### 1. Redis Configuration
```bash
# Local development
redis-server

# Production
export REDIS_URL=redis://your-redis-instance:6379
```

### 2. Start Discovery Worker
```bash
# Development
npm run worker:discovery

# Production
tsx scripts/start-discovery-worker.ts
```

### 3. Environment Variables
```env
REDIS_URL=redis://localhost:6379
GITHUB_TOKEN=your_github_token
```

## Benefits

### For Users
- **Fast responses**: Immediate results for popular searches
- **Fresh content**: Automatic discovery of new MCP servers
- **Progressive enhancement**: Results improve over time

### For System
- **Reduced API calls**: 1-week GitHub search caching
- **Scalable**: Background processing handles heavy lifting
- **Resilient**: Graceful degradation when services unavailable

### For Developers
- **DRY principle**: Single discovery service used everywhere
- **Monitoring**: Queue status and processing metrics
- **Configurable**: Batch sizes, intervals, thresholds

## Monitoring

### Queue Status
```bash
curl http://localhost:3000/api/admin/discovery-queue
```

### Worker Logs
```
Discovery worker processed 5 items, 0 errors
Discovery queue status: 15 total (3 priority, 12 background)
```

### Redis Inspection
```bash
redis-cli
> ZCARD discovery_queue          # Total queue size
> ZCOUNT discovery_queue 1 1     # Priority items
> KEYS github_search:*           # Cached searches
```

## Configuration

### Discovery Service
```typescript
const CACHE_EXPIRY_DAYS = 7;           // GitHub search cache
const MIN_RESULTS_THRESHOLD = 3;       // Minimum for immediate response
const MAX_GITHUB_RESULTS = 10;         // GitHub search limit
```

### Worker
```typescript
const BATCH_SIZE = 5;                  // Repos per batch
const INTERVAL_SECONDS = 30;           // Processing interval
```

## Future Enhancements

1. **Smart caching**: Vary cache duration by search popularity
2. **Priority scoring**: Better queue prioritization algorithm
3. **Health monitoring**: Worker health checks and alerts
4. **Analytics**: Search patterns and discovery success rates
5. **Rate limiting**: GitHub API rate limit management
