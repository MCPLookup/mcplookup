// Main SDK exports
export * from './types.js';
export * from './generated/api-client.js';
// export * from './shared/index.js'; // Temporarily disabled while fixing types

// Unified MCP Server types - USE THESE EVERYWHERE
export {
  MCPServer,
  GitHubRepoWithInstallation,
  transformGitHubRepoToMCPServer,
  StoredServerData,
  // All component types
  MCPServerQuality,
  MCPServerPopularity,
  MCPServerCapabilities,
  MCPServerAvailability,
  MCPServerAPI,
  MCPServerInstallation,
  MCPServerEnvironment,
  MCPServerDocumentation,
  MCPServerSource,
  MCPServerVerification,
  PackageInfo,
  EnvironmentVariable,
  ClaudeDesktopConfig,
  CodeExample
} from './types/mcp-server.js';

// GitHub and installation types (specific exports to avoid conflicts)
export type {
  GitHubRepository,
  GitHubRepo,
  FileContent,
  GitHubSearchResult,
  RepositoryAnalysisOptions
} from './types/github-repository.js';

export type {
  InstallationType,
  InstallationCategory,
  InstallationSubtype,
  InstallationPlatform,
  TransportType,
  MCPConfig,
  InstallationEndpoint,
  InstallationMethod
} from './types/installation.js';

export type {
  MCPClassification,
  ComplexityLevel,
  DifficultyLevel,
  MaturityLevel,
  ComputedMetrics,
  AIProviderType,
  ParsingMetadata
} from './types/mcp-classification.js';

export type {
  ProgressUpdate,
  FileDownloadProgress,
  AIParsingProgress,
  RepoAnalysisProgress,
  SearchProgress,
  ProgressResult,
  ProgressCallback,
  ProgressOptions
} from './types/progress.js';

// JSON Schemas for AI providers
export * from './schemas/index.js';
