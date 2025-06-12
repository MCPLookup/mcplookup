// Main SDK exports
export * from './types.js';
export * from './generated/api-client.js';
export * from './shared/index.js';

// Unified MCP Server types - USE THESE EVERYWHERE
export {
  MCPServer,
  GitHubRepoWithInstallation,
  StoredServerData,
  QualityMetrics,
  PopularityMetrics,
  InstallationInfo,
  EnvironmentConfig,
  ClaudeIntegration,
  DocumentationInfo,
  ServerCapabilities,
  AvailabilityInfo,
  APIConfiguration,
  SourceInfo,
  PackageInfo,
  VerificationStatus,
  EnvironmentVariable,
  InstallationContext,
  ResolvedPackage
} from './types/generated.js';
export { buildMCPServerFromGitHubRepo } from './shared/github-builder.js';

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
} from './types/installation.js';

export type { InstallationMethod } from './types/generated.js';

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
