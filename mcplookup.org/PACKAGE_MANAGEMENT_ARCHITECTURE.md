# Package Management Architecture

## Overview

MCPLookup.org now supports **both live servers and package-only servers** while maintaining our philosophy that **live, actionable servers are first-class citizens**.

## Server Classification

### 🚀 **First-Class Citizens: Live Servers**
- **Status**: `live`
- **Characteristics**: 
  - Working HTTP endpoint
  - Real-time MCP protocol introspection
  - Health monitoring
  - DNS verification
  - Immediate discoverability and usability

### 📦 **Deprecated Citizens: Package-Only Servers**
- **Status**: `package_only`
- **Characteristics**:
  - No live endpoint
  - Installation packages only (npm, docker, etc.)
  - Requires local setup
  - **Excluded from default discovery**
  - Legacy compatibility support

### 🔄 **Other Statuses**
- **`deprecated`**: Explicitly deprecated servers
- **`offline`**: Previously live servers that are now offline

## Data Structure Extensions

### New Schema Fields

```typescript
// Server Availability Status
availability: {
  status: 'live' | 'package_only' | 'deprecated' | 'offline',
  live_endpoint?: string,
  endpoint_verified: boolean,
  packages_available: boolean,
  primary_package?: string,
  deprecation_reason?: string
}

// Package Management (MCP Registry Compatibility)
packages?: [
  {
    registry_name: 'npm' | 'docker' | 'pypi' | 'github' | 'manual',
    name: string,
    version: string,
    package_arguments?: [...],
    environment_variables?: [...],
    installation_command?: string,
    startup_command?: string,
    setup_instructions?: string
  }
]

// Repository Information
repository?: {
  url: string,
  source: 'github' | 'gitlab' | 'bitbucket' | 'other',
  stars?: number,
  license?: string,
  topics?: string[]
}

// Version Information
version_info?: {
  version: string,
  release_date?: string,
  is_latest: boolean,
  changelog_url?: string,
  breaking_changes: boolean
}
```

## Discovery Behavior

### Default Discovery (Live Servers Only)
```typescript
// Default behavior - only live servers
const discovery = await fetch('/api/v1/discover/smart', {
  method: 'POST',
  body: JSON.stringify({
    intent: "I need email servers"
  })
});
// Returns: Only live, working servers
```

### Including Package-Only Servers
```typescript
// Explicit inclusion of deprecated citizens
const discovery = await fetch('/api/v1/discover/smart', {
  method: 'POST',
  body: JSON.stringify({
    intent: "I need email servers",
    availability_filter: {
      include_live: true,
      include_package_only: true  // Explicitly include
    }
  })
});
// Returns: Live servers + package-only servers
```

### Package-Only Filter
```typescript
// Only package-only servers (for compatibility)
const discovery = await fetch('/api/v1/discover/smart', {
  method: 'POST',
  body: JSON.stringify({
    intent: "I need email servers",
    availability_filter: {
      include_live: false,
      include_package_only: true
    }
  })
});
// Returns: Only package-only servers
```

## MCP Server Tools

### Updated `discover_mcp_servers` Tool

```typescript
// New availability filtering parameter
{
  availability_filter: {
    include_live: boolean,           // Default: true
    include_package_only: boolean,   // Default: false
    include_deprecated: boolean,     // Default: false
    include_offline: boolean,        // Default: false
    live_servers_only: boolean       // Shortcut: Default: false
  }
}
```

## Migration Strategy

### Existing Servers
- **Backward Compatibility**: Existing servers without `availability` field default to `live` status
- **Gradual Migration**: Package-only servers can be imported from MCP Registry format
- **No Breaking Changes**: All existing APIs continue to work

### MCP Registry Compatibility
- **Import Support**: Can import servers from MCP Registry JSON format
- **Package Data**: Full support for their package management structure
- **Enhanced Discovery**: Add our live monitoring on top of their package data

## Implementation Examples

### Live Server (Preferred)
```typescript
{
  domain: "gmail.com",
  endpoint: "https://gmail.com/mcp",
  availability: {
    status: "live",
    endpoint_verified: true,
    packages_available: true  // Also has packages for local dev
  },
  server_info: { /* Live MCP introspection */ },
  tools: [ /* Live tool definitions */ ],
  health: { /* Real-time health data */ }
}
```

### Package-Only Server (Legacy)
```typescript
{
  domain: "legacy-server.com",
  endpoint: undefined,
  availability: {
    status: "package_only",
    packages_available: true,
    primary_package: "npm",
    deprecation_reason: "No live endpoint available"
  },
  packages: [
    {
      registry_name: "npm",
      name: "@legacy/mcp-server",
      installation_command: "npm install -g @legacy/mcp-server"
    }
  ],
  server_info: undefined,  // No live introspection
  health: undefined        // No health monitoring
}
```

## Benefits

### For Users
- **Better Discovery**: Find working servers by default
- **Clear Expectations**: Know if server requires installation
- **Compatibility**: Access to legacy package-only servers when needed

### For Developers
- **Migration Path**: Easy transition from package-only to live servers
- **Flexibility**: Support both deployment models
- **Future-Proof**: Encourage live server adoption while supporting legacy

### For the Ecosystem
- **Standards Evolution**: Push toward live, discoverable servers
- **Backward Compatibility**: Don't break existing package-based workflows
- **Quality Improvement**: Prioritize reliable, monitored servers

## Philosophy

> **Live servers are the future. Package-only servers are the past.**
> 
> We support both, but we **default to the future** while providing **first-class support for the past**.

This architecture ensures MCPLookup.org can be the universal discovery service for **all** MCP servers while encouraging the ecosystem to evolve toward more discoverable, reliable, and actionable services.
