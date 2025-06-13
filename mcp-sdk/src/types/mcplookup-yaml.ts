// MCPLookup YAML Configuration Types
// Generated from mcplookup-yaml-schema.yaml

export interface MCPLookupConfig {
  version: "1.0";
  mcp: MCPMetadata;
  installation: InstallationConfig;
  configuration?: ConfigurationSettings;
  capabilities?: CapabilitiesInfo;
  testing?: TestingConfig;
}

export interface MCPMetadata {
  name: string;
  description: string;
  category: MCPCategory;
  subcategories?: string[];
  keywords?: string[];
  author?: AuthorInfo;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
}

export type MCPCategory = 
  | "communication" 
  | "productivity" 
  | "development" 
  | "finance" 
  | "social" 
  | "storage" 
  | "ai" 
  | "data" 
  | "monitoring" 
  | "other";

export interface AuthorInfo {
  name?: string;
  email?: string;
  url?: string;
}

export interface InstallationConfig {
  recommended: InstallationType;
  methods: InstallationMethod[];
}

export type InstallationType = "npm" | "python" | "docker" | "git" | "binary";

export interface InstallationMethod {
  type: InstallationType;
  command: string;
  requirements?: InstallationRequirements;
  environment_variables?: Record<string, EnvironmentVariable>;
  post_install?: string[];
}

export interface InstallationRequirements {
  node_version?: string;
  python_version?: string;
  docker_version?: string;
  system?: string[];
}

export interface EnvironmentVariable {
  description: string;
  required?: boolean;
  default?: string;
  example?: string;
}

export interface ConfigurationSettings {
  transport?: "stdio" | "sse" | "websocket" | "http";
  command?: string;
  args?: string[];
  claude_desktop?: ClaudeDesktopConfig;
}

export interface ClaudeDesktopConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface CapabilitiesInfo {
  tools?: ToolInfo[];
  resources?: ResourceInfo[];
  prompts?: PromptInfo[];
}

export interface ToolInfo {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface ResourceInfo {
  name: string;
  description: string;
  uri_template?: string;
}

export interface PromptInfo {
  name: string;
  description: string;
}

export interface TestingConfig {
  test_commands?: string[];
  health_check?: HealthCheckConfig;
}

export interface HealthCheckConfig {
  endpoint?: string;
  expected_response?: string;
}

// Utility types for validation and conversion
export interface MCPLookupValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config?: MCPLookupConfig;
}

export interface MCPServerFromYAML {
  // Converted MCPServer object from YAML config
  id: string;
  name: string;
  description: string;
  category: string;
  subcategories: string[];
  installation: {
    methods: any[];
    recommended: string;
    environmentVariables: any[];
  };
  capabilities: {
    intentKeywords: string[];
    useCases: string[];
    toolCount: number;
    examples: boolean;
  };
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
  quality: {
    score: number;
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
  trustScore: number;
  verified: boolean;
  packages: any;
}

// Example YAML configuration for documentation
export const EXAMPLE_MCPLOOKUP_YAML = `version: "1.0"
mcp:
  name: "Weather API Server"
  description: "Provides real-time weather data and forecasts via OpenWeatherMap API"
  category: "data"
  subcategories: ["weather", "api", "real-time"]
  keywords: ["weather", "forecast", "temperature", "climate"]
  author:
    name: "Weather Corp"
    email: "support@weather.com"
    url: "https://weather.com"
  license: "MIT"
  homepage: "https://github.com/weather/mcp-server"
  repository: "https://github.com/weather/mcp-server"
  documentation: "https://weather.com/docs"

installation:
  recommended: "npm"
  methods:
    - type: "npm"
      command: "npm install -g weather-mcp-server"
      requirements:
        node_version: ">=18.0.0"
        system: ["linux", "macos", "windows"]
      environment_variables:
        OPENWEATHER_API_KEY:
          description: "API key for OpenWeatherMap service"
          required: true
          example: "your-api-key-here"
      post_install:
        - "weather-mcp-server --setup"
    
    - type: "docker"
      command: "docker run -d weather/mcp-server"
      requirements:
        docker_version: ">=20.0"
      environment_variables:
        OPENWEATHER_API_KEY:
          description: "API key for OpenWeatherMap service"
          required: true

configuration:
  transport: "stdio"
  command: "weather-mcp-server"
  args: ["--port", "3000"]
  claude_desktop:
    command: "weather-mcp-server"
    args: ["--claude"]
    env:
      OPENWEATHER_API_KEY: "your-api-key"

capabilities:
  tools:
    - name: "get_current_weather"
      description: "Get current weather for a location"
      parameters:
        location:
          type: "string"
          description: "City name or coordinates"
    - name: "get_forecast"
      description: "Get weather forecast for a location"
      parameters:
        location:
          type: "string"
          description: "City name or coordinates"
        days:
          type: "number"
          description: "Number of days to forecast"

testing:
  test_commands:
    - "weather-mcp-server --test"
  health_check:
    endpoint: "http://localhost:3000/health"
    expected_response: "OK"`;
