// GitHub Repository Ownership Claim API
// POST /api/v1/github/claim-ownership - Initiate ownership claim for GitHub repo

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { GitHubOwnershipService } from '@/lib/services/github-ownership';
import { registerRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiting';

// Initialize the service with storage integration
const githubOwnershipService = new GitHubOwnershipService();

const ClaimOwnershipSchema = z.object({
  github_repo: z.string().regex(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/, 'Invalid GitHub repository format'),
  claim_reason: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  console.log('🔐 GitHub Repository Ownership Claim Request');

  try {    // Rate limiting
    const rateLimitResult = await registerRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult; // Already rate limited response
    }    // Authentication check
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          details: 'You must be logged in to claim repository ownership'
        },
        { status: 401 }
      );
    }const body = await request.json();
    const validated = ClaimOwnershipSchema.parse(body);
    const { github_repo, claim_reason } = validated;

    // Ensure github_repo is defined (it should be after validation)
    if (!github_repo) {
      return NextResponse.json(
        { error: 'GitHub repository is required' },
        { status: 400 }
      );
    }

    // Check if repository is already owned
    const existingOwnership = await githubOwnershipService.checkRepositoryOwnership(
      github_repo,
      session.user.id
    );

    if (existingOwnership.owned) {
      if (existingOwnership.owner_user_id === session.user.id) {
        return NextResponse.json(
          {
            error: 'Already owned',
            message: 'You already own this repository'
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            error: 'Repository already claimed',
            message: 'This repository is already owned by another user'
          },
          { status: 409 }
        );
      }
    }

    // Verify repository exists and is accessible
    const repoExists = await verifyGitHubRepositoryExists(github_repo);
    if (!repoExists) {
      return NextResponse.json(
        {
          error: 'Repository not found',
          details: `GitHub repository '${github_repo}' does not exist or is not accessible`
        },
        { status: 404 }
      );
    }

    // Create ownership challenge
    const challenge = await githubOwnershipService.claimRepositoryOwnership(
      github_repo,
      session.user.id,
      claim_reason
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'Repository ownership claim initiated',
        challenge: {
          challenge_id: challenge.challenge_id,
          github_repo: challenge.github_repo,
          verification_hash: challenge.verification_hash,
          file_name: challenge.file_name,
          created_at: challenge.created_at.toISOString(),
          expires_at: challenge.expires_at.toISOString(),
          verification_instructions: challenge.verification_instructions
        },
        next_steps: {
          instructions: 'Follow the verification steps to prove repository ownership',
          verify_url: '/api/v1/github/verify-ownership',
          expires_in: '7 days'
        }
      },
      { status: 200 }
    );

    return response; // Rate limiting already handled above

  } catch (error) {
    console.error('GitHub ownership claim error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initiate repository ownership claim. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Verify that a GitHub repository exists and is accessible
 */
async function verifyGitHubRepositoryExists(githubRepo: string): Promise<boolean> {
  try {
    const [owner, repo] = githubRepo.split('/');
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCPLookup-Ownership-Verification'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error verifying GitHub repository:', error);
    return false;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
