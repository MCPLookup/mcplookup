# 🔍 MCP GitHub Parser

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

A powerful, comprehensive tool for **analyzing GitHub repositories** and extracting detailed information about **MCP (Model Context Protocol) servers**, including installation methods, configuration details, and deployment instructions.

## 🎯 **What It Does**

This tool automatically analyzes GitHub repositories to answer critical questions:

- 🔍 **Is this an MCP server?** (8 precise classification types)
- ⚙️ **How do we install it?** (All installation methods)
- 🔧 **How do we configure it?** (Environment variables, config files)
- 🚀 **How do we deploy it?** (Local, Docker, cloud deployment)
- 📋 **What's the Claude Desktop JSON?** (Complete configurations)
- 🛠️ **What tools/resources does it provide?** (MCP capabilities)
- 📊 **How mature/ready is it?** (Production readiness assessment)

## ✨ **Key Features**

### 🚀 **Smart AI Analysis**
- **Comprehensive AI-powered analysis** using multiple LLM providers
- **Progressive enhancement** - starts with basic info, adds AI insights
- **Intelligent classification** of MCP repositories into 8 categories
- **Installation method extraction** with complete setup workflows

### 📊 **Real-Time Progress Reporting**
- **Ultra-smooth progress bars** with user-friendly messages
- **AsyncGenerator-based streaming** for long-running operations
- **Granular progress tracking** through all analysis phases
- **Configurable progress tickers** during AI processing

### 🏗️ **Production-Ready Architecture**
- **TypeScript** with full type safety
- **Modular design** with clean separation of concerns
- **Comprehensive error handling** and retry logic
- **Rate limiting** and GitHub API best practices

## 🛠️ **Installation**

```bash
npm install mcp-github-parser
```

Or for development:

```bash
git clone https://github.com/your-username/mcp-github-parser.git
cd mcp-github-parser
npm install
```

## 📋 **Prerequisites**

1. **GitHub Token** (for API access):
   ```bash
   export GITHUB_TOKEN="your_github_token_here"
   ```

2. **AI Provider API Key** (optional, for enhanced analysis):
   ```bash
   export OPENAI_API_KEY="your_openai_key"
   # OR
   export GEMINI_API_KEY="your_gemini_key"
   ```

## 🚀 **Quick Start**

### **Basic Usage**

```typescript
import { GitHubClient, AIProvider } from 'mcp-github-parser';

const client = new GitHubClient(process.env.GITHUB_TOKEN);
client.setAIProvider(new AIProvider());

// Analyze a single repository
const result = await client.getFullRepositoryData('redis/mcp-redis');

console.log(`Found ${result.installationMethods.length} installation methods`);
console.log(`MCP Classification: ${result.computed.mcpClassification}`);
console.log(`Confidence: ${result.computed.mcpConfidence}`);
```

### **Search and Analyze Multiple Repositories**

```typescript
// Search for MCP servers and analyze top results
const results = await client.searchAndParse('mcp server python', 5);

results.forEach(repo => {
  console.log(`${repo.repository.fullName}: ${repo.installationMethods.length} methods`);
});
```

### **Real-Time Progress Reporting**

```typescript
// Get real-time progress updates during analysis
const generator = client.getFullRepositoryDataWithProgress('modelcontextprotocol/servers');

for await (const progress of generator) {
  console.log(`${progress.progress}% - ${progress.message}`);
}

// Get final result
const result = await generator.next();
if (result.done) {
  console.log('Analysis complete!', result.value);
}
```

## 📊 **Analysis Results**

The parser returns comprehensive data about each repository:

```typescript
interface GitHubRepoWithInstallation {
  repository: {
    fullName: string;
    description: string;
    stars: number;
    language: string;
    // ... more GitHub data
  };
  
  installationMethods: InstallationMethod[];  // All ways to install/use
  
  computed: {
    mcpClassification: 'mcp_server' | 'mcp_framework' | 'not_mcp_related' | ...;
    mcpConfidence: number;          // 0.0 - 1.0
    isMcpServer: boolean;
    mcpReasoning: string;           // AI explanation
    maturityLevel: string;          // alpha, beta, stable
    complexity: string;             // simple, moderate, complex
    primaryLanguage: string;
  };
  
  files: FileContent[];             // Downloaded key files
  parsingMetadata: ParsingMetadata; // Analysis metadata
}
```

## 🎯 **MCP Classification Types**

The parser intelligently classifies repositories into these categories:

| Classification | Description | Examples |
|---------------|-------------|----------|
| `mcp_server` | Actual usable MCP servers | `redis/mcp-redis`, `anthropics/mcp-weather` |
| `mcp_framework` | Frameworks for building servers | MCP SDKs and libraries |
| `mcp_sdk` | Client libraries and SDKs | Language-specific MCP clients |
| `mcp_awesome_list` | Curated lists/collections | Awesome MCP lists |
| `mcp_tool` | Developer tools/utilities | MCP development tools |
| `mcp_example` | Examples/demos/tutorials | Learning resources |
| `mcp_template` | Templates/boilerplates | Starter templates |
| `not_mcp_related` | Not MCP-related | Regular repositories |

## 📚 **Documentation**

- **[API Reference](./API.md)** - Complete API documentation
- **[Architecture Guide](./ARCHITECTURE.md)** - System design and components
- **[Configuration Guide](./CONFIGURATION.md)** - Setup and configuration options
- **[Examples & Tutorials](./EXAMPLES.md)** - Comprehensive usage examples
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🧪 **Examples**

Run the included examples:

```bash
# Basic usage example
npm run example:basic

# Enhanced progress demo
npm run example:progress

# Batch analysis demo
npm run example:batch
```

## 🏗️ **Architecture**

```
src/
├── index.ts                 # Main entry point
├── github-client.ts         # Core GitHub client
├── types.ts                 # Core type definitions
├── parsers/                 # AI providers and parsers
│   ├── ai-provider.ts
│   ├── gemini-json-parser.ts
│   └── ...
├── types/
│   └── progress.ts          # Progress tracking types
├── schemas/
│   └── github-repo-schema.ts # Data schemas
├── prompts/
│   └── mcp-analysis-prompt.ts # AI prompts
└── api/
    └── github-analysis-handlers.ts # Web API handlers
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## 📄 **License**

MIT License - see LICENSE file for details.

## 🆘 **Support**

- 📖 Check the [Enhanced Analysis Guide](../ENHANCED_ANALYSIS.md)
- 🐛 [Report Issues](https://github.com/your-username/mcp-github-parser/issues)
- 💬 [Discussions](https://github.com/your-username/mcp-github-parser/discussions)

---

**Built with ❤️ for the MCP Community**
