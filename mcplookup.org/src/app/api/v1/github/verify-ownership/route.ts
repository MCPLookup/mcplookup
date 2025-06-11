// GitHub Repository Ownership Verification API
// POST /api/v1/github/verify-ownership - Verify ownership by checking hash file

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { GitHubOwnershipService } from '@/lib/services/github-ownership';

// Initialize the service with storage integration
const githubOwnershipService = new GitHubOwnershipService();

const VerifyOwnershipSchema = z.object({
  github_repo: z.string().regex(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/, 'Invalid GitHub repository format'),
  verification_hash: z.string().min(1, 'Verification hash is required'),
  branch_name: z.string().min(1, 'Branch name is required')
});

export async function POST(request: NextRequest) {
  console.log('🔍 GitHub Repository Ownership Verification Request');

  try {    // Authentication check
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          details: 'You must be logged in with a valid user ID to verify repository ownership'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { github_repo, verification_hash, branch_name } = VerifyOwnershipSchema.parse(body);

    // Verify repository ownership
    const verificationResult = await githubOwnershipService.verifyRepositoryOwnership(
      github_repo,
      verification_hash,
      branch_name,
      session.user.id
    );

    if (verificationResult.verified) {
      // Success - ownership verified
      return NextResponse.json(
        {
          verified: true,
          success: true,
          message: verificationResult.message,
          ownership_status: verificationResult.ownership_status,
          badges: verificationResult.badges,
          repository: {
            github_repo: github_repo,
            owned_by: session.user.id,
            verified_at: new Date().toISOString(),
            verification_method: 'hash_file'
          },
          next_steps: {
            view_repository: `/repositories/${github_repo}`,
            edit_metadata: `/repositories/${github_repo}/edit`,
            dashboard: `/dashboard/repositories`
          }
        },
        { status: 200 }
      );
    } else {
      // Verification failed
      return NextResponse.json(
        {
          verified: false,
          error: 'Verification failed',
          message: verificationResult.message,
          suggestions: [
            'Make sure the mcplookup.org file exists in the specified branch',
            'Verify the file contains the exact hash provided',
            'Check that the branch name is correct',
            'Ensure the file is committed to the repository'
          ]
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('GitHub ownership verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          verified: false,
          error: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        verified: false,
        error: 'Verification failed due to technical error',
        message: 'Please try again. If the problem persists, contact support.'
      },
      { status: 500 }
    );
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
