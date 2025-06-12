import type { components } from '../generated/api-types.js';

/**
 * Installation Method Types
 * Source of truth for all installation-related data structures
 */

// === INSTALLATION TYPE DEFINITIONS ===

export type InstallationType = 
  | "installation"
  | "configuration" 
  | "claude_desktop"
  | "vscode"
  | "deployment"
  | "testing";

export type InstallationCategory = 
  | "setup" 
  | "build" 
  | "deploy" 
  | "configure" 
  | "test" 
  | "run";

export type InstallationSubtype = 
  // Python ecosystem
  | "pip" | "conda" | "poetry" | "pipenv" | "setup_py" | "pyproject_toml" 
  | "requirements_txt" | "venv" | "virtualenv"
  // JavaScript/Node.js ecosystem  
  | "npm" | "yarn" | "pnpm" | "npm_global" | "npx" | "package_json"
  // Go ecosystem
  | "go_get" | "go_install" | "go_mod" | "go_build" | "go_run" | "go_mod_tidy"
  // Rust ecosystem
  | "cargo_install" | "cargo_build" | "cargo_run" | "cargo_test" | "cargo_features"
  // Docker ecosystem
  | "docker_build" | "docker_run" | "docker_compose" | "dockerfile" | "docker_pull"
  // Package managers
  | "brew" | "apt" | "yum" | "dnf" | "chocolatey" | "winget" | "snap" | "flatpak"
  // Build systems
  | "make" | "cmake" | "gradle" | "maven" | "bazel" | "ninja"
  // Git-based installs
  | "git+uv" | "git_clone" | "git_submodule" | "git_pull"
  // MCP specific
  | "package_manager"
  // Environment/Config
  | "environment_vars" | "json_config" | "yaml_config" | "ini_config" | "toml_config"
  // Platform specific
  | "manual_config" | "docker_config"
  // VS Code specific
  | "mcp_json" | "settings_json" | "workspace_config"
  // Runtime/Deployment
  | "server_start" | "docker_run" | "service_start" | "background_process"
  // Testing
  | "curl_test" | "inspector_test" | "unit_test" | "integration_test";

export type InstallationPlatform = 
  // Programming languages
  | "python" | "javascript" | "typescript" | "go" | "rust" | "java" 
  | "csharp" | "cpp" | "php" | "ruby"
  // Runtime environments
  | "nodejs" | "deno" | "bun"
  // Containerization
  | "docker" | "kubernetes" | "podman"
  // Operating systems
  | "linux" | "macos" | "windows" | "cross_platform"
  // MCP platforms
  | "claude_desktop" | "vscode" | "mcp_client"
  // Service platforms
  | "system_service" | "cloud" | "serverless" | "web_server";

export type TransportType = "stdio" | "sse" | "websocket" | "tcp" | "http";

// === INSTALLATION INTERFACES ===

export interface MCPConfig {
  server_name?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface InstallationEndpoint {
  url: string;
  transport: string;
  description: string;
}

export type InstallationMethod = components['schemas']['InstallationMethod'];

export interface EnvironmentVariable {
  name: string;
  required: boolean;
  description?: string;
  default?: string;
  example?: string;
  validation?: string;
}

export interface MCPServerInstallation {
  recommended_method: InstallationSubtype;
  difficulty: 'easy' | 'medium' | 'hard';
  methods: InstallationMethod[];
}

export interface MCPServerEnvironment {
  variables: EnvironmentVariable[];
  runtime_requirements: {
    node_version?: string;
    python_version?: string;
    platforms: string[];
  };
}

export interface ClaudeDesktopConfig {
  available: boolean;
  config?: {
    mcpServers: {
      [serverName: string]: {
        command: string;
        args: string[];
        env?: Record<string, string>;
      };
    };
  };
  server_name?: string;
  command?: string;
  args?: string[];
  env_vars?: Record<string, string>;
}

// === TYPE GUARDS ===

export function isInstallationMethod(obj: any): obj is InstallationMethod {
  return obj && typeof obj.type === 'string' && typeof obj.title === 'string';
}

export function isValidInstallationType(value: string): value is InstallationType {
  const validTypes: InstallationType[] = [
    "installation", "configuration", "claude_desktop", "vscode", "deployment", "testing"
  ];
  return validTypes.includes(value as InstallationType);
}

export function isValidInstallationPlatform(value: string): value is InstallationPlatform {
  const validPlatforms: InstallationPlatform[] = [
    "python", "javascript", "typescript", "go", "rust", "java", "csharp", "cpp", "php", "ruby",
    "nodejs", "deno", "bun", "docker", "kubernetes", "podman", "linux", "macos", "windows", 
    "cross_platform", "claude_desktop", "vscode", "mcp_client", "system_service", "cloud", 
    "serverless", "web_server"
  ];
  return validPlatforms.includes(value as InstallationPlatform);
}
