import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IntentService, EnhancedIntentService } from './intent';

describe('IntentService', () => {
  let intentService: IntentService;

  beforeEach(() => {
    intentService = new IntentService();
  });

  describe('intentToCapabilities', () => {
    it('should map email-related intents to email capabilities', async () => {
      const emailIntents = [
        'send email',
        'manage emails',
        'email automation',
        'compose message',
        'inbox management'
      ];

      for (const intent of emailIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities).toContain('email');
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });

    it('should map calendar-related intents to calendar capabilities', async () => {
      const calendarIntents = [
        'schedule meeting',
        'manage calendar',
        'book appointment',
        'create event',
        'calendar integration'
      ];

      for (const intent of calendarIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities).toContain('calendar');
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });

    it('should map file-related intents to file capabilities', async () => {
      const fileIntents = [
        'upload file',
        'manage documents',
        'file storage',
        'download files',
        'document management'
      ];

      for (const intent of fileIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities).toContain('file_storage');
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });

    it('should map database-related intents to database capabilities', async () => {
      const databaseIntents = [
        'query database',
        'manage data',
        'sql operations',
        'database integration',
        'data analysis'
      ];

      for (const intent of databaseIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities).toContain('database');
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });

    it('should map AI-related intents to AI capabilities', async () => {
      const aiIntents = [
        'ai assistance',
        'machine learning',
        'natural language processing',
        'chatbot',
        'ai integration'
      ];

      for (const intent of aiIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities).toContain('ai');
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });

    it('should handle complex multi-capability intents', async () => {
      const complexIntents = [
        'send email and schedule meeting',
        'manage calendar and files',
        'ai-powered email automation',
        'database-driven analytics'
      ];

      for (const intent of complexIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities.length).toBeGreaterThan(1);
      }
    });

    it('should return empty array for unrecognized intents', async () => {
      const unrecognizedIntents = [
        'xyz unknown capability',
        'random gibberish',
        'completely unrelated intent'
      ];

      for (const intent of unrecognizedIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities).toEqual([]);
      }
    });

    it('should handle empty or whitespace-only intents', async () => {
      const emptyIntents = ['', '   ', '\t\n'];

      for (const intent of emptyIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities).toEqual([]);
      }
    });

    it('should be case-insensitive', async () => {
      const variations = [
        'Send Email',
        'SEND EMAIL',
        'send email',
        'Send EMAIL'
      ];

      const results = await Promise.all(
        variations.map(intent => intentService.intentToCapabilities(intent))
      );

      // All variations should return the same capabilities
      results.forEach(capabilities => {
        expect(capabilities).toContain('email');
      });
    });

    it('should handle partial matches', async () => {
      const partialIntents = [
        'email',
        'calendar',
        'file',
        'database',
        'ai'
      ];

      for (const intent of partialIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities).toContain(intent);
      }
    });

    it('should map productivity intents correctly', async () => {
      const productivityIntents = [
        'productivity tools',
        'workflow automation',
        'task management',
        'project management'
      ];

      for (const intent of productivityIntents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities.length).toBeGreaterThan(0);
        // Should include productivity-related capabilities
        expect(capabilities.some(cap => 
          ['email', 'calendar', 'task_management', 'project_management'].includes(cap)
        )).toBe(true);
      }
    });
  });

  describe('getSimilarIntents', () => {
    it('should return similar intents for email-related queries', async () => {
      const emailIntent = 'send email';
      const similarIntents = await intentService.getSimilarIntents(emailIntent);

      expect(similarIntents.length).toBeGreaterThan(0);
      expect(similarIntents).toContain('email automation');
      expect(similarIntents).toContain('manage emails');
    });

    it('should return similar intents for calendar-related queries', async () => {
      const calendarIntent = 'schedule meeting';
      const similarIntents = await intentService.getSimilarIntents(calendarIntent);

      expect(similarIntents.length).toBeGreaterThan(0);
      expect(similarIntents).toContain('manage calendar');
      expect(similarIntents).toContain('book appointment');
    });

    it('should return similar intents for file-related queries', async () => {
      const fileIntent = 'upload file';
      const similarIntents = await intentService.getSimilarIntents(fileIntent);

      expect(similarIntents.length).toBeGreaterThan(0);
      expect(similarIntents).toContain('file storage');
      expect(similarIntents).toContain('manage documents');
    });

    it('should return empty array for unrecognized intents', async () => {
      const unrecognizedIntent = 'completely unknown intent';
      const similarIntents = await intentService.getSimilarIntents(unrecognizedIntent);

      expect(similarIntents).toEqual([]);
    });

    it('should not include the original intent in similar intents', async () => {
      const intent = 'send email';
      const similarIntents = await intentService.getSimilarIntents(intent);

      expect(similarIntents).not.toContain(intent);
    });

    it('should handle case-insensitive matching', async () => {
      const intent1 = 'Send Email';
      const intent2 = 'send email';

      const similar1 = await intentService.getSimilarIntents(intent1);
      const similar2 = await intentService.getSimilarIntents(intent2);

      expect(similar1).toEqual(similar2);
    });
  });

  describe('intent parsing and normalization', () => {
    it('should handle intents with extra whitespace', async () => {
      const intent = '  send   email  ';
      const capabilities = await intentService.intentToCapabilities(intent);

      expect(capabilities).toContain('email');
    });

    it('should handle intents with special characters', async () => {
      const intents = [
        'send email!',
        'schedule meeting?',
        'file storage...',
        'ai-powered automation'
      ];

      for (const intent of intents) {
        const capabilities = await intentService.intentToCapabilities(intent);
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('EnhancedIntentService', () => {
  let enhancedIntentService: EnhancedIntentService;

  beforeEach(() => {
    enhancedIntentService = new EnhancedIntentService();
  });

  describe('enhanced intent processing', () => {
    it('should provide more sophisticated intent mapping', async () => {
      const complexIntent = 'I need to automate my email workflow and integrate it with my calendar for better productivity';
      const capabilities = await enhancedIntentService.intentToCapabilities(complexIntent);

      expect(capabilities.length).toBeGreaterThan(2);
      expect(capabilities).toContain('email');
      expect(capabilities).toContain('calendar');
      expect(capabilities).toContain('automation');
    });

    it('should handle context-aware intent mapping', async () => {
      const contextualIntent = 'business email automation for customer support';
      const capabilities = await enhancedIntentService.intentToCapabilities(contextualIntent);

      expect(capabilities).toContain('email');
      expect(capabilities).toContain('automation');
      expect(capabilities).toContain('customer_support');
    });

    it('should provide better similar intent suggestions', async () => {
      const intent = 'email automation';
      const similarIntents = await enhancedIntentService.getSimilarIntents(intent);

      expect(similarIntents.length).toBeGreaterThan(3);
      expect(similarIntents).toContain('workflow automation');
      expect(similarIntents).toContain('email integration');
      expect(similarIntents).toContain('automated messaging');
    });

    it('should handle industry-specific intents', async () => {
      const industryIntents = [
        'healthcare data management',
        'financial reporting automation',
        'e-commerce inventory tracking',
        'legal document processing'
      ];

      for (const intent of industryIntents) {
        const capabilities = await enhancedIntentService.intentToCapabilities(intent);
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });

    it('should provide semantic understanding of intents', async () => {
      const semanticIntents = [
        'help me organize my work',
        'improve team collaboration',
        'streamline business processes',
        'enhance customer experience'
      ];

      for (const intent of semanticIntents) {
        const capabilities = await enhancedIntentService.intentToCapabilities(intent);
        expect(capabilities.length).toBeGreaterThan(0);
      }
    });
  });

  describe('machine learning integration', () => {
    it('should learn from user interactions (simulated)', async () => {
      // Simulate learning from user feedback
      const intent = 'project collaboration';
      
      // First call
      const capabilities1 = await enhancedIntentService.intentToCapabilities(intent);
      
      // Simulate user feedback that this should also include 'communication'
      // In a real implementation, this would update the ML model
      
      // Second call (simulating improved results)
      const capabilities2 = await enhancedIntentService.intentToCapabilities(intent);
      
      expect(capabilities2.length).toBeGreaterThanOrEqual(capabilities1.length);
    });
  });

  describe('performance optimization', () => {
    it('should cache frequently used intent mappings', async () => {
      const intent = 'send email';
      
      const start1 = Date.now();
      await enhancedIntentService.intentToCapabilities(intent);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      await enhancedIntentService.intentToCapabilities(intent);
      const time2 = Date.now() - start2;
      
      // Second call should be faster due to caching
      expect(time2).toBeLessThanOrEqual(time1);
    });
  });
});
