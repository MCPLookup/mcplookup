# Repository Guidelines

## Development Workflow
- Install dependencies with `npm install` at repo root.
- Validate builds using `npm run type-check` before committing.
- Type-check uses `tsc` across all packages via `turbo`.

## Type System
- The `mcp-sdk` package provides **all** shared types.
- Import types from `@mcplookup-org/mcp-sdk` and avoid custom duplicates.
- When SDK types are incomplete, cast to `any` rather than redefining.

## Coding Style
- Use optional chaining for fields that may be missing.
- Prefer explicit imports over `export type {...} from` when the same types are used locally.
- Keep scripts and tests out of type checking; they are excluded via `tsconfig.typecheck.json`.

## Commit Messages
- Summarize changes succinctly and mention affected packages when relevant.
