// Account Cleanup Service
// Handles comprehensive cleanup when users delete their accounts

import { createStorage } from './storage/factory';
import { IStorage, StorageResult, createSuccessResult, createErrorResult } from './storage/unified-storage';
import { githubOwnershipService } from './github-ownership';
import { apiKeyService } from './api-keys/service';

export interface AccountCleanupResult {
  success: boolean;
  cleaned_items: {
    github_ownerships: number;
    api_keys: number;
    sessions: number;
    support_tickets: number;
    registered_servers: number;
    email_change_requests: number;
  };
  errors: string[];
  cleanup_completed_at: string;
}

/**
 * Account Cleanup Service
 * Handles comprehensive cleanup when users delete accounts
 */
export class AccountCleanupService {
  private storage: IStorage;

  constructor(storage?: IStorage) {
    this.storage = storage || createStorage();
  }

  /**
   * Perform comprehensive account cleanup
   */
  async cleanupUserAccount(userId: string): Promise<StorageResult<AccountCleanupResult>> {
    const cleanupResult: AccountCleanupResult = {
      success: true,
      cleaned_items: {
        github_ownerships: 0,
        api_keys: 0,
        sessions: 0,
        support_tickets: 0,
        registered_servers: 0,
        email_change_requests: 0
      },
      errors: [],
      cleanup_completed_at: new Date().toISOString()
    };

    try {
      console.log(`🧹 Starting account cleanup for user: ${userId}`);

      // 1. Clean up GitHub repository ownerships
      await this.cleanupGitHubOwnerships(userId, cleanupResult);

      // 2. Clean up API keys
      await this.cleanupApiKeys(userId, cleanupResult);

      // 3. Clean up user sessions
      await this.cleanupUserSessions(userId, cleanupResult);

      // 4. Clean up support tickets
      await this.cleanupSupportTickets(userId, cleanupResult);

      // 5. Clean up registered servers
      await this.cleanupRegisteredServers(userId, cleanupResult);

      // 6. Clean up email change requests
      await this.cleanupEmailChangeRequests(userId, cleanupResult);

      // 7. Mark user profile as deleted (already done in main delete function)
      
      console.log(`✅ Account cleanup completed for user: ${userId}`, cleanupResult);

      return createSuccessResult(cleanupResult);
    } catch (error) {
      cleanupResult.success = false;
      cleanupResult.errors.push(`Cleanup failed: ${error}`);
      console.error('Account cleanup error:', error);
      return createErrorResult(`Account cleanup failed: ${error}`, 'CLEANUP_FAILED');
    }
  }

  /**
   * Clean up GitHub repository ownerships
   */
  private async cleanupGitHubOwnerships(userId: string, result: AccountCleanupResult): Promise<void> {
    try {
      // Get all GitHub ownerships
      const ownershipsResult = await this.storage.getAll('github_repository_ownership');
      
      if (ownershipsResult.success) {
        const userOwnerships = ownershipsResult.data.items.filter(
          (ownership: any) => ownership.owner_user_id === userId
        );

        // Delete each ownership record
        for (const ownership of userOwnerships) {
          if (ownership.github_repo) {
            const deleteResult = await this.storage.delete('github_repository_ownership', ownership.github_repo);
            if (deleteResult.success) {
              result.cleaned_items.github_ownerships++;
            } else {
              result.errors.push(`Failed to delete GitHub ownership: ${ownership.github_repo}`);
            }
          }
        }

        // Clean up ownership challenges
        const challengesResult = await this.storage.getAll('github_ownership_challenges');
        if (challengesResult.success) {
          const userChallenges = challengesResult.data.items.filter(
            (challenge: any) => challenge.user_id === userId
          );

          for (const challenge of userChallenges) {
            await this.storage.delete('github_ownership_challenges', challenge.challenge_id);
          }
        }
      }
    } catch (error) {
      result.errors.push(`GitHub ownership cleanup failed: ${error}`);
    }
  }

  /**
   * Clean up user API keys
   */
  private async cleanupApiKeys(userId: string, result: AccountCleanupResult): Promise<void> {
    try {
      // Get user's API keys using the API key service
      const apiKeysResult = await apiKeyService.getUserApiKeys(userId);
      
      if (apiKeysResult.success) {
        for (const apiKey of apiKeysResult.data) {
          const deleteResult = await apiKeyService.revokeApiKey(userId, apiKey.id);
          if (deleteResult.success) {
            result.cleaned_items.api_keys++;
          } else {
            result.errors.push(`Failed to delete API key: ${apiKey.id}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`API key cleanup failed: ${error}`);
    }
  }

  /**
   * Clean up user sessions
   */
  private async cleanupUserSessions(userId: string, result: AccountCleanupResult): Promise<void> {
    try {
      // Get all sessions
      const sessionsResult = await this.storage.getAll('auth_sessions');
      
      if (sessionsResult.success) {
        const userSessions = sessionsResult.data.items.filter(
          (session: any) => session.userId === userId
        );

        for (const session of userSessions) {
          const deleteResult = await this.storage.delete('auth_sessions', session.id);
          if (deleteResult.success) {
            result.cleaned_items.sessions++;
          } else {
            result.errors.push(`Failed to delete session: ${session.id}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Session cleanup failed: ${error}`);
    }
  }

  /**
   * Clean up support tickets
   */
  private async cleanupSupportTickets(userId: string, result: AccountCleanupResult): Promise<void> {
    try {
      // Get all support tickets
      const ticketsResult = await this.storage.getAll('support_tickets');
      
      if (ticketsResult.success) {
        const userTickets = ticketsResult.data.items.filter(
          (ticket: any) => ticket.user_id === userId
        );

        for (const ticket of userTickets) {
          // Mark as closed rather than delete (for audit trail)
          const updatedTicket = {
            ...ticket,
            status: 'closed',
            resolution: 'Account deleted by user',
            updated_at: new Date().toISOString(),
            resolved_at: new Date().toISOString()
          };

          const updateResult = await this.storage.set('support_tickets', ticket.id, updatedTicket);
          if (updateResult.success) {
            result.cleaned_items.support_tickets++;
          } else {
            result.errors.push(`Failed to close support ticket: ${ticket.id}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Support ticket cleanup failed: ${error}`);
    }
  }

  /**
   * Clean up registered servers
   */
  private async cleanupRegisteredServers(userId: string, result: AccountCleanupResult): Promise<void> {
    try {
      // Get all MCP servers
      const serversResult = await this.storage.getAll('mcp_servers');
      
      if (serversResult.success) {
        const userServers = serversResult.data.items.filter(
          (server: any) => server.registered_by_user_id === userId || server.owner_user_id === userId
        );

        for (const server of userServers) {
          // Mark server as unowned rather than delete (preserve for community)
          const updatedServer = {
            ...server,
            ownership_status: 'unowned',
            registered_by_user_id: null,
            owner_user_id: null,
            ownership_verified_at: null,
            github_ownership: {
              ownership_status: 'unowned',
              owner_user_id: null,
              ownership_verified_at: null
            },
            updated_at: new Date().toISOString()
          };

          const updateResult = await this.storage.set('mcp_servers', server.domain, updatedServer);
          if (updateResult.success) {
            result.cleaned_items.registered_servers++;
          } else {
            result.errors.push(`Failed to clean server: ${server.domain}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Registered server cleanup failed: ${error}`);
    }
  }

  /**
   * Clean up email change requests
   */
  private async cleanupEmailChangeRequests(userId: string, result: AccountCleanupResult): Promise<void> {
    try {
      // Get all email change requests
      const requestsResult = await this.storage.getAll('email_change_requests');
      
      if (requestsResult.success) {
        const userRequests = requestsResult.data.items.filter(
          (request: any) => request.user_id === userId
        );

        for (const request of userRequests) {
          const deleteResult = await this.storage.delete('email_change_requests', request.ticket_id);
          if (deleteResult.success) {
            result.cleaned_items.email_change_requests++;
          } else {
            result.errors.push(`Failed to delete email change request: ${request.ticket_id}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Email change request cleanup failed: ${error}`);
    }
  }

  /**
   * Generate cleanup report
   */
  async generateCleanupReport(userId: string): Promise<{
    estimated_items: AccountCleanupResult['cleaned_items'];
    warnings: string[];
  }> {
    const estimated_items = {
      github_ownerships: 0,
      api_keys: 0,
      sessions: 0,
      support_tickets: 0,
      registered_servers: 0,
      email_change_requests: 0
    };
    const warnings: string[] = [];

    try {
      // Count GitHub ownerships
      const ownershipsResult = await this.storage.getAll('github_repository_ownership');
      if (ownershipsResult.success) {
        estimated_items.github_ownerships = ownershipsResult.data.items.filter(
          (ownership: any) => ownership.owner_user_id === userId
        ).length;
      }

      // Count API keys
      const apiKeysResult = await apiKeyService.getUserApiKeys(userId);
      if (apiKeysResult.success) {
        estimated_items.api_keys = apiKeysResult.data.length;
      }

      // Count sessions
      const sessionsResult = await this.storage.getAll('auth_sessions');
      if (sessionsResult.success) {
        estimated_items.sessions = sessionsResult.data.items.filter(
          (session: any) => session.userId === userId
        ).length;
      }

      // Count support tickets
      const ticketsResult = await this.storage.getAll('support_tickets');
      if (ticketsResult.success) {
        estimated_items.support_tickets = ticketsResult.data.items.filter(
          (ticket: any) => ticket.user_id === userId
        ).length;
      }

      // Count registered servers
      const serversResult = await this.storage.getAll('mcp_servers');
      if (serversResult.success) {
        const userServers = serversResult.data.items.filter(
          (server: any) => server.registered_by_user_id === userId || server.owner_user_id === userId
        );
        estimated_items.registered_servers = userServers.length;

        if (userServers.length > 0) {
          warnings.push(`${userServers.length} registered servers will be marked as unowned but remain in the registry for community use`);
        }
      }

      // Add general warnings
      if (estimated_items.github_ownerships > 0) {
        warnings.push('GitHub repository ownership will be revoked and cannot be restored');
      }
      if (estimated_items.api_keys > 0) {
        warnings.push('All API keys will be permanently deleted and integrations will stop working');
      }

      return { estimated_items, warnings };
    } catch (error) {
      console.error('Error generating cleanup report:', error);
      return { estimated_items, warnings: ['Unable to generate cleanup report'] };
    }
  }
}

export const accountCleanupService = new AccountCleanupService();
