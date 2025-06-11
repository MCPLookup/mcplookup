// GitHub Repository Ownership Verification System
// Prevents repo hijacking while maintaining easy submission

import { z } from 'zod';
import { IStorage, StorageResult, createSuccessResult, createErrorResult } from './storage/unified-storage';
import { createStorage } from './storage/factory';

// Enhanced server type schema with GitHub ownership levels
export const GitHubOwnershipSchema = z.object({
  ownership_status: z.enum(['unowned', 'owned']).default('unowned'),
  ownership_verified_at: z.string().datetime().optional(),
  ownership_method: z.enum(['hash_file']).optional(),
  owner_user_id: z.string().optional(),
  verification_file_hash: z.string().optional(),
  verification_branch: z.string().optional()
});

export const EnhancedServerTypeSchema = z.object({
  type: z.enum(['github', 'official']).describe("Server classification type"),
  
  // GitHub-based server details with ownership
  github_repo: z.string().optional().describe("GitHub repository (owner/repo) if applicable"),
  github_stars: z.number().optional().describe("GitHub stars count"),
  github_verified: z.boolean().default(false).describe("Whether GitHub repo is verified as MCP server"),
  github_ownership: GitHubOwnershipSchema.optional().describe("GitHub repository ownership verification"),
  
  // Official domain-registered server details  
  domain_verified: z.boolean().default(false).describe("Whether domain ownership is verified via DNS"),
  domain_verification_date: z.string().datetime().optional().describe("When domain verification was completed"),
  registrant_verified: z.boolean().default(false).describe("Whether registrant identity is verified"),
  
  // Trust indicators with ownership levels
  official_status: z.enum(['unowned', 'community', 'owned', 'verified', 'enterprise']).default('unowned'),
  verification_badges: z.array(z.string()).default([]).describe("Verification badges earned")
});

// GitHub ownership claim request
export const GitHubOwnershipClaimSchema = z.object({
  github_repo: z.string().describe("GitHub repository (owner/repo)"),
  requested_by_user_id: z.string().describe("User requesting ownership"),
  claim_reason: z.string().max(500).optional().describe("Reason for claiming ownership")
});

// GitHub ownership verification request  
export const GitHubOwnershipVerificationSchema = z.object({
  github_repo: z.string().describe("GitHub repository (owner/repo)"),
  verification_hash: z.string().describe("Hash that should be in mcplookup.org file"),
  branch_name: z.string().describe("Branch where verification file is located"),
  user_id: z.string().describe("User verifying ownership")
});

// Ownership challenge for verification
export interface GitHubOwnershipChallenge {
  challenge_id: string;
  github_repo: string;
  user_id: string;
  verification_hash: string;
  file_name: 'mcplookup.org';
  created_at: Date;
  expires_at: Date;
  verified: boolean;
  verification_instructions: string[];
}

export type GitHubOwnershipStatus = 'unowned' | 'owned';
export type OfficialStatus = 'unowned' | 'community' | 'owned' | 'verified' | 'enterprise';

/**
 * GitHub Repository Ownership Service
 * Handles verification of GitHub repository ownership via hash files
 */
export class GitHubOwnershipService {
  private storage: IStorage;

  constructor(storage?: IStorage) {
    this.storage = storage || createStorage();
  }
  
  /**
   * Initiate ownership claim for a GitHub repository
   */
  async claimRepositoryOwnership(
    githubRepo: string, 
    userId: string, 
    reason?: string
  ): Promise<GitHubOwnershipChallenge> {
    
    // Generate unique verification hash
    const verificationHash = this.generateVerificationHash();
    const challengeId = `gh-claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const challenge: GitHubOwnershipChallenge = {
      challenge_id: challengeId,
      github_repo: githubRepo,
      user_id: userId,
      verification_hash: verificationHash,
      file_name: 'mcplookup.org',
      created_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      verified: false,
      verification_instructions: [
        `Create a file named 'mcplookup.org' in the root directory of your repository`,
        `Add the following content to the file: ${verificationHash}`,
        `Commit this file to any branch of your choosing`,
        `Return here and submit the repository + branch name for verification`,
        `Once verified, you'll gain ownership and can edit metadata, show on profile, etc.`
      ]
    };    // Store challenge (save to storage API)
    const challengeStoreResult = await this.storage.set(
      'github_ownership_challenges',
      challengeId,
      challenge
    );

    if (!challengeStoreResult.success) {
      throw new Error(`Failed to store challenge: ${challengeStoreResult.error}`);
    }

    console.log('🔐 GitHub ownership challenge created:', challenge);
    
    return challenge;
  }

  /**
   * Verify GitHub repository ownership by checking for hash file
   */
  async verifyRepositoryOwnership(
    githubRepo: string,
    verificationHash: string,
    branchName: string,
    userId: string
  ): Promise<{
    verified: boolean;
    message: string;
    ownership_status?: GitHubOwnershipStatus;
    badges?: string[];
  }> {
    
    try {
      // Check if verification hash exists in our challenges
      const validChallenge = await this.getValidChallenge(githubRepo, verificationHash, userId);
      if (!validChallenge) {
        return {
          verified: false,
          message: 'Invalid verification hash or expired challenge'
        };
      }

      // Fetch file from GitHub API
      const fileContent = await this.fetchGitHubFile(githubRepo, 'mcplookup.org', branchName);
      
      if (!fileContent) {
        return {
          verified: false,
          message: `File 'mcplookup.org' not found in branch '${branchName}' of repository ${githubRepo}`
        };
      }

      // Verify hash matches
      const trimmedContent = fileContent.trim();
      if (trimmedContent !== verificationHash) {
        return {
          verified: false,
          message: `Hash mismatch. Expected: ${verificationHash}, Found: ${trimmedContent}`
        };
      }

      // Ownership verified! Update server record
      await this.grantRepositoryOwnership(githubRepo, userId, verificationHash, branchName);

      return {
        verified: true,
        message: 'GitHub repository ownership verified successfully!',
        ownership_status: 'owned',
        badges: ['github_verified', 'repo_owner', 'metadata_editor']
      };

    } catch (error) {
      console.error('GitHub ownership verification error:', error);
      return {
        verified: false,
        message: 'Verification failed due to technical error. Please try again.'
      };
    }
  }  /**
   * Grant ownership of GitHub repository to user
   */
  private async grantRepositoryOwnership(
    githubRepo: string,
    userId: string,
    verificationHash: string,
    branchName: string
  ): Promise<void> {
    
    // Update server record with ownership information
    const ownershipData = {
      github_repo: githubRepo, // 👈 Add repo name to data
      ownership_status: 'owned' as const,
      ownership_verified_at: new Date().toISOString(),
      ownership_method: 'hash_file' as const,
      owner_user_id: userId,
      verification_file_hash: verificationHash,
      verification_branch: branchName
    };

    // Store ownership record in storage API
    const storeResult = await this.storage.set(
      'github_repository_ownership',
      githubRepo,
      ownershipData
    );

    if (!storeResult.success) {
      throw new Error(`Failed to store ownership: ${storeResult.error}`);
    }

    console.log('👤 Repository ownership granted:', {
      github_repo: githubRepo,
      user_id: userId,
      ownership_data: ownershipData
    });

    // Mark challenge as completed
    await this.markChallengeCompleted(githubRepo, verificationHash);
  }

  /**
   * Fetch file content from GitHub repository
   */
  private async fetchGitHubFile(
    githubRepo: string, 
    fileName: string, 
    branch: string
  ): Promise<string | null> {
    
    try {
      const [owner, repo] = githubRepo.split('/');
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${fileName}?ref=${branch}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'MCPLookup-Ownership-Verification'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // File not found
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Decode base64 content
      if (data.content && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      return null;
    } catch (error) {
      console.error('Error fetching GitHub file:', error);
      return null;
    }
  }

  /**
   * Generate random verification hash
   */
  private generateVerificationHash(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 12);
    return `mcplookup-verify-${timestamp}-${random}`;
  }
  /**
   * Get valid challenge for verification
   */
  private async getValidChallenge(
    githubRepo: string,
    verificationHash: string,
    userId: string
  ): Promise<GitHubOwnershipChallenge | null> {
    
    // Try to find challenge by verification hash (search all challenges)
    try {
      const challengesResult = await this.storage.getAll('github_ownership_challenges');
      
      if (!challengesResult.success) {
        console.error('Failed to get challenges:', challengesResult.error);
        return null;
      }

      // Find matching challenge
      const challenge = challengesResult.data.items.find((c: GitHubOwnershipChallenge) => 
        c.github_repo === githubRepo &&
        c.verification_hash === verificationHash &&
        c.user_id === userId &&
        new Date() < new Date(c.expires_at)
      );

      return challenge || null;
    } catch (error) {
      console.error('Error validating challenge:', error);
      return null;
    }
  }
  /**
   * Mark challenge as completed
   */
  private async markChallengeCompleted(
    githubRepo: string,
    verificationHash: string
  ): Promise<void> {
    
    try {
      // Find and update the challenge
      const challengesResult = await this.storage.getAll('github_ownership_challenges');
      
      if (challengesResult.success) {
        const challenge = challengesResult.data.items.find((c: GitHubOwnershipChallenge) => 
          c.github_repo === githubRepo && c.verification_hash === verificationHash
        );

        if (challenge) {
          // Mark as verified
          const updatedChallenge = { ...challenge, verified: true };
          await this.storage.set('github_ownership_challenges', challenge.challenge_id, updatedChallenge);
        }
      }

      console.log('✅ Challenge completed:', { githubRepo, verificationHash });
    } catch (error) {
      console.error('Error marking challenge completed:', error);
    }
  }
  /**
   * Check if user owns a GitHub repository
   */
  async checkRepositoryOwnership(
    githubRepo: string,
    userId: string
  ): Promise<{
    owned: boolean;
    owner_user_id?: string;
    verified_at?: string;
  }> {
    
    try {
      const ownershipResult = await this.storage.get('github_repository_ownership', githubRepo);
      
      if (!ownershipResult.success || !ownershipResult.data) {
        return { owned: false };
      }

      const ownership = ownershipResult.data;
      return {
        owned: ownership.owner_user_id === userId,
        owner_user_id: ownership.owner_user_id,
        verified_at: ownership.ownership_verified_at
      };
    } catch (error) {
      console.error('Error checking repository ownership:', error);
      return { owned: false };
    }
  }  /**
   * Get repositories owned by user
   */
  async getUserOwnedRepositories(userId: string): Promise<string[]> {
    
    try {
      const ownershipsResult = await this.storage.getAll('github_repository_ownership');
      
      if (!ownershipsResult.success) {
        console.error('Failed to get repository ownerships:', ownershipsResult.error);
        return [];
      }

      // Filter repositories owned by this user
      const userRepos: string[] = [];
      
      // The storage returns items, we need to check each one
      const items = ownershipsResult.data?.items || [];
      
      for (const item of items) {
        if (item && typeof item === 'object' && 'owner_user_id' in item && 'github_repo' in item) {
          if (item.owner_user_id === userId) {
            userRepos.push(item.github_repo as string);
          }
        }
      }

      return userRepos;
    } catch (error) {
      console.error('Error getting user owned repositories:', error);
      return [];
    }
  }

  /**
   * Get repositories owned by user with privacy awareness
   * Returns 'Private' when user has private profile settings
   */
  async getUserOwnedRepositoriesWithPrivacy(
    userId: string, 
    userPreferences?: { show_github_repos?: boolean; profile_visibility?: string }
  ): Promise<string[] | 'Private'> {
    
    // Check privacy settings
    if (userPreferences?.profile_visibility === 'private' || userPreferences?.show_github_repos === false) {
      return 'Private';
    }

    // Return actual repositories for public profiles
    return await this.getUserOwnedRepositories(userId);
  }

  /**
   * Get user's GitHub ownership stats with privacy awareness
   */
  async getUserGitHubStats(
    userId: string,
    userPreferences?: { show_github_repos?: boolean; profile_visibility?: string; show_activity_stats?: boolean }
  ): Promise<{ 
    total_repos: number | 'Private';
    verification_count: number | 'Private';
    latest_verification?: string | 'Private';
  }> {
    
    // Check privacy settings
    const isPrivate = userPreferences?.profile_visibility === 'private' || 
                     userPreferences?.show_github_repos === false ||
                     userPreferences?.show_activity_stats === false;

    if (isPrivate) {
      return {
        total_repos: 'Private',
        verification_count: 'Private',
        latest_verification: 'Private'
      };
    }

    // Get actual stats for public profiles
    try {
      const repos = await this.getUserOwnedRepositories(userId);
      const ownershipsResult = await this.storage.getAll('github_repository_ownership');
      
      let latestVerification: string | undefined;
      if (ownershipsResult.success) {
        const userOwnerships = ownershipsResult.data.items.filter(
          (item: any) => item.owner_user_id === userId
        );
        
        // Find latest verification
        userOwnerships.sort((a: any, b: any) => 
          new Date(b.ownership_verified_at || 0).getTime() - new Date(a.ownership_verified_at || 0).getTime()
        );
        
        if (userOwnerships.length > 0 && userOwnerships[0].ownership_verified_at) {
          latestVerification = userOwnerships[0].ownership_verified_at;
        }
      }

      return {
        total_repos: repos.length,
        verification_count: repos.length,
        latest_verification: latestVerification
      };
    } catch (error) {
      console.error('Error getting GitHub stats:', error);
      return {
        total_repos: 0,
        verification_count: 0
      };
    }
  }
}

export const githubOwnershipService = new GitHubOwnershipService();
