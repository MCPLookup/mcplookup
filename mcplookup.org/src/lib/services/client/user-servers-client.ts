// Client-safe User Servers Service
// This module provides API wrappers for client-side components
// All actual database operations happen server-side via API routes

import { MCPServer } from '@mcplookup-org/mcp-sdk';

interface UserServerResponse {
  success: boolean;
  servers?: MCPServer[];
  error?: string;
}

interface ServerUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Client-side User Servers Service
 * Makes API calls to server-side endpoints instead of direct database access
 */
export class ClientUserServersService {
  /**
   * Get all servers owned by a user via API
   */
  async getUserServers(userId: string): Promise<UserServerResponse> {
    try {
      const response = await fetch(`/api/v1/user/servers?userId=${encodeURIComponent(userId)}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user servers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update a server's information via API
   */
  async updateServer(
    userId: string,
    domain: string,
    updates: Partial<MCPServer>
  ): Promise<ServerUpdateResponse> {
    try {
      const response = await fetch('/api/v1/user/servers/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain,
          updates
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating server:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a server via API
   */
  async deleteServer(
    userId: string,
    domain: string
  ): Promise<ServerUpdateResponse> {
    try {
      const response = await fetch('/api/v1/user/servers/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting server:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export a singleton instance for client-side use
export const clientUserServersService = new ClientUserServersService();
