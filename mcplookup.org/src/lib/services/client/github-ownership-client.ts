// Client-safe GitHub Ownership Service
// This module provides API wrappers for client-side components
// All actual Redis operations happen server-side via API routes

interface GitHubOwnershipStatus {
  ownership_status: 'unowned' | 'owned';
  ownership_verified_at?: string;
  ownership_method?: 'hash_file';
  owner_user_id?: string;
  verification_file_hash?: string;
  verification_branch?: string;
}

interface OwnershipVerificationResult {
  success: boolean;
  status: 'unowned' | 'owned';
  error?: string;
  message?: string;
}

interface ClaimOwnershipResult {
  success: boolean;
  message?: string;
  error?: string;
  verification_file_content?: string;
  verification_file_path?: string;
}

/**
 * Client-side GitHub Ownership Service
 * Makes API calls to server-side endpoints instead of direct database access
 */
export class ClientGitHubOwnershipService {
  /**
   * Verify ownership of a GitHub repository via API
   */
  async verifyRepositoryOwnership(
    userId: string,
    githubRepo: string
  ): Promise<OwnershipVerificationResult> {
    try {
      const response = await fetch('/api/v1/github/verify-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          githubRepo
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying repository ownership:', error);
      return {
        success: false,
        status: 'unowned',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Claim ownership of a GitHub repository via API
   */
  async claimRepositoryOwnership(
    userId: string,
    githubRepo: string
  ): Promise<ClaimOwnershipResult> {
    try {
      const response = await fetch('/api/v1/github/claim-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          githubRepo
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error claiming repository ownership:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get ownership status for multiple repositories via API
   */
  async getUserRepositories(userId: string): Promise<{
    success: boolean;
    repositories?: Array<{
      githubRepo: string;
      ownership: GitHubOwnershipStatus;
    }>;
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/v1/github/user-repositories?userId=${encodeURIComponent(userId)}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user repositories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export a singleton instance for client-side use
export const clientGitHubOwnershipService = new ClientGitHubOwnershipService();
