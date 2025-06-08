# OpenAPI Two-Way Generation & Bridge Sync

This document describes the two-way OpenAPI generation system and bridge synchronization process.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Repository                          │
│                  (mcplookup.org)                           │
├─────────────────────────────────────────────────────────────┤
│  📄 openapi.yaml (Single Source of Truth)                  │
│  ↓                                                         │
│  🔧 Generation Scripts:                                    │
│  • npm run openapi:generate-types                         │
│  • npm run openapi:generate-client                        │
│  • npm run openapi:generate-server                        │
│  ↓                                                         │
│  📁 Generated Files:                                       │
│  • src/lib/generated/types.ts                             │
│  • src/lib/generated/client.ts                            │
│  • src/lib/generated/api-client.ts                        │
│  • src/lib/generated/server-schemas.ts                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Sync Process
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Bridge Repository                        │
│                   (mcp-bridge)                             │
├─────────────────────────────────────────────────────────────┤
│  📁 Synced Generated Files:                               │
│  • src/generated/types.ts                                 │
│  • src/generated/client.ts                                │
│  • src/generated/api-client.ts                            │
│  ↓                                                         │
│  🌉 MCP Bridge Implementation:                             │
│  • 8 MCP Tools using generated client                     │
│  • Type-safe API calls                                    │
│  • Standalone npm package                                 │
└─────────────────────────────────────────────────────────────┘
```

## Two-Way Generation

### Client-Side Generation
- **Types**: `openapi-typescript` generates TypeScript types from OpenAPI spec
- **Client**: Type-safe API client wrapper with authentication
- **Usage**: Used by bridge and any external consumers

### Server-Side Generation  
- **Schemas**: `openapi-zod-client` generates Zod validation schemas
- **Validation**: Request/response validation middleware
- **Usage**: Used by API route handlers for type safety

## Sync Scripts

### 1. Generate All (`npm run openapi:generate-all`)
Generates all client and server code from OpenAPI spec:
```bash
npm run openapi:validate      # Validate OpenAPI spec
npm run openapi:generate-types    # Generate TypeScript types
npm run openapi:generate-client   # Generate API client
npm run openapi:generate-server   # Generate Zod schemas
```

### 2. Sync Bridge (`npm run openapi:sync-bridge`)
Syncs generated client to bridge repository:
```bash
node scripts/sync-bridge.js
```

**What it does:**
1. Checks out/updates bridge repository
2. Generates latest API client
3. Copies generated files to bridge repo
4. Syncs package versions
5. Builds bridge to verify compatibility
6. Commits and pushes changes

### 3. Version Bump (`node scripts/version-bump.js [patch|minor|major]`)
Bumps version and syncs both repositories:
```bash
node scripts/version-bump.js patch   # 1.0.0 → 1.0.1
node scripts/version-bump.js minor   # 1.0.0 → 1.1.0  
node scripts/version-bump.js major   # 1.0.0 → 2.0.0
```

**What it does:**
1. Bumps version in main repo
2. Updates CHANGELOG.md
3. Generates latest API client
4. Commits and tags main repo
5. Syncs bridge repository
6. Pushes both repositories

## Development Workflow

### Making API Changes
1. **Update OpenAPI spec** (`openapi.yaml`)
2. **Regenerate code**: `npm run openapi:generate-all`
3. **Update route handlers** to use generated schemas
4. **Test locally**
5. **Sync bridge**: `npm run openapi:sync-bridge`
6. **Test bridge** in separate repo

### Releasing New Version
1. **Make your changes** and test
2. **Bump version**: `node scripts/version-bump.js patch`
3. **Create GitHub releases** for both repos
4. **Publish bridge**: `cd ../mcp-bridge && npm publish`

## File Locations

### Main Repository
- **Spec**: `openapi.yaml`
- **Generated Types**: `src/lib/generated/types.ts`
- **Generated Client**: `src/lib/generated/api-client.ts`
- **Generated Schemas**: `src/lib/generated/server-schemas.ts`
- **Validation Middleware**: `src/lib/middleware/openapi-validation.ts`

### Bridge Repository
- **Synced Types**: `src/generated/types.ts`
- **Synced Client**: `src/generated/api-client.ts`
- **Bridge Implementation**: `src/bridge.ts`
- **MCP Tools**: Uses generated client for API calls

## Benefits

1. **Single Source of Truth**: OpenAPI spec drives everything
2. **Type Safety**: Generated types ensure consistency
3. **Automatic Sync**: Scripts keep repositories in lockstep
4. **Independent Distribution**: Bridge can be published separately
5. **Version Consistency**: Both repos always have matching versions
6. **True Two-Way**: Both client and server use generated code

## Troubleshooting

### Sync Fails
- Check bridge repository exists at `../mcp-bridge`
- Ensure you have push access to bridge repository
- Verify OpenAPI spec is valid: `npm run openapi:validate`

### Build Fails
- Check generated types are compatible
- Verify API client methods match bridge usage
- Run `npm run build` in both repositories

### Version Mismatch
- Run sync script: `npm run openapi:sync-bridge`
- Check package.json versions in both repos
- Manually sync if needed
