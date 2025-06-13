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

// Key types re-exported from generated schema
export type {
  MCPServer,
  GitHubRepoWithInstallation,
  StoredServerData,
  InstallationMethod,
  GitHubRepository,
  FileContent,
  ComputedMetrics,
  ParsingMetadata
} from './types/generated.js';

// Additional types from individual modules (non-duplicated)
export type {
  MCPClassification,
  ComplexityLevel,
  DifficultyLevel,
  MaturityLevel,
  AIProviderType
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
