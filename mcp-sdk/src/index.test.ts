import { describe, it, expect } from 'vitest';
import { MCPLookupAPIClient } from '../src/generated/api-client.js';
import { createSuccessResult, createErrorResult } from '../src/shared/response-utils.js';

describe('MCP SDK', () => {
  describe('API Client', () => {
    it('should create API client with default URL', () => {
      const client = new MCPLookupAPIClient();
      expect(client).toBeDefined();
    });

    it('should create API client with custom URL', () => {
      const client = new MCPLookupAPIClient('https://custom.api.url');
      expect(client).toBeDefined();
    });
  });

  describe('Response Utils', () => {
    it('should create success result', () => {
      const result = createSuccessResult({ test: 'data' });
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.isError).toBeUndefined();
    });

    it('should create error result', () => {
      const result = createErrorResult('Test error');
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toBe('Test error');
      expect(result.isError).toBe(true);
    });

    it('should create error result with context', () => {
      const result = createErrorResult('Test error', 'Test context');
      expect(result.content[0].text).toBe('Test context: Test error');
    });
  });
});
