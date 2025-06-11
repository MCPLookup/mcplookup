# Server Type Classification Implementation Guide

## 🎯 Overview

We've successfully implemented a **two-tier server classification system** that distinguishes between:

1. **GitHub-based servers** (unofficial/community)
2. **Domain ownership-based official servers** (verified/enterprise)

This provides clear separation while maintaining full discovery compatibility for both types.

## 🏗️ Architecture Changes

### 1. Enhanced Schema (`src/lib/schemas/discovery.ts`)

#### New ServerTypeSchema
```typescript
export const ServerTypeSchema = z.object({
  type: z.enum(['github', 'official']),
  
  // GitHub-based server details
  github_repo: z.string().optional(),
  github_stars: z.number().optional(),
  github_verified: z.boolean().default(false),
  
  // Official domain-registered server details
  domain_verified: z.boolean().default(false),
  domain_verification_date: z.string().datetime().optional(),
  registrant_verified: z.boolean().default(false),
  
  // Trust indicators
  official_status: z.enum(['unofficial', 'community', 'verified', 'enterprise']).default('unofficial'),
  verification_badges: z.array(z.string()).default([])
});
```

#### Enhanced MCPServerRecordSchema
```typescript
export const MCPServerRecordSchema = z.object({
  // ... existing fields ...
  
  // ---- SERVER TYPE CLASSIFICATION ----
  server_type: ServerTypeSchema.describe("Server classification (GitHub-based vs official domain-registered)"),
  
  // ... rest of schema ...
});
```

#### Enhanced DiscoveryRequestSchema
```typescript
// Server type filtering (GITHUB vs OFFICIAL)
server_type_filter: z.object({
  include_github: z.boolean().default(true),
  include_official: z.boolean().default(true),
  official_only: z.boolean().default(false),
  github_only: z.boolean().default(false),
  minimum_official_status: z.enum(['unofficial', 'community', 'verified', 'enterprise']).default('unofficial'),
  require_domain_verification: z.boolean().default(false),
  require_github_verification: z.boolean().default(false)
}).optional()
```

### 2. Enhanced Discovery Service (`src/lib/services/discovery.ts`)

#### New Discovery Methods
- `executeDiscoveryStrategy()` - Routes to appropriate discovery method
- `executeCombinedDiscovery()` - Handles both GitHub and official servers
- `discoverOfficialServers()` - Official domain-registered servers only
- `discoverGitHubServers()` - GitHub-based servers only
- `loadOfficialServers()` - Loads official servers from registry
- `loadGitHubServers()` - Loads GitHub servers from registry
- `filterByServerType()` - Applies server type filtering
- `getOfficialStatusRank()` - Compares official status levels

## 🔧 Usage Examples

### 1. Default Discovery (Both Types)
```typescript
const response = await discoveryService.discoverServers({
  intent: "I need email servers"
});
// Returns: Both GitHub and official servers, prioritizing official
```

### 2. Official Servers Only
```typescript
const response = await discoveryService.discoverServers({
  intent: "I need email servers",
  server_type_filter: {
    official_only: true
  }
});
// Returns: Only domain-verified official servers like gmail.com/mcp
```

### 3. GitHub Servers Only
```typescript
const response = await discoveryService.discoverServers({
  intent: "I need email servers", 
  server_type_filter: {
    github_only: true
  }
});
// Returns: Only GitHub repository-based servers
```

### 4. Enterprise-Grade Servers Only
```typescript
const response = await discoveryService.discoverServers({
  intent: "I need production email servers",
  server_type_filter: {
    official_only: true,
    minimum_official_status: "enterprise"
  }
});
// Returns: Only enterprise-grade official servers
```

### 5. Domain-Verified Servers Only
```typescript
const response = await discoveryService.discoverServers({
  intent: "I need trusted email servers",
  server_type_filter: {
    require_domain_verification: true
  }
});
// Returns: Only servers with DNS domain verification
```

## 📊 Server Classification Examples

### GitHub-Based Server (Community)
```typescript
{
  domain: "github.com/example/mcp-email-server",
  name: "Community Email MCP Server",
  server_type: {
    type: "github",
    github_repo: "example/mcp-email-server",
    github_stars: 156,
    github_verified: true,
    domain_verified: false,
    official_status: "community",
    verification_badges: ["github_verified"]
  },
  availability: {
    status: "package_only",
    packages_available: true,
    primary_package: "npm"
  }
}
```

### Official Domain Server (Enterprise)
```typescript
{
  domain: "gmail.com",
  name: "Gmail MCP Server",
  server_type: {
    type: "official", 
    github_repo: "google/gmail-mcp",
    github_verified: true,
    domain_verified: true,
    domain_verification_date: "2025-01-01T10:00:00Z",
    registrant_verified: true,
    official_status: "enterprise",
    verification_badges: ["dns_verified", "github_verified", "registrant_verified", "enterprise_grade"]
  },
  availability: {
    status: "live",
    live_endpoint: "https://gmail.com/mcp",
    endpoint_verified: true,
    packages_available: true
  }
}
```

## 🎯 Benefits

### For Discovery
- **Clear Distinction**: Users know if they're getting unofficial GitHub repos vs official services
- **Trust Indicators**: Verification badges and official status levels provide trust signals
- **Flexible Filtering**: Granular control over server types in discovery
- **Priority Ordering**: Official servers returned first, then GitHub servers

### For Official Services
- **Domain Ownership**: DNS verification proves service ownership
- **Trust Hierarchy**: unofficial → community → verified → enterprise
- **Verification Badges**: Clear indicators of verification status
- **Live Endpoints**: HTTP streaming support for real-time usage

### For GitHub Projects
- **Community Recognition**: Clear classification as community/unofficial projects
- **GitHub Integration**: Star counts, verification status, repository links
- **Package Support**: Installation instructions for local usage
- **Discovery Inclusion**: Still discoverable when explicitly requested

### For Ecosystem
- **Backward Compatibility**: All existing GitHub discovery continues to work
- **Migration Path**: GitHub projects can become official by registering domains
- **Quality Assurance**: Official status indicates higher reliability
- **Standards**: Encourages ecosystem evolution toward verified services

## 🚀 Implementation Status

### ✅ Completed
- [x] ServerTypeSchema with GitHub/Official classification
- [x] Enhanced MCPServerRecordSchema with server_type field
- [x] Discovery request filtering for server types
- [x] Discovery service with type-aware routing
- [x] Official status hierarchy (unofficial → community → verified → enterprise)
- [x] Verification badge system
- [x] Domain ownership verification support
- [x] GitHub repository verification
- [x] Filtering methods for server type classification

### 🔄 Integration Points

#### Registry Service
Needs to support:
- `getServersByType(type: 'github' | 'official')`
- Domain verification checking
- Official status filtering

#### Health Service  
Needs to handle:
- Live endpoint monitoring for official servers
- GitHub repository health checking
- Verification status updates

#### Registration API
Needs to support:
- Domain ownership verification flow
- Official status assignment
- Verification badge management

## 📋 Example Responses

### Combined Discovery Response
```json
{
  "servers": [
    {
      "domain": "gmail.com",
      "name": "Gmail MCP Server", 
      "server_type": {
        "type": "official",
        "official_status": "enterprise",
        "domain_verified": true,
        "verification_badges": ["dns_verified", "enterprise_grade"]
      },
      "availability": {
        "status": "live",
        "endpoint_verified": true
      }
    },
    {
      "domain": "github.com/community/email-mcp",
      "name": "Community Email Server",
      "server_type": {
        "type": "github", 
        "official_status": "community",
        "github_verified": true,
        "verification_badges": ["github_verified"]
      },
      "availability": {
        "status": "package_only",
        "packages_available": true
      }
    }
  ],
  "query_metadata": {
    "filters_applied": ["official_discovery", "github_discovery"]
  }
}
```

## 🎉 Summary

This implementation provides:

1. **Clear Server Classification**: GitHub-based vs Official domain-registered
2. **Trust Hierarchy**: From unofficial to enterprise-grade
3. **Flexible Discovery**: Filter by server type, verification status, official level
4. **Backward Compatibility**: All existing GitHub discovery continues to work
5. **Future-Proof**: Official servers get priority while supporting community projects
6. **Verification System**: DNS domain ownership + GitHub repository verification
7. **Badge System**: Clear trust indicators for users

The result is a **unified discovery service** that supports both the current ecosystem (GitHub-based packages) and the future ecosystem (official live HTTP streaming services) with clear distinctions and appropriate trust signals.
