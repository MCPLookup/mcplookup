// Claude Desktop configuration utilities
// Helpers for generating and managing Claude Desktop config files

import { InstallationResolver } from './installation-utils.js';
import { ResolvedPackage, InstallationContext } from '../types/generated.js';

export interface ClaudeServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface ClaudeDesktopConfig {
  mcpServers: Record<string, ClaudeServerConfig>;
}

export class ClaudeConfigGenerator {
  private resolver: InstallationResolver;

  constructor(baseUrl?: string, apiKey?: string) {
    this.resolver = new InstallationResolver(baseUrl, apiKey);
  }

  /**
   * Generate complete Claude Desktop configuration for a package
   */
  async generateConfig(
    resolvedPackage: ResolvedPackage,
    context: InstallationContext,
    customEnv: Record<string, string> = {},
    serverName?: string
  ): Promise<ClaudeDesktopConfig> {
    // Get detailed installation instructions
    const instructions = await this.resolver.getInstallationInstructions(resolvedPackage, context);
    
    const finalServerName = serverName || this.resolver.generateServerName(resolvedPackage.packageName);
    
    const serverConfig: ClaudeServerConfig = {
      command: instructions.command,
      args: instructions.args,
      ...(Object.keys({ ...instructions.env_vars, ...customEnv }).length > 0 && {
        env: { ...instructions.env_vars, ...customEnv }
      })
    };

    return {
      mcpServers: {
        [finalServerName]: serverConfig
      }
    };
  }

  /**
   * Generate configuration from minimal input (package name + environment)
   */
  async generateFromPackage(
    packageName: string,
    context: InstallationContext,
    customEnv: Record<string, string> = {}
  ): Promise<{
    config: ClaudeDesktopConfig;
    package: ResolvedPackage;
    instructions: string[];
  }> {
    // Resolve the package first
    const resolvedPackage = await this.resolver.resolvePackage(packageName);
    
    // Generate configuration
    const config = await this.generateConfig(resolvedPackage, context, customEnv);
    
    // Get installation instructions
    const installationInfo = await this.resolver.getInstallationInstructions(resolvedPackage, context);
    
    return {
      config,
      package: resolvedPackage,
      instructions: [
        ...installationInfo.steps,
        ...installationInfo.post_install_notes
      ]
    };
  }

  /**
   * Create a ready-to-copy Claude config snippet
   */
  formatConfigForCopy(config: ClaudeDesktopConfig, includeWrapper = true): string {
    if (includeWrapper) {
      return JSON.stringify(config, null, 2);
    } else {
      // Just the mcpServers content
      return JSON.stringify(config.mcpServers, null, 2);
    }
  }

  /**
   * Merge multiple server configurations
   */
  mergeConfigs(...configs: ClaudeDesktopConfig[]): ClaudeDesktopConfig {
    const merged: ClaudeDesktopConfig = { mcpServers: {} };
    
    for (const config of configs) {
      Object.assign(merged.mcpServers, config.mcpServers);
    }
    
    return merged;
  }

  /**
   * Validate a Claude Desktop configuration
   */
  validateConfig(config: ClaudeDesktopConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.mcpServers) {
      errors.push('Missing mcpServers section');
      return { valid: false, errors, warnings };
    }

    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      // Validate server name
      if (!/^[a-zA-Z0-9_-]+$/.test(serverName)) {
        warnings.push(`Server name "${serverName}" contains special characters`);
      }

      // Validate required fields
      if (!serverConfig.command) {
        errors.push(`Server "${serverName}" missing command`);
      }

      if (!Array.isArray(serverConfig.args)) {
        errors.push(`Server "${serverName}" args must be an array`);
      }

      // Validate environment variables
      if (serverConfig.env) {
        for (const [envKey, envValue] of Object.entries(serverConfig.env)) {
          if (typeof envValue !== 'string') {
            errors.push(`Server "${serverName}" env variable "${envKey}" must be a string`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get example configurations for common scenarios
   */
  getExampleConfigs(): Record<string, ClaudeDesktopConfig> {
    return {
      'npm-global': {
        mcpServers: {
          'example-server': {
            command: 'mcp-server-example',
            args: []
          }
        }
      },
      'npm-npx': {
        mcpServers: {
          'example-server': {
            command: 'npx',
            args: ['mcp-server-example']
          }
        }
      },
      'python-uvx': {
        mcpServers: {
          'example-server': {
            command: 'uvx',
            args: ['mcp-server-example'],
            env: {
              'API_KEY': 'your-api-key-here'
            }
          }
        }
      },
      'docker': {
        mcpServers: {
          'example-server': {
            command: 'docker',
            args: ['run', '--rm', '-i', 'example/mcp-server']
          }
        }
      }
    };
  }
}
