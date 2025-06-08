// Type comparison and migration helper
// This script helps identify what manual types can be removed

import { components } from '../generated/api-types.js';

// List all available generated types
export type GeneratedTypes = {
  // === CORE ENTITIES ===
  MCPServer: components['schemas']['MCPServer'];
  InstallationMethod: components['schemas']['InstallationMethod'];
  EnvironmentVariable: components['schemas']['EnvironmentVariable'];
  
  // === QUALITY & METRICS ===
  QualityMetrics: components['schemas']['QualityMetrics'];
  PopularityMetrics: components['schemas']['PopularityMetrics'];
  
  // === INSTALLATION ===
  InstallationInfo: components['schemas']['InstallationInfo'];
  EnvironmentConfig: components['schemas']['EnvironmentConfig'];
  
  // === INTEGRATIONS ===
  ClaudeIntegration: components['schemas']['ClaudeIntegration'];
  
  // === METADATA ===
  DocumentationInfo: components['schemas']['DocumentationInfo'];
  ServerCapabilities: components['schemas']['ServerCapabilities'];
  AvailabilityInfo: components['schemas']['AvailabilityInfo'];
  APIConfiguration: components['schemas']['APIConfiguration'];
  SourceInfo: components['schemas']['SourceInfo'];
  PackageInfo: components['schemas']['PackageInfo'];
  VerificationStatus: components['schemas']['VerificationStatus'];
};

// Types that are available in generated schema
export const AVAILABLE_GENERATED_TYPES = [
  'MCPServer',
  'InstallationMethod', 
  'EnvironmentVariable',
  'QualityMetrics',
  'PopularityMetrics', 
  'InstallationInfo',
  'EnvironmentConfig',
  'ClaudeIntegration',
  'DocumentationInfo',
  'ServerCapabilities',
  'AvailabilityInfo',
  'APIConfiguration',
  'SourceInfo',
  'PackageInfo',
  'VerificationStatus'
] as const;

// Types that should remain manual (SDK-specific utilities)
export const MANUAL_UTILITY_TYPES = [
  'InstallationContext',
  'ResolvedPackage'
] as const;

/**
 * Check if a type name should use generated vs manual definition
 */
export function shouldUseGeneratedType(typeName: string): boolean {
  return AVAILABLE_GENERATED_TYPES.includes(typeName as any);
}

/**
 * Get the import statement for a type
 */
export function getTypeImport(typeName: string): string {
  if (shouldUseGeneratedType(typeName)) {
    return `import { ${typeName} } from '@mcplookup-org/mcp-sdk/types/generated';`;
  } else if (MANUAL_UTILITY_TYPES.includes(typeName as any)) {
    return `import { ${typeName} } from '@mcplookup-org/mcp-sdk/types/generated';`;
  } else {
    return `// Warning: ${typeName} not found in generated or utility types`;
  }
}
