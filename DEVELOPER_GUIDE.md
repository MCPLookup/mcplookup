# MCPLookup.org Developer Guide 🛠️

Complete guide for developers who want to contribute to, understand, or extend MCPLookup.org.

## 🏗️ Architecture Overview

MCPLookup.org is built as a **serverless, zero-infrastructure** discovery service using modern web technologies.

### Core Philosophy: "Central Discovery Hub"

MCPLookup.org is designed as the central MCP discovery service that helps you find and connect to all other MCP servers with enterprise-grade reliability and security.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Agent      │───▶│  MCPLookup.org   │───▶│  Target Server  │
│                 │    │  (Discovery)     │    │  (Gmail, etc.)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend & API:**
- **Next.js 15** (App Router) - React framework with server-side rendering
- **TypeScript** - Type safety throughout the codebase
- **Tailwind CSS** - Utility-first CSS framework
- **Chakra UI v3** - Component library for consistent design
- **Zod** - Runtime type validation and schema parsing

**Authentication:**
- **NextAuth.js v5** - Authentication with OAuth providers
- **Google OAuth** - Google account integration
- **GitHub OAuth** - GitHub account integration

**Storage & Data:**
- **Upstash Redis** - Serverless Redis for production
- **In-memory storage** - Zero-setup development storage
- **DNS queries** - Real-time TXT record lookups
- **Well-known endpoints** - HTTP-based discovery

**Deployment & Infrastructure:**
- **Vercel** - Serverless deployment platform
- **Edge Functions** - Global edge computing
- **Vercel Analytics** - Performance monitoring
- **GitHub Actions** - CI/CD pipeline

## 📁 Project Structure

```
mcplookup.org/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   └── v1/           # API v1 endpoints
│   │   ├── auth/             # Authentication pages
│   │   ├── discover/         # Discovery interface
│   │   ├── register/         # Registration interface
│   │   └── docs/             # Documentation pages
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── discovery/        # Discovery UI components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                  # Core business logic
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Business logic services
│   │   │   ├── storage/      # Storage implementations
│   │   │   ├── discovery/    # Discovery logic
│   │   │   └── verification/ # DNS verification
│   │   └── utils/            # Utility functions
│   └── types/                # TypeScript type definitions
├── scripts/                  # Development and testing scripts
├── docs/                     # Additional documentation
└── public/                   # Static assets
```

## 🔧 Development Setup

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **npm/yarn/pnpm** - Package manager
- **Git** - Version control
- **Redis** (optional) - For local Redis storage testing

### Quick Start

```bash
# Clone the repository
git clone https://github.com/TSavo/mcplookup.org
cd mcplookup.org

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Environment Configuration

Create `.env.local` with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret

# OAuth Providers (optional for basic development)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Storage Configuration (optional)
# Leave empty for in-memory storage
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Development flags
NODE_ENV=development
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Testing
npm run test         # Run test suite (when implemented)
npm run test:storage # Test storage implementations

# Utilities
npm run clean        # Clean build artifacts
npm run analyze      # Analyze bundle size
```

## 🏛️ Core Architecture Patterns

### 1. Smart Storage Strategy

The storage layer automatically adapts to the environment:

```typescript
// src/lib/services/storage/index.ts
export function createStorageServices(): {
  registry: IRegistryStorage;
  verification: IVerificationStorage;
} {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    // Production: Upstash Redis
    return {
      registry: new UpstashRegistryStorage(),
      verification: new UpstashVerificationStorage()
    };
  } else {
    // Development: In-memory
    return {
      registry: new InMemoryRegistryStorage(),
      verification: new InMemoryVerificationStorage()
    };
  }
}
```

### 2. Multi-Method Discovery

Discovery combines multiple strategies for maximum coverage:

```typescript
// src/lib/services/discovery/discovery-service.ts
export class DiscoveryService {
  async discoverServers(query: DiscoveryQuery): Promise<MCPServerRecord[]> {
    const results = await Promise.allSettled([
      this.searchRegistry(query),      // Fast: Redis lookup
      this.queryDNS(query),           // Real-time: DNS TXT records
      this.checkWellKnown(query),     // HTTP: /.well-known/mcp
      this.healthCheck(servers)       // Verification: Live testing
    ]);
    
    return this.mergeAndRank(results);
  }
}
```

### 3. Type-Safe API Design

All APIs use Zod schemas for validation:

```typescript
// src/lib/schemas/discovery.ts
export const DiscoveryQuerySchema = z.object({
  q: z.string().optional(),
  domain: z.string().optional(),
  capability: z.string().optional(),
  verified: z.boolean().optional(),
  health: z.enum(['healthy', 'degraded', 'down']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

export type DiscoveryQuery = z.infer<typeof DiscoveryQuerySchema>;
```

### 4. Error Handling Pattern

Consistent error handling with typed results:

```typescript
// src/lib/utils/result.ts
export type StorageResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export function createSuccessResult<T>(data: T): StorageResult<T> {
  return { success: true, data };
}

export function createErrorResult<T>(error: string, code?: string): StorageResult<T> {
  return { success: false, error, code };
}
```

## 🔌 API Implementation

### Route Structure

API routes follow RESTful conventions:

```
/api/v1/
├── discover/                 # Discovery endpoints
│   ├── route.ts             # GET /api/v1/discover
│   ├── domain/[domain]/     # GET /api/v1/discover/domain/{domain}
│   └── capability/[cap]/    # GET /api/v1/discover/capability/{capability}
├── register/                # Registration endpoints
│   ├── route.ts            # POST /api/v1/register
│   └── verify/[id]/        # POST /api/v1/register/verify/{id}
└── health/                  # Health check endpoints
    └── [domain]/           # GET /api/v1/health/{domain}
```

### API Route Example

```typescript
// src/app/api/v1/discover/route.ts
import { NextRequest } from 'next/server';
import { DiscoveryQuerySchema } from '@/lib/schemas/discovery';
import { createDiscoveryService } from '@/lib/services/discovery';

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    const query = DiscoveryQuerySchema.parse(params);
    
    // Execute discovery
    const discoveryService = createDiscoveryService();
    const result = await discoveryService.discover(query);
    
    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return Response.json(result.data);
  } catch (error) {
    return Response.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  }
}
```

## 🧪 Testing Strategy

### Unit Testing

Test individual components and services:

```typescript
// tests/services/discovery.test.ts
import { DiscoveryService } from '@/lib/services/discovery';
import { InMemoryRegistryStorage } from '@/lib/services/storage';

describe('DiscoveryService', () => {
  let service: DiscoveryService;
  
  beforeEach(() => {
    const storage = new InMemoryRegistryStorage();
    service = new DiscoveryService(storage);
  });
  
  it('should discover servers by domain', async () => {
    // Test implementation
  });
});
```

### Integration Testing

Test API endpoints end-to-end:

```typescript
// tests/api/discover.test.ts
import { GET } from '@/app/api/v1/discover/route';

describe('/api/v1/discover', () => {
  it('should return servers for valid query', async () => {
    const request = new Request('http://localhost/api/v1/discover?domain=gmail.com');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.servers).toBeDefined();
  });
});
```

### Storage Testing

Test storage implementations:

```bash
# Test storage implementations
npm run test:storage

# Test with real Redis (requires Redis running)
REDIS_URL=redis://localhost:6379 npm run test:storage
```

## 🚀 Deployment

### Vercel Deployment

The project is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Set these in Vercel dashboard:

```bash
# Required
NEXTAUTH_URL=https://mcplookup.org
NEXTAUTH_SECRET=your-production-secret

# OAuth (optional)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Storage (recommended for production)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Performance Optimization

The app is optimized for performance:

- **Static generation** for documentation pages
- **Edge functions** for API routes
- **Automatic caching** with appropriate headers
- **Bundle optimization** with Next.js
- **Image optimization** with Next.js Image component

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes with tests
4. **Commit** with conventional commits: `git commit -m "feat: add amazing feature"`
5. **Push** to your fork: `git push origin feature/amazing-feature`
6. **Create** a Pull Request

### Code Standards

- **TypeScript** for all new code
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Zod schemas** for data validation
- **Error handling** with typed results

### Adding New Features

#### Adding a New API Endpoint

1. Create the route file: `src/app/api/v1/new-endpoint/route.ts`
2. Define Zod schemas: `src/lib/schemas/new-feature.ts`
3. Implement service logic: `src/lib/services/new-feature/`
4. Add tests: `tests/api/new-endpoint.test.ts`
5. Update documentation

#### Adding a New Storage Backend

1. Implement the interface: `src/lib/services/storage/new-storage.ts`
2. Add to storage factory: `src/lib/services/storage/index.ts`
3. Add configuration: Environment variables
4. Add tests: `tests/storage/new-storage.test.ts`

### Documentation

When adding features, update:

- **API_SPECIFICATION.md** - For API changes
- **USER_GUIDE.md** - For user-facing features
- **DEVELOPER_GUIDE.md** - For developer features
- **README.md** - For major changes

## 🔍 Debugging

### Common Issues

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Storage Issues:**
```bash
# Test storage implementations
npm run test:storage

# Check Redis connection
curl $UPSTASH_REDIS_REST_URL/ping \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
```

**API Issues:**
```bash
# Check API endpoints locally
curl http://localhost:3000/api/v1/discover

# Check with verbose output
curl -v http://localhost:3000/api/v1/discover/domain/gmail.com
```

### Development Tools

- **Next.js DevTools** - Built into development server
- **React DevTools** - Browser extension
- **Vercel Analytics** - Performance monitoring
- **Upstash Console** - Redis monitoring

---

**Ready to contribute?** Check our [open issues](https://github.com/TSavo/mcplookup.org/issues) or [start a discussion](https://github.com/TSavo/mcplookup.org/discussions)!
