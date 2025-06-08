// Claude Desktop configuration management
import { readFile, writeFile, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readJsonFile, writeJsonFile, updateJsonFile } from '@mcplookup-org/mcp-sdk';
export class ClaudeConfigManager {
    configPath;
    /**
     * Get Claude Desktop config path for the current platform
     */
    async getConfigPath() {
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
            }
            catch {
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
    async readConfig() {
        const configPath = await this.getConfigPath();
        return await readJsonFile(configPath, { mcpServers: {} });
    }
    /**
     * Write Claude Desktop configuration
     */
    async writeConfig(config) {
        const configPath = await this.getConfigPath();
        await writeJsonFile(configPath, config);
    }
    /**
     * Add server to Claude Desktop configuration
     */
    async addServer(name, command, args, env = {}) {
        const configPath = await this.getConfigPath();
        await updateJsonFile(configPath, (config) => {
            if (!config.mcpServers) {
                config.mcpServers = {};
            }
            config.mcpServers[name] = {
                command,
                args,
                ...(Object.keys(env).length > 0 && { env })
            };
            return config;
        }, { mcpServers: {} });
    }
    /**
     * Remove server from Claude Desktop configuration
     */
    async removeServer(name) {
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
    async hasServer(name) {
        const config = await this.readConfig();
        return !!(config.mcpServers && config.mcpServers[name]);
    }
    /**
     * List all servers in configuration
     */
    async listServers() {
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
    async getServer(name) {
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
    async updateServer(name, command, args, env = {}) {
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
    async validateConfig() {
        const errors = [];
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
        }
        catch (error) {
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
    async backupConfig() {
        const configPath = await this.getConfigPath();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = configPath.replace('.json', `_backup_${timestamp}.json`);
        try {
            const config = await readFile(configPath, 'utf-8');
            await writeFile(backupPath, config);
            return backupPath;
        }
        catch (error) {
            throw new Error(`Failed to backup config: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get configuration file info
     */
    async getConfigInfo() {
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
        }
        catch {
            return {
                path: configPath,
                exists: false
            };
        }
    }
}
//# sourceMappingURL=claude-config-manager.js.map