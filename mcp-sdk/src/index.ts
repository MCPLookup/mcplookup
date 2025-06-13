// Main SDK exports
export * from './types.js';
export * from './generated/api-client.js';

// Working shared utilities
export {
  createSuccessResult,
  createErrorResult,
  executeWithErrorHandling,
  sanitizeIdentifier
} from './shared/response-utils.js';

export {
  readJsonFile,
  writeJsonFile,
  updateJsonFile,
  fileExists
} from './shared/config-utils.js';

export {
  validateInstallOptions,
  ValidationResult
} from './shared/validation-utils.js';

// Installation utilities
export { InstallationResolver } from './shared/installation-utils.js';

// Installation types (export from generated.ts)
export type { InstallationContext, ResolvedPackage } from './types/generated.js';

// Direct export of needed function for GitHub parser
export { buildMCPServerFromGitHubRepo } from './shared/github-builder.js';

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
