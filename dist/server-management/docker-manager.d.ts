import { ManagedServer } from '@mcplookup-org/mcp-sdk';
export declare class DockerManager {
    /**
     * Dockerize an npm package into a runnable container command
     */
    dockerizeNpmServer(server: ManagedServer, env?: Record<string, string>): Promise<void>;
    /**
     * Create a Docker command for running npm packages
     * Centralized method to avoid duplication between bridge and direct modes
     */
    createNpmDockerCommand(packageName: string, options?: {
        containerName?: string;
        mode?: 'bridge' | 'direct';
        env?: Record<string, string>;
        includePortMapping?: boolean;
    }): string[];
    /**
     * Create Docker command args for direct mode (without 'docker' prefix)
     * Used by Claude Desktop config
     */
    createDirectModeDockerArgs(packageName: string, env?: Record<string, string>): string[];
    /**
     * Validate Docker command format
     */
    validateDockerCommand(command: string[]): boolean;
    /**
     * Extract container name from Docker command
     */
    getContainerName(server: ManagedServer): string;
    /**
     * Add security options to Docker command
     */
    addSecurityOptions(command: string[]): string[];
    /**
     * Add resource limits to Docker command
     */
    addResourceLimits(command: string[], options?: {
        memory?: string;
        cpus?: string;
        pidsLimit?: number;
    }): string[];
    /**
     * Add environment variables to Docker command
     */
    addEnvironmentVariables(command: string[], env: Record<string, string>): string[];
    /**
     * Create optimized Docker command for MCP server
     */
    createOptimizedCommand(server: ManagedServer, env?: Record<string, string>): string[];
    /**
     * Check if Docker is available
     */
    isDockerAvailable(): Promise<boolean>;
    /**
     * Get Docker container status
     */
    getContainerStatus(containerName: string): Promise<'running' | 'stopped' | 'not_found'>;
    /**
     * Stop Docker container
     */
    stopContainer(containerName: string): Promise<boolean>;
    /**
     * Remove Docker container
     */
    removeContainer(containerName: string): Promise<boolean>;
    /**
     * Get container logs
     */
    getContainerLogs(containerName: string, lines?: number): Promise<string>;
}
//# sourceMappingURL=docker-manager.d.ts.map