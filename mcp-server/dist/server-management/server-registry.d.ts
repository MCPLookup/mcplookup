import { ManagedServer } from '@mcplookup-org/mcp-sdk';
export declare class ServerRegistry {
    private servers;
    private dockerManager;
    constructor();
    /**
     * Add a server to the registry
     */
    addServer(server: ManagedServer): void;
    /**
     * Remove a server from the registry
     */
    removeServer(name: string): boolean;
    /**
     * Get a server by name
     */
    getServer(name: string): ManagedServer | undefined;
    /**
     * Check if a server exists
     */
    hasServer(name: string): boolean;
    /**
     * List all servers
     */
    listServers(): ManagedServer[];
    /**
     * Get servers by status
     */
    getServersByStatus(status: ManagedServer['status']): ManagedServer[];
    /**
     * Start a server
     */
    startServer(name: string): Promise<void>;
    /**
     * Stop a server
     */
    stopServer(name: string): Promise<void>;
    /**
     * Restart a server
     */
    restartServer(name: string): Promise<void>;
    /**
     * Remove a server completely
     */
    removeServerCompletely(name: string): Promise<void>;
    /**
     * Get server health status
     */
    getServerHealth(name: string): Promise<{
        status: ManagedServer['status'];
        toolCount: number;
        uptime?: number;
        lastError?: string;
    }>;
    /**
     * Get registry statistics
     */
    getStats(): {
        total: number;
        running: number;
        stopped: number;
        error: number;
        installing: number;
        totalTools: number;
    };
    /**
     * Health check for all servers
     */
    healthCheckAll(): Promise<Map<string, {
        status: ManagedServer['status'];
        healthy: boolean;
        issues: string[];
    }>>;
    /**
     * Auto-restart failed servers
     */
    autoRestart(): Promise<string[]>;
    /**
     * Cleanup stopped servers
     */
    cleanup(): Promise<string[]>;
    /**
     * Close all connections and cleanup
     */
    close(): Promise<void>;
}
//# sourceMappingURL=server-registry.d.ts.map