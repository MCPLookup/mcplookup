// OpenAPI Validation Middleware
// Uses generated schemas to validate requests and responses

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { schemas } from '../generated/server-schemas';

export type ValidationError = {
  field: string;
  message: string;
  code: string;
};

export type ValidatedRequest<T = any> = {
  body?: T;
  query?: Record<string, any>;
  params?: Record<string, any>;
};

/**
 * Validate request body using generated OpenAPI schema
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      return { success: false, errors };
    }
    
    return {
      success: false,
      errors: [{ field: 'body', message: 'Invalid request body', code: 'invalid_type' }]
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQuery(
  schema: z.ZodSchema,
  query: Record<string, any>
): { success: true; data: any } | { success: false; errors: ValidationError[] } {
  try {
    const data = schema.parse(query);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      return { success: false, errors };
    }
    
    return {
      success: false,
      errors: [{ field: 'query', message: 'Invalid query parameters', code: 'invalid_type' }]
    };
  }
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(errors: ValidationError[]): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: errors
    },
    { status: 400 }
  );
}

/**
 * Higher-order function to create validated API handlers
 */
export function withValidation<TBody = any, TQuery = any>(config: {
  bodySchema?: z.ZodSchema<TBody>;
  querySchema?: z.ZodSchema<TQuery>;
  handler: (request: NextRequest, validated: ValidatedRequest<TBody>) => Promise<NextResponse>;
}) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const validated: ValidatedRequest<TBody> = {};
    
    // Validate request body if schema provided
    if (config.bodySchema) {
      try {
        const body = await request.json();
        const bodyValidation = validateRequestBody(config.bodySchema, body);
        
        if (!bodyValidation.success) {
          return createValidationErrorResponse(bodyValidation.errors);
        }
        
        validated.body = bodyValidation.data;
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
    }
    
    // Validate query parameters if schema provided
    if (config.querySchema) {
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams.entries());
      
      const queryValidation = validateQuery(config.querySchema, query);
      
      if (!queryValidation.success) {
        return createValidationErrorResponse(queryValidation.errors);
      }
      
      validated.query = queryValidation.data;
    }
    
    // Extract path parameters from context
    if (context?.params) {
      validated.params = await context.params;
    }
    
    // Call the actual handler with validated data
    return config.handler(request, validated);
  };
}

// Export commonly used schemas for convenience
export const RequestSchemas = {
  // Note: These will be available once server-schemas.ts is properly generated
  // discover: schemas.getDiscover_QueryParams,
  // register: schemas.postRegister_Body,
  // smartDiscover: schemas.postDiscoversmart_Body,
  // onboarding: schemas.postOnboarding_Body,
} as const;

// Query parameter schemas for common endpoints
export const QuerySchemas = {
  domainCheck: z.object({
    domain: z.string().min(1)
  }),
  health: z.object({
    realtime: z.string().optional().transform(val => val === 'true')
  }),
  discover: z.object({
    query: z.string().optional(),
    intent: z.string().optional(),
    domain: z.string().optional(),
    capability: z.string().optional(),
    category: z.enum(['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'other']).optional(),
    transport: z.enum(['streamable_http', 'sse', 'stdio']).optional(),
    verified_only: z.string().optional().transform(val => val === 'true'),
    include_health: z.string().optional().transform(val => val !== 'false'),
    include_tools: z.string().optional().transform(val => val !== 'false'),
    include_resources: z.string().optional().transform(val => val === 'true'),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
  })
} as const;
