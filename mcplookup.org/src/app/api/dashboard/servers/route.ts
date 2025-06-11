// User Servers Dashboard API
// Handles fetching user's registered MCP servers

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { userServerService } from '@/lib/services/user-servers';

/**
 * GET /api/dashboard/servers
 * Get current user's registered MCP servers
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }    // Get user's profile to check privacy settings
    const storage = userServerService['storage']; // Access private storage
    const userResult = await storage.get('auth_users', session.user.id);
    
    let userPreferences: any = {};
    if (userResult.success && userResult.data?.preferences) {
      userPreferences = userResult.data.preferences;
    }

    // Get user's servers with privacy awareness
    const serversResult = await userServerService.getUserServersWithPrivacy(
      session.user.id, 
      userPreferences
    );
    
    if (!serversResult.success) {
      return NextResponse.json(
        { error: 'Failed to get user servers' },
        { status: 500 }
      );
    }

    // Get user's server statistics with privacy awareness
    const statsResult = await userServerService.getUserServerStatsWithPrivacy(
      session.user.id,
      userPreferences
    );
    
    const stats = statsResult.success ? statsResult.data : 'Private';

    return NextResponse.json({
      servers: serversResult.data,
      stats,
      user_id: session.user.id,
      privacy_settings: {
        profile_visibility: userPreferences.profile_visibility || 'private',
        show_registered_servers: userPreferences.show_registered_servers || false
      }
    });

  } catch (error) {
    console.error('Dashboard servers GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
