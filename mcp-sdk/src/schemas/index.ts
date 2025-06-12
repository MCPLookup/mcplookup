/**
 * JSON Schema Generation from TypeScript Types
 * Generates schemas for AI providers from our unified types
 */

import type { GitHubRepository } from '../types/github-repository.js';
import type {
  GitHubRepoWithInstallation,
  InstallationMethod,
  ComputedMetrics,
  ParsingMetadata,
  MCPServer
} from '../types/generated.js';

// === GITHUB REPOSITORY SCHEMA ===

export const githubRepositorySchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    name: { type: "string" },
    fullName: { type: "string" },
    description: { type: ["string", "null"] },
    url: { type: "string" },
    htmlUrl: { type: "string" },
    cloneUrl: { type: "string" },
    stars: { type: "number" },
    forks: { type: "number" },
    watchers: { type: "number" },
    size: { type: "number" },
    language: { type: ["string", "null"] },
    topics: {
      type: "array",
      items: { type: "string" }
    },
    license: {
      type: "object",
      properties: {
        key: { type: "string" },
        name: { type: "string" },
        spdxId: { type: "string" }
      }
    },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
    pushedAt: { type: "string" },
    defaultBranch: { type: "string" },
    archived: { type: "boolean" },
    fork: { type: "boolean" },
    private: { type: "boolean" },
    hasIssues: { type: "boolean" },
    hasWiki: { type: "boolean" },
    hasPages: { type: "boolean" },
    isMCP: { type: "boolean" },
    owner: {
      type: "object",
      properties: {
        login: { type: "string" },
        type: { 
          type: "string",
          enum: ["User", "Organization"]
        },
        avatarUrl: { type: "string" }
      },
      required: ["login", "type"]
    }
  },
  required: ["id", "name", "fullName", "url", "stars", "forks", "size", "topics", "createdAt", "updatedAt", "pushedAt", "defaultBranch", "archived", "fork", "private", "owner"]
} as const;

// === INSTALLATION METHOD SCHEMA ===

export const installationMethodSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["installation", "configuration", "claude_desktop", "vscode", "deployment", "testing"]
    },
    title: { type: "string" },
    description: { type: "string" },
    category: {
      type: "string",
      enum: ["setup", "build", "deploy", "configure", "test", "run"]
    },
    subtype: {
      type: "string",
      enum: [
        // Python ecosystem
        "pip", "conda", "poetry", "pipenv", "setup_py", "pyproject_toml", 
        "requirements_txt", "venv", "virtualenv",
        // JavaScript/Node.js ecosystem  
        "npm", "yarn", "pnpm", "npm_global", "npx", "package_json",
        // Go ecosystem
        "go_get", "go_install", "go_mod", "go_build", "go_run", "go_mod_tidy",
        // Rust ecosystem
        "cargo_install", "cargo_build", "cargo_run", "cargo_test", "cargo_features",
        // Docker ecosystem
        "docker_build", "docker_run", "docker_compose", "dockerfile", "docker_pull",
        // Package managers
        "brew", "apt", "yum", "dnf", "chocolatey", "winget", "snap", "flatpak",
        // Build systems
        "make", "cmake", "gradle", "maven", "bazel", "ninja",
        // Git-based installs
        "git+uv", "git_clone", "git_submodule", "git_pull",
        // MCP specific
        "package_manager",
        // Environment/Config
        "environment_vars", "json_config", "yaml_config", "ini_config", "toml_config",
        // Platform specific
        "manual_config", "docker_config",
        // VS Code specific
        "mcp_json", "settings_json", "workspace_config",
        // Runtime/Deployment
        "server_start", "docker_run", "service_start", "background_process",
        // Testing
        "curl_test", "inspector_test", "unit_test", "integration_test"
      ]
    },
    commands: {
      type: "array",
      items: { type: "string" }
    },
    platform: {
      type: "string",
      enum: [
        "python", "javascript", "typescript", "go", "rust", "java", "csharp", "cpp", "php", "ruby",
        "nodejs", "deno", "bun", "docker", "kubernetes", "podman", "linux", "macos", "windows", 
        "cross_platform", "claude_desktop", "vscode", "mcp_client", "system_service", "cloud", 
        "serverless", "web_server"
      ]
    },
    config_content: { type: "string" },
    config_file_path: { type: "string" },
    variables: {
      type: "object",
      additionalProperties: { type: "string" }
    },
    mcp_config: {
      type: "object",
      properties: {
        server_name: { type: "string" },
        command: { type: "string" },
        args: {
          type: "array",
          items: { type: "string" }
        },
        env: {
          type: "object",
          additionalProperties: { type: "string" }
        }
      }
    },
    environment_vars: {
      type: "object",
      additionalProperties: { type: "string" }
    },
    ports: {
      type: "array",
      items: { type: "number" }
    },
    endpoints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string" },
          transport: { type: "string" },
          description: { type: "string" }
        },
        required: ["url", "transport", "description"]
      }
    },
    transport: {
      type: "string",
      enum: ["stdio", "sse", "websocket", "tcp", "http"]
    },
    test_commands: {
      type: "array",
      items: { type: "string" }
    },
    expected_output: { type: "string" },
    test_url: { type: "string" },
    requirements: {
      type: "array",
      items: { type: "string" }
    },
    dependencies: {
      type: "object",
      additionalProperties: { type: "string" }
    }
  },
  required: ["type", "title", "description", "category"]
} as const;

// === COMPUTED METRICS SCHEMA ===

export const computedMetricsSchema = {
  type: "object",
  properties: {
    isMcpServer: { type: "boolean" },
    mcpClassification: {
      type: "string",
      enum: [
        "mcp_server", "mcp_framework", "mcp_sdk", "mcp_awesome_list", 
        "mcp_tool", "mcp_example", "mcp_template", "not_mcp_related"
      ]
    },
    mcpConfidence: {
      type: "number",
      minimum: 0,
      maximum: 1
    },
    mcpReasoning: { type: "string" },
    primaryLanguage: { type: "string" },
    complexity: {
      type: "string",
      enum: ["simple", "moderate", "complex"]
    },
    installationDifficulty: {
      type: "string",
      enum: ["easy", "medium", "hard"]
    },
    maturityLevel: {
      type: "string",
      enum: ["experimental", "alpha", "beta", "stable", "production"]
    },
    supportedPlatforms: {
      type: "array",
      items: { type: "string" }
    },
    tags: {
      type: "array",
      items: { type: "string" }
    },
    mcpTools: {
      type: "array",
      items: { type: "string" }
    },
    mcpResources: {
      type: "array",
      items: { type: "string" }
    },
    mcpPrompts: {
      type: "array",
      items: { type: "string" }
    },
    requiresClaudeDesktop: { type: "boolean" },
    requiresEnvironmentVars: { type: "boolean" },
    hasDocumentation: { type: "boolean" },
    hasExamples: { type: "boolean" }
  },
  required: ["isMcpServer", "mcpClassification", "mcpConfidence", "mcpReasoning"]
} as const;

// === PARSING METADATA SCHEMA ===

export const parsingMetadataSchema = {
  type: "object",
  properties: {
    parsedAt: { type: "string" },
    parserVersion: { type: "string" },
    parserType: {
      type: "string",
      enum: ["gemini", "openrouter", "together", "claude", "openai"]
    },
    sourceFiles: {
      type: "array",
      items: { type: "string" }
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1
    },
    processingTimeMs: { type: "number" },
    methodCount: { type: "number" },
    extractionSuccessful: { type: "boolean" },
    errors: {
      type: "array",
      items: { type: "string" }
    },
    warnings: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["parsedAt", "methodCount", "extractionSuccessful"]
} as const;

// === GITHUB REPO WITH INSTALLATION SCHEMA ===

export const githubRepoWithInstallationSchema = {
  type: "object",
  properties: {
    repository: githubRepositorySchema,
    files: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
          size: { type: "number" },
          encoding: { type: "string" },
          downloadUrl: { type: "string" },
          lastModified: { type: "string" }
        },
        required: ["path", "content"]
      }
    },
    installationMethods: {
      type: "array",
      items: installationMethodSchema
    },
    parsingMetadata: parsingMetadataSchema,
    computed: computedMetricsSchema
  },
  required: ["repository", "installationMethods", "parsingMetadata"]
} as const;

// === AI ANALYSIS RESPONSE SCHEMA ===
// This is the main schema used by AI providers for repository analysis

export const aiAnalysisResponseSchema = {
  type: "object",
  properties: {
    // Installation methods extracted from documentation
    installationMethods: {
      type: "array",
      items: installationMethodSchema,
      description: "All installation, configuration, and setup methods found in the repository"
    },

    // Computed analysis metrics
    computed: {
      type: "object",
      properties: {
        isMcpServer: {
          type: "boolean",
          description: "True if this is an actual usable MCP server, false if it's a framework/SDK/awesome list/template"
        },
        mcpClassification: {
          type: "string",
          enum: [
            "mcp_server", "mcp_framework", "mcp_sdk", "mcp_awesome_list",
            "mcp_tool", "mcp_example", "mcp_template", "not_mcp_related"
          ],
          description: "Primary classification of this repository's relationship to MCP"
        },
        mcpConfidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "Confidence level in the MCP classification (0-1)"
        },
        mcpReasoning: {
          type: "string",
          description: "Detailed explanation for the MCP classification decision"
        },
        primaryLanguage: {
          type: "string",
          description: "Primary programming language used"
        },
        complexity: {
          type: "string",
          enum: ["simple", "moderate", "complex"],
          description: "Overall complexity of installation and setup"
        },
        installationDifficulty: {
          type: "string",
          enum: ["easy", "medium", "hard"],
          description: "Difficulty level for end users to install and use"
        },
        maturityLevel: {
          type: "string",
          enum: ["experimental", "alpha", "beta", "stable", "production"],
          description: "Maturity and stability level of the project"
        },
        supportedPlatforms: {
          type: "array",
          items: { type: "string" },
          description: "Platforms and operating systems supported"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Relevant tags and keywords for discovery"
        },
        mcpTools: {
          type: "array",
          items: { type: "string" },
          description: "MCP tools provided by this server"
        },
        mcpResources: {
          type: "array",
          items: { type: "string" },
          description: "MCP resources provided by this server"
        },
        mcpPrompts: {
          type: "array",
          items: { type: "string" },
          description: "MCP prompts provided by this server"
        },
        requiresClaudeDesktop: {
          type: "boolean",
          description: "Whether this requires Claude Desktop to function"
        },
        requiresEnvironmentVars: {
          type: "boolean",
          description: "Whether this requires environment variables to be set"
        },
        hasDocumentation: {
          type: "boolean",
          description: "Whether comprehensive documentation is available"
        },
        hasExamples: {
          type: "boolean",
          description: "Whether usage examples are provided"
        }
      },
      required: ["isMcpServer", "mcpClassification", "mcpConfidence", "mcpReasoning"]
    }
  },
  required: ["installationMethods", "computed"]
} as const;

// === SCHEMA UTILITIES ===

/**
 * Get the appropriate schema for AI analysis
 * This is the main schema that should be passed to AI providers
 */
export function getAIAnalysisSchema() {
  return aiAnalysisResponseSchema;
}

/**
 * Get a simplified schema for Gemini (removes complex features)
 */
export function getGeminiCompatibleSchema() {
  // Create a simplified version without additionalProperties and complex refs
  const simplified = JSON.parse(JSON.stringify(aiAnalysisResponseSchema));

  // Remove additionalProperties from all objects
  function removeAdditionalProperties(obj: any) {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach(removeAdditionalProperties);
      } else {
        delete obj.additionalProperties;
        Object.values(obj).forEach(removeAdditionalProperties);
      }
    }
  }

  removeAdditionalProperties(simplified);
  return simplified;
}

/**
 * Validate a response against the AI analysis schema
 */
export function validateAIResponse(response: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic structure validation
  if (!response || typeof response !== 'object') {
    errors.push('Response must be an object');
    return { valid: false, errors };
  }

  // Check required fields
  if (!Array.isArray(response.installationMethods)) {
    errors.push('installationMethods must be an array');
  }

  if (!response.computed || typeof response.computed !== 'object') {
    errors.push('computed must be an object');
  } else {
    const computed = response.computed;

    if (typeof computed.isMcpServer !== 'boolean') {
      errors.push('computed.isMcpServer must be a boolean');
    }

    if (typeof computed.mcpClassification !== 'string') {
      errors.push('computed.mcpClassification must be a string');
    }

    if (typeof computed.mcpConfidence !== 'number' || computed.mcpConfidence < 0 || computed.mcpConfidence > 1) {
      errors.push('computed.mcpConfidence must be a number between 0 and 1');
    }

    if (typeof computed.mcpReasoning !== 'string') {
      errors.push('computed.mcpReasoning must be a string');
    }
  }

  return { valid: errors.length === 0, errors };
}

// Export all schemas for use by AI providers
export const schemas = {
  githubRepository: githubRepositorySchema,
  installationMethod: installationMethodSchema,
  computedMetrics: computedMetricsSchema,
  parsingMetadata: parsingMetadataSchema,
  githubRepoWithInstallation: githubRepoWithInstallationSchema,
  aiAnalysisResponse: aiAnalysisResponseSchema
} as const;
