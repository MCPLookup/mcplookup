/**
 * MCP GitHub Parser - Main Entry Point
 * 
 * A comprehensive tool for analyzing GitHub repositories and extracting
 * MCP (Model Context Protocol) server information, installation methods,
 * and configuration details.
 */

// Core Client
export { GitHubClient } from './github-client.js';

// AI Providers
export { AIProvider } from './parsers/ai-provider.js';
export { GeminiJSONParser } from './parsers/gemini-json-parser.js';

// Types - now using SDK types as source of truth
export type { GitHubRepo } from './types.js'; // Legacy compatibility only

// Re-export all types from SDK
export type {
  GitHubRepository,
  GitHubRepoWithInstallation,
  InstallationMethod,
  FileContent,
  ParsingMetadata,
  ProgressUpdate,
  SearchProgress,
  RepoAnalysisProgress,
  FileDownloadProgress,
  AIParsingProgress,
  MCPClassification,
  ComputedMetrics,
  MCPServer,
  buildMCPServerFromGitHubRepo
} from '@mcplookup-org/mcp-sdk';

// Schemas
// export { GITHUB_REPO_SCHEMA } from './schemas/github-repo-schema.js';

// API Handlers (for web applications)
export {
  handleGitHubAnalysisWithProgress,
  handleGitHubAnalysisWithCallback,
  handleGitHubAnalysisWebSocket
} from './api/github-analysis-handlers.js';
