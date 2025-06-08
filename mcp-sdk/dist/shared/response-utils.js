// Shared response utilities to eliminate duplication
/**
 * Create a successful tool call result
 */
export function createSuccessResult(data) {
    return {
        content: [{
                type: 'text',
                text: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
            }]
    };
}
/**
 * Create an error tool call result
 */
export function createErrorResult(error, context) {
    const message = error instanceof Error ? error.message : String(error);
    const fullMessage = context ? `${context}: ${message}` : message;
    return {
        content: [{
                type: 'text',
                text: fullMessage
            }],
        isError: true
    };
}
/**
 * Execute operation with standardized error handling
 */
export async function executeWithErrorHandling(operation, context) {
    try {
        const result = await operation();
        return createSuccessResult(result);
    }
    catch (error) {
        return createErrorResult(error, context);
    }
}
/**
 * Sanitize string for use in identifiers
 */
export function sanitizeIdentifier(input) {
    return input
        .replace(/[@\/]/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toLowerCase();
}
//# sourceMappingURL=response-utils.js.map