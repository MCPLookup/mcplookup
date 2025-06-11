// Installation utilities for MCP servers
// Shared logic for package resolution, installation methods, and configuration

import { MCPLookupAPIClient } from '../generated/api-client.js';
import { InstallationContext, ResolvedPackage } from '../types/generated.js';

export class InstallationResolver {
  private client: MCPLookupAPIClient;

  constructor(baseUrl?: string, apiKey?: string) {
    this.client = new MCPLookupAPIClient(baseUrl, apiKey);
  }

  /**
   * Resolve package name to actual installable package
   * Handles: NPM packages, Python packages, Docker images, natural language queries
   */
  async resolvePackage(input: string): Promise<ResolvedPackage> {
    // 1. Direct NPM package (e.g., @npmorg/package, package-name)
    if (this.isNpmPackage(input)) {
      return {
        packageName: input,
        displayName: input,
        type: 'npm',
        source: 'direct'
      };
    }

    // 2. Python package (e.g., mcp-server-*)
    if (this.isPythonPackage(input)) {
      return {
        packageName: input,
        displayName: input,
        type: 'python',
        source: 'direct'
      };
    }

    // 3. Docker image (e.g., company/server:latest)
    if (this.isDockerImage(input)) {
      return {
        packageName: input,
        displayName: input,
        type: 'docker',
        source: 'direct'
      };
    }

    // 4. Natural language or server name - search mcplookup.org
    return await this.searchForPackage(input);
  }

  /**
   * Get detailed installation instructions for a resolved package
   */
  async getInstallationInstructions(
    resolvedPackage: ResolvedPackage,
    context: InstallationContext
  ): Promise<{
    steps: string[];
    command: string;
    args: string[];
    env_vars: Record<string, string>;
    post_install_notes: string[];
  }> {
    try {
      // Try to get enhanced instructions from API
      const instructions = await this.client.getInstallInstructions(
        resolvedPackage.packageName,
        {
          method: resolvedPackage.type,
          platform: context.platform
        }
      );
        return {
        steps: instructions.installation_steps?.map(step => step.description).filter(Boolean) as string[] || [],
        command: instructions.claude_config?.command || this.getDefaultCommand(resolvedPackage, context),
        args: instructions.claude_config?.args || this.getDefaultArgs(resolvedPackage, context),
        env_vars: instructions.claude_config?.env_vars || {},
        post_install_notes: []
      };
    } catch (error) {
      // Fall back to local resolution
      return this.generateLocalInstructions(resolvedPackage, context);
    }
  }

  /**
   * Generate Claude Desktop configuration for a package
   */
  generateClaudeConfig(
    resolvedPackage: ResolvedPackage,
    context: InstallationContext,
    customEnv: Record<string, string> = {}
  ): any {
    const serverName = this.generateServerName(resolvedPackage.packageName);
    const command = this.getDefaultCommand(resolvedPackage, context);
    const args = this.getDefaultArgs(resolvedPackage, context);

    const config = {
      [serverName]: {
        command,
        args,
        ...(Object.keys(customEnv).length > 0 && { env: customEnv })
      }
    };

    return { mcpServers: config };
  }  /**
   * Determine the best installation method for a package
   */
  getBestInstallationMethod(
    resolvedPackage: ResolvedPackage,
    context: InstallationContext
  ): InstallationMethod {
    // If we have API data, use it
    if (resolvedPackage.installation?.methods && resolvedPackage.installation.methods.length > 0) {
      const recommended = resolvedPackage.installation.methods.find(
        (m: any) => m.type === resolvedPackage.installation?.recommended_method
      );
      if (recommended) {
        return this.convertToInstallationMethod(recommended);
      }
      return this.convertToInstallationMethod(resolvedPackage.installation.methods[0]);
    }

    // Fall back to local logic
    return this.generateLocalInstallationMethod(resolvedPackage, context);
  }

  private convertToInstallationMethod(apiMethod: any): InstallationMethod {
    return {
      type: apiMethod.type || 'npm',
      package: apiMethod.package,
      command: apiMethod.command || '',
      registry: apiMethod.registry,
      version: apiMethod.version,
      complexity: apiMethod.complexity || 'simple',
      requirements: apiMethod.requirements || []
    };
  }

  private isNpmPackage(input: string): boolean {
    return /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(input) &&
           !input.includes(':') &&
           !input.includes(' ') &&
           !input.startsWith('mcp-server-');
  }

  private isPythonPackage(input: string): boolean {
    return input.startsWith('mcp-server-') ||
           input.includes('python') ||
           /^[a-z][a-z0-9_-]*$/.test(input);
  }

  private isDockerImage(input: string): boolean {
    return input.includes(':') && !input.includes(' ') && !input.startsWith('@');
  }

  private async searchForPackage(query: string): Promise<ResolvedPackage> {
    try {
      // Use smart discovery for better matching
      const result = await this.client.smartDiscover({
        query,
        max_results: 5
      });      if (result.matches && result.matches.length > 0) {
        const match = result.matches[0];
        const server = match.server;

        if (!server) {
          throw new Error(`Invalid server data received for: "${query}"`);
        }

        // Convert API response to our format
        return {
          packageName: this.extractPackageName(server) || server.id || query,
          displayName: server.name || 'Unknown Server',
          description: server.description,
          type: this.determinePackageType(server),
          source: 'smart_search',
          verified: server.verification?.status === 'verified',
          installation: server.installation,
          claude_integration: server.claude_integration
        };
      }

      throw new Error(`No installable package found for: "${query}"`);
    } catch (error) {
      throw new Error(`Search failed for "${query}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  private extractPackageName(server: any): string | undefined {
    // Try different package sources in order of preference
    if (server.packages) {
      for (const pkg of server.packages) {
        if (pkg.registry_name === 'npm') return pkg.name;
        if (pkg.registry_name === 'pypi') return pkg.name;
        if (pkg.registry_name === 'docker') return pkg.name;
      }
    }
    
    // Fall back to source URL parsing
    if (server.source?.url) {
      const url = server.source.url;
      if (url.includes('github.com')) {
        return url.split('/').slice(-2).join('/');
      }
    }

    return server.id;
  }

  private determinePackageType(server: any): 'npm' | 'python' | 'docker' | 'git' {
    if (server.packages) {
      for (const pkg of server.packages) {
        if (pkg.registry_name === 'npm') return 'npm';
        if (pkg.registry_name === 'pypi') return 'python';
        if (pkg.registry_name === 'docker') return 'docker';
      }
    }

    // Fall back to source analysis
    if (server.source?.language === 'Python') return 'python';
    if (server.source?.language === 'TypeScript' || server.source?.language === 'JavaScript') return 'npm';
    
    return 'git';
  }

  private getDefaultCommand(resolvedPackage: ResolvedPackage, context: InstallationContext): string {
    if (resolvedPackage.claude_integration?.command) {
      return resolvedPackage.claude_integration.command;
    }

    switch (resolvedPackage.type) {
      case 'npm':
        return context.globalInstall ? resolvedPackage.packageName : 'npx';
      case 'python':
        return 'uvx';
      case 'docker':
        return 'docker';
      default:
        return 'npx';
    }
  }

  private getDefaultArgs(resolvedPackage: ResolvedPackage, context: InstallationContext): string[] {
    if (resolvedPackage.claude_integration?.args) {
      return resolvedPackage.claude_integration.args;
    }

    switch (resolvedPackage.type) {
      case 'npm':
        return context.globalInstall ? [] : [resolvedPackage.packageName];
      case 'python':
        return [resolvedPackage.packageName];
      case 'docker':
        return ['run', '--rm', '-i', resolvedPackage.packageName];
      default:
        return [resolvedPackage.packageName];
    }
  }

  private generateLocalInstructions(
    resolvedPackage: ResolvedPackage,
    context: InstallationContext
  ) {
    const steps = [];
    const command = this.getDefaultCommand(resolvedPackage, context);
    const args = this.getDefaultArgs(resolvedPackage, context);

    switch (resolvedPackage.type) {
      case 'npm':
        if (context.globalInstall) {
          steps.push(`npm install -g ${resolvedPackage.packageName}`);
        }
        steps.push(`Add to Claude Desktop configuration`);
        break;
      case 'python':
        steps.push(`Install using uvx: uvx ${resolvedPackage.packageName}`);
        break;
      case 'docker':
        steps.push(`Pull Docker image: docker pull ${resolvedPackage.packageName}`);
        break;
    }

    return {
      steps,
      command,
      args,
      env_vars: {},
      post_install_notes: context.mode === 'direct' ? ['Restart Claude Desktop to use the server'] : []
    };
  }
  private generateLocalInstallationMethod(
    resolvedPackage: ResolvedPackage,
    context: InstallationContext
  ): InstallationMethod {
    return {
      type: resolvedPackage.type,
      package: resolvedPackage.packageName,
      command: this.getDefaultCommand(resolvedPackage, context),
      registry: this.getRegistryForType(resolvedPackage.type),
      complexity: 'simple',
      requirements: this.getRequirementsForType(resolvedPackage.type)
    };
  }

  private getRegistryForType(type: string): string {
    switch (type) {
      case 'npm': return 'npmjs.com';
      case 'python': return 'pypi.org';
      case 'docker': return 'hub.docker.com';
      default: return 'github.com';
    }
  }

  private getRequirementsForType(type: string): string[] {
    switch (type) {
      case 'npm': return ['Node.js >= 18'];
      case 'python': return ['Python >= 3.8', 'uv or pip'];
      case 'docker': return ['Docker'];
      default: return [];
    }
  }

  /**
   * Generate a clean server name from package name
   */
  generateServerName(packageName: string): string {
    return packageName
      .replace(/[@\/]/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase();
  }

  /**
   * Get runtime information string for display
   */
  getRuntimeInfo(type: string, mode: string, globalInstall?: boolean): string {
    if (mode === 'bridge') {
      return type === 'docker' ? 'Docker container (bridge)' : 'Docker container (via npx/uvx)';
    }

    // Direct mode
    if (type === 'docker') {
      return 'Docker container (direct)';
    }

    // Package in direct mode
    if (globalInstall) {
      return 'Host system (native)';
    } else {
      return 'Docker container (via npx/uvx)';
    }
  }
}
