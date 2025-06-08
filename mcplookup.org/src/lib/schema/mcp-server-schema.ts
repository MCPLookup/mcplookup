/**
 * Clean MCP Server Schema for CLI Tool
 * Transforms Redis hash data into structured, usable objects
 */

export interface MCPServer {
  // Core Identity
  id: string;
  name: string;
  description: string;
  category: string;
  subcategories: string[];
  
  // Quality & Trust
  quality: {
    score: number;        // 0-170
    category: 'low' | 'medium' | 'high';
    issues: string[];
    breakdown: {
      hasClaudeConfig: boolean;
      hasNpmPackage: boolean;
      hasPipInstall: boolean;
      hasDocker: boolean;
      hasGitInstall: boolean;
      hasExamples: boolean;
      hasEnvVars: boolean;
      stars: number;
    };
  };
  
  trustScore: number;     // 0-100
  verified: boolean;
  
  // Installation Methods
  installation: {
    methods: InstallationMethod[];
    recommended: 'npm' | 'python' | 'docker' | 'git';
    environmentVariables: EnvironmentVariable[];
  };
  
  // Package Information
  packages: {
    npm?: {
      name: string;
      command: string;
      requiresGlobal: boolean;
      nodeVersion?: string;
    };
    python?: {
      name: string;
      command: string;
      pythonVersion?: string;
    };
    docker?: {
      image: string;
      commands: string[];
      hasDocker: boolean;
    };
    git?: {
      url: string;
      command: string;
      setupInstructions: string;
    };
  };
  
  // Repository & Source
  repository: {
    url: string;
    source: 'github' | 'npm' | 'pypi' | 'docker';
    stars: number;
    forks: number;
    lastCommit: string;
    license?: string;
    language?: string;
    topics: string[];
  };
  
  // Capabilities
  capabilities: {
    intentKeywords: string[];
    useCases: string[];
    toolCount: number;
    examples: boolean;
  };
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    source: string;
    sourceId: string;
    lastAnalyzed: string;
  };
}

export interface InstallationMethod {
  type: 'npm' | 'python' | 'docker' | 'git';
  command: string;
  package?: string;
  image?: string;
  args?: string[];
  setupInstructions?: string;
}

export interface EnvironmentVariable {
  name: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
  type?: 'string' | 'number' | 'boolean' | 'url' | 'secret';
}

/**
 * Redis Data Transformer
 * Converts messy Redis hash data into clean MCPServer objects
 */
export class MCPServerTransformer {
  /**
   * Transform Redis hash data into clean MCPServer object
   */
  static transform(redisData: Record<string, string>): MCPServer {
    return {
      id: redisData._key || redisData.domain || 'unknown',
      name: redisData.name || this.extractNameFromKey(redisData._key),
      description: redisData.description || 'No description available',
      category: this.extractCategory(redisData),
      subcategories: this.parseArray(redisData['capabilities.subcategories']),
      
      quality: this.transformQuality(redisData),
      trustScore: parseInt(redisData.trust_score) || 0,
      verified: redisData.verification_status !== 'unverified',
      
      installation: this.transformInstallation(redisData),
      packages: this.transformPackages(redisData),
      repository: this.transformRepository(redisData),
      capabilities: this.transformCapabilities(redisData),
      metadata: this.transformMetadata(redisData)
    };
  }
  
  private static extractNameFromKey(key?: string): string {
    if (!key) return 'Unknown Server';
    return key.split('/').pop()?.replace(/[-_]/g, ' ') || 'Unknown Server';
  }
  
  private static extractCategory(data: Record<string, string>): string {
    return data['capabilities.category'] || 
           data['_source_data.mcp_category'] || 
           'other';
  }
  
  private static transformQuality(data: Record<string, string>) {
    const score = parseInt(data['quality.score']) || 0;
    let category: 'low' | 'medium' | 'high' = 'low';
    
    if (score >= 80) category = 'high';
    else if (score >= 50) category = 'medium';
    
    return {
      score,
      category,
      issues: this.parseArray(data['quality.issues']),
      breakdown: this.parseJSON(data['quality.breakdown'], {
        hasClaudeConfig: false,
        hasNpmPackage: false,
        hasPipInstall: false,
        hasDocker: false,
        hasGitInstall: false,
        hasExamples: false,
        hasEnvVars: false,
        stars: 0
      })
    };
  }
  
  private static transformInstallation(data: Record<string, string>) {
    const methods = this.parseInstallationMethods(data);
    const envVars = this.parseEnvironmentVariables(data);
    
    // Determine recommended method based on quality and availability
    let recommended: 'npm' | 'python' | 'docker' | 'git' = 'git';
    
    if (methods.find(m => m.type === 'npm')) recommended = 'npm';
    else if (methods.find(m => m.type === 'python')) recommended = 'python';
    else if (methods.find(m => m.type === 'docker')) recommended = 'docker';
    
    return {
      methods,
      recommended,
      environmentVariables: envVars
    };
  }
  
  private static parseInstallationMethods(data: Record<string, string>): InstallationMethod[] {
    const methods: InstallationMethod[] = [];
    
    // Parse structured installation methods
    const structuredMethods = this.parseArray(data['structured.installation.methods']);
    structuredMethods.forEach(method => {
      if (typeof method === 'object' && method.type) {
        methods.push({
          type: method.type,
          command: method.command || '',
          package: method.package,
          setupInstructions: method.setupInstructions
        });
      }
    });
    
    // Parse packages array for additional methods
    const packages = this.parseArray(data.packages);
    packages.forEach(pkg => {
      if (typeof pkg === 'object') {
        if (pkg.registry_name === 'npm') {
          methods.push({
            type: 'npm',
            command: pkg.installation_command || `npm install ${pkg.name}`,
            package: pkg.name
          });
        } else if (pkg.registry_name === 'pypi') {
          methods.push({
            type: 'python',
            command: pkg.installation_command || `pip install ${pkg.name}`,
            package: pkg.name
          });
        } else if (pkg.registry_name === 'github') {
          methods.push({
            type: 'git',
            command: pkg.installation_command || `git clone ${pkg.name}`,
            setupInstructions: pkg.setup_instructions
          });
        }
      }
    });
    
    return methods;
  }
  
  private static parseEnvironmentVariables(data: Record<string, string>): EnvironmentVariable[] {
    const envVars: EnvironmentVariable[] = [];
    
    // Parse structured environment variables
    const structuredEnv = this.parseArray(data['structured.environment.variables']);
    if (Array.isArray(structuredEnv)) {
      structuredEnv.forEach(envVar => {
        if (typeof envVar === 'string') {
          envVars.push({
            name: envVar,
            required: true
          });
        } else if (typeof envVar === 'object' && envVar.name) {
          envVars.push({
            name: envVar.name,
            required: envVar.required !== false,
            description: envVar.description,
            defaultValue: envVar.defaultValue,
            type: envVar.type
          });
        }
      });
    }
    
    // Parse source data environment variables
    const sourceEnv = this.parseJSON(data['_source_data.environment_variables']);
    if (sourceEnv && typeof sourceEnv === 'object') {
      Object.entries(sourceEnv).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          envVars.push({
            name: key,
            required: (value as any).required !== false,
            description: (value as any).description,
            type: (value as any).type
          });
        }
      });
    }
    
    return envVars;
  }
  
  private static transformPackages(data: Record<string, string>) {
    const packages: any = {};
    const breakdown = this.parseJSON(data['quality.breakdown'], {});
    
    // NPM Package
    if (breakdown.hasNpmPackage || data['_source_data.npm_package']) {
      packages.npm = {
        name: data['_source_data.npm_package'] || data['repository.npm_package'] || '',
        command: data['_source_data.installation_command'] || `npm install ${data['_source_data.npm_package']}`,
        requiresGlobal: false,
        nodeVersion: this.parseJSON(data['_source_data.package_json.engines.node'])
      };
    }
    
    // Python Package
    if (breakdown.hasPipInstall) {
      const methods = this.parseArray(data['structured.installation.methods']);
      const pythonMethod = methods.find((m: any) => m.type === 'python');
      if (pythonMethod) {
        packages.python = {
          name: pythonMethod.package || '',
          command: pythonMethod.command || `pip install ${pythonMethod.package}`,
          pythonVersion: '>=3.8'
        };
      }
    }
    
    // Docker Package
    if (breakdown.hasDocker || data['structured.docker.has_docker'] === 'true') {
      packages.docker = {
        image: this.parseArray(data['structured.docker.images'])[0] || 'node:18-alpine',
        commands: this.parseArray(data['structured.docker.commands']),
        hasDocker: true
      };
    }
    
    // Git Package
    if (breakdown.hasGitInstall) {
      packages.git = {
        url: data['repository.url'] || data['_source_data.clone_url'] || '',
        command: `git clone ${data['repository.url']}`,
        setupInstructions: 'Clone repository and follow README instructions'
      };
    }
    
    return packages;
  }
  
  private static transformRepository(data: Record<string, string>) {
    return {
      url: data['repository.url'] || data['_source_data.html_url'] || '',
      source: (data['repository.source'] || data._source || 'unknown') as any,
      stars: parseInt(data['repository.stars']) || parseInt(data['_source_data.stargazers_count']) || 0,
      forks: parseInt(data['repository.forks']) || parseInt(data['_source_data.forks_count']) || 0,
      lastCommit: data['repository.last_commit'] || data['_source_data.pushed_at'] || '',
      license: data['repository.license'] || data['_source_data.license'] || undefined,
      language: data['repository.language'] || data['_source_data.language'] || undefined,
      topics: this.parseArray(data['repository.topics']) || this.parseArray(data['_source_data.topics'])
    };
  }
  
  private static transformCapabilities(data: Record<string, string>) {
    return {
      intentKeywords: this.parseArray(data['capabilities.intent_keywords']),
      useCases: this.parseArray(data['capabilities.use_cases']),
      toolCount: this.parseArray(data['_source_data.tools']).length || 0,
      examples: this.parseArray(data['structured.examples']).length > 0
    };
  }
  
  private static transformMetadata(data: Record<string, string>) {
    return {
      createdAt: data.created_at || data['_source_data.created_at'] || '',
      updatedAt: data.updated_at || data['_source_data.updated_at'] || '',
      source: data._source || 'unknown',
      sourceId: data._source_id || '',
      lastAnalyzed: data.enhanced_filtered_at || ''
    };
  }
  
  // Helper methods
  private static parseArray(value?: string): any[] {
    if (!value) return [];
    if (typeof value !== 'string') return [];
    
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  
  private static parseJSON(value?: string, fallback: any = null): any {
    if (!value) return fallback;
    if (typeof value !== 'string') return value;
    
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
}

/**
 * CLI-specific helper methods
 */
export class MCPServerUtils {
  /**
   * Get the best installation method for CLI use
   */
  static getBestInstallationMethod(server: MCPServer): InstallationMethod | null {
    const { methods, recommended } = server.installation;
    
    // Try recommended method first
    const recommendedMethod = methods.find(m => m.type === recommended);
    if (recommendedMethod) return recommendedMethod;
    
    // Fallback priority: npm > python > docker > git
    const priorities = ['npm', 'python', 'docker', 'git'];
    for (const type of priorities) {
      const method = methods.find(m => m.type === type);
      if (method) return method;
    }
    
    return null;
  }
  
  /**
   * Get Docker command for any installation method
   */
  static getDockerCommand(server: MCPServer, method: InstallationMethod): string[] {
    const envArgs = server.installation.environmentVariables
      .filter(env => env.required)
      .flatMap(env => ['-e', `${env.name}=\${${env.name}}`]);
    
    switch (method.type) {
      case 'npm':
        return [
          'docker', 'run', '--rm', '-i',
          ...envArgs,
          'node:18-alpine',
          'sh', '-c',
          `npm install -g ${method.package} && npx ${method.package}`
        ];
        
      case 'python':
        return [
          'docker', 'run', '--rm', '-i',
          ...envArgs,
          'python:3.12-alpine',
          'sh', '-c',
          `pip install ${method.package} && python -m ${method.package.replace('-', '_')}`
        ];
        
      case 'docker':
        return server.packages.docker?.commands[0]?.split(' ') || [];
        
      default:
        return [];
    }
  }
  
  /**
   * Validate server quality for CLI installation
   */
  static isRecommendedForInstall(server: MCPServer): {
    recommended: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    
    if (server.quality.score < 50) {
      reasons.push(`Low quality score: ${server.quality.score}/170`);
    }
    
    if (server.quality.issues.length > 0) {
      reasons.push(`Quality issues: ${server.quality.issues.join(', ')}`);
    }
    
    if (server.installation.methods.length === 0) {
      reasons.push('No installation methods available');
    }
    
    if (!server.quality.breakdown.hasClaudeConfig) {
      reasons.push('No Claude Desktop configuration available');
    }
    
    return {
      recommended: reasons.length === 0 && server.quality.score >= 70,
      reasons
    };
  }
  
  /**
   * Format server for CLI display
   */
  static formatForCLI(server: MCPServer): string {
    const quality = server.quality.score;
    const qualityIcon = quality >= 80 ? '🟢' : quality >= 50 ? '🟡' : '🔴';
    const method = this.getBestInstallationMethod(server);
    const methodIcon = method?.type === 'npm' ? '📦' : 
                      method?.type === 'python' ? '🐍' : 
                      method?.type === 'docker' ? '🐳' : '📁';
    
    return [
      `${qualityIcon} ${server.name} (${quality}/170)`,
      `   ${server.description}`,
      `   ${methodIcon} ${method?.type || 'unknown'}: ${method?.command || 'No installation method'}`,
      `   ⭐ ${server.repository.stars} stars | 🏷️ ${server.category}`
    ].join('\n');
  }
}
