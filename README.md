# MCPLookup.org 🚀

**The Universal MCP Discovery Service Ecosystem**

This monorepo contains all the core components of the MCPLookup.org platform - the "DNS for AI tools" that eliminates hardcoded server lists forever.

## 📁 Project Structure

```
mcplookup/
├── mcp-sdk/                    # @mcplookup-org/mcp-sdk@0.0.1
│   └── src/                    # Shared SDK and utilities
├── mcp-server/                 # @mcplookup-org/mcp-server@0.0.1  
│   └── src/                    # Universal MCP bridge server
├── mcpl-cli/                   # @mcplookup-org/mcpl-cli@0.0.1
│   └── src/                    # Enhanced CLI management tool
├── mcplookup.org/              # mcplookup-registry@0.0.1
│   └── src/                    # Discovery service website & API
├── package.json                # Workspace configuration
└── turbo.json                  # Build orchestration
```

## 🎉 **Monorepo Successfully Created!**

**✅ Git History Preserved** - All commit history from 4 separate repositories merged  
**✅ Workspace Dependencies** - SDK changes immediately available to all packages  
**✅ Build System** - Turborepo orchestrates builds in correct dependency order  
**✅ Type Safety** - Shared types work across all packages  

## ⚡ Quick Start

### Install Dependencies
```bash
npm install
```

### Development
```bash
# Start all projects
npm run dev

# Start specific projects
npm run dev:web      # Next.js web app
npm run dev:sdk      # SDK development
npm run dev:server   # Bridge server
npm run dev:cli      # CLI tool
```

### Building
```bash
# Build everything
npm run build

# Build specific packages
npm run build:sdk    # Just the SDK
```

## 🔧 Development Workflow

### Making Changes to the SDK
1. Edit files in `mcp-sdk/src/`
2. The changes are automatically available to other packages
3. Run `npm run build:sdk` to compile
4. Other packages will use the updated SDK immediately

### Adding Dependencies
```bash
# Add to specific workspace
npm install package-name --workspace=mcp-sdk

# Add to root (shared dev dependencies)
npm install package-name --save-dev
```

### Testing Changes
```bash
# Test everything
npm run test

# Lint everything  
npm run lint

# Type check everything
npm run type-check
```

## 🌟 Key Benefits

✅ **Unified Development** - One repo, one install, all packages  
✅ **Automatic Dependencies** - SDK changes immediately available  
✅ **Coordinated Builds** - Proper dependency order handled by Turborepo  
✅ **Simplified Workflow** - No more sync scripts or version management  
✅ **Type Safety** - Shared types across all packages  

## 📦 Publishing

```bash
# Build and publish all npm packages
npm run publish:packages
```

The web app (`mcplookup.org`) deploys to Vercel independently.

## 🔗 Individual Project Links

- **[mcp-sdk](./mcp-sdk/README.md)** - Shared SDK and utilities
- **[mcp-server](./mcp-server/README.md)** - Universal bridge server  
- **[mcpl-cli](./mcpl-cli/README.md)** - CLI management tool
- **[mcplookup.org](./mcplookup.org/README.md)** - Web app and API

---

**🔥 MCPLookup.org - Making AI tools as discoverable as web pages**
