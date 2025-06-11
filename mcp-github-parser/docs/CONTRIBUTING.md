# Contributing to MCP GitHub Parser

Thank you for your interest in contributing to MCP GitHub Parser! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information**:
   - Operating system and Node.js version
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Console output or error messages
   - Sample repository that demonstrates the issue

### Suggesting Features

1. **Check existing feature requests** to avoid duplicates
2. **Use the feature request template**
3. **Explain the use case** and why it would be valuable
4. **Provide examples** of how the feature would be used

### Submitting Pull Requests

1. **Fork the repository** and create a feature branch
2. **Follow the coding standards** (see below)
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Test your changes** thoroughly
6. **Submit a clear pull request** with description

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub token for API access
- AI provider API key (OpenAI, Gemini, or OpenRouter)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/mcp-github-parser.git
   cd mcp-github-parser
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run examples**:
   ```bash
   npm run example:basic
   npm run example:progress
   npm run example:batch
   ```

### Project Structure

```
src/
├── index.ts                 # Main entry point and exports
├── github-client.ts         # Core GitHub client class
├── types.ts                 # Core type definitions
├── parsers/                 # AI providers and parsing logic
│   ├── ai-provider.ts       # Base AI provider class
│   ├── gemini-json-parser.ts # Gemini-specific implementation
│   └── ...
├── types/
│   └── progress.ts          # Progress tracking interfaces
├── schemas/
│   └── github-repo-schema.ts # JSON schemas for data validation
├── prompts/
│   └── mcp-analysis-prompt.ts # AI prompt templates
└── api/
    └── github-analysis-handlers.ts # Web API handlers
```

## 📝 Coding Standards

### TypeScript Guidelines

- **Use strict TypeScript**: Enable all strict mode options
- **Explicit types**: Prefer explicit type annotations over `any`
- **Interfaces over types**: Use interfaces for object shapes
- **Proper exports**: Use named exports, avoid default exports
- **Documentation**: Add JSDoc comments for public APIs

### Code Style

- **Formatting**: Use Prettier with default settings
- **Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Comments**: Write clear, concise comments for complex logic
- **Error handling**: Always handle errors gracefully
- **Async/await**: Prefer async/await over Promises

### Example Code Style

```typescript
/**
 * Analyzes a GitHub repository for MCP server information
 * @param repoName - Full repository name (e.g., 'owner/repo')
 * @param options - Analysis configuration options
 * @returns Promise resolving to analysis result
 */
export async function analyzeRepository(
  repoName: string, 
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  try {
    // Implementation here
  } catch (error) {
    throw new Error(`Failed to analyze repository ${repoName}: ${error.message}`);
  }
}
```

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- **Test all public APIs**: Every public function should have tests
- **Test error cases**: Include negative test cases
- **Mock external APIs**: Don't make real API calls in tests
- **Clear test names**: Use descriptive test names

### Example Test

```typescript
describe('GitHubClient', () => {
  it('should classify MCP servers correctly', async () => {
    const client = new GitHubClient();
    const result = await client.getFullRepositoryData('redis/mcp-redis');
    
    expect(result.computed.mcpClassification).toBe('mcp_server');
    expect(result.computed.isMcpServer).toBe(true);
    expect(result.installationMethods.length).toBeGreaterThan(0);
  });
});
```

## 📊 Adding New AI Providers

To add support for a new AI provider:

1. **Create provider class** extending `AIProvider`:
   ```typescript
   export class CustomAIProvider extends AIProvider {
     async analyzeRepository(content: string, repoName: string, repoData: GitHubRepository) {
       // Implementation
     }
   }
   ```

2. **Add progress support**:
   ```typescript
   async *analyzeRepositoryWithProgress(files: FileContent[], repoName: string, repoData: GitHubRepository) {
     // Yield progress updates
     // Return final result
   }
   ```

3. **Export from index.ts**:
   ```typescript
   export { CustomAIProvider } from './parsers/custom-ai-provider.js';
   ```

4. **Add example usage** in examples directory

5. **Update documentation** in README and API docs

## 🔄 Progress Reporting Guidelines

When adding new operations with progress reporting:

1. **Use consistent progress ranges**: 0-100%
2. **Provide meaningful messages**: User-friendly, not technical
3. **Include relevant data**: File counts, processing times, etc.
4. **Handle edge cases**: Empty repositories, API failures, etc.

### Progress Update Structure

```typescript
interface ProgressUpdate {
  step: string;           // Technical step name
  progress: number;       // 0-100
  message: string;        // User-friendly message
  timestamp: string;      // ISO timestamp
  data?: any;            // Additional context data
}
```

## 📚 Documentation

### README Updates

- Keep examples current and working
- Update feature lists when adding functionality
- Include performance considerations
- Add troubleshooting sections as needed

### API Documentation

- Document all public interfaces
- Include usage examples
- Specify parameter types and return values
- Document error conditions

### Code Comments

- Explain complex algorithms
- Document non-obvious business logic
- Include links to relevant external documentation
- Keep comments up-to-date with code changes

## 🐛 Debugging

### Common Issues

1. **GitHub API rate limiting**: Use proper delays and tokens
2. **AI provider timeouts**: Implement proper timeout handling
3. **Memory usage**: Monitor for large repository analysis
4. **Progress reporting**: Ensure generators are properly consumed

### Debug Mode

Enable debug logging:

```bash
DEBUG=mcp-github-parser:* npm run example:basic
```

## 📋 Release Process

1. **Update version** in package.json
2. **Update CHANGELOG.md** with new features
3. **Test thoroughly** with all examples
4. **Create GitHub release** with release notes
5. **Publish to npm** (if applicable)

## 🆘 Getting Help

- **Check existing issues** and documentation first
- **Join discussions** in GitHub Discussions
- **Ask questions** in issues with the "question" label
- **Provide context** when asking for help

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MCP GitHub Parser! 🎉
