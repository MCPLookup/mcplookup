// Docker container management for MCP servers

import { ManagedServer } from '@mcplookup-org/mcp-sdk/types';

export class DockerManager {
  /**
   * Dockerize an npm package into a runnable container command
   */
  async dockerizeNpmServer(server: ManagedServer, env: Record<string, string> = {}): Promise<void> {
    const packageName = server.command[1]; // npx <package-name>

    // Use the centralized Docker command creation
    server.command = this.createNpmDockerCommand(packageName, {
      containerName: `mcp-${server.name}`,
      mode: 'bridge',
      env,
      includePortMapping: false // Bridge mode doesn't need port mapping for stdio
    });
  }

  /**
   * Create a Docker command for running npm packages
   * Centralized method to avoid duplication between bridge and direct modes
   */
  createNpmDockerCommand(
    packageName: string,
    options: {
      containerName?: string;
      mode?: 'bridge' | 'direct';
      env?: Record<string, string>;
      includePortMapping?: boolean;
    } = {}
  ): string[] {
    const {
      containerName = `mcp-${packageName.replace(/[@\/]/g, '-')}`,
      mode = 'bridge',
      env = {},
      includePortMapping = false
    } = options;

    // Base Docker command
    const baseCommand = [
      'docker', 'run', '--rm', '-i',
      '--name', containerName,
      ...(includePortMapping ? ['-p', '0:3000'] : []), // Only add port mapping if needed
      'node:18-alpine',
      'sh', '-c',
      `npm install -g ${packageName} && npx ${packageName}`
    ];

    // Add environment variables if provided
    let command = baseCommand;
    if (Object.keys(env).length > 0) {
      command = this.addEnvironmentVariables(command, env);
    }

    // Add security and resource limits for production use
    if (mode === 'direct') {
      // Direct mode gets full security hardening
      command = this.addResourceLimits(command, {
        memory: '512m',
        cpus: '0.5',
        pidsLimit: 100
      });
      command = this.addSecurityOptions(command);
    }

    return command;
  }

  /**
   * Create Docker command args for direct mode (without 'docker' prefix)
   * Used by Claude Desktop config
   */
  createDirectModeDockerArgs(
    packageName: string,
    env: Record<string, string> = {}
  ): string[] {
    const fullCommand = this.createNpmDockerCommand(packageName, {
      containerName: `mcp-direct-${packageName.replace(/[@\/]/g, '-')}`,
      mode: 'direct',
      env,
      includePortMapping: false
    });

    // Remove 'docker' prefix for Claude Desktop config
    return fullCommand.slice(1);
  }

  /**
   * Validate Docker command format
   */
  validateDockerCommand(command: string[]): boolean {
    if (command.length < 2) return false;
    if (command[0] !== 'docker') return false;
    if (!command.includes('run')) return false;
    return true;
  }

  /**
   * Extract container name from Docker command
   */
  getContainerName(server: ManagedServer): string {
    const nameIndex = server.command.indexOf('--name');
    if (nameIndex !== -1 && nameIndex + 1 < server.command.length) {
      return server.command[nameIndex + 1];
    }
    return `mcp-${server.name}`;
  }

  /**
   * Add security options to Docker command
   */
  addSecurityOptions(command: string[]): string[] {
    const securityOptions = [
      '--read-only',
      '--no-new-privileges',
      '--security-opt', 'no-new-privileges:true'
    ];

    // Insert security options after 'docker run'
    const runIndex = command.indexOf('run');
    if (runIndex !== -1) {
      return [
        ...command.slice(0, runIndex + 1),
        ...securityOptions,
        ...command.slice(runIndex + 1)
      ];
    }

    return command;
  }

  /**
   * Add resource limits to Docker command
   */
  addResourceLimits(command: string[], options: {
    memory?: string;
    cpus?: string;
    pidsLimit?: number;
  } = {}): string[] {
    const resourceOptions: string[] = [];

    if (options.memory) {
      resourceOptions.push('--memory', options.memory);
    }

    if (options.cpus) {
      resourceOptions.push('--cpus', options.cpus);
    }

    if (options.pidsLimit) {
      resourceOptions.push('--pids-limit', options.pidsLimit.toString());
    }

    // Insert resource options after 'docker run'
    const runIndex = command.indexOf('run');
    if (runIndex !== -1) {
      return [
        ...command.slice(0, runIndex + 1),
        ...resourceOptions,
        ...command.slice(runIndex + 1)
      ];
    }

    return command;
  }

  /**
   * Add environment variables to Docker command
   */
  addEnvironmentVariables(command: string[], env: Record<string, string>): string[] {
    const envOptions: string[] = [];

    for (const [key, value] of Object.entries(env)) {
      envOptions.push('-e', `${key}=${value}`);
    }

    // Insert env options after 'docker run'
    const runIndex = command.indexOf('run');
    if (runIndex !== -1) {
      return [
        ...command.slice(0, runIndex + 1),
        ...envOptions,
        ...command.slice(runIndex + 1)
      ];
    }

    return command;
  }

  /**
   * Create optimized Docker command for MCP server
   */
  createOptimizedCommand(server: ManagedServer, env: Record<string, string> = {}): string[] {
    let command = [...server.command];

    // Add environment variables
    if (Object.keys(env).length > 0) {
      command = this.addEnvironmentVariables(command, env);
    }

    // Add resource limits (reasonable defaults)
    command = this.addResourceLimits(command, {
      memory: '512m',
      cpus: '0.5',
      pidsLimit: 100
    });

    // Add security options
    command = this.addSecurityOptions(command);

    return command;
  }

  /**
   * Check if Docker is available
   */
  async isDockerAvailable(): Promise<boolean> {
    try {
      const { spawn } = await import('node:child_process');
      return new Promise((resolve) => {
        const process = spawn('docker', ['--version'], { stdio: 'ignore' });
        process.on('close', (code) => {
          resolve(code === 0);
        });
        process.on('error', () => {
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }

  /**
   * Get Docker container status
   */
  async getContainerStatus(containerName: string): Promise<'running' | 'stopped' | 'not_found'> {
    try {
      const { spawn } = await import('node:child_process');
      return new Promise((resolve) => {
        const process = spawn('docker', ['ps', '-a', '--filter', `name=${containerName}`, '--format', '{{.Status}}'], {
          stdio: ['ignore', 'pipe', 'ignore']
        });

        let output = '';
        process.stdout?.on('data', (data) => {
          output += data.toString();
        });

        process.on('close', (code) => {
          if (code !== 0 || !output.trim()) {
            resolve('not_found');
            return;
          }

          const status = output.trim().toLowerCase();
          if (status.includes('up')) {
            resolve('running');
          } else {
            resolve('stopped');
          }
        });

        process.on('error', () => {
          resolve('not_found');
        });
      });
    } catch {
      return 'not_found';
    }
  }

  /**
   * Stop Docker container
   */
  async stopContainer(containerName: string): Promise<boolean> {
    try {
      const { spawn } = await import('node:child_process');
      return new Promise((resolve) => {
        const process = spawn('docker', ['stop', containerName], { stdio: 'ignore' });
        process.on('close', (code) => {
          resolve(code === 0);
        });
        process.on('error', () => {
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }

  /**
   * Remove Docker container
   */
  async removeContainer(containerName: string): Promise<boolean> {
    try {
      const { spawn } = await import('node:child_process');
      return new Promise((resolve) => {
        const process = spawn('docker', ['rm', '-f', containerName], { stdio: 'ignore' });
        process.on('close', (code) => {
          resolve(code === 0);
        });
        process.on('error', () => {
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(containerName: string, lines: number = 50): Promise<string> {
    try {
      const { spawn } = await import('node:child_process');
      return new Promise((resolve) => {
        const process = spawn('docker', ['logs', '--tail', lines.toString(), containerName], {
          stdio: ['ignore', 'pipe', 'pipe']
        });

        let output = '';
        process.stdout?.on('data', (data) => {
          output += data.toString();
        });

        process.stderr?.on('data', (data) => {
          output += data.toString();
        });

        process.on('close', () => {
          resolve(output);
        });

        process.on('error', () => {
          resolve('Error retrieving logs');
        });
      });
    } catch {
      return 'Error retrieving logs';
    }
  }
}
