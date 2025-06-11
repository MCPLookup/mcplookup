# Server Type Filtering Examples for MCP Tool

## 🎯 Overview

The `discover_mcp_servers` MCP tool now supports **server type filtering** to distinguish between:

- **GitHub-based servers** (unofficial/community projects)
- **Official domain-registered servers** (verified enterprises)

## 📋 Usage Examples

### 1. Default Discovery (Both Types)
```typescript
// Returns both GitHub and official servers, prioritizing official ones
{
  "name": "discover_mcp_servers",
  "arguments": {
    "intent": "I need email servers"
  }
}
```

### 2. Official Servers Only
```typescript
// Only returns domain-verified official servers like gmail.com/mcp
{
  "name": "discover_mcp_servers", 
  "arguments": {
    "intent": "I need production-ready email servers",
    "server_type_filter": {
      "official_only": true
    }
  }
}
```

### 3. GitHub Community Servers Only
```typescript
// Only returns GitHub repository-based servers
{
  "name": "discover_mcp_servers",
  "arguments": {
    "intent": "I need open source email tools",
    "server_type_filter": {
      "github_only": true
    }
  }
}
```

### 4. Enterprise-Grade Servers Only
```typescript
// Only returns enterprise-level official servers
{
  "name": "discover_mcp_servers",
  "arguments": {
    "intent": "I need enterprise email solutions",
    "server_type_filter": {
      "official_only": true,
      "minimum_official_status": "enterprise"
    }
  }
}
```

### 5. Domain-Verified Servers Only
```typescript
// Only returns servers with DNS domain verification
{
  "name": "discover_mcp_servers",
  "arguments": {
    "intent": "I need trusted email servers",
    "server_type_filter": {
      "require_domain_verification": true
    }
  }
}
```

### 6. GitHub Verified Repositories Only
```typescript
// Only returns GitHub servers that are verified as MCP servers
{
  "name": "discover_mcp_servers",
  "arguments": {
    "intent": "I need verified GitHub MCP servers",
    "server_type_filter": {
      "github_only": true,
      "require_github_verification": true
    }
  }
}
```

### 7. Combined Filters (Advanced)
```typescript
// Combine server type with availability and performance filters
{
  "name": "discover_mcp_servers",
  "arguments": {
    "intent": "I need production email servers",
    "server_type_filter": {
      "include_official": true,
      "include_github": false,
      "minimum_official_status": "verified"
    },
    "availability_filter": {
      "live_servers_only": true
    },
    "performance": {
      "min_uptime": 99.0,
      "verified_only": true
    }
  }
}
```

## 📊 Response Format

The enhanced response now includes server type information:

```json
{
  "results": [
    {
      "domain": "gmail.com",
      "name": "Gmail MCP Server",
      "server_type": {
        "type": "official",
        "official_status": "enterprise", 
        "domain_verified": true,
        "github_verified": true,
        "verification_badges": ["dns_verified", "enterprise_grade"]
      },
      "enhanced_features": {
        "server_type": "official",
        "official_status": "enterprise",
        "domain_verified": true,
        "github_verified": true,
        "verification_badges": ["dns_verified", "enterprise_grade"],
        "trust_score": 98
      }
    },
    {
      "domain": "github.com/community/email-mcp",
      "name": "Community Email Server",
      "server_type": {
        "type": "github",
        "official_status": "community",
        "github_verified": true,
        "domain_verified": false,
        "verification_badges": ["github_verified"]
      },
      "enhanced_features": {
        "server_type": "github",
        "official_status": "community",
        "domain_verified": false,
        "github_verified": true,
        "verification_badges": ["github_verified"],
        "trust_score": 75
      }
    }
  ],
  "enhancement_info": {
    "server_type_breakdown": {
      "official_servers": 1,
      "github_servers": 1,
      "domain_verified": 1,
      "github_verified": 2,
      "enterprise_grade": 1
    }
  }
}
```

## 🎯 Server Type Filter Parameters

### Complete Parameter Reference

```typescript
server_type_filter: {
  // Basic inclusion filters
  include_github: boolean = true,              // Include GitHub-based servers
  include_official: boolean = true,            // Include official servers
  
  // Shortcut filters (override inclusion)
  official_only: boolean = false,              // Only official servers
  github_only: boolean = false,               // Only GitHub servers
  
  // Quality filters
  minimum_official_status: 'unofficial' | 'community' | 'verified' | 'enterprise' = 'unofficial',
  require_domain_verification: boolean = false,   // Require DNS verification
  require_github_verification: boolean = false,   // Require GitHub verification
}
```

### Official Status Hierarchy

1. **`unofficial`** - Basic community projects
2. **`community`** - Active community projects with some verification
3. **`verified`** - Domain-verified official services
4. **`enterprise`** - Enterprise-grade services with full verification

## 🌟 Use Cases

### For Developers
- **Exploration**: Use `github_only: true` to find open-source alternatives
- **Production**: Use `official_only: true` for reliable services
- **Research**: Use both types to compare options

### For Enterprises
- **Security**: Use `require_domain_verification: true`
- **Reliability**: Use `minimum_official_status: "enterprise"`
- **Compliance**: Combine with performance filters

### For AI Agents
- **Smart Defaults**: Let the system prioritize official servers
- **Fallback Options**: Include GitHub servers when official ones aren't available
- **Trust Indicators**: Use verification badges for decision making

## 🚀 Benefits

### Clear Classification
- **Official**: Domain-verified, enterprise-grade, high trust
- **GitHub**: Community-driven, open-source, varying quality

### Flexible Discovery
- Mix and match filters for precise requirements
- Default behavior prioritizes official servers
- Explicit control over server types

### Trust Indicators
- Verification badges show trust level
- Official status hierarchy provides quality signals
- Trust scores help with selection

This implementation provides the **best of both worlds**: access to reliable official services while maintaining support for the vibrant GitHub-based MCP ecosystem.
