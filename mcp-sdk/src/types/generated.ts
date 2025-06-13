// AUTO-GENERATED UNIFIED TYPES
// This file is auto-generated from OpenAPI spec - DO NOT EDIT MANUALLY
// Generated on: 2025-06-13T20:06:29.119Z
// Source: OpenAPI specification at spec/openapi-v1.yaml

import { components } from '../generated/api-types.js';

// === PRIMARY UNIFIED TYPES (Generated from OpenAPI) ===

/**
 * Complete MCP Server Record - THE SINGLE TYPE to use everywhere
 * Replaces: MCPServerRecord, GitHubRepoAnalysis, all custom transformations
 */
export type MCPServer = components['schemas']['MCPServer'];

/**
 * Installation Method - unified across all sources
 */
export type InstallationMethod = components['schemas']['InstallationMethod'];

/**
 * Environment Variable definition
 */
export type EnvironmentVariable = components['schemas']['EnvironmentVariable'];

// === QUALITY & METRICS (Generated) ===
export type QualityMetrics = components['schemas']['QualityMetrics'];
export type PopularityMetrics = components['schemas']['PopularityMetrics'];

// === INSTALLATION (Generated) ===
export type InstallationInfo = components['schemas']['InstallationInfo'];
export type EnvironmentConfig = components['schemas']['EnvironmentConfig'];

// === INTEGRATIONS (Generated) ===
export type ClaudeIntegration = components['schemas']['ClaudeIntegration'];

// === METADATA (Generated) ===
export type DocumentationInfo = components['schemas']['DocumentationInfo'];
export type ServerCapabilities = components['schemas']['ServerCapabilities'];
export type AvailabilityInfo = components['schemas']['AvailabilityInfo'];
export type APIConfiguration = components['schemas']['APIConfiguration'];
export type SourceInfo = components['schemas']['SourceInfo'];
export type PackageInfo = components['schemas']['PackageInfo'];
export type VerificationStatus = components['schemas']['VerificationStatus'];

// === GITHUB & PARSING TYPES (Generated) ===
export type GitHubRepository = components['schemas']['GitHubRepository'];
export type FileContent = components['schemas']['FileContent'];
export type ComputedMetrics = components['schemas']['ComputedMetrics'];
export type ParsingMetadata = components['schemas']['ParsingMetadata'];
export type GitHubRepoWithInstallation = components['schemas']['GitHubRepoWithInstallation'];

// === OTHER AVAILABLE TYPES ===
export type CodeExample = components['schemas']['CodeExample'];
export type AuthConfiguration = components['schemas']['AuthConfiguration'];
export type StoredServerData = components['schemas']['StoredServerData'];

// === UTILITY TYPES (SDK-specific, not generated) ===

/**
 * Installation context for SDK utilities
 */
export interface InstallationContext {
  mode: 'direct' | 'bridge';
  platform: 'linux' | 'darwin' | 'win32';
  globalInstall?: boolean;
  client: string;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Resolved package from SDK resolution
 */
export interface ResolvedPackage {
  packageName: string;
  displayName: string;
  description?: string;
  type: 'npm' | 'python' | 'docker' | 'git';
  source: 'direct' | 'smart_search' | 'registry_search';
  verified?: boolean;
  repositoryUrl?: string;
  version?: string;
  installation?: any;
  claude_integration?: any;
}

// === STORAGE TYPES ===
// Note: StoredServerData is now imported from generated schema above

// === TRANSFORMATION ELIMINATION ===

/**
 * @deprecated Use MCPServer directly from OpenAPI schema
 * This type exists only for backward compatibility during migration
 */
export type MCPServerRecord = MCPServer;

/**
 * @deprecated Use MCPServer directly - no more GitHubRepoAnalysis needed
 * All analysis data is embedded in the MCPServer type
 */
export interface GitHubRepoAnalysis {
  // This type should be eliminated - data flows directly to MCPServer
}

// === RE-EXPORTS FOR CONVENIENCE ===
export type { components } from '../generated/api-types.js';
export type { paths } from '../generated/api-types.js';
