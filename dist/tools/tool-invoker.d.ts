import { InvokeToolOptions, ToolCallResult } from '@mcplookup-org/mcp-sdk';
export declare class ToolInvoker {
    private clientCache;
    /**
     * Invoke a tool on any MCP server
     */
    invoke(options: InvokeToolOptions): Promise<ToolCallResult>;
    /**
     * Get or create a client for the given endpoint
     */
    private getOrCreateClient;
    /**
     * Clear the client cache
     */
    clearCache(): void;
    /**
     * Close all connections
     */
    close(): Promise<void>;
}
//# sourceMappingURL=tool-invoker.d.ts.map