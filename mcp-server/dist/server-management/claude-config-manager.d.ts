import { ClaudeConfig } from '@mcplookup-org/mcp-sdk';
export declare class ClaudeConfigManager {
    private configPath?;
    /**
     * Get Claude Desktop config path for the current platform
     */
    getConfigPath(): Promise<string>;
    /**
     * Read Claude Desktop configuration
     */
    readConfig(): Promise<ClaudeConfig>;
    /**
     * Write Claude Desktop configuration
     */
    writeConfig(config: ClaudeConfig): Promise<void>;
    /**
     * Add server to Claude Desktop configuration
     */
    addServer(name: string, command: string, args: string[], env?: Record<string, string>): Promise<void>;
    /**
     * Remove server from Claude Desktop configuration
     */
    removeServer(name: string): Promise<boolean>;
    /**
     * Check if server exists in configuration
     */
    hasServer(name: string): Promise<boolean>;
    /**
     * List all servers in configuration
     */
    listServers(): Promise<Array<{
        name: string;
        command: string;
        args: string[];
        env: Record<string, string>;
    }>>;
    /**
     * Get specific server configuration
     */
    getServer(name: string): Promise<{
        command: string;
        args: string[];
        env: Record<string, string>;
    } | null>;
    /**
     * Update server configuration
     */
    updateServer(name: string, command: string, args: string[], env?: Record<string, string>): Promise<boolean>;
    /**
     * Validate configuration file
     */
    validateConfig(): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * Backup configuration file
     */
    backupConfig(): Promise<string>;
    /**
     * Get configuration file info
     */
    getConfigInfo(): Promise<{
        path: string;
        exists: boolean;
        size?: number;
        modified?: Date;
    }>;
}
//# sourceMappingURL=claude-config-manager.d.ts.map