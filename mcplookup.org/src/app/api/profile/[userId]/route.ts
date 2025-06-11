// Public Profile API
// Handles viewing public user profiles via profile slugs (respects privacy settings)

import { NextRequest, NextResponse } from 'next/server';
import { createStorage } from '@/lib/services/storage/factory';
import { githubOwnershipService } from '@/lib/services/github-ownership';
import { userServerService } from '@/lib/services/user-servers';
import { profileSlugService } from '@/lib/services/profile-slug';

/**
 * GET /api/profile/[profileSlug]
 * Get public profile information for a user by their profile slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // Next.js 15 requires Promise for params
) {
  try {
    const { userId: profileSlug } = await params; // Await the promise and rename to profileSlug
    
    if (!profileSlug) {
      return NextResponse.json(
        { error: 'Profile name required' },
        { status: 400 }
      );
    }

    // Get user ID from profile slug
    const userId = await profileSlugService.getUserIdFromSlug(profileSlug);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const storage = createStorage();
    
    // Get user profile
    const userResult = await storage.get('auth_users', userId);
    
    if (!userResult.success || !userResult.data) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userProfile = userResult.data;
    const preferences = userProfile.preferences || {};

    // Check if profile is public
    if (preferences.profile_visibility === 'private') {
      return NextResponse.json({
        profile_name: profileSlug,
        name: userProfile.name || 'Private User',
        image: userProfile.image,
        profile_visibility: 'private',
        github_repos: 'Private',
        registered_servers: 'Private',
        activity_stats: 'Private',
        message: 'This user has set their profile to private'
      });
    }

    // Get GitHub repositories (with privacy awareness)
    const githubRepos = await githubOwnershipService.getUserOwnedRepositoriesWithPrivacy(
      userId, 
      preferences
    );

    // Get registered servers (with privacy awareness) 
    const serversResult = await userServerService.getUserServersWithPrivacy(
      userId,
      preferences
    );

    // Get activity stats (with privacy awareness)
    const githubStats = await githubOwnershipService.getUserGitHubStats(
      userId,
      preferences
    );

    const serverStats = await userServerService.getUserServerStatsWithPrivacy(
      userId,
      preferences
    );

    return NextResponse.json({
      profile_name: profileSlug,
      name: userProfile.name || 'Unknown User',
      image: userProfile.image,
      profile_visibility: 'public',
      created_at: userProfile.created_at,
      github_repos: githubRepos,
      registered_servers: serversResult.success ? serversResult.data : 'Private',
      activity_stats: {
        github: githubStats,
        servers: serverStats.success ? serverStats.data : 'Private'
      },
      privacy_settings: {
        show_github_repos: preferences.show_github_repos || false,
        show_registered_servers: preferences.show_registered_servers || false,
        show_activity_stats: preferences.show_activity_stats || false
      }
    });

  } catch (error) {
    console.error('Public profile GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
