// Profile Slug Availability API
// Checks if a profile slug is available for use

import { NextRequest, NextResponse } from 'next/server';
import { profileSlugService } from '@/lib/services/profile-slug';
import { auth } from '@/auth';

/**
 * GET /api/profile/check-slug?slug=username
 * Check if a profile slug is available
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
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!profileSlugService.isValidSlugFormat(slug)) {
      return NextResponse.json({
        available: false,
        reason: 'invalid_format',
        message: 'Invalid format. Use only letters, numbers, and hyphens (2-50 characters).'
      });
    }

    // Check if slug is forbidden
    if (profileSlugService.isForbiddenSlug(slug)) {
      return NextResponse.json({
        available: false,
        reason: 'forbidden',
        message: 'This profile name is reserved. Please choose a different name.'
      });
    }

    // Check if slug is already taken
    const isTaken = await profileSlugService.isSlugTaken(slug);
    
    // Check if it's taken by the current user (which is allowed)
    let ownedByCurrentUser = false;
    if (isTaken) {
      const slugUserId = await profileSlugService.getUserIdFromSlug(slug);
      ownedByCurrentUser = slugUserId === session.user.id;
    }

    return NextResponse.json({
      available: !isTaken || ownedByCurrentUser,
      reason: isTaken && !ownedByCurrentUser ? 'taken' : null,
      message: isTaken && !ownedByCurrentUser 
        ? 'This profile name is already taken.' 
        : ownedByCurrentUser 
        ? 'This is your current profile name.'
        : 'This profile name is available!',
      owned_by_you: ownedByCurrentUser
    });

  } catch (error) {
    console.error('Slug check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
