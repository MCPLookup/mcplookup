// Shared response utilities to eliminate duplication

import { ToolCallResult } from '../types.js';

/**
 * Create a successful tool call result
 */
export function createSuccessResult(data: any): ToolCallResult {
  return {
    content: [{
      type: 'text' as const,
      text: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    }]
  };
}

/**
 * Create an error tool call result
 */
export function createErrorResult(error: unknown, context?: string): ToolCallResult {
  const message = error instanceof Error ? error.message : String(error);
  const fullMessage = context ? `${context}: ${message}` : message;
  
  return {
    content: [{
      type: 'text' as const,
      text: fullMessage
    }],
    isError: true
  };
}

/**
 * Execute operation with standardized error handling
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<ToolCallResult> {
  try {
    const result = await operation();
    return createSuccessResult(result);
  } catch (error) {
    return createErrorResult(error, context);
  }
}

/**
 * Sanitize string for use in identifiers
 */
export function sanitizeIdentifier(input: string): string {
  return input
    .replace(/[@\/]/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}
