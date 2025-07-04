// Unified Types - Single Source of Truth
// Replace all custom types with SDK-generated types

// Import ALL types from SDK
// Import types for use in interfaces
import type {
  MCPServer,
  GitHubRepoWithInstallation
} from '@mcplookup-org/mcp-sdk';

// Re-export the types
export type {
  MCPServer,
  GitHubRepoWithInstallation
} from '@mcplookup-org/mcp-sdk';

export {
  transformGitHubRepoToMCPServer
} from '@mcplookup-org/mcp-sdk';

// DEPRECATED - Remove these custom types:
// - MCPServerRecord (use MCPServer instead)
// - GitHubRepoAnalysis (use GitHubRepoWithInstallation instead)
// - Custom PackageInfo (use SDK PackageInfo instead)

// Unified storage format
export interface StoredServerData {
  // Store complete SDK objects
  server: MCPServer;
  
  // Additional metadata not in SDK
  metadata: {
    discoveredAt: string;
    lastAnalyzed: string;
    sourceQuery?: string;
    registrationSource: 'github_auto' | 'manual' | 'api';
  };
  
  // Cache original parser data for debugging
  original?: {
    githubRepo: GitHubRepoWithInstallation;
    parserVersion: string;
  };
}

// Storage operations use unified types
export interface UnifiedStorage {
  storeServer(id: string, data: StoredServerData): Promise<void>;
  getServer(id: string): Promise<StoredServerData | null>;
  getAllServers(): Promise<StoredServerData[]>;
  searchServers(query: string): Promise<StoredServerData[]>;
}
