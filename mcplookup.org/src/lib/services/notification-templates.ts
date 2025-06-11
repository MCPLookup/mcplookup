// Notification Templates Initialization
// Initialize default notification templates for the system

import { notificationService } from './notifications';

/**
 * Initialize all default notification templates
 */
export async function initializeNotificationTemplates() {
  const templates = [
    {
      id: 'github_ownership_verified',
      name: 'GitHub Repository Ownership Verified',
      type: 'email' as const,
      category: 'ownership' as const,
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
      id: 'github_server_registered',
      name: 'GitHub MCP Server Registered',
      type: 'email' as const,
      category: 'server_updates' as const,
      subject_template: 'MCP Server Registered: {{server_name}}',
      body_template: `Your MCP server has been successfully registered!

Server Name: {{server_name}}
GitHub Repository: {{github_repo}}
Domain: {{domain}}

Your server is now discoverable in the MCPLookup.org registry and will appear in your dashboard.

You can view your server at: https://mcplookup.org/servers/{{domain}}

Best regards,
MCPLookup.org Team`,
      variables: ['server_name', 'github_repo', 'domain'],
      default_enabled: true
    },
    {
      id: 'support_ticket_created',
      name: 'Support Ticket Created',
      type: 'email' as const,
      category: 'support' as const,
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
    },
    {
      id: 'email_change_requested',
      name: 'Email Change Requested',
      type: 'email' as const,
      category: 'support' as const,
      subject_template: 'Email Change Request Received',
      body_template: `We've received your email change request.

Current Email: {{current_email}}
Requested Email: {{requested_email}}
Request Date: {{request_date}}

Our support team will review your request and contact you within 1-2 business days to verify your identity and process the change.

Best regards,
MCPLookup.org Support Team`,
      variables: ['current_email', 'requested_email', 'request_date'],
      default_enabled: true
    },
    {
      id: 'account_deleted',
      name: 'Account Deletion Confirmation',
      type: 'email' as const,
      category: 'security' as const,
      subject_template: 'Account Deletion Confirmation',
      body_template: `Your MCPLookup.org account has been successfully deleted.

Cleanup Summary:
- GitHub ownerships removed: {{github_ownerships}}
- API keys deleted: {{api_keys}}
- Sessions cleared: {{sessions}}
- Servers unowned: {{servers}}

Your account data has been permanently removed from our systems. This action cannot be undone.

If you believe this was done in error, please contact support immediately.

Best regards,
MCPLookup.org Team`,
      variables: ['github_ownerships', 'api_keys', 'sessions', 'servers'],
      default_enabled: true
    }
  ];

  for (const template of templates) {
    try {
      const storage = notificationService['storage']; // Access private storage
      await storage.set('notification_templates', template.id, template);
      console.log(`✅ Notification template initialized: ${template.id}`);
    } catch (error) {
      console.error(`❌ Failed to initialize template ${template.id}:`, error);
    }
  }

  console.log('🔔 Notification templates initialization complete');
}

/**
 * Initialize notification templates on server startup
 */
export function setupNotificationTemplates() {
  // Initialize templates when the module is imported
  initializeNotificationTemplates().catch(error => {
    console.error('Failed to initialize notification templates:', error);
  });
}
