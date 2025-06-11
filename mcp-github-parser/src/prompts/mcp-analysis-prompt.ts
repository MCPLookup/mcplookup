/**
 * MCP Repository Analysis Prompt Builder
 * Creates comprehensive prompts for AI analysis of GitHub repositories
 */

export interface PromptContext {
  repoName: string;
  repoDescription?: string;
  repoTopics: string[];
  primaryLanguage?: string;
  combinedContent: string;
}

/**
 * MCP Classification types with detailed descriptions
 */
export const MCP_CLASSIFICATIONS = {
  mcp_server: {
    name: "mcp_server",
    emoji: "✅",
    title: "MCP Server",
    description: "ONLY if this is an ACTUAL, USABLE MCP SERVER"
  },
  mcp_framework: {
    name: "mcp_framework", 
    emoji: "🔧",
    title: "MCP Framework",
    description: "Framework/library for building MCP servers"
  },
  mcp_sdk: {
    name: "mcp_sdk",
    emoji: "🛠️", 
    title: "MCP SDK",
    description: "SDK or client libraries for MCP"
  },
  mcp_awesome_list: {
    name: "mcp_awesome_list",
    emoji: "📚",
    title: "MCP Awesome List", 
    description: "Curated lists/collections"
  },
  mcp_tool: {
    name: "mcp_tool",
    emoji: "🔨",
    title: "MCP Tool",
    description: "Developer tools/utilities for MCP"
  },
  mcp_example: {
    name: "mcp_example",
    emoji: "📖", 
    title: "MCP Example",
    description: "Examples/demos/tutorials"
  },
  mcp_template: {
    name: "mcp_template",
    emoji: "📋",
    title: "MCP Template",
    description: "Templates/boilerplates"
  },
  not_mcp_related: {
    name: "not_mcp_related",
    emoji: "❌",
    title: "Not MCP Related",
    description: "Not MCP-related"
  }
} as const;

// Schema is now provided by the SDK via getAIAnalysisSchema()

/**
 * Generate MCP classification guidelines section
 */
export function getMcpClassificationGuidelines(): string {
  return Object.entries(MCP_CLASSIFICATIONS).map(([key, config]) => {
    const examples = getMcpClassificationExamples(key);
    
    return `### ${config.emoji} "${config.name}" - ${config.title}:
${config.description}
${examples}`;
  }).join('\n\n');
}

/**
 * Get specific examples for each MCP classification type
 */
function getMcpClassificationExamples(classification: string): string {
  const examples = {
    mcp_server: `- Has server implementation code (main.py, index.js, server.ts, etc.)
- Implements MCP protocol (handles initialize, tools/call, resources/list, etc.)
- Provides tools, resources, or prompts to MCP clients
- Can be installed and run as a functioning server
- Has MCP server imports like "@modelcontextprotocol/sdk", "mcp", etc.
- Contains tool definitions, resource handlers, or prompt templates
- Includes Claude Desktop configuration examples
- Look for: server classes, request handlers, protocol implementation`,

    mcp_framework: `- Provides base classes, utilities, abstractions for MCP development
- Not a server itself, but helps developers build servers
- Usually named like "mcp-framework", "mcp-sdk-python", "mcp-core"
- Contains abstract classes, interfaces, helper functions`,

    mcp_sdk: `- Client-side libraries for connecting to MCP servers
- SDKs for different programming languages
- Developer tools for MCP integration
- Usually for integrating MCP into applications`,

    mcp_awesome_list: `- README files with lists of MCP servers/tools
- "Awesome" lists, catalogs, directories
- Collection repositories with links to other MCP projects
- Look for: lists of links, tables of servers, directories`,

    mcp_tool: `- CLI tools, debugging utilities, testing tools
- Inspector tools, validators, analyzers
- Development aids that work with MCP but aren't servers`,

    mcp_example: `- Sample implementations, proof of concepts
- Educational examples, tutorial code
- Demo servers for learning purposes
- Usually simple, educational implementations`,

    mcp_template: `- Starter templates, scaffolding, cookiecutter templates
- Code generators, project templates
- Boilerplate code for creating new MCP servers`,

    not_mcp_related: `- No MCP functionality or mentions
- Different protocol or unrelated purpose`
  };

  return examples[classification as keyof typeof examples] || '';
}

/**
 * Build the comprehensive MCP analysis prompt
 */
export function buildMcpAnalysisPrompt(context: PromptContext): string {
  return `You are an expert repository analyzer specializing in MCP (Model Context Protocol) servers and tools. 

Your mission is to be the ONE-STOP SHOP for MCP repository analysis. Answer these critical questions:
🔍 **Is this an MCP server?** (Be extremely careful with classification)
⚙️ **How do we install it?** (All methods, package managers, manual builds)
🔧 **How do we configure it?** (Environment variables, config files, secrets)
🚀 **How do we deploy it?** (Local, Docker, cloud, etc.)
📋 **What's the Claude Desktop JSON?** (Complete configurations)
🛠️ **What tools/resources does it provide?** (Actual MCP capabilities)
📊 **How mature/ready is it?** (Production readiness assessment)

## REPOSITORY CONTEXT:
- **Repository**: ${context.repoName}
- **Description**: ${context.repoDescription || 'No description provided'}
- **Topics**: ${context.repoTopics.join(', ') || 'None'}
- **Primary Language**: ${context.primaryLanguage || 'Unknown'}

## FILES TO ANALYZE:
${context.combinedContent}

## MCP CLASSIFICATION GUIDELINES (BE EXTREMELY CAREFUL):

${getMcpClassificationGuidelines()}

## COMPREHENSIVE ANALYSIS REQUIREMENTS:

### 🔍 1. **EXAMINE CODE STRUCTURE METICULOUSLY**
- Look for MCP protocol implementation patterns
- Identify server entry points (main.py, index.js, server.ts)
- Check for MCP message handlers (initialize, tools/call, resources/list)
- Find tool definitions, resource handlers, prompt templates

### 📦 2. **ANALYZE DEPENDENCIES & IMPORTS**
- MCP server libraries vs client libraries vs frameworks
- Look for: "@modelcontextprotocol/sdk", "mcp", "anthropic-mcp", etc.
- Distinguish between server implementations and client SDKs

### ⚙️ 3. **EXTRACT ALL INSTALLATION METHODS**
Be comprehensive and capture EVERY installation approach:

**Package Managers:**
- pip install, npm install, cargo install, go get
- conda install, brew install, apt-get install
- Docker pull commands

**Manual Installation:**
- git clone + build steps (group complete workflows)
- Download + extract + install sequences
- Compilation instructions (make, cargo build, npm run build)

**Configuration Steps:**
- Environment variable setup (.env files, export commands)
- Configuration file creation/editing
- API key setup and authentication
- Database connection setup

**Claude Desktop Setup:**
- Complete JSON configurations (capture EXACTLY as written)
- File paths, command structures
- Environment variable references
- Server startup commands

**VS Code MCP Setup:**
- settings.json configurations
- Extension installations
- Workspace setup

**Deployment Methods:**
- Local development setup
- Docker containerization
- Cloud deployment (AWS, GCP, Azure)
- Server hosting instructions

**Testing & Debugging:**
- Test command examples
- Debugging setup
- Validation steps

### 🔧 4. **IDENTIFY MCP CAPABILITIES**
If this is an MCP server, extract:
- **Tools**: What specific tools does this server provide?
- **Resources**: What resources can it access/provide?
- **Prompts**: What prompt templates are included?
- **Integrations**: What external services does it connect to?

### 📊 5. **ASSESS MATURITY & USABILITY**
- **Documentation Quality**: How well documented is it?
- **Example Availability**: Are there working examples?
- **Production Readiness**: Is this ready for real use?
- **Community Support**: Active development/maintenance?
- **Maturity Level**: experimental, alpha, beta, stable, production

### 🏗️ 6. **TECHNICAL ASSESSMENT**
- **Complexity**: How complex is the installation/setup?
- **Platform Support**: What platforms does it support?
- **Dependencies**: What are the key dependencies?
- **Configuration Requirements**: What needs to be configured?

## OUTPUT REQUIREMENTS:

**CRITICAL**: Group complete installation workflows together. If installation requires multiple steps (git clone → cd → install deps → configure → test), put them ALL in one installation method. 

**ULTRA IMPORTANT**: Capture Claude Desktop JSON configurations COMPLETELY and EXACTLY as written in the documentation.

**COMPREHENSIVE**: Fill out ALL fields in the response schema, including the enhanced computed fields for MCP capabilities, maturity assessment, and technical details.

Return comprehensive JSON analysis covering all aspects of the repository.`;
}

/**
 * Build a focused prompt for installation method extraction only
 */
export function buildInstallationExtractionPrompt(context: PromptContext): string {
  return `Extract ALL installation methods, configuration steps, and deployment instructions from this repository.

Repository: ${context.repoName}
Files: ${context.combinedContent}

Focus on extracting EVERY method for:
1. **Installation** (pip, npm, docker, git clone, manual builds)
2. **Configuration** (environment variables, config files, API keys) 
3. **Claude Desktop setup** (complete JSON configs)
4. **VS Code setup** (if applicable)
5. **Deployment/running instructions**
6. **Testing methods**

Group complete workflows together. Don't break up coherent installation sequences.
Capture Claude Desktop configurations in their entirety.

Return as many installation methods as possible - be comprehensive, not selective.`;
}
