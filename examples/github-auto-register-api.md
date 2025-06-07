# GitHub Auto-Registration API Examples

The GitHub Auto-Registration API allows you to automatically analyze and register MCP servers from GitHub repositories. This document provides comprehensive examples of how to use the API.

## API Endpoint

```
POST /api/v1/register/github
```

## Authentication

The API supports both session-based authentication (for web UI) and API key authentication (for programmatic access):

```bash
# Using API key (recommended for automation)
curl -X POST https://mcplookup.org/api/v1/register/github \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @request.json

# Using session authentication (web UI)
# Authentication handled automatically by browser session
```

## Basic Registration

### Request

```json
{
  "github_url": "https://github.com/modelcontextprotocol/server-filesystem",
  "contact_email": "developer@example.com"
}
```

### Successful Response (200)

```json
{
  "success": true,
  "message": "MCP server successfully registered from GitHub repository",
  "server": {
    "domain": "github.com/modelcontextprotocol/server-filesystem",
    "name": "Filesystem MCP Server",
    "description": "MCP server for filesystem operations",
    "github_url": "https://github.com/modelcontextprotocol/server-filesystem",
    "registration_type": "github_auto",
    "verification_required": false
  },
  "analysis": {
    "repository": {
      "owner": "modelcontextprotocol",
      "repo": "server-filesystem",
      "stars": 42,
      "language": "TypeScript",
      "topics": ["mcp", "filesystem", "claude"],
      "license": "MIT"
    },
    "deployment_options": {
      "npm_package": true,
      "docker_support": true,
      "has_dockerfile": true,
      "live_url_detected": false,
      "python_package": false
    },
    "mcp_features": {
      "has_claude_config": true,
      "npm_package": "@modelcontextprotocol/server-filesystem",
      "installation_command": "npm install -g @modelcontextprotocol/server-filesystem",
      "environment_variables": ["FILESYSTEM_ROOT"],
      "suggested_auth_type": "none"
    },
    "quality_assessment": {
      "confidence_score": 95,
      "usability_score": 90,
      "installation_complexity": "simple",
      "documentation_quality": "excellent",
      "recommended_action": "accept"
    },
    "feedback": {
      "positive_indicators": [
        "Contains Claude Desktop configuration",
        "Available as NPM package",
        "Comprehensive documentation",
        "Docker support available"
      ],
      "warning_flags": [],
      "rejection_reasons": []
    }
  },
  "next_steps": [
    "Install the package: npm install -g @modelcontextprotocol/server-filesystem",
    "Set required environment variables: FILESYSTEM_ROOT",
    "Add the Claude Desktop configuration from the README to your claude_desktop_config.json",
    "Your MCP server is now discoverable in the MCPLookup.org registry"
  ],
  "recommendations": [
    "Consider adding more usage examples to the documentation"
  ]
}
```

## JavaScript/TypeScript Example

```typescript
interface GitHubRegistrationRequest {
  github_url: string;
  contact_email: string;
  force_register?: boolean;
  skip_analysis?: boolean;
}

async function registerMCPServer(
  githubUrl: string, 
  contactEmail: string,
  apiKey: string
) {
  const response = await fetch('https://mcplookup.org/api/v1/register/github', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      github_url: githubUrl,
      contact_email: contactEmail
    })
  });

  if (\!response.ok) {
    const error = await response.json();
    throw new Error(`Registration failed: ${error.details || error.error}`);
  }

  return await response.json();
}

// Usage
try {
  const result = await registerMCPServer(
    'https://github.com/modelcontextprotocol/server-filesystem',
    'developer@example.com',
    'your_api_key'
  );
  
  console.log('Registration successful:', result.server);
  console.log('Analysis:', result.analysis);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

## OpenAPI Specification

The complete OpenAPI specification is available at:
- **Production**: https://mcplookup.org/openapi.yaml
- **Documentation**: https://mcplookup.org/api-docs
