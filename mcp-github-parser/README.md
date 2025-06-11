# 🔍 MCP GitHub Parser

A powerful, comprehensive tool for analyzing GitHub repositories and extracting detailed information about **MCP (Model Context Protocol) servers**.

## 🎯 What It Does

- 🔍 **Classify repositories** into 8 MCP-related categories
- ⚙️ **Extract installation methods** automatically 
- 🚀 **Real-time progress reporting** with smooth UX
- 📊 **AI-powered analysis** with multiple providers
- 🏗️ **Production-ready** TypeScript architecture

## 🚀 Quick Start

```typescript
import { GitHubClient, AIProvider } from 'mcp-github-parser';

const client = new GitHubClient(process.env.GITHUB_TOKEN);
client.setAIProvider(new AIProvider());

// Analyze any repository
const result = await client.getFullRepositoryData('redis/mcp-redis');
console.log(`Classification: ${result.computed.mcpClassification}`);
console.log(`Found ${result.installationMethods.length} installation methods`);
```

## 🧪 Try the Examples

```bash
npm install
npm run example:basic     # Simple analysis
npm run example:progress  # With progress tracking  
npm run example:batch     # Multiple repositories
```

## 📚 Documentation

- **[Getting Started](./docs/README.md)** - Complete setup guide
- **[API Reference](./docs/API.md)** - Full API documentation
- **[Examples](./docs/EXAMPLES.md)** - Comprehensive tutorials
- **[Configuration](./docs/CONFIGURATION.md)** - Setup and options
- **[Architecture](./docs/ARCHITECTURE.md)** - System design
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues

## 🤝 Contributing

See [Contributing Guide](./docs/CONTRIBUTING.md) for development setup and guidelines.

## 📄 License

MIT License - Built with ❤️ for the MCP Community
