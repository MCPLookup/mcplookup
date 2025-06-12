/**
 * GitHub Client
 * Handles GitHub API operations like search and file downloads
 */

import { GitHubRepo } from './types.js';
import { AIProvider } from './parsers/ai-provider.js';
import {
  GitHubRepository,
  GitHubRepoWithInstallation,
  FileContent,
  InstallationMethod,
  ParsingMetadata,
  getAIAnalysisSchema,
  installationMethodSchema,
  validateAIResponse
} from '@mcplookup-org/mcp-sdk';
import { ProgressUpdate, RepoAnalysisProgress, SearchProgress, FileDownloadProgress, AIParsingProgress } from '@mcplookup-org/mcp-sdk';
import {
  buildMcpAnalysisPrompt,
  buildInstallationExtractionPrompt,
  PromptContext
} from './prompts/mcp-analysis-prompt.js';

export class GitHubClient {
  private readonly baseUrl = 'https://api.github.com';
  private readonly token?: string;
  private aiProvider: AIProvider;
  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
    this.aiProvider = new AIProvider();
  }

  /**
   * Set the AI provider for parsing installation methods
   * @param provider - AI provider instance (e.g., OpenAIParser, GeminiJSONParser)
   */
  setAIProvider(provider: AIProvider): void {
    this.aiProvider = provider;
  }

  /**
   * Search GitHub repositories by query string
   */
  async search(query: string): Promise<GitHubRepo[]> {
    const headers = this.getHeaders();
    const searchUrl = `${this.baseUrl}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`;

    try {
      const response = await fetch(searchUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }      const data = await response.json() as any;
      
      return data.items.map((item: any) => ({
        name: item.name,
        fullName: item.full_name,
        description: item.description,
        stars: item.stargazers_count,
        url: item.html_url,
        language: item.language,
      }));

    } catch (error) {
      
      return [];
    }
  }

  /**
   * Download a file from a GitHub repository
   * @param repo - Repository in format "owner/repo" or GitHubRepo object
   * @param path - File path like "README.md" or "src/index.ts"
   * @returns Promise<string> - File content as string
   */
  async downloadFile(repo: string | GitHubRepo, path: string): Promise<string> {
    const repoName = typeof repo === 'string' ? repo : repo.fullName;
    const headers = this.getHeaders();
    
    // Use the contents API to get file content
    const fileUrl = `${this.baseUrl}/repos/${repoName}/contents/${path}`;

    try {
      
      
      const response = await fetch(fileUrl, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File '${path}' not found in repository '${repoName}'`);
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }      const data = await response.json() as any;
      
      // GitHub API returns file content as base64 encoded
      if (data.content && data.encoding === 'base64') {
        const content = atob(data.content.replace(/\s/g, ''));
        
        return content;
      }
      
      throw new Error('Unexpected file format from GitHub API');

    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Search GitHub repositories and return fully populated repo objects with AI-parsed installation methods
   * @param query - Search query (e.g., "mcp server", "claude mcp", "python mcp")
   * @param maxResults - Maximum number of repositories to process (default: 5)
   * @returns Promise<GitHubRepoWithInstallation[]> - Fully populated repo objects
   */
  async searchAndParse(query: string, maxResults: number = 5): Promise<GitHubRepoWithInstallation[]> {
    
    
    // First, search for repositories
    const repos = await this.search(query);
    
    if (repos.length === 0) {
      
      return [];
    }
    
    
    
    const results: GitHubRepoWithInstallation[] = [];
    
    // Process each repository (limit to maxResults)
    for (let i = 0; i < Math.min(maxResults, repos.length); i++) {
      const repo = repos[i];
      
      
      try {
        const fullRepo = await this.getFullRepositoryData(repo);
        results.push(fullRepo);
        
      } catch (error) {
        
        // Continue with next repo instead of failing completely
      }
    }
    
    
    return results;
  }  /**
   * Get complete repository data with AI-parsed installation methods
   * @param repo - Basic repository info or repo name
   * @returns Promise<GitHubRepoWithInstallation> - Complete repo data
   */  async getFullRepositoryData(repo: GitHubRepo | string): Promise<GitHubRepoWithInstallation> {
    const repoName = typeof repo === 'string' ? repo : repo.fullName;
    
    
    // Get detailed repository information
    const detailedRepo = await this.getRepositoryDetails(repoName);
    
    // Download key files for analysis
    const files = await this.downloadKeyFiles(repoName);
    
    // Perform comprehensive AI analysis
    const aiAnalysis = await this.analyzeRepositoryWithAI(files, repoName, detailedRepo);
    
    // Update the repository with AI-determined MCP fields
    const enhancedRepo = { 
      ...detailedRepo, 
      isMCP: aiAnalysis.isMcpServer
    };
    
    // Generate parsing metadata
    const parsingMetadata: ParsingMetadata = {
      parsedAt: new Date().toISOString(),
      sourceFiles: files.map(f => f.path),
      methodCount: aiAnalysis.installationMethods.length,
      extractionSuccessful: aiAnalysis.installationMethods.length > 0
    };
    
    // Compute additional fields with MCP classification info
    const computed = {
      ...aiAnalysis.computed,
      isMcpServer: aiAnalysis.isMcpServer,
      mcpClassification: aiAnalysis.mcpClassification,
      mcpConfidence: aiAnalysis.mcpConfidence,
      mcpReasoning: aiAnalysis.mcpReasoning
    };
    
    return {
      repository: enhancedRepo,
      files,
      installationMethods: aiAnalysis.installationMethods as any,
      parsingMetadata,
      computed
    };
  }

  /**
   * Get detailed repository information from GitHub API
   */
  private async getRepositoryDetails(repoName: string): Promise<GitHubRepository> {
    const headers = this.getHeaders();
    const repoUrl = `${this.baseUrl}/repos/${repoName}`;
    
    
    
    const response = await fetch(repoUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      url: data.html_url,
      htmlUrl: data.html_url,
      cloneUrl: data.clone_url,
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.watchers_count,
      size: data.size,
      language: data.language,
      topics: data.topics || [],
      license: data.license ? {
        key: data.license.key,
        name: data.license.name,
        spdxId: data.license.spdx_id
      } : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      defaultBranch: data.default_branch,
      archived: data.archived,
      fork: data.fork,
      private: data.private,
      hasIssues: data.has_issues,
      hasWiki: data.has_wiki,
      hasPages: data.has_pages,
      owner: {
        login: data.owner.login,
        type: data.owner.type,
        avatarUrl: data.owner.avatar_url
      }
    };
  }
  /**
   * Download key files for installation analysis
   */
  private async downloadKeyFiles(repoName: string): Promise<FileContent[]> {
    const filesToTry = [
      'README.md',
      'README.rst', 
      'package.json',
      'pyproject.toml',
      'Cargo.toml',
      'go.mod',
      'Dockerfile',
      'docker-compose.yml',
      'requirements.txt',
      'setup.py',
      'Makefile',
      'INSTALL.md',
      'INSTALLATION.md',
      '.env.example',
      'smithery.yaml'
    ];
    
    const files: FileContent[] = [];
    
    for (const filePath of filesToTry) {
      try {
        const content = await this.downloadFile(repoName, filePath);
        files.push({
          path: filePath,
          content: content,
          size: content.length,
          lastModified: new Date().toISOString()
        });
      } catch (error) {
        // File doesn't exist, continue to next file
        continue;
      }
    }
      
    return files;
  }

  /**
   * Download key files with progress updates (AsyncGenerator version)
   */
  private async *downloadKeyFilesWithProgress(repoName: string): AsyncGenerator<FileDownloadProgress, FileContent[], void> {
    const filesToTry = [
      'README.md',
      'README.rst', 
      'package.json',
      'pyproject.toml',
      'Cargo.toml',
      'go.mod',
      'Dockerfile',
      'docker-compose.yml',
      'requirements.txt',
      'setup.py',
      'Makefile',
      'INSTALL.md',
      'INSTALLATION.md',
      '.env.example',
      'smithery.yaml'
    ];
    
    const files: FileContent[] = [];
    const downloadedFiles: string[] = [];
    const skippedFiles: string[] = [];
    
    for (let i = 0; i < filesToTry.length; i++) {
      const filePath = filesToTry[i];
      const progress = Math.round(((i + 1) / filesToTry.length) * 100);
      
      yield {
        step: 'downloading_files',
        progress,
        message: `Trying to download ${filePath}...`,
        timestamp: new Date().toISOString(),
        repoName,
        fileName: filePath,
        fileIndex: i,
        totalFiles: filesToTry.length,
        downloadedFiles: [...downloadedFiles],
        skippedFiles: [...skippedFiles]
      };
      
      try {
        const content = await this.downloadFile(repoName, filePath);
        files.push({
          path: filePath,
          content: content,
          size: content.length,
          lastModified: new Date().toISOString()
        });
        downloadedFiles.push(filePath);
        
        yield {
          step: 'downloading_files',
          progress,
          message: `✅ Downloaded ${filePath} (${content.length} chars)`,
          timestamp: new Date().toISOString(),
          repoName,
          fileName: filePath,
          fileIndex: i,
          totalFiles: filesToTry.length,
          downloadedFiles: [...downloadedFiles],
          skippedFiles: [...skippedFiles]
        };
      } catch (error) {
        skippedFiles.push(filePath);
        yield {
          step: 'downloading_files',
          progress,
          message: `⏭️ Skipped ${filePath} (not found)`,
          timestamp: new Date().toISOString(),
          repoName,
          fileName: filePath,
          fileIndex: i,
          totalFiles: filesToTry.length,
          downloadedFiles: [...downloadedFiles],
          skippedFiles: [...skippedFiles]
        };
      }
    }
    
    return files;  }  /**
   * Comprehensive AI analysis of repository for full schema population
   */
  private async analyzeRepositoryWithAI(files: FileContent[], repoName: string, repoData: GitHubRepository): Promise<{
    installationMethods: InstallationMethod[];
    mcpClassification: string;
    mcpConfidence: number;
    mcpReasoning: string;
    isMcpServer: boolean;
    computed: any;
  }> {
    if (files.length === 0) {
      return {
        installationMethods: [],
        mcpClassification: "not_mcp_related",
        mcpConfidence: 0.9,
        mcpReasoning: "No files available for analysis",
        isMcpServer: false,
        computed: this.computeRepositoryMetrics(repoData, [])
      };
    }
    
    // Combine file contents for analysis
    const combinedContent = files.map(file => 
      `=== ${file.path} ===\n${file.content}\n`
    ).join('\n');    // Build the prompt using the new prompt system
    const promptContext: PromptContext = {
      repoName,
      repoDescription: repoData.description || undefined,
      repoTopics: repoData.topics,
      primaryLanguage: repoData.language || undefined,
      combinedContent
    };

    const prompt = buildMcpAnalysisPrompt(promptContext);
    const responseSchema = getAIAnalysisSchema();

    try {
      const response = await this.aiProvider.parseWithSchema(prompt, responseSchema);
      
      if (response && response.mcpClassification && Array.isArray(response.installationMethods)) {
        // Ensure isMcpServer is consistent with classification
        const actuallyMcpServer = response.mcpClassification === "mcp_server";
        
        return {
          installationMethods: response.installationMethods,
          mcpClassification: response.mcpClassification,
          mcpConfidence: response.mcpConfidence || 0.5,
          mcpReasoning: response.mcpReasoning || "AI analysis completed",
          isMcpServer: actuallyMcpServer,
          computed: response.computed || this.computeRepositoryMetrics(repoData, response.installationMethods)
        };
      } else {
        return {
          installationMethods: [],
          mcpClassification: "not_mcp_related",
          mcpConfidence: 0.3,
          mcpReasoning: "AI analysis failed to return valid response structure",
          isMcpServer: false,
          computed: this.computeRepositoryMetrics(repoData, [])
        };
      }
    } catch (error: any) {
      return {
        installationMethods: [],
        mcpClassification: "not_mcp_related",
        mcpConfidence: 0.1,
        mcpReasoning: `AI analysis failed: ${error.message}`,
        isMcpServer: false,
        computed: this.computeRepositoryMetrics(repoData, [])
      };
    }
  }
  /**
   * Parse installation methods using AI (legacy method - now calls comprehensive analysis)
   */
  private async parseInstallationMethods(files: FileContent[], repoName: string): Promise<InstallationMethod[]> {
    // For backward compatibility, we'll extract just the installation methods
    // from the comprehensive analysis
    const repoData = await this.getRepositoryDetails(repoName);
    const analysis = await this.analyzeRepositoryWithAI(files, repoName, repoData);
    return analysis.installationMethods;
  }
  /**
   * Comprehensive AI analysis with progress updates (AsyncGenerator version)
   */
  private async *analyzeRepositoryWithAIProgress(files: FileContent[], repoName: string, repoData: GitHubRepository): AsyncGenerator<AIParsingProgress, {
    installationMethods: InstallationMethod[];
    mcpClassification: string;
    mcpConfidence: number;
    mcpReasoning: string;
    isMcpServer: boolean;
    computed: any;
  }, void> {
    if (files.length === 0) {
      yield {
        step: 'parsing_ai',
        progress: 100,
        message: 'No files to analyze',
        timestamp: new Date().toISOString(),
        repoName,
        provider: 'none',
        stage: 'complete'
      };
      return {
        installationMethods: [],
        mcpClassification: "not_mcp_related",
        mcpConfidence: 0.9,
        mcpReasoning: "No files available for analysis",
        isMcpServer: false,
        computed: this.computeRepositoryMetrics(repoData, [])
      };
    }

    // Stage 1: Preparing
    yield {
      step: 'parsing_ai',
      progress: 10,
      message: 'Preparing comprehensive repository analysis...',
      timestamp: new Date().toISOString(),
      repoName,
      provider: this.aiProvider.constructor.name,
      stage: 'preparing',
      data: { fileCount: files.length }
    };
      // Combine file contents for analysis
    const combinedContent = files.map(file => 
      `=== ${file.path} ===\n${file.content}\n`
    ).join('\n');

    const tokenCount = Math.round(combinedContent.length / 4); // Rough token estimate

    yield {
      step: 'parsing_ai',
      progress: 25,
      message: `Content prepared for comprehensive analysis (~${tokenCount} tokens)`,
      timestamp: new Date().toISOString(),
      repoName,
      provider: this.aiProvider.constructor.name,
      stage: 'preparing',
      tokenCount
    };

    // Build the prompt using the new prompt system
    const promptContext: PromptContext = {
      repoName,
      repoDescription: repoData.description || undefined,
      repoTopics: repoData.topics,
      primaryLanguage: repoData.language || undefined,
      combinedContent
    };

    const prompt = buildMcpAnalysisPrompt(promptContext);

    // Stage 2: Calling API
    yield {
      step: 'parsing_ai',
      progress: 40,
      message: 'Calling AI provider for comprehensive analysis...',
      timestamp: new Date().toISOString(),
      repoName,
      provider: this.aiProvider.constructor.name,
      stage: 'calling_api',
      tokenCount
    };

    // Get the comprehensive response schema
    const responseSchema = getAIAnalysisSchema();

    try {
      // Stage 3: Parsing response
      yield {
        step: 'parsing_ai',
        progress: 70,
        message: 'AI analyzing repository comprehensively...',
        timestamp: new Date().toISOString(),
        repoName,
        provider: this.aiProvider.constructor.name,
        stage: 'parsing_response',
        tokenCount
      };

      const response = await this.aiProvider.parseWithSchema(prompt, responseSchema);
      
      // Stage 4: Validating
      yield {
        step: 'parsing_ai',
        progress: 90,
        message: 'Validating comprehensive analysis...',
        timestamp: new Date().toISOString(),
        repoName,
        provider: this.aiProvider.constructor.name,
        stage: 'validating',
        tokenCount
      };
        if (response && response.mcpClassification && Array.isArray(response.installationMethods)) {
        // Ensure isMcpServer is consistent with classification
        const actuallyMcpServer = response.mcpClassification === "mcp_server";
        
        yield {
          step: 'parsing_ai',
          progress: 100,
          message: `✅ Complete analysis: ${response.mcpClassification} (${response.installationMethods.length} installation methods)`,
          timestamp: new Date().toISOString(),
          repoName,
          provider: this.aiProvider.constructor.name,
          stage: 'complete',
          tokenCount,
          methodsFound: response.installationMethods.length
        };
        
        return {
          installationMethods: response.installationMethods,
          mcpClassification: response.mcpClassification,
          mcpConfidence: response.mcpConfidence || 0.5,
          mcpReasoning: response.mcpReasoning || "AI analysis completed",
          isMcpServer: actuallyMcpServer,
          computed: response.computed || this.computeRepositoryMetrics(repoData, response.installationMethods)
        };
      } else {
        yield {
          step: 'parsing_ai',
          progress: 100,
          message: '⚠️ AI response did not contain valid comprehensive analysis',
          timestamp: new Date().toISOString(),
          repoName,
          provider: this.aiProvider.constructor.name,
          stage: 'complete',
          tokenCount,
          methodsFound: 0
        };
        return {
          installationMethods: [],
          mcpClassification: "not_mcp_related",
          mcpConfidence: 0.3,
          mcpReasoning: "AI analysis failed to return valid response structure",
          isMcpServer: false,
          computed: this.computeRepositoryMetrics(repoData, [])
        };
      }
      
    } catch (error: any) {
      yield {
        step: 'parsing_ai',
        progress: 100,
        message: `❌ Comprehensive analysis failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        repoName,
        provider: this.aiProvider.constructor.name,
        stage: 'complete',
        tokenCount,
        methodsFound: 0
      };
      return {
        installationMethods: [],
        mcpClassification: "not_mcp_related",
        mcpConfidence: 0.1,
        mcpReasoning: `AI analysis failed: ${error.message}`,
        isMcpServer: false,
        computed: this.computeRepositoryMetrics(repoData, [])
      };
    }
  }

  /**
   * Parse installation methods using AI with progress updates (AsyncGenerator version)
   * DEPRECATED: Use analyzeRepositoryWithAIProgress for comprehensive analysis
   */
  private async *parseInstallationMethodsWithProgress(files: FileContent[], repoName: string): AsyncGenerator<AIParsingProgress, InstallationMethod[], void> {
    if (files.length === 0) {
      yield {
        step: 'parsing_ai',
        progress: 100,
        message: 'No files to analyze',
        timestamp: new Date().toISOString(),
        repoName,
        provider: 'none',
        stage: 'complete'
      };
      return [];
    }

    // Stage 1: Preparing
    yield {
      step: 'parsing_ai',
      progress: 10,
      message: 'Preparing content for AI analysis...',
      timestamp: new Date().toISOString(),
      repoName,
      provider: this.aiProvider.constructor.name,
      stage: 'preparing',
      data: { fileCount: files.length }
    };
      // Combine file contents for analysis
    const combinedContent = files.map(file => 
      `=== ${file.path} ===\n${file.content}\n`
    ).join('\n');

    const tokenCount = Math.round(combinedContent.length / 4); // Rough token estimate

    yield {
      step: 'parsing_ai',
      progress: 25,
      message: `Content prepared (~${tokenCount} tokens)`,
      timestamp: new Date().toISOString(),
      repoName,
      provider: this.aiProvider.constructor.name,
      stage: 'preparing',
      tokenCount
    };

    // Build the prompt using the new prompt system for installation extraction only
    const promptContext: PromptContext = {
      repoName,
      repoDescription: undefined,
      repoTopics: [],
      primaryLanguage: undefined,
      combinedContent
    };

    const prompt = buildInstallationExtractionPrompt(promptContext);

    // Stage 2: Calling API
    yield {
      step: 'parsing_ai',
      progress: 40,
      message: 'Calling AI provider...',
      timestamp: new Date().toISOString(),
      repoName,
      provider: this.aiProvider.constructor.name,
      stage: 'calling_api',
      tokenCount
    };

    // Create the response schema for AI
    const responseSchema = {
      type: "object",
      properties: {
        methods: {
          type: "array", 
          items: installationMethodSchema
        }
      },
      required: ["methods"]
    };

    try {
      // Stage 3: Parsing response
      yield {
        step: 'parsing_ai',
        progress: 70,
        message: 'AI processing response...',
        timestamp: new Date().toISOString(),
        repoName,
        provider: this.aiProvider.constructor.name,
        stage: 'parsing_response',
        tokenCount
      };

      const response = await this.aiProvider.parseWithSchema(prompt, responseSchema);
      
      // Stage 4: Validating
      yield {
        step: 'parsing_ai',
        progress: 90,
        message: 'Validating extracted methods...',
        timestamp: new Date().toISOString(),
        repoName,
        provider: this.aiProvider.constructor.name,
        stage: 'validating',
        tokenCount
      };
      
      if (response && response.methods && Array.isArray(response.methods)) {
        yield {
          step: 'parsing_ai',
          progress: 100,
          message: `✅ Extracted ${response.methods.length} installation methods`,
          timestamp: new Date().toISOString(),
          repoName,
          provider: this.aiProvider.constructor.name,
          stage: 'complete',
          tokenCount,
          methodsFound: response.methods.length
        };
        return response.methods;
      } else {
        yield {
          step: 'parsing_ai',
          progress: 100,
          message: '⚠️ AI response did not contain methods array',
          timestamp: new Date().toISOString(),
          repoName,
          provider: this.aiProvider.constructor.name,
          stage: 'complete',
          tokenCount,
          methodsFound: 0
        };
        return [];
      }
        } catch (error: any) {
      yield {
        step: 'parsing_ai',
        progress: 100,
        message: `❌ AI parsing failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        repoName,
        provider: this.aiProvider.constructor.name,
        stage: 'complete',
        tokenCount,
        methodsFound: 0      };
      return [];
    }
  }

  /**
   * Compute additional repository metrics
   */
  private computeRepositoryMetrics(repo: GitHubRepository, methods: any[]) {
    const isMcpServer = repo.description?.toLowerCase().includes('mcp') || 
                       repo.topics.some(topic => topic.includes('mcp')) ||
                       methods.some(method => method.description.toLowerCase().includes('mcp'));
    
    const platforms = new Set<string>();
    methods.forEach(method => {
      if (method.platform) platforms.add(method.platform);
    });
    
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (methods.length > 10) complexity = 'complex';
    else if (methods.length > 5) complexity = 'moderate';
    
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    const hasComplexSetup = methods.some(m => 
      m.category === 'configure' && m.variables && Object.keys(m.variables).length > 3
    );
    
    if (hasComplexSetup || methods.length > 8) difficulty = 'hard';
    else if (methods.length > 4) difficulty = 'medium';
    
    const tags = [...repo.topics, ...(isMcpServer ? ['mcp-server'] : [])];
    
    // Enhanced fields for comprehensive analysis
    const hasClaudeDesktopConfig = methods.some(m => 
      m.category === 'configure' && m.description.toLowerCase().includes('claude desktop')
    );
    
    const hasEnvironmentVars = methods.some(m => 
      m.variables && Object.keys(m.variables).length > 0
    );
    
    const hasDocumentation = repo.description && repo.description.length > 50;
    const hasExamples = methods.some(m => m.category === 'test' || m.description.toLowerCase().includes('example'));
    
    // Determine maturity level based on repository characteristics
    let maturityLevel: 'experimental' | 'alpha' | 'beta' | 'stable' | 'production' = 'experimental';
    
    if (repo.stars > 1000 && hasDocumentation && methods.length > 3) {
      maturityLevel = 'production';
    } else if (repo.stars > 100 && hasDocumentation) {
      maturityLevel = 'stable';
    } else if (repo.stars > 50 || methods.length > 2) {
      maturityLevel = 'beta';
    } else if (methods.length > 1) {
      maturityLevel = 'alpha';
    }
    
    return {
      isMcpServer,
      primaryLanguage: repo.language || 'Unknown',
      complexity,
      installationDifficulty: difficulty,
      supportedPlatforms: Array.from(platforms),
      tags,
      
      // Enhanced computed fields
      mcpTools: [], // Will be populated by AI analysis
      mcpResources: [], // Will be populated by AI analysis
      mcpPrompts: [], // Will be populated by AI analysis
      requiresClaudeDesktop: hasClaudeDesktopConfig,
      requiresEnvironmentVars: hasEnvironmentVars,
      hasDocumentation,
      hasExamples,
      maturityLevel
    };
  }

  /**
   * Get common headers for GitHub API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'mcp-github-parser',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }  /**
   * Search GitHub repositories with progress updates (AsyncGenerator version)
   * Yields progress updates and returns list of found repositories
   * @param query - Search query
   * @param maxResults - Maximum repositories to return
   */
  async *searchRepositoriesWithProgress(query: string, maxResults: number = 10): AsyncGenerator<SearchProgress, GitHubRepo[], void> {
    const startTime = Date.now();
    
    // Initial progress
    yield {
      step: 'searching',
      progress: 0,
      message: `🔍 Searching GitHub for: "${query}"`,
      timestamp: new Date().toISOString(),
      totalRepos: 0,
      completedRepos: 0,
      failedRepos: []
    };

    // Progress during API call
    yield {
      step: 'searching',
      progress: 30,
      message: `📡 Calling GitHub API...`,
      timestamp: new Date().toISOString(),
      totalRepos: 0,
      completedRepos: 0,
      failedRepos: []
    };

    // Search for repositories
    const repos = await this.search(query);
    
    if (repos.length === 0) {
      yield {
        step: 'searching',
        progress: 100,
        message: '❌ No repositories found',
        timestamp: new Date().toISOString(),
        totalRepos: 0,
        completedRepos: 0,
        failedRepos: []
      };
      return [];
    }

    // Progress after getting results
    yield {
      step: 'searching',
      progress: 70,
      message: `📋 Found ${repos.length} repositories`,
      timestamp: new Date().toISOString(),
      totalRepos: repos.length,
      completedRepos: 0,
      failedRepos: []
    };

    // Limit results
    const limitedRepos = repos.slice(0, maxResults);
    
    // Final progress
    yield {
      step: 'searching',
      progress: 100,
      message: `✅ Search complete - returning top ${limitedRepos.length} repositories`,
      timestamp: new Date().toISOString(),
      totalRepos: limitedRepos.length,
      completedRepos: limitedRepos.length,
      failedRepos: [],
      data: {
        searchTimeMs: Date.now() - startTime,
        totalFound: repos.length,
        returned: limitedRepos.length
      }
    };

    return limitedRepos;
  }

  /**
   * Search GitHub repositories with progress updates (AsyncGenerator version)
   * Yields progress updates and returns final results
   * @param query - Search query
   * @param maxResults - Maximum repositories to process
   */
  async *searchAndParseWithProgress(query: string, maxResults: number = 5): AsyncGenerator<SearchProgress | RepoAnalysisProgress | FileDownloadProgress | AIParsingProgress, GitHubRepoWithInstallation[], void> {
    const startTime = Date.now();
    
    // Initial progress
    yield {
      step: 'searching',
      progress: 0,
      message: `Searching GitHub for: "${query}"`,
      timestamp: new Date().toISOString(),
      totalRepos: 0,
      completedRepos: 0,
      failedRepos: []
    };

    // Search for repositories
    const repos = await this.search(query);
    
    if (repos.length === 0) {
      yield {
        step: 'searching',
        progress: 100,
        message: 'No repositories found',
        timestamp: new Date().toISOString(),
        totalRepos: 0,
        completedRepos: 0,
        failedRepos: []
      };
      return [];
    }

    const reposToProcess = Math.min(maxResults, repos.length);
    const results: GitHubRepoWithInstallation[] = [];
    const failedRepos: string[] = [];

    yield {
      step: 'processing',
      progress: 10,
      message: `Found ${repos.length} repositories, processing top ${reposToProcess}...`,
      timestamp: new Date().toISOString(),
      totalRepos: reposToProcess,
      completedRepos: 0,
      failedRepos: []
    };

    // Process each repository
    for (let i = 0; i < reposToProcess; i++) {
      const repo = repos[i];
      const progressPercent = Math.round(((i + 1) / reposToProcess) * 90) + 10; // 10-100%

      yield {
        step: 'processing',
        progress: progressPercent,
        message: `Processing ${repo.fullName} (${i + 1}/${reposToProcess})...`,
        timestamp: new Date().toISOString(),
        currentRepo: repo.fullName,
        totalRepos: reposToProcess,
        completedRepos: i,
        failedRepos: [...failedRepos]
      };      try {
        // Use the enhanced version that yields granular progress
        const repoGenerator = this.getFullRepositoryDataWithProgress(repo);
        let fullRepo: GitHubRepoWithInstallation;
        
        // Forward all the granular progress updates
        while (true) {
          const result = await repoGenerator.next();
          if (result.done) {
            fullRepo = result.value;
            break;
          } else {
            // Re-scale the progress to fit within this repo's allocation
            const repoProgress = result.value;
            const baseProgress = 10 + Math.round(((i + (repoProgress.progress / 100)) / reposToProcess) * 90);
            
            // Forward the granular progress
            yield {
              ...repoProgress,
              progress: baseProgress
            };
          }
        }
        
        results.push(fullRepo);
      } catch (error) {
        failedRepos.push(repo.fullName);
      }
    }

    // Final progress
    yield {
      step: 'complete',
      progress: 100,
      message: `Completed processing ${results.length}/${reposToProcess} repositories`,
      timestamp: new Date().toISOString(),
      totalRepos: reposToProcess,
      completedRepos: results.length,
      failedRepos: [...failedRepos],
      data: {
        processingTimeMs: Date.now() - startTime,
        successRate: Math.round((results.length / reposToProcess) * 100)
      }
    };

    return results;
  }  /**
   * Get repository data with progress updates (AsyncGenerator version)
   * @param repo - Repository info or name
   */
  async *getFullRepositoryDataWithProgress(repo: GitHubRepo | string): AsyncGenerator<any, GitHubRepoWithInstallation, void> {
    const repoName = typeof repo === 'string' ? repo : repo.fullName;
    const startTime = Date.now();

    // Step 1: Fetch repository details
    yield {
      step: 'fetching_repo',
      stage: 'starting',
      currentStep: 'fetching_repo',
      progress: 5,
      message: `Fetching repository details for ${repoName}...`,
      timestamp: new Date().toISOString(),
      repoName
    };

    const detailedRepo = await this.getRepositoryDetails(repoName);

    yield {
      step: 'fetching_repo',
      currentStep: 'fetching_repo',
      progress: 15,
      message: `✅ Repository details fetched`,
      timestamp: new Date().toISOString(),
      repoName
    };

    // Step 2: Download files with granular progress
    yield {
      step: 'downloading_files',
      currentStep: 'downloading_files',
      progress: 20,
      message: `Starting file downloads from ${repoName}...`,
      timestamp: new Date().toISOString(),
      repoName
    };

    let files: FileContent[] = [];
    const fileGenerator = this.downloadKeyFilesWithProgress(repoName);
    
    while (true) {
      const result = await fileGenerator.next();
      if (result.done) {
        files = result.value;
        break;
      } else {
        // Re-scale progress from 20-50%
        const progress = result.value;
        const scaledProgress = 20 + Math.round((progress.progress / 100) * 30);
        yield {
          ...progress,
          progress: scaledProgress
        };
      }
    }    // Step 3: AI comprehensive analysis with granular progress
    yield {
      step: 'parsing_ai',
      currentStep: 'parsing_ai',
      progress: 55,
      message: `Starting comprehensive AI analysis for ${repoName}...`,
      timestamp: new Date().toISOString(),
      repoName
    };

    let aiAnalysis: {
      installationMethods: InstallationMethod[];
      mcpClassification: string;
      mcpConfidence: number;
      mcpReasoning: string;
      isMcpServer: boolean;
      computed: any;
    };
    
    const aiGenerator = this.analyzeRepositoryWithAIProgress(files, repoName, detailedRepo);
    
    while (true) {
      const result = await aiGenerator.next();
      if (result.done) {
        aiAnalysis = result.value;
        break;
      } else {
        // Re-scale progress from 55-85%
        const progress = result.value;
        const scaledProgress = 55 + Math.round((progress.progress / 100) * 30);
        yield {
          ...progress,
          progress: scaledProgress
        };
      }
    }    // Step 4: Computing metrics
    yield {
      step: 'computing_metrics',
      currentStep: 'computing_metrics',
      progress: 90,
      message: `Computing repository metrics...`,
      timestamp: new Date().toISOString(),
      repoName
    };

    const parsingMetadata: ParsingMetadata = {
      parsedAt: new Date().toISOString(),
      sourceFiles: files.map(f => f.path),
      methodCount: aiAnalysis.installationMethods.length,
      extractionSuccessful: aiAnalysis.installationMethods.length > 0
    };

    // Final step
    yield {
      step: 'complete',
      currentStep: 'complete',
      progress: 100,
      message: `Successfully analyzed ${repoName}`,
      timestamp: new Date().toISOString(),
      repoName,
      data: {
        processingTimeMs: Date.now() - startTime,
        methodCount: aiAnalysis.installationMethods.length,
        isMcpServer: aiAnalysis.isMcpServer,
        mcpClassification: aiAnalysis.mcpClassification,
        mcpConfidence: aiAnalysis.mcpConfidence
      }
    };    return {
      repository: detailedRepo,
      files,
      installationMethods: aiAnalysis.installationMethods as any,
      parsingMetadata,
      computed: {
        ...aiAnalysis.computed,
        isMcpServer: aiAnalysis.isMcpServer,
        mcpClassification: aiAnalysis.mcpClassification,
        mcpConfidence: aiAnalysis.mcpConfidence,
        mcpReasoning: aiAnalysis.mcpReasoning
      }
    };
  }
}
