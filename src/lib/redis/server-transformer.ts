// Redis Data Transformation Layer
// Converts raw Redis hash data into structured server objects

export interface ServerMetadata {
  // Core Identity
  id: string;
  name: string;
  description: string;
  category: string;
  subcategories: string[];
  
  // Quality & Trust
  quality: {
    score: number;
    category: 'high' | 'medium' | 'low';
    breakdown: QualityBreakdown;
    issues: string[];
    evidence: string[];
  };
  trustScore: number;
  verificationStatus: string;
  
  // Installation Methods
  installationMethods: InstallationMethod[];
  packages: PackageInfo[];
  primaryPackage: string;
  
  // Environment & Configuration
  environmentVariables: EnvironmentVariable[];
  claudeConfig?: ClaudeConfig;
  
  // Docker Support
  docker?: DockerMetadata;
  
  // Repository Info
  repository: RepositoryInfo;
  
  // Capabilities
  capabilities: {
    tools: string[];
    useCase: string[];
    intentKeywords: string[];
  };
  
  // Runtime Info
  transport: 'stdio' | 'sse' | 'http';
  corsEnabled: boolean;
  auth: AuthInfo;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastFiltered: string;
}

export interface InstallationMethod {
  type: 'npm' | 'python' | 'docker' | 'git';
  command: string;
  package?: string;
  setupInstructions?: string;
  requiresGlobal?: boolean;
  runtimeRequirements?: RuntimeRequirements;
}

export interface PackageInfo {
  registryName: string;
  name: string;
  version: string;
  installationCommand: string;
  setupInstructions?: string;
}

export interface EnvironmentVariable {
  name: string;
  type?: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface DockerMetadata {
  hasDocker: boolean;
  images: string[];
  commands: string[];
  baseImage?: string;
  resourceRequirements?: {
    memory: string;
    cpu: string;
    pidsLimit: number;
  };
}

export interface RuntimeRequirements {
  nodeVersion?: string;
  pythonVersion?: string;
  platforms: string[];
  architecture?: string[];
  diskSpaceMB?: number;
}

export interface QualityBreakdown {
  hasClaudeConfig: boolean;
  hasNpmPackage: boolean;
  hasPipInstall: boolean;
  hasDocker: boolean;
  hasGitInstall: boolean;
  hasExamples: boolean;
  hasEnvVars: boolean;
  stars: number;
}

export interface RepositoryInfo {
  url: string;
  source: string;
  stars: number;
  forks: number;
  lastCommit: string;
  license?: string;
  language?: string;
  topics: string[];
  hasClaudeConfig: boolean;
}

export interface AuthInfo {
  type: string;
  description: string;
  requiredCredentials?: string[];
}

export interface ClaudeConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export class RedisServerTransformer {
  /**
   * Transform raw Redis hash data into structured ServerMetadata
   */
  transformServer(redisData: Record<string, string>): ServerMetadata {
    return {
      // Core Identity
      id: redisData._key || '',
      name: redisData.name || '',
      description: redisData.description || '',
      category: redisData['capabilities.category'] || 'other',
      subcategories: this.parseArrayField(redisData['capabilities.subcategories']),
      
      // Quality & Trust
      quality: this.parseQuality(redisData),
      trustScore: parseFloat(redisData.trust_score) || 0,
      verificationStatus: redisData.verification_status || 'unverified',
      
      // Installation Methods
      installationMethods: this.parseInstallationMethods(redisData),
      packages: this.parsePackages(redisData),
      primaryPackage: redisData['availability.primary_package'] || '',
      
      // Environment & Configuration
      environmentVariables: this.parseEnvironmentVariables(redisData),
      claudeConfig: this.parseClaudeConfig(redisData),
      
      // Docker Support
      docker: this.parseDockerMetadata(redisData),
      
      // Repository Info
      repository: this.parseRepository(redisData),
      
      // Capabilities
      capabilities: {
        tools: this.parseArrayField(redisData['_source_data.tools']),
        useCase: this.parseArrayField(redisData['capabilities.use_cases']),
        intentKeywords: this.parseArrayField(redisData['capabilities.intent_keywords'])
      },
      
      // Runtime Info
      transport: (redisData.transport as any) || 'stdio',
      corsEnabled: redisData.cors_enabled === 'true',
      auth: this.parseAuth(redisData),
      
      // Timestamps
      createdAt: redisData.created_at || '',
      updatedAt: redisData.updated_at || '',
      lastFiltered: redisData.enhanced_filtered_at || ''
    };
  }

  private parseQuality(data: Record<string, string>) {
    const breakdown = this.parseObjectField(data['quality.breakdown']) as QualityBreakdown || {
      hasClaudeConfig: false,
      hasNpmPackage: false,
      hasPipInstall: false,
      hasDocker: false,
      hasGitInstall: false,
      hasExamples: false,
      hasEnvVars: false,
      stars: 0
    };

    return {
      score: parseFloat(data['quality.score']) || 0,
      category: (data['quality.category'] as any) || 'low',
      breakdown,
      issues: this.parseArrayField(data['quality.issues']),
      evidence: this.parseArrayField(data['quality.evidence'])
    };
  }

  private parseInstallationMethods(data: Record<string, string>): InstallationMethod[] {
    const methods: InstallationMethod[] = [];
    
    // Parse structured.installation.methods
    const structuredMethods = this.parseArrayField(data['structured.installation.methods']);
    if (structuredMethods.length > 0) {
      structuredMethods.forEach((method: any) => {
        if (typeof method === 'object' && method.type) {
          methods.push({
            type: method.type,
            command: method.command || '',
            package: method.package,
            setupInstructions: method.setupInstructions,
            requiresGlobal: method.requiresGlobal,
            runtimeRequirements: this.parseRuntimeRequirements(data, method.type)
          });
        }
      });
    }
    
    // Add NPM method if npm package exists
    if (data['_source_data.npm_package']) {
      methods.push({
        type: 'npm',
        command: `npm install ${data['_source_data.npm_package']}`,
        package: data['_source_data.npm_package'],
        runtimeRequirements: this.parseRuntimeRequirements(data, 'npm')
      });
    }
    
    // Add installation command if available
    if (data['_source_data.installation_command']) {
      const command = data['_source_data.installation_command'];
      const type = this.detectInstallationType(command);
      methods.push({
        type,
        command,
        runtimeRequirements: this.parseRuntimeRequirements(data, type)
      });
    }
    
    return methods;
  }

  private parsePackages(data: Record<string, string>): PackageInfo[] {
    const packagesData = this.parseArrayField(data.packages);
    return packagesData.map((pkg: any) => ({
      registryName: pkg.registry_name || '',
      name: pkg.name || '',
      version: pkg.version || 'latest',
      installationCommand: pkg.installation_command || '',
      setupInstructions: pkg.setup_instructions
    }));
  }

  private parseEnvironmentVariables(data: Record<string, string>): EnvironmentVariable[] {
    const envVars: EnvironmentVariable[] = [];
    
    // Parse structured.environment.variables
    const structuredEnv = this.parseArrayField(data['structured.environment.variables']);
    if (structuredEnv.length > 0) {
      structuredEnv.forEach((envVar: any) => {
        if (typeof envVar === 'string') {
          envVars.push({
            name: envVar,
            required: true
          });
        } else if (typeof envVar === 'object') {
          envVars.push({
            name: envVar.name || '',
            type: envVar.type,
            required: envVar.required !== false,
            description: envVar.description,
            defaultValue: envVar.defaultValue
          });
        }
      });
    }
    
    // Parse _source_data.environment_variables
    const sourceEnv = this.parseObjectField(data['_source_data.environment_variables']);
    if (sourceEnv && sourceEnv.properties) {
      Object.entries(sourceEnv.properties).forEach(([name, config]: [string, any]) => {
        envVars.push({
          name,
          type: config.type,
          required: config.required !== false,
          description: config.description
        });
      });
    }
    
    return envVars;
  }

  private parseDockerMetadata(data: Record<string, string>): DockerMetadata | undefined {
    const hasDocker = data['structured.docker.has_docker'] === 'true';
    if (!hasDocker) return undefined;
    
    return {
      hasDocker: true,
      images: this.parseArrayField(data['structured.docker.images']),
      commands: this.parseArrayField(data['structured.docker.commands']),
      baseImage: this.inferBaseImage(data),
      resourceRequirements: this.inferResourceRequirements(data)
    };
  }

  private parseRepository(data: Record<string, string>): RepositoryInfo {
    return {
      url: data['repository.url'] || '',
      source: data['repository.source'] || data._source || '',
      stars: parseInt(data['repository.stars'] || data['_source_data.stargazers_count']) || 0,
      forks: parseInt(data['repository.forks'] || data['_source_data.forks_count']) || 0,
      lastCommit: data['repository.last_commit'] || data['_source_data.pushed_at'] || '',
      license: data['repository.license'] || data['_source_data.license'],
      language: data['repository.language'] || data['_source_data.language'],
      topics: this.parseArrayField(data['repository.topics'] || data['_source_data.topics']),
      hasClaudeConfig: data['repository.has_claude_config'] === 'true'
    };
  }

  private parseAuth(data: Record<string, string>): AuthInfo {
    return {
      type: data['auth.type'] || 'none',
      description: data['auth.description'] || 'No authentication required',
      requiredCredentials: this.parseArrayField(data['_source_data.required_credentials'])
    };
  }

  private parseClaudeConfig(data: Record<string, string>): ClaudeConfig | undefined {
    const configData = this.parseObjectField(data['_source_data.claude_config']);
    return configData as ClaudeConfig;
  }

  private parseRuntimeRequirements(data: Record<string, string>, type: string): RuntimeRequirements {
    const requirements: RuntimeRequirements = {
      platforms: ['linux', 'darwin', 'win32']
    };
    
    // Parse Node.js version from package.json
    if (type === 'npm' && data['_source_data.package_json.engines.node']) {
      requirements.nodeVersion = data['_source_data.package_json.engines.node'];
    }
    
    // Infer Python version from language or other indicators
    if (type === 'python') {
      requirements.pythonVersion = this.inferPythonVersion(data);
    }
    
    return requirements;
  }

  // Utility methods
  private parseArrayField(value: string | undefined): any[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private parseObjectField(value: string | undefined): any {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private detectInstallationType(command: string): 'npm' | 'python' | 'docker' | 'git' {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('npm') || lowerCommand.includes('npx')) return 'npm';
    if (lowerCommand.includes('pip') || lowerCommand.includes('python')) return 'python';
    if (lowerCommand.includes('docker')) return 'docker';
    if (lowerCommand.includes('git clone')) return 'git';
    return 'npm'; // default
  }

  private inferBaseImage(data: Record<string, string>): string {
    const images = this.parseArrayField(data['structured.docker.images']);
    if (images.length > 0) return images[0];
    
    const language = data['_source_data.language']?.toLowerCase();
    if (language === 'python') return 'python:3.12-alpine';
    return 'node:18-alpine';
  }

  private inferResourceRequirements(data: Record<string, string>) {
    // Default resource requirements based on server type/complexity
    const stars = parseInt(data['_source_data.stargazers_count']) || 0;
    const hasComplexFeatures = data['quality.score'] && parseFloat(data['quality.score']) > 120;
    
    return {
      memory: hasComplexFeatures ? '512m' : '256m',
      cpu: stars > 100 ? '0.5' : '0.3',
      pidsLimit: 100
    };
  }

  private inferPythonVersion(data: Record<string, string>): string {
    // Look for Python version indicators in readme or description
    const readme = data['_source_data.readme_content'] || '';
    const description = data.description || '';
    const content = (readme + ' ' + description).toLowerCase();
    
    if (content.includes('python 3.12')) return '>=3.12';
    if (content.includes('python 3.11')) return '>=3.11';
    if (content.includes('python 3.10')) return '>=3.10';
    if (content.includes('python 3.9')) return '>=3.9';
    if (content.includes('python 3.8')) return '>=3.8';
    
    return '>=3.8'; // Default minimum
  }
}

// Usage example:
export async function getStructuredServer(redis: any, serverId: string): Promise<ServerMetadata> {
  const transformer = new RedisServerTransformer();
  const rawData = await redis.hGetAll(`servers_enhanced_filtered:${serverId}`);
  return transformer.transformServer(rawData);
}

export async function getStructuredServers(redis: any, serverIds: string[]): Promise<ServerMetadata[]> {
  const transformer = new RedisServerTransformer();
  const servers: ServerMetadata[] = [];
  
  for (const id of serverIds) {
    const rawData = await redis.hGetAll(`servers_enhanced_filtered:${id}`);
    servers.push(transformer.transformServer(rawData));
  }
  
  return servers;
}
