import type {
  MCPServer,
  GitHubRepoWithInstallation
} from '../types/generated.js';

/**
 * Build a minimal MCPServer object from GitHub parser output.
 * This is a thin wrapper until the parser emits MCPServer directly.
 */
export function buildMCPServerFromGitHubRepo(
  githubRepo: GitHubRepoWithInstallation,
  overrides: Partial<MCPServer> = {}
): MCPServer {
  const repo = githubRepo.repository;
  return {
    id: repo.fullName,
    domain: `github.com/${repo.fullName}`,
    name: repo.name,
    description: repo.description || '',
    endpoint: undefined,
    category: 'development' as const,
    repository: repo,
    files: githubRepo.files || [],
    computed: githubRepo.computed,
    parsingMetadata: githubRepo.parsingMetadata,
    installationMethods: githubRepo.installationMethods,
    packages: [],
    capabilities: {
      tools: githubRepo.computed?.mcpTools || [],
      resources: githubRepo.computed?.mcpResources || [],
      prompts: githubRepo.computed?.mcpPrompts || []
    },
    quality: {
      score: 0,
      category: 'low' as const,
      trust_score: 0,
      verified: false,
      issues: [],
      evidence: []
    },
    popularity: {
      stars: repo.stars,
      forks: repo.forks,
      downloads: undefined,
      rating: undefined,
      last_updated: repo.updatedAt
    },
    trust_score: 0,
    verification_status: 'unverified',
    availability: {
      status: 'package_only',
      endpoint_verified: false,
      live_endpoint: undefined,
      primary_package: 'github',
      packages_available: true
    },
    created_at: repo.createdAt || new Date().toISOString(),
    updated_at: repo.updatedAt || new Date().toISOString(),
    ...overrides
  };
}
