/**
 * Comprehensive MCP Server Types
 * Purpose: Discovery + Installation
 * Based on Redis analysis of 2,635 servers
 */

// === DISCOVERY INTERFACES ===

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

// === INSTALLATION INTERFACES ===

export interface InstallationMethod {
  type: 'npm' | 'python' | 'docker' | 'git' | 'live_service';
  package?: string;                 // Package name
  command: string;                  // Installation command
  registry?: string;                // Package registry
  version?: string;                 // Package version
  complexity: 'simple' | 'moderate' | 'complex';
  requirements?: string[];          // Prerequisites
}

export interface MCPServerInstallation {
  recommended_method: 'npm' | 'python' | 'docker' | 'git' | 'live_service';
  difficulty: 'easy' | 'medium' | 'advanced';
  methods: InstallationMethod[];
}

export interface EnvironmentVariable {
  name: string;
  required: boolean;
  description?: string;
  default?: string;
  example?: string;
  validation?: string;              // Validation pattern
}

export interface MCPServerEnvironment {
  variables: EnvironmentVariable[];
  runtime_requirements: {
    node_version?: string;          // ">=18.0.0"
    python_version?: string;        // ">=3.8"
    platforms: string[];            // ["linux", "darwin", "win32"]
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

// === MAIN SERVER INTERFACE ===

export interface MCPServer {
  // === DISCOVERY SECTION ===
  // Core Identity & Search
  id: string;                       // "github.com/baidu-maps/mcp"
  name: string;                     // "Baidu Maps MCP"
  description: string;              // Human-readable description
  tagline?: string;                 // One-line summary
  
  // Categorization & Discovery
  category: 'development' | 'data' | 'communication' | 'api-integration' | 'utility' | 'other';
  subcategories: string[];          // ["python", "maps", "geolocation"]
  tags: string[];                   // Searchable keywords
  use_cases: string[];              // What problems this solves
  
  // Quality & Trust (Discovery)
  quality: MCPServerQuality;
  
  // Social Proof & Popularity (Discovery)
  popularity: MCPServerPopularity;
  
  // === INSTALLATION SECTION ===
  installation: MCPServerInstallation;
  environment: MCPServerEnvironment;
  claude_integration: ClaudeDesktopConfig;
  documentation: MCPServerDocumentation;
  
  // === TECHNICAL SECTION ===
  capabilities: MCPServerCapabilities;
  availability: MCPServerAvailability;
  api: MCPServerAPI;
  
  // === METADATA SECTION ===
  source: MCPServerSource;
  packages: PackageInfo[];
  verification: MCPServerVerification;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// === TRANSFORMATION FUNCTIONS ===

/**
 * Transform Redis hash data to MCPServer schema
 */
export function transformRedisToMCPServer(redisData: Record<string, string>): MCPServer {
  return {
    // Discovery Section
    id: redisData._key || redisData.domain,
    name: redisData.name,
    description: redisData.description,
    tagline: generateTagline(redisData),
    
    category: mapCategory(redisData['capabilities.category']),
    subcategories: safeJsonParse(redisData['capabilities.subcategories'], []),
    tags: extractTags(redisData),
    use_cases: safeJsonParse(redisData['capabilities.use_cases'], []),
    
    quality: {
      score: parseFloat(redisData['quality.score']) || 0,
      category: redisData['quality.category'] as any || 'low',
      trust_score: parseFloat(redisData.trust_score) || 0,
      verified: redisData.verification_status === 'verified',
      issues: safeJsonParse(redisData['quality.issues'], []),
      evidence: safeJsonParse(redisData['quality.evidence'], [])
    },
    
    popularity: {
      stars: parseInt(redisData['repository.stars']) || parseInt(redisData['_source_data.stargazers_count']) || 0,
      forks: parseInt(redisData['repository.forks']) || parseInt(redisData['_source_data.forks_count']) || 0,
      downloads: undefined // TODO: Extract from package data
    },
    
    // Installation Section
    installation: extractInstallation(redisData),
    environment: extractEnvironment(redisData),
    claude_integration: extractClaudeIntegration(redisData),
    documentation: extractDocumentation(redisData),
    
    // Technical Section
    capabilities: {
      tools: extractToolNames(redisData),
      resources: [], // TODO: Extract from examples/docs
      prompts: [], // TODO: Extract from examples/docs
      protocol_version: undefined // TODO: Extract if available
    },
    
    availability: {
      status: redisData['availability.status'] as any || 'package_only',
      endpoint_verified: redisData['availability.endpoint_verified'] === 'true',
      live_endpoint: redisData['availability.live_endpoint'] || undefined,
      primary_package: redisData['availability.primary_package'] || 'github',
      packages_available: redisData['availability.packages_available'] === 'true'
    },
    
    api: {
      transport: redisData.transport as any || 'stdio',
      endpoints: safeJsonParse(redisData['structured.api.endpoints'], []),
      cors_enabled: redisData.cors_enabled === 'true',
      auth: {
        type: redisData['auth.type'] as any || 'none',
        description: redisData['auth.description'] || 'No authentication required'
      }
    },
    
    // Metadata Section
    source: {
      type: redisData._source || redisData['_source_data.source'] as any || 'github',
      url: redisData['repository.url'] || redisData['_source_data.html_url'],
      language: redisData['_source_data.language'] || 'Unknown',
      license: redisData['repository.license'] || redisData['_source_data.license'],
      last_updated: redisData['_source_data.updated_at'] || redisData.updated_at,
      topics: safeJsonParse(redisData['_source_data.topics'], [])
    },
    
    packages: safeJsonParse(redisData.packages, []),
    
    verification: {
      status: redisData.verification_status as any || 'unverified',
      enhanced_at: redisData.enhanced_filtered_at,
      source_id: redisData._source_id
    },
    
    created_at: redisData.created_at || redisData['_source_data.created_at'],
    updated_at: redisData.updated_at || redisData['_source_data.updated_at']
  };
}

// Helper functions
function safeJsonParse(value: string | undefined, fallback: any = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function generateTagline(redisData: Record<string, string>): string | undefined {
  // Generate tagline from description or capabilities
  const desc = redisData.description;
  if (desc && desc.length < 100) return desc;
  
  const category = redisData['capabilities.category'];
  const subcats = safeJsonParse(redisData['capabilities.subcategories'], []);
  
  if (category && subcats.length > 0) {
    return `${category} server for ${subcats.slice(0, 2).join(' and ')}`;
  }
  
  return undefined;
}

function mapCategory(category: string): MCPServer['category'] {
  const map: Record<string, MCPServer['category']> = {
    'development': 'development',
    'data': 'data', 
    'communication': 'communication',
    'api-integration': 'api-integration',
    'utility': 'utility'
  };
  return map[category] || 'other';
}

function extractTags(redisData: Record<string, string>): string[] {
  const tags = new Set<string>();
  
  // Add subcategories as tags
  const subcats = safeJsonParse(redisData['capabilities.subcategories'], []);
  subcats.forEach((tag: string) => tags.add(tag));
  
  // Add topics as tags
  const topics = safeJsonParse(redisData['_source_data.topics'], []);
  topics.forEach((tag: string) => tags.add(tag));
  
  // Add language as tag
  const language = redisData['_source_data.language'];
  if (language) tags.add(language.toLowerCase());
  
  return Array.from(tags);
}

function extractInstallation(redisData: Record<string, string>): MCPServerInstallation {
  const methods: InstallationMethod[] = [];
  
  // Extract structured installation methods
  const structuredMethods = safeJsonParse(redisData['structured.installation.methods'], []);
  structuredMethods.forEach((method: any) => {
    methods.push({
      type: method.type,
      package: method.package,
      command: method.command,
      complexity: 'simple' // TODO: Determine complexity
    });
  });
  
  // Add package-based methods
  const packages = safeJsonParse(redisData.packages, []);
  packages.forEach((pkg: any) => {
    if (pkg.installation_command) {
      methods.push({
        type: pkg.registry_name === 'github' ? 'git' : pkg.registry_name,
        package: pkg.name,
        command: pkg.installation_command,
        version: pkg.version,
        complexity: 'simple'
      });
    }
  });
  
  // Determine recommended method
  let recommended: any = 'git';
  if (methods.find(m => m.type === 'npm')) recommended = 'npm';
  if (methods.find(m => m.type === 'python')) recommended = 'python';
  
  return {
    recommended_method: recommended,
    difficulty: 'easy', // TODO: Calculate based on complexity
    methods
  };
}

function extractEnvironment(redisData: Record<string, string>): MCPServerEnvironment {
  const variables: EnvironmentVariable[] = [];
  
  // Extract structured environment variables
  const structuredEnv = safeJsonParse(redisData['structured.environment.variables'], []);
  if (Array.isArray(structuredEnv)) {
    structuredEnv.forEach((varName: string) => {
      variables.push({
        name: varName,
        required: true, // Assume required unless specified
        description: undefined
      });
    });
  }
  
  // Extract Claude config environment variables
  const claudeConfig = safeJsonParse(redisData['_source_data.claude_config'], null);
  if (claudeConfig?.mcpServers) {
    Object.values(claudeConfig.mcpServers).forEach((server: any) => {
      if (server.env) {
        Object.keys(server.env).forEach(envVar => {
          if (!variables.find(v => v.name === envVar)) {
            variables.push({
              name: envVar,
              required: true,
              description: `Required for ${claudeConfig.mcpServers[Object.keys(claudeConfig.mcpServers)[0]]}`
            });
          }
        });
      }
    });
  }
  
  return {
    variables,
    runtime_requirements: {
      node_version: redisData['_source_data.package_json.engines.node'],
      python_version: extractPythonVersion(redisData),
      platforms: ['linux', 'darwin', 'win32'] // Default to all platforms
    }
  };
}

function extractClaudeIntegration(redisData: Record<string, string>): ClaudeDesktopConfig {
  const claudeConfig = safeJsonParse(redisData['_source_data.claude_config'], null);
  const hasConfig = redisData['_source_data.has_claude_config'] === 'true';
  
  if (!claudeConfig || !hasConfig) {
    return { available: false };
  }
  
  const serverNames = Object.keys(claudeConfig.mcpServers || {});
  if (serverNames.length === 0) {
    return { available: true, config: claudeConfig };
  }
  
  const firstServerName = serverNames[0];
  const serverConfig = claudeConfig.mcpServers[firstServerName];
  
  return {
    available: true,
    config: claudeConfig,
    server_name: firstServerName,
    command: serverConfig.command,
    args: serverConfig.args || [],
    env_vars: serverConfig.env || {}
  };
}

function extractDocumentation(redisData: Record<string, string>): MCPServerDocumentation {
  const examples: CodeExample[] = [];
  
  // Extract structured examples
  const structuredExamples = safeJsonParse(redisData['structured.examples'], []);
  structuredExamples.forEach((example: any) => {
    examples.push({
      type: example.type || 'code_block',
      language: example.language || 'text',
      content: example.content,
      description: example.description
    });
  });
  
  return {
    readme_content: redisData['_source_data.readme_content'],
    setup_instructions: extractSetupInstructions(redisData['_source_data.readme_content']),
    examples,
    installation_notes: extractInstallationNotes(redisData['_source_data.readme_content']),
    troubleshooting: extractTroubleshooting(redisData['_source_data.readme_content'])
  };
}

function extractToolNames(redisData: Record<string, string>): string[] {
  // Extract tool names from examples and documentation
  // TODO: Implement tool name extraction
  return [];
}

function extractPythonVersion(redisData: Record<string, string>): string | undefined {
  const subcats = safeJsonParse(redisData['capabilities.subcategories'], []);
  if (subcats.includes('python')) {
    return '>=3.8'; // Reasonable default
  }
  return undefined;
}

function extractSetupInstructions(readme: string | undefined): string[] {
  // TODO: Extract setup instructions from README
  return [];
}

function extractInstallationNotes(readme: string | undefined): string | undefined {
  // TODO: Extract installation notes from README  
  return undefined;
}

function extractTroubleshooting(readme: string | undefined): string[] {
  // TODO: Extract troubleshooting from README
  return [];
}

export default MCPServer;
