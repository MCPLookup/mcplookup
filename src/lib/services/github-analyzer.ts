// Integration between GitHub Auto-Registration and our GitHub Enhancement Pipeline
// This connects the UI registration with our existing GitHub analysis tools

// import { extractEnhancedClaudeConfig } from './claude-config-extractor.js';

export interface GitHubAnalysisResult {
  // Repository metadata
  repository: {
    owner: string;
    repo: string;
    full_name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    topics: string[];
    license: string | null;
    created_at: string;
    updated_at: string;
  };
  
  // MCP-specific analysis
  mcp_analysis: {
    has_claude_config: boolean;
    claude_configs: any[];
    npm_package: string | null;
    installation_command: string | null;
    environment_variables: string[];
    auth_requirements: string[];
    suggested_auth_type: 'none' | 'api_key' | 'oauth2' | 'basic';
  };
  
  // Suggested registration data
  suggestions: {
    domain: string;
    endpoint: string | null;
    name: string;
    description: string;
    capabilities: string[];
    category: string;
  };
  
  // Quality indicators
  quality: {
    has_readme: boolean;
    has_package_json: boolean;
    has_mcp_keywords: boolean;
    documentation_quality: 'poor' | 'fair' | 'good' | 'excellent';
    overall_score: number; // 0-100
  };
}

/**
 * Enhanced GitHub repository analyzer that uses our existing pipeline
 */
export class GitHubRepositoryAnalyzer {
  private githubToken: string | null;
  
  constructor(githubToken?: string) {
    this.githubToken = githubToken || process.env.GITHUB_TOKEN || null;
  }
  
  /**
   * Analyze a GitHub repository for MCP server registration
   */
  async analyzeRepository(githubUrl: string): Promise<GitHubAnalysisResult | null> {
    try {
      // Extract owner/repo from URL
      const repoInfo = this.parseGitHubUrl(githubUrl);
      if (!repoInfo) {
        throw new Error('Invalid GitHub URL format');
      }
      
      // Fetch repository data
      const repoData = await this.fetchRepositoryData(repoInfo.owner, repoInfo.repo);
      if (!repoData) {
        throw new Error('Failed to fetch repository data');
      }
      
      // Fetch README content
      const readmeContent = await this.fetchReadmeContent(repoInfo.owner, repoInfo.repo);
      
      // Fetch package.json if it exists
      const packageJson = await this.fetchPackageJson(repoInfo.owner, repoInfo.repo);
      
      // Perform MCP-specific analysis
      const mcpAnalysis = await this.analyzeMCPFeatures(
        readmeContent, 
        packageJson, 
        repoData,
        repoInfo.owner,
        repoInfo.repo
      );
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(repoData, mcpAnalysis);
      
      // Assess quality
      const quality = this.assessQuality(repoData, readmeContent, packageJson, mcpAnalysis);
      
      return {
        repository: {
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          full_name: repoData.full_name,
          description: repoData.description || '',
          stars: repoData.stargazers_count || 0,
          forks: repoData.forks_count || 0,
          language: repoData.language || '',
          topics: repoData.topics || [],
          license: repoData.license?.spdx_id || null,
          created_at: repoData.created_at,
          updated_at: repoData.updated_at
        },
        mcp_analysis: mcpAnalysis,
        suggestions,
        quality
      };
      
    } catch (error) {
      console.error('GitHub repository analysis failed:', error);
      return null;
    }
  }
  
  /**
   * Parse GitHub URL to extract owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== 'github.com') {
        return null;
      }
      
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) {
        return null;
      }
      
      return {
        owner: pathParts[0],
        repo: pathParts[1]
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Fetch repository data from GitHub API
   */
  private async fetchRepositoryData(owner: string, repo: string): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MCPLookup-Analyzer/1.0'
    };
    
    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  }
  
  /**
   * Fetch README content
   */
  private async fetchReadmeContent(owner: string, repo: string): Promise<string | null> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MCPLookup-Analyzer/1.0'
    };
    
    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }
    
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Fetch package.json content
   */
  private async fetchPackageJson(owner: string, repo: string): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MCPLookup-Analyzer/1.0'
    };
    
    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }
    
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
        headers
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Analyze MCP-specific features using our existing pipeline
   */
  private async analyzeMCPFeatures(
    readmeContent: string | null,
    packageJson: any,
    repoData: any,
    owner: string,
    repo: string
  ) {
    const analysis = {
      has_claude_config: false,
      claude_configs: [] as any[],
      npm_package: null as string | null,
      installation_command: null as string | null,
      environment_variables: [] as string[],
      auth_requirements: [] as string[],
      suggested_auth_type: 'none' as 'none' | 'api_key' | 'oauth2' | 'basic'
    };
    
    // Use our existing Claude config extractor (temporarily disabled)
    if (readmeContent) {
      try {
        // TODO: Re-enable when claude-config-extractor is available
        /*
        const claudeConfigResult = await extractEnhancedClaudeConfig(
          `${owner}/${repo}`,
          readmeContent,
          packageJson
        );
        
        if (claudeConfigResult) {
          analysis.has_claude_config = claudeConfigResult.claude_configs.length > 0;
          analysis.claude_configs = claudeConfigResult.claude_configs;
          analysis.environment_variables = claudeConfigResult.analysis.unique_env_vars;
        }
        */
      } catch (error) {
        console.warn('Claude config extraction failed:', error);
      }
    }
    
    // Extract NPM package information
    if (packageJson) {
      analysis.npm_package = packageJson.name;
      if (packageJson.name) {
        analysis.installation_command = `npm install -g ${packageJson.name}`;
      }
    }
    
    // Analyze authentication requirements
    const authKeywords = ['api_key', 'token', 'secret', 'auth', 'oauth', 'bearer'];
    const envVarText = analysis.environment_variables.join(' ').toLowerCase();
    const readmeText = (readmeContent || '').toLowerCase();
    
    if (authKeywords.some(keyword => envVarText.includes(keyword) || readmeText.includes(keyword))) {
      if (readmeText.includes('oauth') || readmeText.includes('bearer')) {
        analysis.suggested_auth_type = 'oauth2';
      } else {
        analysis.suggested_auth_type = 'api_key';
      }
      
      analysis.auth_requirements = analysis.environment_variables.filter(env =>
        authKeywords.some(keyword => env.toLowerCase().includes(keyword))
      );
    }
    
    return analysis;
  }
  
  /**
   * Generate registration suggestions
   */
  private generateSuggestions(repoData: any, mcpAnalysis: any) {
    const capabilities = this.inferCapabilities(repoData, mcpAnalysis);
    
    return {
      domain: `github.com/${repoData.full_name}`,
      endpoint: null, // Package-only by default
      name: this.formatName(repoData.name),
      description: repoData.description || `MCP server from ${repoData.full_name}`,
      capabilities,
      category: capabilities[0] || 'other'
    };
  }
  
  /**
   * Infer capabilities from repository data
   */
  private inferCapabilities(repoData: any, mcpAnalysis: any): string[] {
    const capabilities = new Set<string>();
    
    // Capability mapping
    const capabilityMap: Record<string, string> = {
      'email': 'communication',
      'slack': 'communication',
      'discord': 'communication',
      'database': 'data',
      'postgresql': 'data',
      'mysql': 'data',
      'mongodb': 'data',
      'filesystem': 'data',
      'calendar': 'productivity',
      'todo': 'productivity',
      'notes': 'productivity',
      'ai': 'development',
      'llm': 'development',
      'openai': 'development'
    };
    
    // From topics
    repoData.topics?.forEach((topic: string) => {
      if (capabilityMap[topic.toLowerCase()]) {
        capabilities.add(capabilityMap[topic.toLowerCase()]);
      }
    });
    
    // From description
    const description = (repoData.description || '').toLowerCase();
    Object.entries(capabilityMap).forEach(([keyword, capability]) => {
      if (description.includes(keyword)) {
        capabilities.add(capability);
      }
    });
    
    // From environment variables
    mcpAnalysis.environment_variables.forEach((envVar: string) => {
      const envLower = envVar.toLowerCase();
      Object.entries(capabilityMap).forEach(([keyword, capability]) => {
        if (envLower.includes(keyword)) {
          capabilities.add(capability);
        }
      });
    });
    
    return Array.from(capabilities);
  }
  
  /**
   * Format repository name for display
   */
  private formatName(repoName: string): string {
    return repoName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Mcp/g, 'MCP');
  }
  
  /**
   * Assess repository quality for MCP server registration
   */
  private assessQuality(
    repoData: any,
    readmeContent: string | null,
    packageJson: any,
    mcpAnalysis: any
  ) {
    let score = 0;
    
    // Base repository quality (40 points)
    if (readmeContent && readmeContent.length > 500) score += 15;
    if (repoData.description && repoData.description.length > 20) score += 10;
    if (repoData.stargazers_count > 5) score += 10;
    if (repoData.license) score += 5;
    
    // MCP-specific quality (40 points)
    if (mcpAnalysis.has_claude_config) score += 20;
    if (mcpAnalysis.npm_package) score += 10;
    if (mcpAnalysis.environment_variables.length > 0) score += 5;
    if (packageJson) score += 5;
    
    // Documentation quality (20 points)
    const docKeywords = ['installation', 'usage', 'example', 'configuration'];
    const readmeText = (readmeContent || '').toLowerCase();
    const docScore = docKeywords.filter(keyword => readmeText.includes(keyword)).length;
    score += Math.min(docScore * 5, 20);
    
    let documentationQuality: 'poor' | 'fair' | 'good' | 'excellent';
    if (score >= 80) documentationQuality = 'excellent';
    else if (score >= 60) documentationQuality = 'good';
    else if (score >= 40) documentationQuality = 'fair';
    else documentationQuality = 'poor';
    
    return {
      has_readme: !!readmeContent,
      has_package_json: !!packageJson,
      has_mcp_keywords: readmeText.includes('mcp') || readmeText.includes('model context protocol'),
      documentation_quality: documentationQuality,
      overall_score: Math.min(score, 100)
    };
  }
}
