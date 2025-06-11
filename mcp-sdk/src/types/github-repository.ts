/**
 * GitHub Repository Types
 * Source of truth for all GitHub-related data structures
 */

// === CORE GITHUB REPOSITORY TYPES ===

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  htmlUrl: string;
  cloneUrl: string;
  stars: number;
  forks: number;
  watchers?: number;
  size: number;
  language: string | null;
  topics: string[];
  license?: {
    key: string;
    name: string;
    spdxId: string;
  };
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  defaultBranch: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
  hasIssues?: boolean;
  hasWiki?: boolean;
  hasPages?: boolean;
  isMCP?: boolean;
  owner: {
    login: string;
    type: "User" | "Organization";
    avatarUrl: string;
  };
}

// Legacy simple interface for backward compatibility
export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  url: string;
  language: string | null;
}

// === FILE CONTENT TYPES ===

export interface FileContent {
  path: string;
  content: string;
  size?: number;
  encoding?: string;
  downloadUrl?: string;
  lastModified?: string;
}

// === UTILITY TYPES ===

export interface GitHubSearchResult {
  repositories: GitHubRepository[];
  totalCount: number;
  hasMore: boolean;
}

export interface RepositoryAnalysisOptions {
  maxFiles?: number;
  includeArchived?: boolean;
  skipLargeFiles?: boolean;
  maxFileSize?: number;
  enableProgress?: boolean;
}

// === TYPE GUARDS ===

export function isGitHubRepository(obj: any): obj is GitHubRepository {
  return obj && typeof obj.id === 'number' && typeof obj.fullName === 'string';
}

export function isGitHubRepo(obj: any): obj is GitHubRepo {
  return obj && typeof obj.name === 'string' && typeof obj.fullName === 'string';
}
