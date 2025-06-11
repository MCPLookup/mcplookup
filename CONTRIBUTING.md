# Contributing to MCPLookup

Welcome to the MCPLookup ecosystem! We're excited that you want to contribute to making AI tools as discoverable as web pages.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git

### Development Setup
```bash
# Clone the repository
git clone https://github.com/MCPLookup/mcplookup.git
cd mcplookup

# Install dependencies
npm install

# Start development
npm run dev
```

## 📁 Project Structure

This is a monorepo containing:

- **`mcp-sdk/`** - Shared SDK and utilities
- **`mcp-server/`** - Universal MCP bridge server  
- **`mcpl-cli/`** - CLI management tool
- **`mcplookup.org/`** - Web application and API

## 🔄 Development Workflow

### Making Changes
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test your changes: `npm run test`
4. Build to ensure everything works: `npm run build`
5. Commit with a descriptive message
6. Push and create a pull request

### Working with the SDK
The SDK is the foundation for all other packages. When you make changes:

```bash
# Build the SDK
npm run build:sdk

# Changes are immediately available to other packages
npm run dev:web  # Uses the updated SDK
```

### Package-specific Development
```bash
# Work on specific packages
npm run dev:web     # Next.js web app
npm run dev:server  # Bridge server
npm run dev:cli     # CLI tool
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📝 Commit Message Guidelines

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Maintenance tasks

Example: `feat: add server discovery endpoint`

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Description** - Clear description of the problem
2. **Steps to Reproduce** - Detailed steps to reproduce the issue
3. **Expected Behavior** - What you expected to happen
4. **Actual Behavior** - What actually happened
5. **Environment** - OS, Node version, package versions

## 🚢 Release Process

Releases are coordinated across all packages:

1. All packages use the same version number
2. Version bumps happen simultaneously
3. Publishing is automated via GitHub Actions

## 💡 Feature Requests

We love feature requests! Please:

1. Check existing issues first
2. Describe the use case
3. Explain how it fits the MCPLookup mission
4. Consider implementation approach

## 🏗️ Architecture Guidelines

- **Modularity** - Keep packages focused and independent
- **Type Safety** - Use TypeScript throughout
- **Testing** - Write tests for new functionality
- **Documentation** - Update docs with your changes

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

Be respectful, collaborative, and constructive. We're building the future of AI tool discovery together!

---

**Questions?** Open an issue or join our discussions!
