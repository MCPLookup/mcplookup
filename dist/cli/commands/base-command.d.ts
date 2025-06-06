import { MCPLookupBridge } from '@mcplookup-org/mcp-server';
export interface CommandOptions {
    verbose?: boolean;
    apiKey?: string;
    color?: boolean;
    [key: string]: any;
}
export declare abstract class BaseCommand {
    protected bridge: MCPLookupBridge;
    protected verbose: boolean;
    constructor(bridge: MCPLookupBridge);
    /**
     * Execute the command
     */
    abstract execute(...args: any[]): Promise<void>;
    /**
     * Log info message
     */
    protected info(message: string): void;
    /**
     * Log success message
     */
    protected success(message: string): void;
    /**
     * Log warning message
     */
    protected warn(message: string): void;
    /**
     * Log error message
     */
    protected error(message: string): void;
    /**
     * Log verbose message
     */
    protected debug(message: string): void;
    /**
     * Handle errors gracefully
     */
    protected handleError(error: unknown, context: string): void;
    /**
     * Parse JSON safely
     */
    protected parseJSON(jsonString: string, defaultValue?: any): any;
    /**
     * Format output based on format option
     */
    protected formatOutput(data: any, format?: string): void;
    /**
     * Simple YAML-like formatter
     */
    private toYaml;
    /**
     * Print data as a table
     */
    private printTable;
    /**
     * Confirm action with user
     */
    protected confirm(message: string, defaultValue?: boolean): Promise<boolean>;
    /**
     * Get user input
     */
    protected prompt(message: string, defaultValue?: string): Promise<string>;
    /**
     * Select from options
     */
    protected select(message: string, choices: string[]): Promise<string>;
    /**
     * Show spinner while executing async operation
     */
    protected withSpinner<T>(message: string, operation: () => Promise<T>): Promise<T>;
    /**
     * Set verbose mode
     */
    setVerbose(verbose: boolean): void;
}
//# sourceMappingURL=base-command.d.ts.map