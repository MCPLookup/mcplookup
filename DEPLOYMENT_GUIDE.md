# DEPLOYMENT GUIDE - MCPLOOKUP.ORG

**Production deployment architecture for the MCP discovery service**

---

## 🏗️ ARCHITECTURE OVERVIEW

### Production Stack
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CLOUDFLARE    │───▶│   LOAD BALANCER  │───▶│  APP INSTANCES  │
│   (CDN/DNS)     │    │   (nginx/HAProxy)│    │  (Docker)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   POSTGRESQL    │    │      REDIS       │    │   MONITORING    │
│   (Primary DB)  │    │   (Cache/Jobs)   │    │ (Prometheus)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🐳 DOCKER CONFIGURATION

### Production Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Production image
FROM node:20-alpine AS production

# Security: Run as non-root user
RUN addgroup -g 1001 -S mcplookup && \
    adduser -S mcplookup -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Security hardening
RUN apk add --no-cache dumb-init && \
    chown -R mcplookup:mcplookup /app

USER mcplookup

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

### Docker Compose (Production)
```yaml
version: '3.8'

services:
  app:
    build: 
      context: .
      target: production
    image: mcplookup/registry:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://mcplookup:${DB_PASSWORD}@postgres:5432/mcplookup_prod
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - mcplookup
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'

  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_DB=mcplookup_prod
      - POSTGRES_USER=mcplookup
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - mcplookup

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - mcplookup

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - mcplookup

volumes:
  postgres_data:
  redis_data:

networks:
  mcplookup:
    driver: bridge
```

---

## 🔧 NGINX CONFIGURATION

### Load Balancer & SSL Termination
```nginx
# /etc/nginx/nginx.conf
upstream mcplookup_backend {
    least_conn;
    server app:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name mcplookup.org www.mcplookup.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mcplookup.org www.mcplookup.org;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/mcplookup.org.crt;
    ssl_certificate_key /etc/nginx/ssl/mcplookup.org.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_session_timeout 10m;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # MCP Endpoint (most important)
    location /mcp {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://mcplookup_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for MCP connections
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API Endpoints
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        
        proxy_pass http://mcplookup_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Caching for discovery endpoints
        proxy_cache discovery_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Health Check
    location /health {
        proxy_pass http://mcplookup_backend;
        access_log off;
    }

    # Static files (if any)
    location /static/ {
        root /var/www/mcplookup;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Caching configuration
proxy_cache_path /var/cache/nginx/discovery 
                 levels=1:2 
                 keys_zone=discovery_cache:10m 
                 max_size=100m 
                 inactive=60m;
```

---

## 🚀 KUBERNETES DEPLOYMENT

### Namespace & Resources
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mcplookup

---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcplookup-registry
  namespace: mcplookup
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcplookup-registry
  template:
    metadata:
      labels:
        app: mcplookup-registry
    spec:
      containers:
      - name: mcplookup
        image: mcplookup/registry:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mcplookup-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: mcplookup-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mcplookup-service
  namespace: mcplookup
spec:
  selector:
    app: mcplookup-registry
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mcplookup-ingress
  namespace: mcplookup
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - mcplookup.org
    secretName: mcplookup-tls
  rules:
  - host: mcplookup.org
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mcplookup-service
            port:
              number: 80
```

---

## 🗄️ DATABASE MIGRATIONS

### Initial Schema
```sql
-- migrations/001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MCP Servers Registry
CREATE TABLE mcp_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    capabilities TEXT[],
    category VARCHAR(50),
    auth_type VARCHAR(20) DEFAULT 'none',
    description TEXT,
    contact_email VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    health_status VARCHAR(20) DEFAULT 'unknown',
    trust_score INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5,2) DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    last_health_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Domain Verifications
CREATE TABLE domain_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    challenge_token VARCHAR(64) NOT NULL,
    record_name VARCHAR(300) NOT NULL,
    record_value VARCHAR(300) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_check TIMESTAMP,
    failure_reason TEXT
);

-- API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255) NOT NULL REFERENCES mcp_servers(domain),
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Discovery Analytics
CREATE TABLE discovery_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    domain VARCHAR(255),
    capability VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mcp_servers_domain ON mcp_servers(domain);
CREATE INDEX idx_mcp_servers_capabilities ON mcp_servers USING GIN(capabilities);
CREATE INDEX idx_mcp_servers_category ON mcp_servers(category);
CREATE INDEX idx_mcp_servers_verified ON mcp_servers(verified);
CREATE INDEX idx_mcp_servers_health ON mcp_servers(health_status);

CREATE INDEX idx_verifications_domain ON domain_verifications(domain);
CREATE INDEX idx_verifications_status ON domain_verifications(status);
CREATE INDEX idx_verifications_expires ON domain_verifications(expires_at);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_domain ON api_keys(domain);

CREATE INDEX idx_discovery_events_type ON discovery_events(event_type);
CREATE INDEX idx_discovery_events_domain ON discovery_events(domain);
CREATE INDEX idx_discovery_events_created ON discovery_events(created_at);
```

---

## 📊 MONITORING & OBSERVABILITY

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mcplookup-registry'
    static_configs:
      - targets: ['mcplookup-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

rule_files:
  - "mcplookup_alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Alert Rules
```yaml
# mcplookup_alerts.yml
groups:
- name: mcplookup
  rules:
  - alert: HighDiscoveryLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{path="/api/v1/discover"}[5m])) > 0.5
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High discovery API latency"

  - alert: VerificationFailureRate
    expr: rate(verification_failures_total[5m]) / rate(verification_attempts_total[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High DNS verification failure rate"

  - alert: HealthyServersLow
    expr: healthy_servers_percentage < 95
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Less than 95% of servers are healthy"
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "MCPLookup Registry",
    "panels": [
      {
        "title": "Discovery Requests/sec",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{path=~\"/api/v1/discover.*\"}[5m])"
          }
        ]
      },
      {
        "title": "Verification Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(verification_successes_total[5m]) / rate(verification_attempts_total[5m]) * 100"
          }
        ]
      },
      {
        "title": "Registered Servers",
        "type": "stat",
        "targets": [
          {
            "expr": "total_registered_servers"
          }
        ]
      }
    ]
  }
}
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy MCPLookup Registry

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: mcplookup/registry:latest,mcplookup/registry:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/deployment.yaml
          k8s/service.yaml
          k8s/ingress.yaml
        images: |
          mcplookup/registry:${{ github.sha }}
        kubectl-version: 'latest'
```

---

## 🌐 CDN & EDGE CONFIGURATION

### Cloudflare Settings
```javascript
// Cloudflare Workers for edge caching
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Cache discovery requests at edge
  if (url.pathname.startsWith('/api/v1/discover/')) {
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    
    let response = await cache.match(cacheKey);
    
    if (!response) {
      response = await fetch(request);
      
      if (response.status === 200) {
        // Cache for 5 minutes
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'public, max-age=300');
        response = new Response(response.body, { 
          status: response.status, 
          headers 
        });
        
        await cache.put(cacheKey, response.clone());
      }
    }
    
    return response;
  }
  
  // Pass through other requests
  return fetch(request);
}
```

---

## 🔧 ENVIRONMENT-SPECIFIC CONFIGS

### Production Environment
```bash
# production.env
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn

# High-performance settings
UV_THREADPOOL_SIZE=64
NODE_OPTIONS="--max-old-space-size=512"

# Database connection pooling
DATABASE_POOL_SIZE=20
DATABASE_MAX_CONNECTIONS=100

# Redis configuration
REDIS_POOL_SIZE=10
REDIS_TIMEOUT_MS=5000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

### Staging Environment
```bash
# staging.env
NODE_ENV=staging
PORT=3000
LOG_LEVEL=info

# Reduced resources for staging
DATABASE_POOL_SIZE=5
REDIS_POOL_SIZE=3

# Feature flags for testing
FEATURE_AUTO_DISCOVERY=true
MOCK_DNS_VERIFICATION=true
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations applied
- [ ] DNS records configured
- [ ] Monitoring setup verified
- [ ] Load testing completed

### Deployment Steps
1. **Build & Test**: `npm run build && npm test`
2. **Database Migration**: `npm run migrate`
3. **Deploy Application**: `docker-compose up -d`
4. **Health Check**: Verify `/health` endpoint
5. **Smoke Tests**: Test key API endpoints
6. **Monitor**: Check metrics and logs

### Post-deployment
- [ ] Health checks passing
- [ ] Metrics flowing to monitoring
- [ ] DNS verification working
- [ ] Discovery API responsive
- [ ] SSL certificate valid
- [ ] CDN caching properly

---

**Production-ready deployment architecture for the MCP discovery service that can handle millions of discovery requests per day.**

🚀 **Ready to serve the world's AI agents!**
