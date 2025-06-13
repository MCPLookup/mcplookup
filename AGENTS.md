# 🤖 AI Agent Guidelines for MCPLookup.org

> **Critical Reference**: Read this ENTIRELY before making any changes to prevent build failures and maintain code quality.

## 🚨 **Common Issues & How to Avoid Them**

### **1. Type Generation Pipeline Issues** 
**❌ Problem**: "Module has no exported member" errors
**✅ Solution**: Always run type generation first:
```bash
cd mcp-sdk && npm run generate-all && npm run build
```

### **2. Duplicate Type Definitions**
**❌ Problem**: Multiple definitions of the same type across packages
**✅ Solution**: Use ONLY generated types from `@mcplookup-org/mcp-sdk`

### **3. Import Path Confusion**
**❌ Problem**: Importing from wrong paths or missing dependencies
**✅ Solution**: Follow the import hierarchy (see below)

---

## 📁 **Project Architecture**

### **Monorepo Structure**
```
mcplookup/
├── mcp-sdk/                    # 🏗️ FOUNDATION - All shared types & utilities
├── mcp-server/                 # 🌉 Universal MCP bridge server
├── mcpl-cli/                   # 🖥️ CLI management tool
├── mcp-github-parser/          # 🔍 GitHub repository analysis
├── mcplookup.org/              # 🌐 Discovery service website & API
├── package.json                # Root workspace config
└── turbo.json                  # Build orchestration
```

### **Dependency Flow** (CRITICAL)
```
mcplookup.org     mcp-server     mcpl-cli     mcp-github-parser
      ↓               ↓             ↓              ↓
                    mcp-sdk (FOUNDATION)
                       ↓
              OpenAPI Schema Generation
```

---

## 🏗️ **Type System Rules** (MUST FOLLOW)

### **1. Single Source of Truth**
- **ALL types** come from `@mcplookup-org/mcp-sdk`
- **NEVER** create duplicate type definitions
- **ALWAYS** import from SDK, not relative paths

### **2. Type Generation Pipeline**
```bash
# 1. Generate OpenAPI types from schema
cd mcp-sdk && npm run generate-client

# 2. Generate unified types from OpenAPI
node scripts/generate-unified-types.js

# 3. Build SDK with new types
npm run build

# 4. Test dependent packages
cd ../mcp-server && npm run build
```

### **3. Import Hierarchy** (FOLLOW EXACTLY)
```typescript
// ✅ CORRECT - Use SDK types
import { MCPServer, InstallationMethod } from '@mcplookup-org/mcp-sdk';

// ❌ WRONG - Don't create local types
interface MCPServer { ... }  // This will cause conflicts!

// ❌ WRONG - Don't import from internal paths
import { MCPServer } from '../types/generated.js';
```

---

## 🛠️ **Development Workflow**

### **Before Making Changes**
1. **Check build status**: `npm run build`
2. **Understand the change scope**: Which packages are affected?
3. **Read this document**: Especially if touching types or schemas

### **Making Changes**
1. **Schema changes**: Update OpenAPI YAML first, then regenerate
2. **Type changes**: Use generated types, don't create duplicates
3. **Utility changes**: Add to SDK, export properly
4. **Test incrementally**: Build packages one by one

### **Before Committing**
```bash
# Full build test
npm run build

# Type checking
npm run type-check

# Individual package tests
npm run build:sdk
npm run build:parser
cd mcp-server && npm run build
```

---

## 📊 **Package-Specific Guidelines**

### **mcp-sdk** (FOUNDATION PACKAGE)
- **Purpose**: Shared types, utilities, API client
- **Critical files**:
  - `src/index.ts` - Main exports (be very careful here!)
  - `src/types/generated.ts` - Auto-generated from OpenAPI
  - `spec/schemas/*.yaml` - Schema definitions
- **Rules**:
  - NEVER edit `generated.ts` manually
  - Export utilities from `shared/` carefully to avoid circular deps
  - Test builds after any change

### **mcp-server** (BRIDGE SERVER)
- **Dependencies**: Heavy user of SDK utilities
- **Common imports**:
  ```typescript
  import {
    createSuccessResult,
    createErrorResult,
    InstallationResolver,
    validateInstallOptions
  } from '@mcplookup-org/mcp-sdk';
  ```
- **Rules**: Don't implement utilities locally, use SDK

### **mcp-github-parser** (ANALYSIS ENGINE)
- **Dependencies**: Uses SDK for type definitions
- **Key function**: `buildMCPServerFromGitHubRepo` from SDK
- **Rules**: Output must conform to SDK's `MCPServer` type

### **mcplookup.org** (WEB APPLICATION)
- **Dependencies**: Uses SDK for API client and types
- **Rules**: 
  - Use generated API client for discovery calls
  - Don't duplicate type definitions
  - Keep service files focused and avoid duplicates

---

## 🧹 **Code Quality Standards**

### **File Naming Conventions**
- **Services**: `service-name.ts` (not `serviceName.ts`)
- **Types**: Use generated types, avoid manual `types/` files
- **Tests**: `*.test.ts` or `*.spec.ts`
- **Configs**: `*.config.ts` or `*.config.js`

### **Import Organization**
```typescript
// 1. Node.js built-ins
import { readFile } from 'node:fs/promises';

// 2. External packages
import { z } from 'zod';

// 3. Internal packages (SDK)
import { MCPServer, createSuccessResult } from '@mcplookup-org/mcp-sdk';

// 4. Relative imports
import { LocalUtility } from './utils.js';
```

### **Documentation Standards**
- **Functions**: JSDoc comments for exported functions
- **Complex types**: Comments explaining purpose
- **Breaking changes**: Update CHANGELOG.md
- **New features**: Update README.md

---

## 🚨 **Anti-Patterns to Avoid**

### **❌ Type System Violations**
```typescript
// DON'T - Duplicate type definitions
interface MCPServer {
  id: string;
  // ... duplicating SDK types
}

// DON'T - Multiple sources of truth
export type { MCPServer } from './local-types.js';
export type { MCPServer } from '@mcplookup-org/mcp-sdk'; // Conflict!
```

### **❌ Build System Issues**
```bash
# DON'T - Build without generating types first
npm run build  # This will fail if types are stale!

# DON'T - Ignore type errors
# "I'll fix the types later" leads to broken builds
```

### **❌ File Organization Issues**
```
# DON'T - Create redundant files
src/services/discovery.ts
src/services/discovery-old.ts        # Delete old versions!
src/services/discovery-simplified.ts # Don't keep iterations!
src/services/unified-discovery.ts    # Pick ONE implementation!
```

---

## 🔧 **Troubleshooting Guide**

### **"Module has no exported member" Errors**
1. Check if types were generated: `ls mcp-sdk/src/types/generated.ts`
2. Regenerate if missing: `cd mcp-sdk && npm run generate-all`
3. Rebuild SDK: `npm run build:sdk`
4. Check exports in `mcp-sdk/src/index.ts`

### **"Cannot find module" Errors**
1. Check package dependencies: `npm ls`
2. Reinstall if needed: `npm install`
3. Check import paths match exports exactly

### **Build Failures**
1. Clean build: `npm run clean && npm run build`
2. Check for circular dependencies
3. Verify all packages build individually

### **Type Conflicts**
1. Check for duplicate type exports
2. Use `grep -r "export.*TypeName"` to find duplicates
3. Remove duplicates, use SDK version only

---

## 📋 **Checklists**

### **Adding New Types**
- [ ] Add to OpenAPI schema (`mcp-sdk/spec/schemas/`)
- [ ] Regenerate types (`npm run generate-all`)
- [ ] Export from SDK if needed
- [ ] Test dependent packages
- [ ] Update documentation

### **Adding New Utilities**
- [ ] Add to appropriate `mcp-sdk/src/shared/` file
- [ ] Export from `mcp-sdk/src/index.ts`
- [ ] Add JSDoc comments
- [ ] Test in dependent packages
- [ ] Update README if public API

### **Refactoring**
- [ ] Understand current architecture
- [ ] Plan change scope (which packages affected?)
- [ ] Make changes incrementally
- [ ] Test builds frequently
- [ ] Remove old code completely (don't leave cruft!)

---

## 🎯 **Success Metrics**

**A successful change should result in:**
- ✅ All packages build without errors
- ✅ No duplicate type definitions
- ✅ Clean git status (no untracked cruft files)
- ✅ Improved or maintained test coverage
- ✅ Clear, descriptive commit messages

**Red flags indicating problems:**
- 🚨 Type errors in multiple packages
- 🚨 Circular dependency warnings
- 🚨 Multiple files with similar names
- 🚨 Build cache misses for unchanged code
- 🚨 Large numbers of modified files for simple changes

---

## 📞 **When in Doubt**

1. **Check the build**: `npm run build`
2. **Check the types**: Look at `mcp-sdk/src/types/generated.ts`
3. **Check the exports**: Look at `mcp-sdk/src/index.ts`
4. **Start simple**: Make minimal changes and test frequently
5. **Follow the patterns**: Look at existing working code

**Remember**: This is a type-safe, well-architected monorepo. Work WITH the system, not against it!

---

*Last updated: June 13, 2025 - After major cleanup and type system consolidation*
