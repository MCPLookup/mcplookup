# 📚 API Reference

Complete API documentation for the MCP GitHub Parser library.

## Table of Contents

- [Core Classes](#core-classes)
  - [GitHubClient](#githubclient)
  - [AIProvider](#aiprovider)
- [Data Types](#data-types)
- [Progress Types](#progress-types)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Configuration Options](#configuration-options)

## Core Classes

### GitHubClient

The main client for GitHub repository analysis.

```typescript
class GitHubClient {
  constructor(githubToken?: string)
  
  // Core Methods
  search(query: string): Promise<GitHubRepo[]>
  getRepositoryDetails(repoName: string): Promise<GitHubRepository>
  getFullRepositoryData(repo: GitHubRepo | string): Promise<GitHubRepoWithInstallation>
  
  // Progress-Enabled Methods (AsyncGenerator)
  searchRepositoriesWithProgress(query: string, maxResults?: number): AsyncGenerator<SearchProgress, GitHubRepo[], void>
  getFullRepositoryDataWithProgress(repo: GitHubRepo | string): AsyncGenerator<RepoAnalysisProgress | FileDownloadProgress | AIParsingProgress, GitHubRepoWithInstallation, void>
  searchAndParseWithProgress(query: string, maxResults?: number): AsyncGenerator<SearchProgress | RepoAnalysisProgress | FileDownloadProgress | AIParsingProgress, GitHubRepoWithInstallation[], void>
  
  // Configuration
  setAIProvider(provider: AIProvider): void
}
```

#### Constructor

```typescript
new GitHubClient(token?: string)
```

**Parameters:**
- `token` (optional): GitHub API token. If not provided, uses `process.env.GITHUB_TOKEN`

**Example:**
```typescript
const client = new GitHubClient('your_github_token');
// or
const client = new GitHubClient(); // Uses environment variable
```

### AIProvider

Base class for AI analysis providers.

```typescript
class AIProvider {
  analyzeRepository(content: string, repoName: string, repoData: GitHubRepository): Promise<AnalysisResult>
  analyzeRepositoryWithProgress(files: FileContent[], repoName: string, repoData: GitHubRepository): AsyncGenerator<AIParsingProgress, AnalysisResult, void>
}
```

### Methods

#### search(query: string): Promise<GitHubRepo[]>

Search GitHub repositories using the GitHub Search API.

**Parameters:**
- `query`: Search query string (e.g., "mcp server", "claude mcp")

**Returns:** Array of basic repository information

**Example:**
```typescript
const repos = await client.search('mcp server python');
console.log(`Found ${repos.length} repositories`);
```

#### getFullRepositoryData(repo: string | GitHubRepo): Promise<GitHubRepoWithInstallation>

Perform comprehensive analysis of a single repository.

**Parameters:**
- `repo`: Repository name ("owner/repo") or GitHubRepo object

**Returns:** Complete repository analysis with installation methods and AI classification

**Example:**
```typescript
const analysis = await client.getFullRepositoryData('redis/mcp-redis');
console.log(`Classification: ${analysis.computed.mcpClassification}`);
console.log(`Installation methods: ${analysis.installationMethods.length}`);
```

#### getFullRepositoryDataWithProgress(repo: string | GitHubRepo): AsyncGenerator<ProgressUpdate, GitHubRepoWithInstallation>

Perform repository analysis with real-time progress updates.

**Parameters:**
- `repo`: Repository name ("owner/repo") or GitHubRepo object

**Returns:** AsyncGenerator yielding progress updates and final result

**Example:**
```typescript
const generator = client.getFullRepositoryDataWithProgress('owner/repo');

for await (const progress of generator) {
  console.log(`${progress.progress}% - ${progress.message}`);
}

// Get final result
const result = await generator.next();
if (result.done) {
  console.log('Analysis complete:', result.value);
}
```

#### searchAndParse(query: string, maxResults?: number): Promise<GitHubRepoWithInstallation[]>

Search for repositories and analyze multiple results.

**Parameters:**
- `query`: Search query string
- `maxResults` (optional): Maximum number of repositories to analyze (default: 5)

**Returns:** Array of analyzed repositories

**Example:**
```typescript
const results = await client.searchAndParse('mcp server', 3);
results.forEach(repo => {
  console.log(`${repo.repository.fullName}: ${repo.computed.mcpClassification}`);
});
```

#### setAIProvider(provider: AIProvider): void

Set a custom AI provider for parsing installation methods.

**Parameters:**
- `provider`: AIProvider instance

**Example:**
```typescript
import { GeminiJSONParser } from 'mcp-github-parser';

const customProvider = new GeminiJSONParser();
client.setAIProvider(customProvider);
```

#### downloadFile(repo: string | GitHubRepo, path: string): Promise<string>

Download a specific file from a repository.

**Parameters:**
- `repo`: Repository name or GitHubRepo object
- `path`: File path (e.g., "README.md", "package.json")

**Returns:** File content as string

**Example:**
```typescript
const readme = await client.downloadFile('owner/repo', 'README.md');
console.log(readme);
```

## AIProvider

Unified AI provider with fallback chain for parsing installation methods.

### Constructor

```typescript
new AIProvider()
```

Automatically initializes available AI providers based on environment variables.

### Methods

#### parseWithSchema(prompt: string, schema: any, schemaName?: string): Promise<any>

Parse content using AI with JSON schema validation.

**Parameters:**
- `prompt`: Text prompt for the AI
- `schema`: JSON schema for response validation
- `schemaName` (optional): Name for the schema

**Returns:** Parsed JSON response matching the schema

**Example:**
```typescript
const provider = new AIProvider();
const schema = {
  type: "object",
  properties: {
    classification: { type: "string" },
    confidence: { type: "number" }
  }
};

const result = await provider.parseWithSchema(prompt, schema);
```

#### parseJSON(prompt: string): Promise<any>

Simple JSON parsing without schema enforcement.

**Parameters:**
- `prompt`: Text prompt for the AI

**Returns:** Parsed JSON response

#### getProviderStatus(): { [key: string]: boolean }

Get status of available AI providers.

**Returns:** Object with provider availability status

**Example:**
```typescript
const status = provider.getProviderStatus();
console.log('Available providers:', status);
// { gemini: true, openrouter: false, together: true }
```

## Data Types

### GitHubRepository

Basic repository information from GitHub API.

```typescript
interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  htmlUrl: string;
  cloneUrl: string;
  stars: number;
  forks: number;
  watchers?: number;
  size: number;
  language: string | null;
  topics: string[];
  license?: {
    key: string;
    name: string;
    spdxId: string;
  };
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
  hasIssues?: boolean;
  hasWiki?: boolean;
  hasPages?: boolean;
  isMCP?: boolean;
  owner: {
    login: string;
    type: "User" | "Organization";
    avatarUrl: string;
  };
}
```

### GitHubRepoWithInstallation

The complete analysis result for a repository.

```typescript
interface GitHubRepoWithInstallation {
  repository: GitHubRepository;
  files: FileContent[];
  installationMethods: InstallationMethod[];
  computed: {
    mcpClassification: MCPClassification;
    mcpConfidence: number;
    isMcpServer: boolean;
    mcpReasoning: string;
    maturityLevel: 'alpha' | 'beta' | 'stable';
    complexity: 'simple' | 'moderate' | 'complex';
    primaryLanguage: string;
  };
  parsingMetadata: ParsingMetadata;
}
```

### InstallationMethod

Represents a single way to install or configure the MCP server.

```typescript
interface InstallationMethod {
  title: string;
  category: 'setup' | 'configure' | 'run' | 'deploy' | 'test';
  platform: string;
  type: 'installation' | 'configuration' | 'deployment';
  commands: string[];
  description?: string;
  requirements?: string[];
  notes?: string[];
}
```

### MCP Classification Types

```typescript
type MCPClassification = 
  | 'mcp_server'        // Actual usable MCP servers
  | 'mcp_framework'     // Frameworks for building servers
  | 'mcp_sdk'          // Client libraries and SDKs
  | 'mcp_awesome_list' // Curated lists/collections
  | 'mcp_tool'         // Developer tools/utilities
  | 'mcp_example'      // Examples/demos/tutorials
  | 'mcp_template'     // Templates/boilerplates
  | 'not_mcp_related'; // Not MCP-related
```

### FileContent

Downloaded file information.

```typescript
interface FileContent {
  path: string;
  content: string;
  size?: number;
  encoding?: string;
  downloadUrl?: string;
  lastModified?: string;
}
```

### ParsingMetadata

Analysis metadata and statistics.

```typescript
interface ParsingMetadata {
  parsedAt: string;
  sourceFiles?: string[];
  confidence?: number;
  processingTimeMs?: number;
  methodCount: number;
  extractionSuccessful: boolean;
  errors?: string[];
  warnings?: string[];
}
```

## Progress Types

### ProgressUpdate

Base progress update interface.

```typescript
interface ProgressUpdate {
  step: string;
  progress: number;
  message: string;
  timestamp: string;
  repoName?: string;
}
```

### RepoAnalysisProgress

Repository analysis progress.

```typescript
interface RepoAnalysisProgress extends ProgressUpdate {
  step: 'fetching_repo';
  repoName: string;
  stage: 'starting' | 'fetching' | 'complete';
}
```

### FileDownloadProgress

File download progress.

```typescript
interface FileDownloadProgress extends ProgressUpdate {
  step: 'downloading_files';
  repoName: string;
  fileName: string;
  fileIndex: number;
  totalFiles: number;
  downloadedFiles: string[];
  skippedFiles: string[];
}
```

### AIParsingProgress

AI parsing progress.

```typescript
interface AIParsingProgress extends ProgressUpdate {
  step: 'parsing_ai';
  repoName: string;
  provider: string;
  stage: 'preparing' | 'calling_api' | 'parsing_response' | 'validating' | 'complete';
  data?: any;
}
```

## Error Handling

The library provides comprehensive error handling:

### Common Errors

- **GitHub API Rate Limit**: Automatically handled with exponential backoff
- **File Not Found**: Gracefully skipped during file download
- **AI Provider Failures**: Automatic fallback to next provider in chain
- **Invalid JSON Schema**: Detailed validation error messages
- **Network Timeouts**: Configurable timeout settings

### Error Types

```typescript
class GitHubAPIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

class AIProviderError extends Error {
  constructor(message: string, public provider: string) {
    super(message);
  }
}

class SchemaValidationError extends Error {
  constructor(message: string, public schema: any, public data: any) {
    super(message);
  }
}
```

### Error Handling Example

```typescript
try {
  const result = await client.getFullRepositoryData('owner/repo');
} catch (error) {
  if (error instanceof GitHubAPIError) {
    console.error(`GitHub API error (${error.status}):`, error.message);
  } else if (error instanceof AIProviderError) {
    console.error(`AI provider ${error.provider} failed:`, error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Usage Examples

### Basic Repository Analysis

```typescript
import { GitHubClient, AIProvider } from 'mcp-github-parser';

const client = new GitHubClient(process.env.GITHUB_TOKEN);
client.setAIProvider(new AIProvider());

// Analyze single repository
const result = await client.getFullRepositoryData('redis/mcp-redis');
console.log(`Classification: ${result.computed.mcpClassification}`);
console.log(`Methods found: ${result.installationMethods.length}`);
```

### Search and Batch Analysis

```typescript
// Search for repositories
const repos = await client.search('mcp server python');

// Analyze multiple repositories with progress
const generator = client.searchAndParseWithProgress('mcp server', 5);

for await (const progress of generator) {
  console.log(`${progress.progress}% - ${progress.message}`);
}
```

### Progress Tracking

```typescript
const generator = client.getFullRepositoryDataWithProgress('redis/mcp-redis');

while (true) {
  const result = await generator.next();
  
  if (result.done) {
    console.log('Analysis complete:', result.value);
    break;
  } else {
    const progress = result.value;
    
    // Create progress bar
    const percentage = progress.progress;
    const bar = '█'.repeat(Math.floor(percentage / 2)) + 
                '░'.repeat(50 - Math.floor(percentage / 2));
    
    console.log(`[${bar}] ${percentage}% - ${progress.message}`);
    
    // Show additional data
    if (progress.data?.fileCount) {
      console.log(`  Files processed: ${progress.data.fileCount}`);
    }
  }
}
```

### Custom AI Provider

```typescript
class CustomAIProvider extends AIProvider {
  async analyzeRepository(content: string, repoName: string, repoData: GitHubRepository) {
    // Custom AI analysis logic
    return {
      isMCP: true,
      installationMethods: [...],
      mcpClassification: 'mcp_server',
      mcpConfidence: 0.95,
      // ... other fields
    };
  }
}

const client = new GitHubClient();
client.setAIProvider(new CustomAIProvider());
```

### Web Integration

#### Express.js Server-Sent Events

```typescript
import express from 'express';
import { handleGitHubAnalysisWithProgress } from 'mcp-github-parser';

const app = express();

app.get('/analyze/:repo', async (req, res) => {
  await handleGitHubAnalysisWithProgress(req, res);
});
```

#### WebSocket Integration

```typescript
import WebSocket from 'ws';
import { handleGitHubAnalysisWebSocket } from 'mcp-github-parser';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    handleGitHubAnalysisWebSocket(ws, data);
  });
});
```

#### React Frontend Example

```typescript
// React component with SSE
function RepositoryAnalysis({ repoName }: { repoName: string }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/analyze/${repoName}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'progress') {
        setProgress(data.progress);
        setMessage(data.message);
      } else if (data.type === 'complete') {
        setResult(data.result);
        eventSource.close();
      }
    };
    
    return () => eventSource.close();
  }, [repoName]);

  return (
    <div>
      <div>Progress: {progress}%</div>
      <div>{message}</div>
      {result && <RepositoryResult data={result} />}
    </div>
  );
}
```

## Configuration Options

### Environment Variables

```bash
# Required
GITHUB_TOKEN=your_github_token

# AI Providers (at least one recommended)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key

# Optional Settings
MAX_FILES_TO_DOWNLOAD=15        # Default: 15
AI_ANALYSIS_TIMEOUT=30000       # Default: 30 seconds
GITHUB_API_DELAY=1000          # Default: 1 second
MAX_CONCURRENT_REQUESTS=3       # Default: 3
```

### Advanced Configuration

```typescript
const client = new GitHubClient(process.env.GITHUB_TOKEN, {
  maxFilesToDownload: 20,
  aiAnalysisTimeout: 45000,
  githubApiDelay: 500,
  retryAttempts: 3
});
```
