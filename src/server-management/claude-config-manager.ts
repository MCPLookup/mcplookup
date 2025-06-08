// Claude Desktop configuration management

import { readFile, writeFile, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ClaudeConfig } from '@mcplookup-org/mcp-sdk';
import {
  readJsonFile,
  writeJsonFile,
  updateJsonFile,
  fileExists
} from '@mcplookup-org/mcp-sdk';

export class ClaudeConfigManager {
  private configPath?: string;

  /**
   * Get Claude Desktop config path for the current platform
   */
  async getConfigPath(): Promise<string> {
    if (this.configPath) {
      return this.configPath;
    }

    const home = homedir();
    
    // Try different possible locations
    const possiblePaths = [
      // macOS
      join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
      // Windows
      join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'),
      // Linux
      join(home, '.config', 'Claude', 'claude_desktop_config.json'),
      // Alternative locations
      join(home, '.claude', 'claude_desktop_config.json'),
      join(home, 'claude_desktop_config.json')
    ];

    for (const path of possiblePaths) {
      try {
        await access(path);
        this.configPath = path;
        return path;
      } catch {
        // Continue to next path
      }
    }

    // Default to macOS path if none found
    this.configPath = possiblePaths[0];
    return this.configPath;
  }

  /**
   * Read Claude Desktop configuration
   */
  async readConfig(): Promise<ClaudeConfig> {
    const configPath = await this.getConfigPath();
    return await readJsonFile(configPath, { mcpServers: {} });
  }

  /**
   * Write Claude Desktop configuration
   */
  async writeConfig(config: ClaudeConfig): Promise<void> {
    const configPath = await this.getConfigPath();
    await writeJsonFile(configPath, config);
  }

  /**
   * Add server to Claude Desktop configuration
   */
  async addServer(
    name: string,
    command: string,
    args: string[],
    env: Record<string, string> = {}
  ): Promise<void> {
    const configPath = await this.getConfigPath();

    await updateJsonFile<ClaudeConfig>(
      configPath,
      (config: ClaudeConfig) => {
        if (!config.mcpServers) {
          config.mcpServers = {};
        }

        config.mcpServers[name] = {
          command,
          args,
          ...(Object.keys(env).length > 0 && { env })
        };

        return config;
      },
      { mcpServers: {} }
    );
  }

  /**
   * Remove server from Claude Desktop configuration
   */
  async removeServer(name: string): Promise<boolean> {
    const config = await this.readConfig();
    
    if (!config.mcpServers || !config.mcpServers[name]) {
      return false;
    }

    delete config.mcpServers[name];
    await this.writeConfig(config);
    return true;
  }

  /**
   * Check if server exists in configuration
   */
  async hasServer(name: string): Promise<boolean> {
    const config = await this.readConfig();
    return !!(config.mcpServers && config.mcpServers[name]);
  }

  /**
   * List all servers in configuration
   */
  async listServers(): Promise<Array<{
    name: string;
    command: string;
    args: string[];
    env: Record<string, string>;
  }>> {
    const config = await this.readConfig();
    
    if (!config.mcpServers) {
      return [];
    }

    return Object.entries(config.mcpServers).map(([name, serverConfig]) => ({
      name,
      command: serverConfig.command,
      args: serverConfig.args,
      env: serverConfig.env || {}
    }));
  }

  /**
   * Get specific server configuration
   */
  async getServer(name: string): Promise<{
    command: string;
    args: string[];
    env: Record<string, string>;
  } | null> {
    const config = await this.readConfig();
    
    if (!config.mcpServers || !config.mcpServers[name]) {
      return null;
    }

    const serverConfig = config.mcpServers[name];
    return {
      command: serverConfig.command,
      args: serverConfig.args,
      env: serverConfig.env || {}
    };
  }

  /**
   * Update server configuration
   */
  async updateServer(
    name: string,
    command: string,
    args: string[],
    env: Record<string, string> = {}
  ): Promise<boolean> {
    const config = await this.readConfig();
    
    if (!config.mcpServers || !config.mcpServers[name]) {
      return false;
    }

    config.mcpServers[name] = {
      command,
      args,
      ...(Object.keys(env).length > 0 && { env })
    };

    await this.writeConfig(config);
    return true;
  }

  /**
   * Validate configuration file
   */
  async validateConfig(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const config = await this.readConfig();
      
      // Check if mcpServers exists and is an object
      if (config.mcpServers && typeof config.mcpServers !== 'object') {
        errors.push('mcpServers must be an object');
      }

      // Validate each server configuration
      if (config.mcpServers) {
        for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
          if (!serverConfig.command || typeof serverConfig.command !== 'string') {
            errors.push(`Server '${name}': command is required and must be a string`);
          }

          if (!Array.isArray(serverConfig.args)) {
            errors.push(`Server '${name}': args must be an array`);
          }

          if (serverConfig.env && typeof serverConfig.env !== 'object') {
            errors.push(`Server '${name}': env must be an object`);
          }
        }
      }

    } catch (error) {
      errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Backup configuration file
   */
  async backupConfig(): Promise<string> {
    const configPath = await this.getConfigPath();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = configPath.replace('.json', `_backup_${timestamp}.json`);
    
    try {
      const config = await readFile(configPath, 'utf-8');
      await writeFile(backupPath, config);
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to backup config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get configuration file info
   */
  async getConfigInfo(): Promise<{
    path: string;
    exists: boolean;
    size?: number;
    modified?: Date;
  }> {
    const configPath = await this.getConfigPath();
    
    try {
      await access(configPath);
      const stats = await import('node:fs/promises').then(fs => fs.stat(configPath));
      
      return {
        path: configPath,
        exists: true,
        size: stats.size,
        modified: stats.mtime
      };
    } catch {
      return {
        path: configPath,
        exists: false
      };
    }
  }
}
