// Storage Service Integration Tests
// Tests the in-memory storage implementation with real data operations

import { describe, it, expect, beforeEach } from 'vitest';
import { getStorageService, setStorageService } from '@/lib/storage';
import { StorageService, createSuccessResult, createErrorResult, isSuccessResult } from '@/lib/storage/types';

describe('Storage Service Integration', () => {
  let storageService: StorageService;

  beforeEach(() => {
    // Reset to a fresh storage instance for each test
    setStorageService(null as any);
    storageService = getStorageService();
  });

  describe('Basic CRUD Operations', () => {
    it('should store and retrieve data', async () => {
      const testData = { id: '1', name: 'Test Item', value: 42 };
      
      // Store data
      const setResult = await storageService.set('test_collection', 'item1', testData);
      expect(setResult.success).toBe(true);
      expect(setResult.data).toEqual(testData);

      // Retrieve data
      const getResult = await storageService.get('test_collection', 'item1');
      expect(getResult.success).toBe(true);
      expect(getResult.data).toEqual(testData);
    });

    it('should handle non-existent keys', async () => {
      const result = await storageService.get('test_collection', 'non_existent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Key not found');
    });

    it('should delete data', async () => {
      const testData = { id: '1', name: 'Test Item' };
      
      // Store data
      await storageService.set('test_collection', 'item1', testData);
      
      // Verify it exists
      const getResult = await storageService.get('test_collection', 'item1');
      expect(getResult.success).toBe(true);

      // Delete data
      const deleteResult = await storageService.delete('test_collection', 'item1');
      expect(deleteResult.success).toBe(true);

      // Verify it's gone
      const getAfterDelete = await storageService.get('test_collection', 'item1');
      expect(getAfterDelete.success).toBe(false);
    });
  });

  describe('Batch Operations', () => {
    it('should retrieve all items from a collection', async () => {
      const testData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' }
      ];

      // Store multiple items
      for (let i = 0; i < testData.length; i++) {
        await storageService.set('test_collection', `item${i + 1}`, testData[i]);
      }

      // Get all items
      const result = await storageService.getAll('test_collection');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data).toEqual(expect.arrayContaining(testData));
    });

    it('should retrieve items by prefix', async () => {
      const testData = [
        { id: '1', name: 'User Item 1' },
        { id: '2', name: 'User Item 2' },
        { id: '3', name: 'Admin Item 1' }
      ];

      // Store items with different prefixes
      await storageService.set('test_collection', 'user_item1', testData[0]);
      await storageService.set('test_collection', 'user_item2', testData[1]);
      await storageService.set('test_collection', 'admin_item1', testData[2]);

      // Get items with 'user_' prefix
      const result = await storageService.getByPrefix('test_collection', 'user_');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(expect.arrayContaining([testData[0], testData[1]]));
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const health = await storageService.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.details).toBeDefined();
      expect(health.details.type).toBe('memory');
    });
  });

  describe('Helper Functions', () => {
    it('should correctly identify success results', async () => {
      const testData = { id: '1', name: 'Test' };
      await storageService.set('test', 'item1', testData);
      
      const result = await storageService.get('test', 'item1');
      expect(result.success).toBe(true);
      
      // Test the helper function
      expect(isSuccessResult(result)).toBe(true);
      
      if (isSuccessResult(result)) {
        // TypeScript should know result.data exists here
        expect(result.data).toEqual(testData);
      }
    });

    it('should create proper success and error results', async () => {
      const successResult = createSuccessResult({ id: '1' });
      expect(successResult.success).toBe(true);
      expect(successResult.data).toEqual({ id: '1' });
      expect(successResult.error).toBeUndefined();

      const errorResult = createErrorResult('Test error');
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBe('Test error');
      expect(errorResult.data).toBeUndefined();
    });
  });
});
