// Generated types export - use these instead of manual types
// All types are generated from OpenAPI schema - DO NOT EDIT MANUALLY

import { components } from '../generated/api-types.js';

// === MAIN TYPES ===
export type MCPServer = components['schemas']['MCPServer'];
export type InstallationMethod = components['schemas']['InstallationMethod'];
export type EnvironmentVariable = components['schemas']['EnvironmentVariable'];

// === QUALITY & METRICS ===
export type QualityMetrics = components['schemas']['QualityMetrics'];
export type PopularityMetrics = components['schemas']['PopularityMetrics'];

// === INSTALLATION ===
export type InstallationInfo = components['schemas']['InstallationInfo'];
export type EnvironmentConfig = components['schemas']['EnvironmentConfig'];

// === INTEGRATIONS ===
export type ClaudeIntegration = components['schemas']['ClaudeIntegration'];

// === METADATA ===
export type DocumentationInfo = components['schemas']['DocumentationInfo'];
export type ServerCapabilities = components['schemas']['ServerCapabilities'];
export type AvailabilityInfo = components['schemas']['AvailabilityInfo'];
export type APIConfiguration = components['schemas']['APIConfiguration'];
export type SourceInfo = components['schemas']['SourceInfo'];
export type PackageInfo = components['schemas']['PackageInfo'];
export type VerificationStatus = components['schemas']['VerificationStatus'];

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
