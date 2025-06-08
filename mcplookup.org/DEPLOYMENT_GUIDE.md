# DEPLOYMENT GUIDE - MCPLOOKUP.ORG

**Zero-infrastructure serverless deployment for the MCP discovery service**

---

## 🏗️ SERVERLESS ARCHITECTURE OVERVIEW

### Flexible Storage Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CLOUDFLARE    │───▶│     VERCEL       │───▶│  EDGE FUNCTIONS │
│   (CDN/DNS)     │    │   (Serverless)   │    │  (Global Edge)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ STORAGE LAYER   │    │   DNS QUERIES    │    │   MONITORING    │
│ • In-Memory     │    │ (TXT Records)    │    │ (Vercel Analytics)│
│ • Local Redis   │    │ • Multi-resolver │    │ • Health Checks │
│ • Upstash Redis │    │ • Verification   │    │ • Statistics    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Benefits
- ✅ **Flexible Storage**: In-memory, local Redis, or Upstash Redis
- ✅ **Auto-Scaling**: Handles traffic spikes automatically
- ✅ **Global Edge**: <100ms response times worldwide
- ✅ **Environment Adaptive**: Automatic storage provider selection
- ✅ **Production Ready**: Persistent storage with Upstash Redis

---

## 🚀 VERCEL DEPLOYMENT OPTIONS

### Option 1: In-Memory Storage (Zero Setup)
Perfect for testing and simple deployments.

### Option 2: Upstash Redis (Production Recommended)
Persistent, globally distributed storage for production use.

### Project Configuration (vercel.json)
```json
{
  "name": "mcplookup-registry",
  "version": 2,
  "framework": "nextjs",
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "rewrites": [
    {
      "source": "/mcp",
      "destination": "/api/mcp"
    },
    {
      "source": "/api/v1/(.*)",
      "destination": "/api/v1/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

### Deployment Steps (Zero Setup Required)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project (first time)
vercel link

# 4. Deploy to production (no database setup needed!)
vercel --prod

# 5. Set custom domain (optional)
vercel domains add mcplookup.org

# That's it! No database migrations, no external services to configure.
```

### Environment Variables

#### Option 1: In-Memory Storage (Zero Config)
```bash
# No environment variables required!
# System automatically uses in-memory storage
```

#### Option 2: Upstash Redis (Production)
```bash
# Required for Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
NODE_ENV=production

# Application configuration
NEXT_PUBLIC_APP_URL=https://mcplookup.org
NEXTAUTH_URL=https://mcplookup.org
NEXTAUTH_SECRET=your-secret-key

# Optional configuration
DNS_RESOLVER_URL=https://cloudflare-dns.com/dns-query
HEALTH_CHECK_TIMEOUT=5000
VERIFICATION_TOKEN_TTL=86400

# Feature flags (optional)
ENABLE_AUTO_DISCOVERY=true
ENABLE_ANALYTICS=true
ENABLE_EXTERNAL_APIS=true

# Authentication (optional - for UI only)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### Setting Environment Variables in Vercel
```bash
# Set Upstash credentials
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN

# Set application URL
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXTAUTH_URL

# Set authentication secret
vercel env add NEXTAUTH_SECRET
```

### Flexible Storage Options ✅

#### In-Memory Storage (Zero Setup)
- ❌ **No PostgreSQL setup**
- ❌ **No Redis configuration**
- ❌ **No MongoDB connection**
- ❌ **No database migrations**
- ❌ **No backup strategies**
- ✅ **Zero infrastructure dependencies**

#### Upstash Redis (Production)
- ✅ **Managed Redis service** (no server management)
- ✅ **Automatic scaling** (serverless)
- ✅ **Global replication** (multi-region)
- ✅ **Built-in persistence** (automatic backups)
- ✅ **Zero maintenance** (fully managed)
- ✅ **Pay-per-use pricing** (cost-effective)

---

## 🌐 CLOUDFLARE CONFIGURATION

### DNS Settings
```dns
# A Records
mcplookup.org.          A       76.76.19.19  (Vercel)
www.mcplookup.org.      CNAME   mcplookup.org.

# MCP Service Discovery
_mcp.mcplookup.org.     TXT     "v=mcp1 endpoint=https://mcplookup.org/api/mcp"
```

### Page Rules
```javascript
// Cache API responses
mcplookup.org/api/v1/discover/*
- Cache Level: Standard
- Edge Cache TTL: 5 minutes
- Browser Cache TTL: 1 minute

// Cache static assets
mcplookup.org/_next/static/*
- Cache Level: Cache Everything
- Edge Cache TTL: 1 year
- Browser Cache TTL: 1 year
```

### Security Settings
```yaml
Security Level: Medium
SSL/TLS: Full (strict)
Always Use HTTPS: On
Minimum TLS Version: 1.2
HSTS: Enabled (max-age=31536000)

# Security Headers
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: "1; mode=block"
Referrer-Policy: strict-origin-when-cross-origin
```

### Rate Limiting
```yaml
# API Protection
/api/*:
  threshold: 100 requests per minute
  action: challenge

# MCP Endpoint Protection
/api/mcp:
  threshold: 50 requests per minute
  action: block
```

---

## 📊 VERCEL ANALYTICS & MONITORING

### Built-in Analytics
```bash
# Enable Vercel Analytics
vercel env add NEXT_PUBLIC_VERCEL_ANALYTICS_ID

# View analytics dashboard
vercel analytics
```

### Custom Metrics
```typescript
// Track discovery requests
import { track } from '@vercel/analytics';

export async function trackDiscovery(domain: string, capability?: string) {
  track('mcp_discovery', {
    domain,
    capability: capability || 'none',
    timestamp: Date.now()
  });
}

// Track registration attempts
export async function trackRegistration(domain: string, success: boolean) {
  track('mcp_registration', {
    domain,
    success,
    timestamp: Date.now()
  });
}
```

### Health Monitoring
```typescript
// API route: /api/health
export async function GET() {
  const healthChecks = {
    dns_resolver: await checkDNSResolver(),
    well_known_servers: await checkWellKnownServers(),
    memory_usage: process.memoryUsage(),
    uptime: process.uptime()
  };

  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: healthChecks
  });
}
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions for Vercel
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Type check
      run: npm run type-check

    - name: Lint
      run: npm run lint

    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] Environment variables configured in Vercel
- [ ] Domain configured and DNS pointing to Vercel
- [ ] Cloudflare settings configured
- [ ] GitHub Actions secrets set up
- [ ] Tests passing locally

### Deployment Steps
1. **Build & Test**: `npm run build && npm test`
2. **Deploy to Vercel**: `vercel --prod`
3. **Configure Domain**: Set up custom domain in Vercel
4. **Health Check**: Verify `/api/health` endpoint
5. **Smoke Tests**: Test key API endpoints
6. **Monitor**: Check Vercel analytics

### Post-deployment
- [ ] Health checks passing
- [ ] Analytics flowing to Vercel
- [ ] DNS verification working
- [ ] Discovery API responsive
- [ ] SSL certificate valid (automatic with Vercel)
- [ ] Edge caching working properly

---

**Serverless deployment architecture for the MCP discovery service that scales automatically and handles millions of discovery requests per day.**

🚀 **Ready to serve the world's AI agents with zero infrastructure management!**
