/**
 * Unified MCP Server Types
 * Purpose: Discovery + Installation + GitHub Integration
 * Source of truth for all MCP server data structures
 */

// Import all the component types
import type { GitHubRepository, FileContent } from './github-repository.js';
import type {
  InstallationMethod,
  InstallationSubtype,
  MCPConfig
} from './installation.js';
import type {
  MCPClassification,
  ComputedMetrics,
  ParsingMetadata
} from './mcp-classification.js';

// Re-export all types for convenience
export * from './github-repository.js';
export * from './installation.js';
export * from './mcp-classification.js';
export * from './progress.js';

// === ADDITIONAL INTERFACES ===

export interface MCPServerQuality {
  score: number;                    // 0-170 quality score
  category: 'high' | 'medium' | 'low';
  trust_score: number;              // 0-100 trust rating
  verified: boolean;
  issues: string[];                 // Known quality issues
  evidence: string[];               // Quality indicators
}

export interface MCPServerPopularity {
  stars: number;                    // GitHub stars
  forks: number;                    // GitHub forks
  downloads?: number;               // Package downloads
  rating?: number;                  // 1-5 user rating
}

export interface MCPServerCapabilities {
  tools: string[];                  // Available tool names
  resources: string[];              // Available resource types
  prompts: string[];                // Available prompts
  protocol_version?: string;        // MCP protocol version
  
  // Additional fields for compatibility
  category?: string;                // Primary category
  subcategories?: string[];         // Technology/language tags
  intent_keywords?: string[];       // Search keywords
  use_cases?: string[];             // What problems this solves
}

export interface MCPServerAvailability {
  status: 'package_only' | 'live_service' | 'both';
  endpoint_verified: boolean;
  live_endpoint?: string;           // Live service URL
  primary_package: string;          // Preferred registry
  packages_available: boolean;
}

export interface MCPServerAPI {
  transport: 'stdio' | 'http' | 'websocket' | 'sse';
  endpoints: string[];              // Documentation/reference URLs
  cors_enabled: boolean;
  auth: {
    type: 'none' | 'api_key' | 'oauth2' | 'basic' | 'custom';
    description: string;
    required_scopes?: string[];
  };
}

export interface MCPServerInstallation {
  recommended_method: InstallationSubtype;
  difficulty: 'easy' | 'medium' | 'hard';
  methods: InstallationMethod[];
}

export interface MCPServerEnvironment {
  variables: EnvironmentVariable[];
  runtime_requirements: {
    node_version?: string;
    python_version?: string;
    platforms: string[];
  };
}

export interface EnvironmentVariable {
  name: string;
  required: boolean;
  description?: string;
  default?: string;
  example?: string;
  validation?: string;
}

export interface ClaudeDesktopConfig {
  available: boolean;
  config?: {
    mcpServers: {
      [serverName: string]: {
        command: string;
        args: string[];
        env?: Record<string, string>;
      };
    };
  };
  server_name?: string;
  command?: string;
  args?: string[];
  env_vars?: Record<string, string>;
}

export interface CodeExample {
  type: 'code_block' | 'configuration' | 'usage' | 'claude_prompt';
  language: string;
  title?: string;
  content: string;
  description?: string;
}

export interface MCPServerDocumentation {
  readme_content?: string;
  setup_instructions: string[];
  examples: CodeExample[];
  installation_notes?: string;
  troubleshooting: string[];
}

export interface MCPServerSource {
  type: 'github' | 'npm' | 'pypi' | 'docker' | 'other';
  url: string;
  language: string;
  license?: string;
  last_updated: string;
  topics: string[];
}

export interface PackageInfo {
  registry_name: 'npm' | 'pypi' | 'docker' | 'github' | 'other';
  name: string;
  version: string;
  installation_command: string;
  setup_instructions?: string;
  download_count?: number;
}

export interface MCPServerVerification {
  status: 'verified' | 'unverified' | 'pending' | 'rejected';
  enhanced_at: string;
  source_id: string;
  verification_method?: string;
  
  // Additional verification fields for compatibility
  endpoint_verified?: boolean;
  dns_verified?: boolean;
  ssl_verified?: boolean;
  last_verification?: string;
}

// === MAIN UNIFIED MCP SERVER INTERFACE ===

/**
 * Unified MCP Server interface that combines GitHub repository data
 * with comprehensive installation methods and analysis
 * USE THIS EVERYWHERE - replaces MCPServerRecord, GitHubRepoAnalysis, etc.
 */
export interface MCPServer {
  // === CORE IDENTITY ===
  id: string;                       // "github.com/owner/repo"
  domain: string;                   // Same as id for compatibility
  name: string;                     // "Repository Name"
  description: string;              // Human-readable description
  endpoint?: string;                // Optional live endpoint URL
  tagline?: string;                 // One-line summary

  // === GITHUB REPOSITORY DATA ===
  repository: GitHubRepository;     // Complete GitHub repository info
  files?: FileContent[];            // Downloaded key files (README, package.json, etc.)

  // === CATEGORIZATION & DISCOVERY ===
  category: 'development' | 'data' | 'communication' | 'api-integration' | 'utility' | 'other';
  subcategories: string[];          // ["python", "maps", "geolocation"]
  tags: string[];                   // Searchable keywords
  use_cases: string[];              // What problems this solves

  // === QUALITY & TRUST ===
  quality: MCPServerQuality;
  popularity: MCPServerPopularity;

  // === INSTALLATION & SETUP ===
  installation: MCPServerInstallation;
  environment: MCPServerEnvironment;
  claude_integration: ClaudeDesktopConfig;
  documentation: MCPServerDocumentation;

  // === TECHNICAL CAPABILITIES ===
  capabilities: MCPServerCapabilities;
  availability: MCPServerAvailability;
  api: MCPServerAPI;

  // === FLAT PROPERTIES (for backward compatibility) ===
  // These flatten nested properties for easier access
  trust_score: number;              // 0-100 trust rating  
  verification_status: 'verified' | 'unverified' | 'pending' | 'rejected';
  cors_enabled: boolean;            // Flattened from api.cors_enabled
  transport: 'stdio' | 'http' | 'websocket' | 'sse'; // Flattened from api.transport
  
  // Health & Status
  health?: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    last_check?: string;
    uptime_percentage?: number;
    avg_response_time_ms?: number;
    response_time_ms?: number;      // Alternative name for compatibility
  };

  // Availability (flattened)
  packages_available: boolean;      // Flattened from availability.packages_available
  primary_package: string;          // Flattened from availability.primary_package
  endpoint_verified: boolean;       // Flattened from availability.endpoint_verified

  // Authentication (flattened) 
  auth?: {
    type: 'none' | 'api_key' | 'oauth2' | 'basic' | 'custom';
    description: string;
    required_scopes?: string[];
  };

  // === ANALYSIS & CLASSIFICATION ===
  computed?: ComputedMetrics;       // AI-computed analysis
  parsingMetadata?: ParsingMetadata; // Analysis metadata

  // === METADATA ===
  source: MCPServerSource;
  packages: PackageInfo[];
  verification: MCPServerVerification;

  // === TIMESTAMPS ===
  created_at: string;
  updated_at: string;
}

/**
 * GitHub Repository with Installation Analysis
 * This is the direct output from the GitHub parser
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

// === TRANSFORMATION FUNCTIONS ===

/**
 * Transform GitHub parser output to MCPServer format
 */
export function transformGitHubRepoToMCPServer(
  githubRepo: GitHubRepoWithInstallation,
  additionalData?: Partial<MCPServer>
): MCPServer {
  const repo = githubRepo.repository;

  return {
    // Core Identity
    id: repo.fullName,
    domain: `github.com/${repo.fullName}`, // Add required domain
    name: repo.name,
    description: repo.description || '',
    endpoint: undefined, // GitHub repos typically don't have live endpoints
    tagline: generateTagline(repo),

    // GitHub Repository Data
    repository: repo,
    files: githubRepo.files,

    // Categorization (derived from computed metrics or defaults)
    category: mapToCategory(githubRepo.computed?.primaryLanguage, githubRepo.computed?.tags),
    subcategories: githubRepo.computed?.tags || extractSubcategories(repo),
    tags: githubRepo.computed?.tags || extractTags(repo),
    use_cases: extractUseCases(repo, githubRepo.computed),

    // Quality & Trust
    quality: {
      score: calculateQualityScore(repo, githubRepo),
      category: calculateQualityCategory(repo, githubRepo),
      trust_score: calculateTrustScore(repo),
      verified: false, // Default to unverified
      issues: [],
      evidence: extractQualityEvidence(repo, githubRepo)
    },

    popularity: {
      stars: repo.stars,
      forks: repo.forks,
      downloads: undefined, // TODO: Extract from package data
      rating: undefined
    },

    // Installation & Setup
    installation: {
      recommended_method: determineRecommendedMethod(githubRepo.installationMethods),
      difficulty: githubRepo.computed?.installationDifficulty || 'medium',
      methods: githubRepo.installationMethods
    },

    environment: extractEnvironment(githubRepo),
    claude_integration: extractClaudeIntegration(githubRepo),
    documentation: extractDocumentation(githubRepo),

    // Technical Capabilities
    capabilities: {
      tools: githubRepo.computed?.mcpTools || [],
      resources: githubRepo.computed?.mcpResources || [],
      prompts: githubRepo.computed?.mcpPrompts || [],
      protocol_version: undefined
    },

    availability: {
      status: 'package_only',
      endpoint_verified: false,
      live_endpoint: undefined,
      primary_package: 'github',
      packages_available: true
    },

    api: {
      transport: 'stdio',
      endpoints: [],
      cors_enabled: false,
      auth: {
        type: 'none',
        description: 'No authentication required'
      }
    },

    // === FLAT PROPERTIES (for backward compatibility) ===
    trust_score: calculateTrustScore(repo),
    verification_status: 'unverified',
    cors_enabled: false,
    transport: 'stdio',
    packages_available: true,
    primary_package: 'github',
    endpoint_verified: false,
    health: {
      status: 'unknown',
      last_check: undefined,
      uptime_percentage: undefined,
      avg_response_time_ms: undefined
    },

    // Analysis & Classification
    computed: githubRepo.computed,
    parsingMetadata: githubRepo.parsingMetadata,

    // Metadata
    source: {
      type: 'github',
      url: repo.htmlUrl,
      language: repo.language || 'Unknown',
      license: repo.license?.name,
      last_updated: repo.updatedAt,
      topics: repo.topics
    },

    packages: [], // TODO: Extract from installation methods

    verification: {
      status: 'unverified',
      enhanced_at: new Date().toISOString(),
      source_id: repo.fullName
    },

    // Timestamps
    created_at: repo.createdAt,
    updated_at: repo.updatedAt,

    // Override with any additional data
    ...additionalData
  };
}

// === HELPER FUNCTIONS ===

function generateTagline(repo: GitHubRepository): string | undefined {
  if (repo.description && repo.description.length < 100) {
    return repo.description;
  }

  const language = repo.language;
  const topics = repo.topics.slice(0, 2);

  if (language && topics.length > 0) {
    return `${language} server for ${topics.join(' and ')}`;
  }

  return undefined;
}

function mapToCategory(
  primaryLanguage?: string,
  tags?: string[]
): MCPServer['category'] {
  const allTags = [...(tags || []), primaryLanguage].filter(Boolean).map(t => t!.toLowerCase());

  if (allTags.some(tag => ['api', 'integration', 'webhook', 'rest'].includes(tag))) {
    return 'api-integration';
  }
  if (allTags.some(tag => ['data', 'database', 'storage', 'analytics'].includes(tag))) {
    return 'data';
  }
  if (allTags.some(tag => ['chat', 'email', 'notification', 'messaging'].includes(tag))) {
    return 'communication';
  }
  if (allTags.some(tag => ['dev', 'development', 'tool', 'cli'].includes(tag))) {
    return 'development';
  }
  if (allTags.some(tag => ['utility', 'util', 'helper', 'tool'].includes(tag))) {
    return 'utility';
  }

  return 'other';
}

function extractSubcategories(repo: GitHubRepository): string[] {
  const subcats = new Set<string>();

  // Add language
  if (repo.language) {
    subcats.add(repo.language.toLowerCase());
  }

  // Add topics
  repo.topics.forEach(topic => subcats.add(topic));

  return Array.from(subcats);
}

function extractTags(repo: GitHubRepository): string[] {
  const tags = new Set<string>();

  // Add language
  if (repo.language) {
    tags.add(repo.language.toLowerCase());
  }

  // Add topics
  repo.topics.forEach(topic => tags.add(topic));

  // Add derived tags from name/description
  const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
  if (text.includes('mcp')) tags.add('mcp');
  if (text.includes('claude')) tags.add('claude');
  if (text.includes('server')) tags.add('server');

  return Array.from(tags);
}

function extractUseCases(repo: GitHubRepository, computed?: ComputedMetrics): string[] {
  const useCases: string[] = [];

  if (computed?.mcpClassification === 'mcp_server') {
    useCases.push('MCP server integration');
  }

  if (repo.description) {
    // Extract use cases from description
    const desc = repo.description.toLowerCase();
    if (desc.includes('api')) useCases.push('API integration');
    if (desc.includes('data')) useCases.push('Data processing');
    if (desc.includes('tool')) useCases.push('Development tools');
  }

  return useCases;
}

function calculateQualityScore(repo: GitHubRepository, githubRepo: GitHubRepoWithInstallation): number {
  let score = 0;

  // GitHub metrics
  score += Math.min(repo.stars / 10, 50); // Max 50 points for stars
  score += Math.min(repo.forks / 5, 20);  // Max 20 points for forks

  // Installation methods
  score += Math.min(githubRepo.installationMethods.length * 10, 30); // Max 30 points

  // Documentation
  if (repo.hasWiki) score += 10;
  if (githubRepo.files?.some(f => f.path.toLowerCase().includes('readme'))) score += 20;

  // Recency
  const daysSinceUpdate = (Date.now() - new Date(repo.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 30) score += 20;
  else if (daysSinceUpdate < 90) score += 10;

  // MCP specific
  if (githubRepo.computed?.isMcpServer) score += 30;

  return Math.min(score, 170);
}

function calculateQualityCategory(repo: GitHubRepository, githubRepo: GitHubRepoWithInstallation): 'high' | 'medium' | 'low' {
  const score = calculateQualityScore(repo, githubRepo);
  if (score >= 100) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

function calculateTrustScore(repo: GitHubRepository): number {
  let score = 0;

  // Repository age and activity
  const ageInDays = (Date.now() - new Date(repo.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays > 365) score += 20; // Mature project

  // Stars and forks indicate community trust
  score += Math.min(repo.stars / 50, 30);
  score += Math.min(repo.forks / 20, 20);

  // Organization vs individual
  if (repo.owner.type === 'Organization') score += 15;

  // License
  if (repo.license) score += 15;

  return Math.min(score, 100);
}

function extractQualityEvidence(repo: GitHubRepository, githubRepo: GitHubRepoWithInstallation): string[] {
  const evidence: string[] = [];

  if (repo.stars > 100) evidence.push(`${repo.stars} GitHub stars`);
  if (repo.forks > 20) evidence.push(`${repo.forks} forks`);
  if (repo.license) evidence.push(`${repo.license.name} license`);
  if (githubRepo.installationMethods.length > 0) {
    evidence.push(`${githubRepo.installationMethods.length} installation methods`);
  }
  if (repo.hasWiki) evidence.push('Has documentation wiki');
  if (githubRepo.computed?.hasDocumentation) evidence.push('Comprehensive documentation');

  return evidence;
}

function determineRecommendedMethod(methods: InstallationMethod[]): InstallationSubtype {
  // Priority order for recommendation
  if (methods.find(m => m.subtype === 'npm')) return 'npm';
  if (methods.find(m => m.subtype === 'pip')) return 'pip';
  if (methods.find(m => m.subtype === 'docker_run')) return 'docker_run';
  if (methods.find(m => m.subtype === 'git_clone')) return 'git_clone';

  // Default to the first method's subtype or package_manager
  return methods[0]?.subtype || 'package_manager';
}

function extractEnvironment(githubRepo: GitHubRepoWithInstallation): MCPServerEnvironment {
  const variables: EnvironmentVariable[] = [];

  // Extract environment variables from installation methods
  githubRepo.installationMethods.forEach(method => {
    if (method.environment_vars) {
      Object.entries(method.environment_vars).forEach(([name, value]) => {
        if (!variables.find(v => v.name === name)) {
          variables.push({
            name,
            required: true,
            description: `Environment variable for ${method.title}`,
            example: value
          });
        }
      });
    }
  });

  return {
    variables,
    runtime_requirements: {
      platforms: githubRepo.computed?.supportedPlatforms || ['cross_platform']
    }
  };
}

function extractClaudeIntegration(githubRepo: GitHubRepoWithInstallation): ClaudeDesktopConfig {
  // Look for Claude Desktop configuration in installation methods
  const claudeMethod = githubRepo.installationMethods.find(m => m.type === 'claude_desktop');

  if (claudeMethod && claudeMethod.mcp_config) {
    return {
      available: true,
      server_name: claudeMethod.mcp_config.server_name,
      command: claudeMethod.mcp_config.command,
      args: claudeMethod.mcp_config.args,
      env_vars: claudeMethod.mcp_config.env
    };
  }

  return {
    available: false
  };
}

function extractDocumentation(githubRepo: GitHubRepoWithInstallation): MCPServerDocumentation {
  const readmeFile = githubRepo.files?.find(f => f.path.toLowerCase().includes('readme'));

  return {
    readme_content: readmeFile?.content,
    setup_instructions: githubRepo.installationMethods.map(m => m.description),
    examples: [],
    troubleshooting: []
  };
}

export interface ClaudeDesktopConfig {
  available: boolean;
  config?: {                        // Full mcpServers config
    mcpServers: {
      [serverName: string]: {
        command: string;
        args: string[];
        env?: Record<string, string>;
      };
    };
  };
  server_name?: string;             // Name in Claude Desktop
  command?: string;                 // Execution command
  args?: string[];                  // Command arguments
  env_vars?: Record<string, string>; // Environment variables
}

export interface CodeExample {
  type: 'code_block' | 'configuration' | 'usage' | 'claude_prompt';
  language: string;
  title?: string;
  content: string;
  description?: string;
}

export interface MCPServerDocumentation {
  readme_content?: string;
  setup_instructions: string[];
  examples: CodeExample[];
  installation_notes?: string;
  troubleshooting: string[];
}

// === TECHNICAL INTERFACES ===

export interface MCPServerCapabilities {
  tools: string[];                  // Available tool names
  resources: string[];              // Available resource types
  prompts: string[];                // Available prompts
  protocol_version?: string;        // MCP protocol version
}

export interface MCPServerAvailability {
  status: 'package_only' | 'live_service' | 'both';
  endpoint_verified: boolean;
  live_endpoint?: string;           // Live service URL
  primary_package: string;          // Preferred registry
  packages_available: boolean;
}

export interface MCPServerAPI {
  transport: 'stdio' | 'http' | 'websocket' | 'sse';
  endpoints: string[];              // Documentation/reference URLs
  cors_enabled: boolean;
  auth: {
    type: 'none' | 'api_key' | 'oauth2' | 'basic' | 'custom';
    description: string;
    required_scopes?: string[];
  };
}

// === METADATA INTERFACES ===

export interface MCPServerSource {
  type: 'github' | 'npm' | 'pypi' | 'docker' | 'other';
  url: string;
  language: string;
  license?: string;
  last_updated: string;
  topics: string[];
}

export interface PackageInfo {
  registry_name: 'npm' | 'pypi' | 'docker' | 'github' | 'other';
  name: string;
  version: string;
  installation_command: string;
  setup_instructions?: string;
  download_count?: number;
}

export interface MCPServerVerification {
  status: 'verified' | 'unverified' | 'pending' | 'rejected';
  enhanced_at: string;
  source_id: string;
  verification_method?: string;
}

// === UTILITY TYPES FOR SDK USAGE ===

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
  version?: string;
  repositoryUrl?: string;
  installation?: any;
  claude_integration?: any;
}

// MCPServer interface is defined above

// End of file
