# 📚 API Reference

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

### AIProvider

Base class for AI analysis providers.

```typescript
class AIProvider {
  analyzeRepository(content: string, repoName: string, repoData: GitHubRepository): Promise<AnalysisResult>
  analyzeRepositoryWithProgress(files: FileContent[], repoName: string, repoData: GitHubRepository): AsyncGenerator<AIParsingProgress, AnalysisResult, void>
}
```

## Data Types

### GitHubRepoWithInstallation

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

### Progress Types

```typescript
interface ProgressUpdate {
  step: string;
  progress: number; // 0-100
  message: string;
  timestamp: string;
  data?: any;
}

interface SearchProgress extends ProgressUpdate {
  currentRepo?: string;
  totalRepos: number;
  completedRepos: number;
  failedRepos: string[];
}

interface AIParsingProgress extends ProgressUpdate {
  repoName: string;
  provider: string;
  stage: 'preparing' | 'calling_api' | 'parsing_response' | 'validating' | 'complete';
  tokenCount?: number;
  methodsFound?: number;
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

## Error Handling

```typescript
try {
  const result = await client.getFullRepositoryData('invalid/repo');
} catch (error) {
  if (error.message.includes('GitHub API error: 404')) {
    console.log('Repository not found');
  } else if (error.message.includes('Rate limit')) {
    console.log('GitHub API rate limit exceeded');
  } else {
    console.error('Analysis failed:', error);
  }
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
