// AUTO-GENERATED UNIFIED TYPES
// This file is auto-generated from OpenAPI spec - DO NOT EDIT MANUALLY
// Run: npm run generate-unified-types

import { components } from '../generated/api-types.js';
import type { GitHubRepository, FileContent } from './github-repository.js';
import type { ComputedMetrics, ParsingMetadata } from './mcp-classification.js';

// === PRIMARY UNIFIED TYPES (Use these everywhere) ===

/**
 * Complete MCP Server Record - use this EVERYWHERE
 * Replaces: MCPServerRecord, GitHubRepoAnalysis, all custom types
 */
export interface MCPServer {
  // Core Identity
  id: string;                           // "github.com/owner/repo"
  domain: string;                       // Same as id for compatibility
  name: string;
  description: string;
  tagline?: string;                    // One-line summary
  category?: 'development' | 'data' | 'communication' | 'api-integration' | 'utility' | 'other';
  subcategories?: string[];
  tags?: string[];
  use_cases?: string[];
  endpoint?: string;                    // Optional live endpoint

  // GitHub Repository Data (complete)
  repository: GitHubRepository;
  files?: FileContent[];

  // AI Analysis & Classification (rich data)
  computed?: ComputedMetrics;
  parsingMetadata?: ParsingMetadata;

  // Installation Methods (complete)
  installationMethods: InstallationMethod[];
  packages: PackageInfo[];

  // Capabilities & Categories
  capabilities: ServerCapabilities;
  
  // Quality & Trust
  quality: QualityMetrics;
  popularity: PopularityMetrics;
  trust_score: number;
  verification_status: 'verified' | 'unverified' | 'pending' | 'rejected';

  // Availability
  availability: AvailabilityInfo;

  // Metadata
  created_at: string;
  updated_at: string;
  maintainer?: {
    name: string;
    url: string;
  };
}

/**
 * GitHub Repository with Installation Analysis
 * Direct output from mcp-github-parser - use as-is
 */
export interface GitHubRepoWithInstallation {
  repository: GitHubRepository;
  files?: FileContent[];
  installationMethods: InstallationMethod[];
  parsingMetadata: ParsingMetadata;
  computed?: ComputedMetrics;
}

/**
 * Storage format for complete server data
 */
export interface StoredServerData {
  server: MCPServer;
  metadata: {
    discoveredAt: string;
    lastAnalyzed: string;
    sourceQuery?: string;
    registrationSource: 'github_auto' | 'manual' | 'api';
  };
  original?: {
    githubRepo: GitHubRepoWithInstallation;
    parserVersion: string;
  };
}

// === GENERATED API TYPES (for compatibility) ===
export type QualityMetrics = components['schemas']['QualityMetrics'];
export type PopularityMetrics = components['schemas']['PopularityMetrics'];
export type InstallationInfo = components['schemas']['InstallationInfo'];
export type EnvironmentConfig = components['schemas']['EnvironmentConfig'];
export type ClaudeIntegration = components['schemas']['ClaudeIntegration'];
export type DocumentationInfo = components['schemas']['DocumentationInfo'];
export type ServerCapabilities = components['schemas']['ServerCapabilities'];
export type AvailabilityInfo = components['schemas']['AvailabilityInfo'];
export type APIConfiguration = components['schemas']['APIConfiguration'];
export type SourceInfo = components['schemas']['SourceInfo'];
export type PackageInfo = components['schemas']['PackageInfo'];
export type VerificationStatus = components['schemas']['VerificationStatus'];
export type EnvironmentVariable = components['schemas']['EnvironmentVariable'];
export type InstallationMethod = components['schemas']['InstallationMethod'];

// === UTILITY TYPES ===
// These are not generated because they're SDK-specific utilities
export interface InstallationContext {
  mode: 'direct' | 'bridge';
  platform: 'linux' | 'darwin' | 'win32';
  globalInstall?: boolean;
  client: string;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface ResolvedPackage {
  packageName: string;
  displayName: string;
  description?: string;
  type: 'npm' | 'python' | 'docker' | 'git';
  source: 'direct' | 'smart_search' | 'registry_search';
  verified?: boolean;
  installation?: any; // Keep flexible to match API response
  claude_integration?: any; // Keep flexible to match API response
}

// Re-export core type definitions for consumers
export type { GitHubRepository, FileContent } from './github-repository.js';
export type { ComputedMetrics, ParsingMetadata } from './mcp-classification.js';
