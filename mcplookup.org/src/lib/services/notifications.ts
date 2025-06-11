// Notification Service
// Handles user notifications based on preferences

import { createStorage } from './storage/factory';
import { IStorage, StorageResult, createSuccessResult, createErrorResult } from './storage/unified-storage';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'in_app' | 'webhook';
  category: 'security' | 'server_updates' | 'ownership' | 'support' | 'marketing';
  subject_template: string;
  body_template: string;
  variables: string[];
  default_enabled: boolean;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  webhook_url?: string;
  
  // Category preferences
  security_notifications: boolean;
  server_update_notifications: boolean;
  ownership_notifications: boolean;
  support_notifications: boolean;
  marketing_notifications: boolean;
  
  // Frequency settings
  digest_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string; // "22:00"
  quiet_hours_end?: string;   // "08:00"
  timezone?: string;
  
  updated_at: string;
}

export interface NotificationQueue {
  id: string;
  user_id: string;
  template_id: string;
  type: 'email' | 'in_app' | 'webhook';
  category: string;
  
  subject: string;
  body: string;
  data: Record<string, any>;
  
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  created_at: string;
  sent_at?: string;
  error_message?: string;
  retry_count: number;
}

/**
 * Notification Service
 * Handles user notifications based on preferences
 */
export class NotificationService {
  private storage: IStorage;

  constructor(storage?: IStorage) {
    this.storage = storage || createStorage();
  }

  /**
   * Initialize default notification preferences for a user
   */
  async initializeUserPreferences(userId: string): Promise<StorageResult<NotificationPreferences>> {
    try {
      const defaultPreferences: NotificationPreferences = {
        user_id: userId,
        email_notifications: true,
        in_app_notifications: true,
        
        // Category defaults
        security_notifications: true,
        server_update_notifications: true,
        ownership_notifications: true,
        support_notifications: true,
        marketing_notifications: false,
        
        // Frequency defaults
        digest_frequency: 'immediate',
        
        updated_at: new Date().toISOString()
      };

      const result = await this.storage.set('notification_preferences', userId, defaultPreferences);
      
      if (!result.success) {
        return createErrorResult('Failed to initialize notification preferences', 'PREFERENCES_INIT_FAILED');
      }

      return createSuccessResult(defaultPreferences);
    } catch (error) {
      return createErrorResult(`Failed to initialize preferences: ${error}`, 'PREFERENCES_INIT_ERROR');
    }
  }

  /**
   * Get user's notification preferences
   */
  async getUserPreferences(userId: string): Promise<StorageResult<NotificationPreferences>> {
    try {
      const result = await this.storage.get('notification_preferences', userId);
      
      if (!result.success || !result.data) {
        // Initialize if not found
        return await this.initializeUserPreferences(userId);
      }

      return createSuccessResult(result.data as NotificationPreferences);
    } catch (error) {
      return createErrorResult(`Failed to get preferences: ${error}`, 'PREFERENCES_GET_ERROR');
    }
  }

  /**
   * Update user's notification preferences
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<StorageResult<NotificationPreferences>> {
    try {
      // Get current preferences
      const currentResult = await this.getUserPreferences(userId);
      
      if (!currentResult.success) {
        return currentResult;
      }

      // Update preferences
      const updatedPreferences: NotificationPreferences = {
        ...currentResult.data,
        ...updates,
        user_id: userId, // Ensure user ID doesn't change
        updated_at: new Date().toISOString()
      };

      const result = await this.storage.set('notification_preferences', userId, updatedPreferences);
      
      if (!result.success) {
        return createErrorResult('Failed to update preferences', 'PREFERENCES_UPDATE_FAILED');
      }

      return createSuccessResult(updatedPreferences);
    } catch (error) {
      return createErrorResult(`Failed to update preferences: ${error}`, 'PREFERENCES_UPDATE_ERROR');
    }
  }

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    templateId: string,
    data: Record<string, any>,
    options?: {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      force_send?: boolean; // Bypass user preferences
    }
  ): Promise<StorageResult<{ sent: boolean; reason?: string }>> {
    try {
      // Get user preferences
      const preferencesResult = await this.getUserPreferences(userId);
      
      if (!preferencesResult.success) {
        return createErrorResult('Failed to get user preferences', 'PREFERENCES_GET_FAILED');
      }

      const preferences = preferencesResult.data;

      // Get notification template
      const templateResult = await this.storage.get('notification_templates', templateId);
      
      if (!templateResult.success || !templateResult.data) {
        return createErrorResult('Notification template not found', 'TEMPLATE_NOT_FOUND');
      }

      const template = templateResult.data as NotificationTemplate;

      // Check if user wants this type of notification
      if (!options?.force_send && !this.shouldSendNotification(preferences, template)) {
        return createSuccessResult({ sent: false, reason: 'User preferences disabled this notification' });
      }

      // Render notification content
      const subject = this.renderTemplate(template.subject_template, data);
      const body = this.renderTemplate(template.body_template, data);

      // Queue notification
      const queueId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const queueItem: NotificationQueue = {
        id: queueId,
        user_id: userId,
        template_id: templateId,
        type: template.type,
        category: template.category,
        subject,
        body,
        data,
        status: 'pending',
        priority: options?.priority || 'normal',
        created_at: new Date().toISOString(),
        retry_count: 0
      };

      const queueResult = await this.storage.set('notification_queue', queueId, queueItem);
      
      if (!queueResult.success) {
        return createErrorResult('Failed to queue notification', 'QUEUE_FAILED');
      }

      // Process notification immediately (or could be queued for batch processing)
      await this.processNotification(queueItem);

      return createSuccessResult({ sent: true });
    } catch (error) {
      return createErrorResult(`Failed to send notification: ${error}`, 'SEND_NOTIFICATION_ERROR');
    }
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendNotification(preferences: NotificationPreferences, template: NotificationTemplate): boolean {
    // Check if email notifications are enabled
    if (template.type === 'email' && !preferences.email_notifications) {
      return false;
    }

    // Check if in-app notifications are enabled
    if (template.type === 'in_app' && !preferences.in_app_notifications) {
      return false;
    }

    // Check category preferences
    switch (template.category) {
      case 'security':
        return preferences.security_notifications;
      case 'server_updates':
        return preferences.server_update_notifications;
      case 'ownership':
        return preferences.ownership_notifications;
      case 'support':
        return preferences.support_notifications;
      case 'marketing':
        return preferences.marketing_notifications;
      default:
        return true; // Send by default for unknown categories
    }
  }

  /**
   * Render notification template with data
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    
    // Simple template variable replacement
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return rendered;
  }

  /**
   * Process queued notification
   */
  private async processNotification(queueItem: NotificationQueue): Promise<void> {
    try {
      let success = false;

      switch (queueItem.type) {
        case 'email':
          success = await this.sendEmailNotification(queueItem);
          break;
        case 'in_app':
          success = await this.sendInAppNotification(queueItem);
          break;
        case 'webhook':
          success = await this.sendWebhookNotification(queueItem);
          break;
      }

      // Update queue item status
      const updatedQueueItem = {
        ...queueItem,
        status: success ? 'sent' : 'failed',
        sent_at: success ? new Date().toISOString() : undefined,
        error_message: success ? undefined : 'Processing failed'
      };

      await this.storage.set('notification_queue', queueItem.id, updatedQueueItem);
    } catch (error) {
      console.error('Notification processing error:', error);
      
      // Update with error
      const errorQueueItem = {
        ...queueItem,
        status: 'failed',
        error_message: String(error),
        retry_count: queueItem.retry_count + 1
      };

      await this.storage.set('notification_queue', queueItem.id, errorQueueItem);
    }
  }

  /**
   * Send email notification (placeholder implementation)
   */
  private async sendEmailNotification(queueItem: NotificationQueue): Promise<boolean> {
    try {
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      console.log('📧 Sending email notification:', {
        to: queueItem.user_id,
        subject: queueItem.subject,
        body: queueItem.body
      });

      // Simulate email sending
      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(queueItem: NotificationQueue): Promise<boolean> {
    try {
      // Store in-app notification for user to see in dashboard
      const inAppNotification = {
        id: `in_app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: queueItem.user_id,
        subject: queueItem.subject,
        body: queueItem.body,
        category: queueItem.category,
        read: false,
        created_at: new Date().toISOString()
      };

      const result = await this.storage.set('in_app_notifications', inAppNotification.id, inAppNotification);
      return result.success;
    } catch (error) {
      console.error('In-app notification failed:', error);
      return false;
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(queueItem: NotificationQueue): Promise<boolean> {
    try {
      // Get user's webhook URL
      const preferencesResult = await this.getUserPreferences(queueItem.user_id);
      
      if (!preferencesResult.success || !preferencesResult.data.webhook_url) {
        return false;
      }

      // Send webhook
      const response = await fetch(preferencesResult.data.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: queueItem.subject,
          body: queueItem.body,
          category: queueItem.category,
          data: queueItem.data,
          timestamp: queueItem.created_at
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook notification failed:', error);
      return false;
    }
  }

  /**
   * Initialize default notification templates
   */
  async initializeTemplates(): Promise<void> {
    const templates: NotificationTemplate[] = [
      {
        id: 'github_ownership_verified',
        name: 'GitHub Repository Ownership Verified',
        type: 'email',
        category: 'ownership',
        subject_template: 'GitHub Repository Ownership Verified: {{repo_name}}',
        body_template: `Your GitHub repository ownership has been verified!

Repository: {{repo_name}}
Verification Date: {{verified_at}}
Branch: {{branch}}

You can now manage this repository's metadata and show it on your profile.

Best regards,
MCPLookup.org Team`,
        variables: ['repo_name', 'verified_at', 'branch'],
        default_enabled: true
      },
      {
        id: 'support_ticket_created',
        name: 'Support Ticket Created',
        type: 'email',
        category: 'support',
        subject_template: 'Support Ticket Created: {{subject}}',
        body_template: `Your support ticket has been created successfully.

Ticket ID: {{ticket_id}}
Subject: {{subject}}
Priority: {{priority}}
Status: {{status}}

We'll review your request and respond within 1-2 business days.

Best regards,
MCPLookup.org Support Team`,
        variables: ['ticket_id', 'subject', 'priority', 'status'],
        default_enabled: true
      }
    ];

    for (const template of templates) {
      await this.storage.set('notification_templates', template.id, template);
    }
  }
}

export const notificationService = new NotificationService();
