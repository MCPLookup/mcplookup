// Dashboard Profile Management API
// Handles user profile viewing and editing

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { createStorage } from '@/lib/services/storage/factory';
import { isSuccessResult } from '@/lib/services/storage/unified-storage';
import { accountCleanupService } from '@/lib/services/account-cleanup';
import { profileSlugService } from '@/lib/services/profile-slug';

// Validation schemas
const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  profile_name: z.string().min(2).max(50).regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,48}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.boolean().optional(),
    newsletter: z.boolean().optional(),
    // Privacy settings
    profile_visibility: z.enum(['public', 'private']).optional(),
    show_github_repos: z.boolean().optional(),
    show_registered_servers: z.boolean().optional(),
    show_activity_stats: z.boolean().optional()
  }).optional(),
});

/**
 * GET /api/dashboard/profile
 * Get current user's profile information
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

    const storage = createStorage();
    
    // Get user profile from storage
    const userResult = await storage.get('auth_users', session.user.id);
    
    if (!userResult.success || !userResult.data) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }    const userProfile = userResult.data;

    // Get or create profile slug
    let profileSlug = await profileSlugService.getSlugFromUserId(session.user.id);
    if (!profileSlug && userProfile.name) {
      profileSlug = await profileSlugService.initializeSlugForUser(session.user.id, userProfile.name);
    }

    // Return safe profile data (no sensitive info)
    return NextResponse.json({
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      profile_name: profileSlug,
      image: userProfile.image,
      provider: userProfile.provider,
      email_verified: userProfile.email_verified,preferences: userProfile.preferences || {
        theme: 'system',
        notifications: true,
        newsletter: false,
        // Privacy defaults - secure by default
        profile_visibility: 'private',
        show_github_repos: false,
        show_registered_servers: false,
        show_activity_stats: false
      },
      created_at: userProfile.created_at,
      last_login_at: userProfile.last_login_at
    });

  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/dashboard/profile
 * Update current user's profile information
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = UpdateProfileSchema.parse(body);
    
    const storage = createStorage();
    
    // Get current user profile
    const userResult = await storage.get('auth_users', session.user.id);
    
    if (!userResult.success || !userResult.data) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }    const currentProfile = userResult.data;

    // Handle profile name/slug update
    let updatedSlug = null;
    if (validatedData.profile_name) {
      // Validate slug format and check forbidden names
      const slugToUse = profileSlugService.generateSlug(validatedData.profile_name);
      
      if (!profileSlugService.isValidSlugFormat(slugToUse)) {
        return NextResponse.json(
          { error: 'Invalid profile name format. Use only letters, numbers, and hyphens.' },
          { status: 400 }
        );
      }
      
      if (profileSlugService.isForbiddenSlug(slugToUse)) {
        return NextResponse.json(
          { error: 'This profile name is reserved. Please choose a different name.' },
          { status: 400 }
        );
      }

      // Check if slug is already taken
      if (await profileSlugService.isSlugTaken(slugToUse)) {
        return NextResponse.json(
          { error: 'This profile name is already taken. Please choose a different name.' },
          { status: 400 }
        );
      }

      // Update the slug
      updatedSlug = await profileSlugService.updateUserSlug(session.user.id, validatedData.profile_name);
      if (!updatedSlug) {
        return NextResponse.json(
          { error: 'Failed to update profile name. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Create updated profile
    const updatedProfile = {
      ...currentProfile,
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.preferences && {
        preferences: {
          ...currentProfile.preferences,
          ...validatedData.preferences
        }
      }),
      updated_at: new Date().toISOString()
    };

    // Save updated profile
    const updateResult = await storage.set('auth_users', session.user.id, updatedProfile);
    
    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }    // Return updated profile (safe data only)
    return NextResponse.json({
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name,
      profile_name: updatedSlug || await profileSlugService.getSlugFromUserId(session.user.id),
      image: updatedProfile.image,
      preferences: updatedProfile.preferences,
      updated_at: updatedProfile.updated_at
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboard/profile
 * Delete current user's account with comprehensive cleanup
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const storage = createStorage();
    
    // Get current user profile
    const userResult = await storage.get('auth_users', session.user.id);
    
    if (!userResult.success || !userResult.data) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const currentProfile = userResult.data;

    // Perform comprehensive cleanup
    const cleanupResult = await accountCleanupService.cleanupUserAccount(session.user.id);    if (!cleanupResult.success) {
      return NextResponse.json(
        { 
          error: 'Account cleanup failed',
          details: [cleanupResult.error]
        },
        { status: 500 }
      );
    }

    // Soft delete by marking as inactive
    const deletedProfile = {
      ...currentProfile,
      is_active: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cleanup_report: cleanupResult.data
    };

    // Save updated profile
    const updateResult = await storage.set('auth_users', session.user.id, deletedProfile);
    
    if (!updateResult.success) {
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Account successfully deleted',
      cleanup_summary: {
        github_ownerships_removed: cleanupResult.data.cleaned_items.github_ownerships,
        api_keys_deleted: cleanupResult.data.cleaned_items.api_keys,
        sessions_cleared: cleanupResult.data.cleaned_items.sessions,
        servers_unowned: cleanupResult.data.cleaned_items.registered_servers,
        support_tickets_closed: cleanupResult.data.cleaned_items.support_tickets
      }
    });

  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
