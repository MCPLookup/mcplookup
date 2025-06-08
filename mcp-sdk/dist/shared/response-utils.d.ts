import { ToolCallResult } from '../types.js';
/**
 * Create a successful tool call result
 */
export declare function createSuccessResult(data: any): ToolCallResult;
/**
 * Create an error tool call result
 */
export declare function createErrorResult(error: unknown, context?: string): ToolCallResult;
/**
 * Execute operation with standardized error handling
 */
export declare function executeWithErrorHandling<T>(operation: () => Promise<T>, context: string): Promise<ToolCallResult>;
/**
 * Sanitize string for use in identifiers
 */
export declare function sanitizeIdentifier(input: string): string;
//# sourceMappingURL=response-utils.d.ts.map