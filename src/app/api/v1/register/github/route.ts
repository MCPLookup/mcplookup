// GitHub Auto-Registration API for MCPLookup.org
// POST /api/v1/register/github - Automatically register MCP server from GitHub URL

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { registerRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';
import { apiKeyMiddleware, recordApiUsage } from '@/lib/auth/api-key-middleware';
import { createStorage } from '@/lib/services/storage';
import { isSuccessResult } from '@/lib/services/storage/unified-storage';

// GitHub URL validation schema
const GitHubAutoRegisterSchema = z.object({
  github_url: z.string().url().refine(
    (url) => url.includes('github.com/') && url.split('/').length >= 5,
    { message: "Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)" }
  ),
  contact_email: z.string().email().describe("Contact email for verification"),
  auto_deploy: z.boolean().optional().default(false).describe("Whether to attempt auto-deployment"),
  deployment_preference: z.enum(['package_only', 'live_endpoint', 'both']).optional().default('package_only')
});

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

    // Analyze GitHub repository
    const analysis = await analyzeGitHubRepository(validatedRequest.github_url);
    
    if (!analysis) {
      return NextResponse.json(
        { 
          error: 'GitHub repository analysis failed',
          details: 'Could not analyze the provided GitHub repository. Please ensure it exists and is public.'
        },
        { status: 400 }
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
          }
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

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: 'MCP server automatically registered from GitHub repository',
      server: {
        domain: analysis.suggested_domain,
        name: analysis.suggested_name,
        description: analysis.suggested_description,
        github_url: validatedRequest.github_url,
        registration_type: 'github_auto',
        verification_required: false // Package-only servers don't need DNS verification
      },
      analysis: {
        repository: {
          owner: analysis.owner,
          repo: analysis.repo,
          stars: analysis.stars,
          language: analysis.language,
          topics: analysis.topics
        },
        mcp_features: {
          has_claude_config: analysis.has_mcp_config,
          npm_package: analysis.npm_package,
          installation_command: analysis.installation_command,
          environment_variables: analysis.environment_variables,
          suggested_auth_type: analysis.suggested_auth_type
        },
        capabilities: analysis.suggested_capabilities
      },
      next_steps: generateNextSteps(analysis, validatedRequest)
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
 * Analyze GitHub repository for MCP server information
 */
async function analyzeGitHubRepository(githubUrl: string): Promise<GitHubRepoAnalysis | null> {
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

    // Fetch README for Claude config analysis
    const readmeResponse = await fetch(`https://api.github.com/repos/${full_name}/readme`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCPLookup-AutoRegister/1.0',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
      }
    });

    let readmeContent = '';
    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
    }

    // Analyze for MCP-specific content
    const mcpAnalysis = analyzeMCPContent(readmeContent, repoData);

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
      ...mcpAnalysis,
      
      // Suggested registration data
      suggested_domain: `github.com/${full_name}`,
      suggested_endpoint: mcpAnalysis.suggested_endpoint,
      suggested_name: repoData.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      suggested_description: repoData.description || `MCP server from ${full_name}`,
      suggested_capabilities: inferCapabilities(repoData, readmeContent),
      suggested_auth_type: mcpAnalysis.suggested_auth_type
    };

  } catch (error) {
    console.error('GitHub repository analysis failed:', error);
    return null;
  }
}

/**
 * Analyze README content for MCP-specific information
 */
function analyzeMCPContent(readmeContent: string, repoData: any) {
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
  const npmPattern = /@[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+/g;
  const npmMatches = readmeContent.match(npmPattern);
  if (npmMatches && npmMatches.length > 0) {
    analysis.npm_package = npmMatches[0];
    analysis.installation_command = `npm install -g ${npmMatches[0]}`;
  }

  // Extract environment variables
  const envPattern = /([A-Z_]+)(?:=|:|\s+)/g;
  const envMatches = readmeContent.match(envPattern);
  if (envMatches) {
    analysis.environment_variables = [...new Set(envMatches.map(m => m.replace(/[=:\s]/g, '')))];
  }

  // Determine auth type from environment variables
  const authIndicators = analysis.environment_variables.filter(env => 
    env.includes('API_KEY') || env.includes('TOKEN') || env.includes('SECRET')
  );
  if (authIndicators.length > 0) {
    analysis.suggested_auth_type = 'api_key';
  }

  return analysis;
}

/**
 * Infer capabilities from repository data and README
 */
function inferCapabilities(repoData: any, readmeContent: string): string[] {
  const capabilities = new Set<string>();
  
  // From topics
  const topicMap: Record<string, string> = {
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

  repoData.topics?.forEach((topic: string) => {
    if (topicMap[topic]) {
      capabilities.add(topicMap[topic]);
    }
  });

  // From description and README content
  const text = `${repoData.description || ''} ${readmeContent}`.toLowerCase();
  Object.entries(topicMap).forEach(([keyword, capability]) => {
    if (text.includes(keyword)) {
      capabilities.add(capability);
    }
  });

  // Default to 'other' if no capabilities found
  if (capabilities.size === 0) {
    capabilities.add('other');
  }

  return Array.from(capabilities);
}

/**
 * Create MCPServerRecord from GitHub analysis
 */
function createMCPServerRecordFromAnalysis(
  analysis: GitHubRepoAnalysis, 
  request: any, 
  userId: string
) {
  const now = new Date().toISOString();
  
  return {
    // Identity
    domain: analysis.suggested_domain,
    endpoint: analysis.suggested_endpoint,
    name: analysis.suggested_name,
    description: analysis.suggested_description,

    // Availability (package-only for GitHub repos)
    availability: {
      status: 'package_only',
      packages_available: true,
      primary_package: analysis.npm_package ? 'npm' : 'github'
    },

    // Package information
    packages: analysis.npm_package ? [{
      registry_name: 'npm',
      name: analysis.npm_package,
      installation_command: analysis.installation_command,
      startup_command: analysis.npm_package
    }] : [{
      registry_name: 'github',
      name: analysis.full_name,
      installation_command: `git clone https://github.com/${analysis.full_name}`,
      setup_instructions: 'Clone repository and follow README instructions'
    }],

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
    github_analysis: analysis
  };
}

/**
 * Generate next steps for the user
 */
function generateNextSteps(analysis: GitHubRepoAnalysis, request: any): string[] {
  const steps = [];

  if (analysis.npm_package) {
    steps.push(`Install the package: ${analysis.installation_command}`);
  } else {
    steps.push(`Clone the repository: git clone https://github.com/${analysis.full_name}`);
  }

  if (analysis.environment_variables.length > 0) {
    steps.push(`Set required environment variables: ${analysis.environment_variables.join(', ')}`);
  }

  if (analysis.has_mcp_config) {
    steps.push('Add the Claude Desktop configuration from the README to your claude_desktop_config.json');
  }

  steps.push('Your MCP server is now discoverable in the MCPLookup.org registry');

  if (request.auto_deploy && request.deployment_preference !== 'package_only') {
    steps.push('Consider deploying a live endpoint for real-time access');
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
