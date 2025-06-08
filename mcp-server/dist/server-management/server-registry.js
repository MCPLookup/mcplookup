// Server registry for managing bridge-mode servers
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { DockerManager } from './docker-manager.js';
export class ServerRegistry {
    servers = new Map();
    dockerManager;
    constructor() {
        this.dockerManager = new DockerManager();
    }
    /**
     * Add a server to the registry
     */
    addServer(server) {
        this.servers.set(server.name, server);
    }
    /**
     * Remove a server from the registry
     */
    removeServer(name) {
        return this.servers.delete(name);
    }
    /**
     * Get a server by name
     */
    getServer(name) {
        return this.servers.get(name);
    }
    /**
     * Check if a server exists
     */
    hasServer(name) {
        return this.servers.has(name);
    }
    /**
     * List all servers
     */
    listServers() {
        return Array.from(this.servers.values());
    }
    /**
     * Get servers by status
     */
    getServersByStatus(status) {
        return this.listServers().filter(server => server.status === status);
    }
    /**
     * Start a server
     */
    async startServer(name) {
        const server = this.getServer(name);
        if (!server) {
            throw new Error(`Server ${name} not found`);
        }
        if (server.status === 'running') {
            throw new Error(`Server ${name} is already running`);
        }
        try {
            server.status = 'installing';
            // Create MCP client to connect to the server
            server.client = new Client({
                name: `bridge-client-${name}`,
                version: '1.0.0'
            });
            // Create transport that will spawn the process
            const transport = new StdioClientTransport({
                command: server.command[0],
                args: server.command.slice(1)
            });
            await server.client.connect(transport);
            // Get available tools from the server
            const tools = await server.client.listTools();
            server.tools = tools.tools?.map((tool) => tool.name) || [];
            server.status = 'running';
            console.log(`✅ Started MCP server '${name}' with tools: ${server.tools.join(', ')}`);
        }
        catch (error) {
            server.status = 'error';
            throw error;
        }
    }
    /**
     * Stop a server
     */
    async stopServer(name) {
        const server = this.getServer(name);
        if (!server) {
            throw new Error(`Server ${name} not found`);
        }
        if (server.client) {
            await server.client.close();
            server.client = undefined;
        }
        // If it's a Docker container, stop it
        if (server.type === 'docker') {
            const containerName = this.dockerManager.getContainerName(server);
            await this.dockerManager.stopContainer(containerName);
        }
        server.status = 'stopped';
        server.tools = [];
        console.log(`🛑 Stopped MCP server '${name}'`);
    }
    /**
     * Restart a server
     */
    async restartServer(name) {
        await this.stopServer(name);
        await this.startServer(name);
    }
    /**
     * Remove a server completely
     */
    async removeServerCompletely(name) {
        const server = this.getServer(name);
        if (!server) {
            throw new Error(`Server ${name} not found`);
        }
        // Stop the server first
        if (server.status === 'running') {
            await this.stopServer(name);
        }
        // If it's a Docker container, remove it
        if (server.type === 'docker') {
            const containerName = this.dockerManager.getContainerName(server);
            await this.dockerManager.removeContainer(containerName);
        }
        // Remove from registry
        this.removeServer(name);
        console.log(`🗑️ Removed MCP server '${name}' completely`);
    }
    /**
     * Get server health status
     */
    async getServerHealth(name) {
        const server = this.getServer(name);
        if (!server) {
            throw new Error(`Server ${name} not found`);
        }
        const health = {
            status: server.status,
            toolCount: server.tools.length
        };
        // For Docker containers, check actual container status
        if (server.type === 'docker' && server.status === 'running') {
            const containerName = this.dockerManager.getContainerName(server);
            const containerStatus = await this.dockerManager.getContainerStatus(containerName);
            if (containerStatus !== 'running') {
                server.status = 'error';
                return { ...health, status: 'error', lastError: 'Container not running' };
            }
        }
        return health;
    }
    /**
     * Get registry statistics
     */
    getStats() {
        const servers = this.listServers();
        return {
            total: servers.length,
            running: servers.filter(s => s.status === 'running').length,
            stopped: servers.filter(s => s.status === 'stopped').length,
            error: servers.filter(s => s.status === 'error').length,
            installing: servers.filter(s => s.status === 'installing').length,
            totalTools: servers.reduce((sum, s) => sum + s.tools.length, 0)
        };
    }
    /**
     * Health check for all servers
     */
    async healthCheckAll() {
        const results = new Map();
        for (const server of this.listServers()) {
            const issues = [];
            let healthy = true;
            try {
                const health = await this.getServerHealth(server.name);
                if (health.status === 'error') {
                    healthy = false;
                    issues.push('Server in error state');
                }
                if (health.toolCount === 0 && server.status === 'running') {
                    healthy = false;
                    issues.push('No tools available');
                }
                results.set(server.name, {
                    status: health.status,
                    healthy,
                    issues
                });
            }
            catch (error) {
                results.set(server.name, {
                    status: 'error',
                    healthy: false,
                    issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
                });
            }
        }
        return results;
    }
    /**
     * Auto-restart failed servers
     */
    async autoRestart() {
        const restarted = [];
        const errorServers = this.getServersByStatus('error');
        for (const server of errorServers) {
            try {
                await this.restartServer(server.name);
                restarted.push(server.name);
                console.log(`🔄 Auto-restarted server '${server.name}'`);
            }
            catch (error) {
                console.error(`Failed to auto-restart server '${server.name}':`, error);
            }
        }
        return restarted;
    }
    /**
     * Cleanup stopped servers
     */
    async cleanup() {
        const cleaned = [];
        const stoppedServers = this.getServersByStatus('stopped');
        for (const server of stoppedServers) {
            if (server.type === 'docker') {
                const containerName = this.dockerManager.getContainerName(server);
                const containerStatus = await this.dockerManager.getContainerStatus(containerName);
                if (containerStatus === 'stopped') {
                    await this.dockerManager.removeContainer(containerName);
                    cleaned.push(server.name);
                    console.log(`🧹 Cleaned up stopped container for '${server.name}'`);
                }
            }
        }
        return cleaned;
    }
    /**
     * Close all connections and cleanup
     */
    async close() {
        const closePromises = this.listServers()
            .filter(server => server.client)
            .map(server => server.client.close().catch(console.error));
        await Promise.all(closePromises);
        // Cleanup Docker containers
        await this.cleanup();
        this.servers.clear();
        console.log('🔌 Server registry closed and cleaned up');
    }
}
//# sourceMappingURL=server-registry.js.map