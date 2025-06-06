// Enhanced GitHub Auto-Registration with Comprehensive Analysis & Rejection Logic
// POST /api/v1/register/github - Intelligent MCP server analysis and registration

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { registerRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';
import { apiKeyMiddleware, recordApiUsage } from '@/lib/auth/api-key-middleware';
import { createStorage } from '@/lib/services/storage';
import { isSuccessResult } from '@/lib/services/storage/unified-storage';

// Enhanced GitHub URL validation schema
const GitHubAutoRegisterSchema = z.object({
  github_url: z.string().url().refine(
    (url) => url.includes('github.com/') && url.split('/').length >= 5,
    { message: "Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)" }
  ),
  contact_email: z.string().email().describe("Contact email for verification"),
  force_register: z.boolean().optional().default(false).describe("Force registration despite warnings"),
  skip_analysis: z.boolean().optional().default(false).describe("Skip detailed analysis (faster)")
});

interface DeploymentOptions {
  npm_package: boolean;
  docker_support: boolean;
  has_dockerfile: boolean;
  has_docker_compose: boolean;
  live_url_detected: boolean;
  github_actions: boolean;
  vercel_config: boolean;
  netlify_config: boolean;
  python_package: boolean;
  rust_crate: boolean;
  go_module: boolean;
}

interface AnalysisReport {
  is_mcp_server: boolean;
  confidence_score: number; // 0-100
  usability_score: number; // 0-100
  rejection_reasons: string[];
  warning_flags: string[];
  positive_indicators: string[];
  installation_complexity: 'simple' | 'moderate' | 'complex' | 'unclear';
  documentation_quality: 'poor' | 'fair' | 'good' | 'excellent';
  recommended_action: 'accept' | 'accept_with_warnings' | 'reject' | 'needs_review';
}

interface GitHubRepoAnalysis {
  owner: string;
  repo: string;
  full_name: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  license: string | null;
  
  // MCP-specific analysis
  has_mcp_config: boolean;
  claude_configs: any[];
  npm_package: string | null;
  installation_command: string | null;
  environment_variables: string[];
  
  // Enhanced deployment analysis
  deployment_options: DeploymentOptions;
  
  // Comprehensive analysis report
  analysis_report: AnalysisReport;
  
  // File analysis
  file_analysis: {
    has_readme: boolean;
    has_package_json: boolean;
    has_dockerfile: boolean;
    has_requirements_txt: boolean;
    has_cargo_toml: boolean;
    has_go_mod: boolean;
    has_mcp_keywords: boolean;
    config_files: string[];
    documentation_files: string[];
  };
  
  // Suggested registration data
  suggested_domain: string;
  suggested_endpoint: string | null;
  suggested_name: string;
  suggested_description: string;
  suggested_capabilities: string[];
  suggested_auth_type: 'none' | 'api_key' | 'oauth2' | 'basic';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Apply rate limiting
  const rateLimitResponse = await registerRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Authentication (session or API key)
    let userId: string | null = null;
    let apiKeyContext = null;

    const apiKeyResult = await apiKeyMiddleware(request, {
      required: false,
      permissions: ['servers:write']
    });

    if (apiKeyResult.response) {
      return apiKeyResult.response;
    }

    if (apiKeyResult.context) {
      userId = apiKeyResult.context.userId;
      apiKeyContext = apiKeyResult.context;
    } else {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          {
            error: 'Authentication required',
            details: 'You must be logged in or provide a valid API key to register MCP servers'
          },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    const body = await request.json();
    const validatedRequest = GitHubAutoRegisterSchema.parse(body);

    // Comprehensive GitHub repository analysis
    const analysis = await analyzeGitHubRepositoryComprehensive(
      validatedRequest.github_url,
      !validatedRequest.skip_analysis
    );
    
    if (!analysis) {
      return NextResponse.json(
        { 
          error: 'GitHub repository analysis failed',
          details: 'Could not analyze the provided GitHub repository. Please ensure it exists and is public.',
          analysis_report: {
            is_mcp_server: false,
            confidence_score: 0,
            rejection_reasons: ['Repository not accessible or does not exist'],
            recommended_action: 'reject'
          }
        },
        { status: 400 }
      );
    }

    // Check if repository should be rejected
    if (analysis.analysis_report.recommended_action === 'reject' && !validatedRequest.force_register) {
      return NextResponse.json(
        {
          error: 'Repository rejected for MCP server registration',
          details: 'This repository does not appear to be a usable MCP server',
          analysis: analysis,
          rejection_reasons: analysis.analysis_report.rejection_reasons,
          suggestions: generateImprovementSuggestions(analysis),
          force_register_option: {
            message: 'You can force registration by setting force_register: true',
            warning: 'Forced registration may result in a non-functional server listing'
          }
        },
        { status: 422 } // Unprocessable Entity
      );
    }

    // Check if this repository is already registered
    const storage = createStorage();
    const existingServer = await storage.getServer(analysis.suggested_domain);
    
    if (isSuccessResult(existingServer) && existingServer.data) {
      return NextResponse.json(
        {
          error: 'Server already registered',
          details: `A server for ${analysis.suggested_domain} is already registered`,
          existing_server: {
            domain: existingServer.data.domain,
            name: existingServer.data.name,
            registered_at: existingServer.data.created_at
          },
          analysis: analysis
        },
        { status: 409 }
      );
    }

    // Create MCPServerRecord from GitHub analysis
    const mcpServerRecord = createMCPServerRecordFromAnalysis(analysis, validatedRequest, userId);

    // Store the server record
    const storeResult = await storage.storeServer(mcpServerRecord);
    
    if (!isSuccessResult(storeResult)) {
      throw new Error('Failed to store server record');
    }

    // Prepare comprehensive response
    const response = NextResponse.json({
      success: true,
      message: analysis.analysis_report.recommended_action === 'accept_with_warnings' 
        ? 'MCP server registered with warnings - please review the analysis'
        : 'MCP server successfully registered from GitHub repository',
      
      server: {
        domain: analysis.suggested_domain,
        name: analysis.suggested_name,
        description: analysis.suggested_description,
        github_url: validatedRequest.github_url,
        registration_type: 'github_auto',
        verification_required: false
      },
      
      // Comprehensive analysis report
      analysis: {
        repository: {
          owner: analysis.owner,
          repo: analysis.repo,
          stars: analysis.stars,
          language: analysis.language,
          topics: analysis.topics,
          license: analysis.license
        },
        
        deployment_options: analysis.deployment_options,
        
        mcp_features: {
          has_claude_config: analysis.has_mcp_config,
          npm_package: analysis.npm_package,
          installation_command: analysis.installation_command,
          environment_variables: analysis.environment_variables,
          suggested_auth_type: analysis.suggested_auth_type
        },
        
        quality_assessment: {
          confidence_score: analysis.analysis_report.confidence_score,
          usability_score: analysis.analysis_report.usability_score,
          installation_complexity: analysis.analysis_report.installation_complexity,
          documentation_quality: analysis.analysis_report.documentation_quality,
          recommended_action: analysis.analysis_report.recommended_action
        },
        
        file_analysis: analysis.file_analysis,
        
        feedback: {
          positive_indicators: analysis.analysis_report.positive_indicators,
          warning_flags: analysis.analysis_report.warning_flags,
          rejection_reasons: analysis.analysis_report.rejection_reasons
        }
      },
      
      next_steps: generateNextSteps(analysis, validatedRequest),
      
      recommendations: generateRecommendations(analysis)
      
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

    // Record API usage if authenticated with API key
    if (apiKeyContext) {
      await recordApiUsage(apiKeyContext, request, response, startTime);
    }

    return addRateLimitHeaders(response, request);

  } catch (error) {
    console.error('GitHub auto-registration error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Comprehensive GitHub repository analysis with rejection logic
 */
async function analyzeGitHubRepositoryComprehensive(
  githubUrl: string, 
  deepAnalysis: boolean = true
): Promise<GitHubRepoAnalysis | null> {
  try {
    // Extract owner/repo from URL
    const urlParts = githubUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];
    const full_name = `${owner}/${repo}`;

    // Fetch repository data from GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${full_name}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCPLookup-AutoRegister/1.0',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
      }
    });

    if (!repoResponse.ok) {
      return null;
    }

    const repoData = await repoResponse.json();

    // Fetch file structure for analysis
    const fileAnalysis = deepAnalysis ? await analyzeRepositoryFiles(full_name) : getBasicFileAnalysis();
    
    // Fetch README for detailed analysis
    const readmeContent = deepAnalysis ? await fetchGitHubReadme(full_name) : null;
    
    // Analyze deployment options
    const deploymentOptions = await analyzeDeploymentOptions(full_name, fileAnalysis, repoData);
    
    // Perform MCP-specific analysis
    const mcpAnalysis = analyzeMCPContent(readmeContent || '', repoData, fileAnalysis);
    
    // Generate comprehensive analysis report
    const analysisReport = generateAnalysisReport(repoData, fileAnalysis, mcpAnalysis, deploymentOptions, readmeContent);

    return {
      owner,
      repo,
      full_name,
      description: repoData.description || '',
      stars: repoData.stargazers_count || 0,
      language: repoData.language || '',
      topics: repoData.topics || [],
      license: repoData.license?.spdx_id || null,
      
      // MCP analysis results
      has_mcp_config: mcpAnalysis.has_mcp_config,
      claude_configs: mcpAnalysis.claude_configs,
      npm_package: mcpAnalysis.npm_package,
      installation_command: mcpAnalysis.installation_command,
      environment_variables: mcpAnalysis.environment_variables,
      
      // Enhanced analysis
      deployment_options: deploymentOptions,
      analysis_report: analysisReport,
      file_analysis: fileAnalysis,
      
      // Suggested registration data
      suggested_domain: `github.com/${full_name}`,
      suggested_endpoint: mcpAnalysis.suggested_endpoint,
      suggested_name: formatRepositoryName(repoData.name),
      suggested_description: repoData.description || `MCP server from ${full_name}`,
      suggested_capabilities: inferCapabilities(repoData, readmeContent || '', mcpAnalysis),
      suggested_auth_type: mcpAnalysis.suggested_auth_type
    };

  } catch (error) {
    console.error('GitHub repository analysis failed:', error);
    return null;
  }
}

/**
 * Analyze repository files to understand structure and capabilities
 */
async function analyzeRepositoryFiles(fullName: string) {
  const fileAnalysis = {
    has_readme: false,
    has_package_json: false,
    has_dockerfile: false,
    has_requirements_txt: false,
    has_cargo_toml: false,
    has_go_mod: false,
    has_mcp_keywords: false,
    config_files: [] as string[],
    documentation_files: [] as string[]
  };

  try {
    // Get repository contents
    const response = await fetch(`https://api.github.com/repos/${fullName}/contents`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCPLookup-AutoRegister/1.0',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
      }
    });

    if (!response.ok) return fileAnalysis;

    const files = await response.json();

    for (const file of files) {
      const fileName = file.name.toLowerCase();

      // Check for key files
      if (fileName.includes('readme')) {
        fileAnalysis.has_readme = true;
        fileAnalysis.documentation_files.push(file.name);
      }

      if (fileName === 'package.json') {
        fileAnalysis.has_package_json = true;
        fileAnalysis.config_files.push(file.name);
      }

      if (fileName === 'dockerfile') {
        fileAnalysis.has_dockerfile = true;
        fileAnalysis.config_files.push(file.name);
      }

      if (fileName === 'requirements.txt') {
        fileAnalysis.has_requirements_txt = true;
        fileAnalysis.config_files.push(file.name);
      }

      if (fileName === 'cargo.toml') {
        fileAnalysis.has_cargo_toml = true;
        fileAnalysis.config_files.push(file.name);
      }

      if (fileName === 'go.mod') {
        fileAnalysis.has_go_mod = true;
        fileAnalysis.config_files.push(file.name);
      }

      // Check for MCP-related keywords in filenames
      if (fileName.includes('mcp') || fileName.includes('claude') || fileName.includes('context')) {
        fileAnalysis.has_mcp_keywords = true;
      }

      // Collect config files
      if (fileName.includes('config') || fileName.includes('.json') || fileName.includes('.yaml') || fileName.includes('.yml')) {
        fileAnalysis.config_files.push(file.name);
      }

      // Collect documentation files
      if (fileName.includes('doc') || fileName.includes('guide') || fileName.includes('.md')) {
        fileAnalysis.documentation_files.push(file.name);
      }
    }

  } catch (error) {
    console.warn('Failed to analyze repository files:', error);
  }

  return fileAnalysis;
}

/**
 * Get basic file analysis without API calls
 */
function getBasicFileAnalysis() {
  return {
    has_readme: false,
    has_package_json: false,
    has_dockerfile: false,
    has_requirements_txt: false,
    has_cargo_toml: false,
    has_go_mod: false,
    has_mcp_keywords: false,
    config_files: [],
    documentation_files: []
  };
}

/**
 * Analyze deployment options available for the repository
 */
async function analyzeDeploymentOptions(fullName: string, fileAnalysis: any, repoData: any): Promise<DeploymentOptions> {
  const options: DeploymentOptions = {
    npm_package: false,
    docker_support: false,
    has_dockerfile: fileAnalysis.has_dockerfile,
    has_docker_compose: false,
    live_url_detected: false,
    github_actions: false,
    vercel_config: false,
    netlify_config: false,
    python_package: false,
    rust_crate: false,
    go_module: false
  };

  // Check for package.json (NPM)
  if (fileAnalysis.has_package_json) {
    options.npm_package = true;
  }

  // Check for Python package
  if (fileAnalysis.has_requirements_txt || repoData.language === 'Python') {
    options.python_package = true;
  }

  // Check for Rust crate
  if (fileAnalysis.has_cargo_toml || repoData.language === 'Rust') {
    options.rust_crate = true;
  }

  // Check for Go module
  if (fileAnalysis.has_go_mod || repoData.language === 'Go') {
    options.go_module = true;
  }

  // Check for Docker support
  if (fileAnalysis.has_dockerfile) {
    options.docker_support = true;
  }

  // Check for deployment configs
  const configFiles = fileAnalysis.config_files.map((f: string) => f.toLowerCase());

  if (configFiles.some((f: string) => f.includes('docker-compose'))) {
    options.has_docker_compose = true;
    options.docker_support = true;
  }

  if (configFiles.some((f: string) => f.includes('vercel'))) {
    options.vercel_config = true;
  }

  if (configFiles.some((f: string) => f.includes('netlify'))) {
    options.netlify_config = true;
  }

  // Check for GitHub Actions
  try {
    const actionsResponse = await fetch(`https://api.github.com/repos/${fullName}/contents/.github/workflows`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCPLookup-AutoRegister/1.0',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
      }
    });

    if (actionsResponse.ok) {
      options.github_actions = true;
    }
  } catch (error) {
    // GitHub Actions check failed, continue
  }

  // Check for live URL in description or homepage
  const urlPattern = /https?:\/\/[^\s]+/g;
  const description = repoData.description || '';
  const homepage = repoData.homepage || '';

  if (urlPattern.test(description) || urlPattern.test(homepage)) {
    options.live_url_detected = true;
  }

  return options;
}

/**
 * Generate comprehensive analysis report with rejection logic
 */
function generateAnalysisReport(
  repoData: any,
  fileAnalysis: any,
  mcpAnalysis: any,
  deploymentOptions: DeploymentOptions,
  readmeContent: string | null
): AnalysisReport {
  const report: AnalysisReport = {
    is_mcp_server: false,
    confidence_score: 0,
    usability_score: 0,
    rejection_reasons: [],
    warning_flags: [],
    positive_indicators: [],
    installation_complexity: 'unclear',
    documentation_quality: 'poor',
    recommended_action: 'reject'
  };

  let confidenceScore = 0;
  let usabilityScore = 0;

  // === MCP SERVER DETECTION ===

  // Strong MCP indicators (+30 points each)
  if (mcpAnalysis.has_mcp_config) {
    confidenceScore += 30;
    report.positive_indicators.push('Contains Claude Desktop configuration');
  }

  if (mcpAnalysis.npm_package && mcpAnalysis.npm_package.includes('mcp')) {
    confidenceScore += 30;
    report.positive_indicators.push('NPM package name contains "mcp"');
  }

  // MCP keywords in repository (+20 points each)
  const description = (repoData.description || '').toLowerCase();
  const readmeText = (readmeContent || '').toLowerCase();
  const topics = (repoData.topics || []).join(' ').toLowerCase();
  const allText = `${description} ${readmeText} ${topics}`;

  if (allText.includes('model context protocol') || allText.includes('mcp')) {
    confidenceScore += 20;
    report.positive_indicators.push('Contains MCP-related keywords');
  }

  if (allText.includes('claude') && (allText.includes('server') || allText.includes('tool'))) {
    confidenceScore += 15;
    report.positive_indicators.push('References Claude with server/tool context');
  }

  // === DEPLOYMENT VIABILITY ===

  // Check for viable deployment options (+15 points each)
  if (deploymentOptions.npm_package) {
    usabilityScore += 15;
    report.positive_indicators.push('Available as NPM package');
  }

  if (deploymentOptions.docker_support) {
    usabilityScore += 15;
    report.positive_indicators.push('Docker support available');
  }

  if (deploymentOptions.python_package) {
    usabilityScore += 10;
    report.positive_indicators.push('Python package structure detected');
  }

  if (deploymentOptions.live_url_detected) {
    usabilityScore += 20;
    report.positive_indicators.push('Live URL detected');
  }

  // === DOCUMENTATION QUALITY ===

  if (fileAnalysis.has_readme) {
    usabilityScore += 10;
    report.positive_indicators.push('Has README documentation');

    if (readmeContent && readmeContent.length > 1000) {
      usabilityScore += 5;
      report.positive_indicators.push('Comprehensive documentation');
    }
  }

  // Installation instructions
  if (mcpAnalysis.installation_command) {
    usabilityScore += 10;
    report.positive_indicators.push('Clear installation instructions');
    report.installation_complexity = 'simple';
  }

  // === REJECTION CRITERIA ===

  // Critical rejection reasons
  if (!deploymentOptions.npm_package &&
      !deploymentOptions.docker_support &&
      !deploymentOptions.python_package &&
      !deploymentOptions.rust_crate &&
      !deploymentOptions.go_module &&
      !deploymentOptions.live_url_detected) {
    report.rejection_reasons.push('No viable deployment method detected (no NPM package, Docker, or live URL)');
  }

  if (confidenceScore < 10) {
    report.rejection_reasons.push('No clear indication this is an MCP server');
  }

  if (!fileAnalysis.has_readme) {
    report.rejection_reasons.push('Missing README documentation');
  }

  if (repoData.stargazers_count === 0 && !mcpAnalysis.has_mcp_config) {
    report.warning_flags.push('Repository has no stars and no Claude configuration');
  }

  // === WARNING FLAGS ===

  if (!mcpAnalysis.has_mcp_config) {
    report.warning_flags.push('No Claude Desktop configuration found');
  }

  if (mcpAnalysis.environment_variables.length > 5) {
    report.warning_flags.push('Complex setup with many environment variables required');
    report.installation_complexity = 'complex';
  }

  if (!deploymentOptions.npm_package && confidenceScore > 20) {
    report.warning_flags.push('Appears to be MCP server but not available as NPM package');
  }

  if (repoData.archived) {
    report.rejection_reasons.push('Repository is archived and no longer maintained');
  }

  // === FINAL SCORING ===

  report.confidence_score = Math.min(confidenceScore, 100);
  report.usability_score = Math.min(usabilityScore, 100);

  // Documentation quality assessment
  if (readmeContent) {
    const docKeywords = ['installation', 'usage', 'example', 'configuration', 'setup'];
    const docScore = docKeywords.filter(keyword => readmeContent.toLowerCase().includes(keyword)).length;

    if (docScore >= 4) report.documentation_quality = 'excellent';
    else if (docScore >= 3) report.documentation_quality = 'good';
    else if (docScore >= 2) report.documentation_quality = 'fair';
    else report.documentation_quality = 'poor';
  }

  // Installation complexity
  if (mcpAnalysis.installation_command && mcpAnalysis.environment_variables.length === 0) {
    report.installation_complexity = 'simple';
  } else if (mcpAnalysis.installation_command && mcpAnalysis.environment_variables.length <= 3) {
    report.installation_complexity = 'moderate';
  } else if (mcpAnalysis.environment_variables.length > 3) {
    report.installation_complexity = 'complex';
  }

  // === FINAL RECOMMENDATION ===

  report.is_mcp_server = confidenceScore >= 20;

  if (report.rejection_reasons.length > 0) {
    report.recommended_action = 'reject';
  } else if (report.warning_flags.length > 2 || usabilityScore < 30) {
    report.recommended_action = 'needs_review';
  } else if (report.warning_flags.length > 0 || confidenceScore < 50) {
    report.recommended_action = 'accept_with_warnings';
  } else {
    report.recommended_action = 'accept';
  }

  return report;
}

/**
 * Generate improvement suggestions for rejected repositories
 */
function generateImprovementSuggestions(analysis: GitHubRepoAnalysis): string[] {
  const suggestions = [];

  if (!analysis.file_analysis.has_readme) {
    suggestions.push('Add a comprehensive README.md file with installation and usage instructions');
  }

  if (!analysis.has_mcp_config) {
    suggestions.push('Include Claude Desktop configuration examples in your README');
  }

  if (!analysis.deployment_options.npm_package && analysis.language === 'JavaScript') {
    suggestions.push('Publish your package to NPM for easy installation');
  }

  if (!analysis.deployment_options.docker_support) {
    suggestions.push('Add a Dockerfile for containerized deployment');
  }

  if (analysis.analysis_report.documentation_quality === 'poor') {
    suggestions.push('Improve documentation with installation steps, usage examples, and configuration details');
  }

  if (!analysis.npm_package && !analysis.deployment_options.live_url_detected) {
    suggestions.push('Provide clear deployment instructions or host a live endpoint');
  }

  if (analysis.environment_variables.length === 0 && analysis.analysis_report.confidence_score > 30) {
    suggestions.push('Document any required environment variables or API keys');
  }

  return suggestions;
}

/**
 * Generate recommendations for successful registrations
 */
function generateRecommendations(analysis: GitHubRepoAnalysis): string[] {
  const recommendations = [];

  if (analysis.analysis_report.warning_flags.length > 0) {
    recommendations.push('Review the warning flags and consider addressing them to improve user experience');
  }

  if (analysis.analysis_report.installation_complexity === 'complex') {
    recommendations.push('Consider simplifying the installation process or providing setup scripts');
  }

  if (!analysis.deployment_options.docker_support && analysis.environment_variables.length > 0) {
    recommendations.push('Consider adding Docker support to simplify deployment with environment variables');
  }

  if (analysis.stars < 5) {
    recommendations.push('Encourage users to star your repository to increase visibility');
  }

  if (analysis.analysis_report.documentation_quality !== 'excellent') {
    recommendations.push('Enhance documentation with more examples and use cases');
  }

  return recommendations;
}

/**
 * Fetch GitHub README content
 */
async function fetchGitHubReadme(fullName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCPLookup-AutoRegister/1.0',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (error) {
    return null;
  }
}

/**
 * Analyze README content for MCP-specific information
 */
function analyzeMCPContent(readmeContent: string, repoData: any, fileAnalysis: any) {
  const analysis = {
    has_mcp_config: false,
    claude_configs: [] as any[],
    npm_package: null as string | null,
    installation_command: null as string | null,
    environment_variables: [] as string[],
    suggested_endpoint: null as string | null,
    suggested_auth_type: 'none' as 'none' | 'api_key' | 'oauth2' | 'basic'
  };

  // Look for Claude Desktop configurations
  const claudeConfigPattern = /```json\s*\n([\s\S]*?"mcpServers"[\s\S]*?)\n```/gi;
  let match;
  while ((match = claudeConfigPattern.exec(readmeContent)) !== null) {
    try {
      const config = JSON.parse(match[1]);
      analysis.claude_configs.push(config);
      analysis.has_mcp_config = true;
    } catch (error) {
      // Ignore malformed JSON
    }
  }

  // Extract NPM package name
  const npmPattern = /@[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+|[a-zA-Z0-9\-_]+/g;
  const npmMatches = readmeContent.match(npmPattern);
  if (npmMatches && fileAnalysis.has_package_json) {
    // Try to find the most likely NPM package name
    const mcpPackages = npmMatches.filter(pkg => pkg.includes('mcp') || pkg.includes('claude'));
    if (mcpPackages.length > 0) {
      analysis.npm_package = mcpPackages[0];
    } else if (npmMatches.length > 0) {
      analysis.npm_package = npmMatches[0];
    }
  }

  if (analysis.npm_package) {
    analysis.installation_command = `npm install -g ${analysis.npm_package}`;
  }

  // Extract environment variables
  const envPattern = /([A-Z_][A-Z0-9_]*)\s*[:=]/g;
  const envMatches = readmeContent.match(envPattern);
  if (envMatches) {
    analysis.environment_variables = [...new Set(envMatches.map(m => m.replace(/[:=]/g, '').trim()))];
  }

  // Determine auth type from environment variables
  const authIndicators = analysis.environment_variables.filter(env =>
    env.includes('API_KEY') || env.includes('TOKEN') || env.includes('SECRET') || env.includes('AUTH')
  );
  if (authIndicators.length > 0) {
    if (readmeContent.toLowerCase().includes('oauth') || readmeContent.toLowerCase().includes('bearer')) {
      analysis.suggested_auth_type = 'oauth2';
    } else {
      analysis.suggested_auth_type = 'api_key';
    }
  }

  return analysis;
}

/**
 * Infer capabilities from repository data and content
 */
function inferCapabilities(repoData: any, readmeContent: string, mcpAnalysis: any): string[] {
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
    'openai': 'development',
    'api': 'integration',
    'webhook': 'integration'
  };

  // From topics
  repoData.topics?.forEach((topic: string) => {
    if (capabilityMap[topic.toLowerCase()]) {
      capabilities.add(capabilityMap[topic.toLowerCase()]);
    }
  });

  // From description and README content
  const text = `${repoData.description || ''} ${readmeContent}`.toLowerCase();
  Object.entries(capabilityMap).forEach(([keyword, capability]) => {
    if (text.includes(keyword)) {
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
function formatRepositoryName(repoName: string): string {
  return repoName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Mcp/g, 'MCP');
}

/**
 * Create MCPServerRecord from comprehensive analysis
 */
function createMCPServerRecordFromAnalysis(analysis: GitHubRepoAnalysis, request: any, userId: string) {
  const now = new Date().toISOString();

  return {
    // Identity
    domain: analysis.suggested_domain,
    endpoint: analysis.suggested_endpoint,
    name: analysis.suggested_name,
    description: analysis.suggested_description,

    // Availability
    availability: {
      status: analysis.deployment_options.live_url_detected ? 'live' : 'package_only',
      packages_available: analysis.deployment_options.npm_package || analysis.deployment_options.docker_support,
      primary_package: analysis.npm_package ? 'npm' : 'github'
    },

    // Package information
    packages: generatePackageInfo(analysis),

    // Repository information
    repository: {
      url: `https://github.com/${analysis.full_name}`,
      source: 'github',
      stars: analysis.stars,
      language: analysis.language,
      topics: analysis.topics,
      license: analysis.license
    },

    // Capabilities
    capabilities: {
      category: analysis.suggested_capabilities[0] || 'other',
      subcategories: analysis.suggested_capabilities,
      intent_keywords: [analysis.repo.toLowerCase(), ...analysis.topics],
      use_cases: [analysis.description]
    },

    // Authentication
    auth: {
      type: analysis.suggested_auth_type,
      description: analysis.environment_variables.length > 0
        ? `Requires environment variables: ${analysis.environment_variables.join(', ')}`
        : 'No authentication required'
    },

    // Technical details
    cors_enabled: true,
    transport: 'stdio',

    // Quality indicators
    quality_score: Math.round((analysis.analysis_report.confidence_score + analysis.analysis_report.usability_score) / 2),
    installation_complexity: analysis.analysis_report.installation_complexity,
    documentation_quality: analysis.analysis_report.documentation_quality,

    // Metadata
    created_at: now,
    updated_at: now,
    verification_status: 'unverified',
    maintainer: {
      name: analysis.owner,
      url: `https://github.com/${analysis.owner}`
    },

    // Source tracking
    registration_source: 'github_auto',
    analysis_report: analysis.analysis_report,
    deployment_options: analysis.deployment_options
  };
}

/**
 * Generate package information based on analysis
 */
function generatePackageInfo(analysis: GitHubRepoAnalysis) {
  const packages = [];

  if (analysis.npm_package) {
    packages.push({
      registry_name: 'npm',
      name: analysis.npm_package,
      installation_command: analysis.installation_command,
      startup_command: analysis.npm_package
    });
  }

  if (analysis.deployment_options.docker_support) {
    packages.push({
      registry_name: 'docker',
      name: `ghcr.io/${analysis.full_name}`,
      installation_command: `docker pull ghcr.io/${analysis.full_name}`,
      startup_command: `docker run ghcr.io/${analysis.full_name}`
    });
  }

  // Default GitHub package
  packages.push({
    registry_name: 'github',
    name: analysis.full_name,
    installation_command: `git clone https://github.com/${analysis.full_name}`,
    setup_instructions: 'Clone repository and follow README instructions'
  });

  return packages;
}

/**
 * Generate next steps based on analysis
 */
function generateNextSteps(analysis: GitHubRepoAnalysis, request: any): string[] {
  const steps = [];

  if (analysis.npm_package) {
    steps.push(`Install the package: ${analysis.installation_command}`);
  } else if (analysis.deployment_options.docker_support) {
    steps.push(`Use Docker: docker pull ghcr.io/${analysis.full_name}`);
  } else {
    steps.push(`Clone the repository: git clone https://github.com/${analysis.full_name}`);
  }

  if (analysis.environment_variables.length > 0) {
    steps.push(`Set required environment variables: ${analysis.environment_variables.join(', ')}`);
  }

  if (analysis.has_mcp_config) {
    steps.push('Add the Claude Desktop configuration from the README to your claude_desktop_config.json');
  } else {
    steps.push('Check the README for Claude Desktop configuration instructions');
  }

  steps.push('Your MCP server is now discoverable in the MCPLookup.org registry');

  if (analysis.analysis_report.warning_flags.length > 0) {
    steps.push('Review the warning flags in the analysis report');
  }

  return steps;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://mcplookup.org',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
