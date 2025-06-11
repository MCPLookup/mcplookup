// Profile Slug Service
// Handles generation and validation of user profile slugs

import { createStorage } from './storage/factory';
import { IStorage } from './storage/unified-storage';

export interface ProfileSlug {
  slug: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Profile Slug Service
 * Manages unique, URL-safe profile identifiers
 */
export class ProfileSlugService {
  private storage: IStorage;

  constructor(storage?: IStorage) {
    this.storage = storage || createStorage();
  }

  /**
   * Generate a URL-safe slug from a display name
   */
  generateSlug(displayName: string): string {
    return displayName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove duplicate hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  }

  /**
   * Generate a unique slug for a user
   */
  async generateUniqueSlug(displayName: string, userId: string): Promise<string> {
    let baseSlug = this.generateSlug(displayName);
    
    // Fallback if name doesn't generate a valid slug
    if (!baseSlug || baseSlug.length < 2) {
      baseSlug = `user-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;

    // Check uniqueness and add counter if needed
    while (await this.isSlugTaken(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Prevent infinite loops
      if (counter > 1000) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    return slug;
  }

  /**
   * Check if a slug is already taken
   */
  async isSlugTaken(slug: string): Promise<boolean> {
    try {
      const result = await this.storage.get('profile_slugs', slug);
      return result.success && result.data !== null;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return true; // Err on the side of caution
    }
  }

  /**
   * Reserve a slug for a user
   */
  async reserveSlug(slug: string, userId: string): Promise<boolean> {
    try {
      // Double-check availability
      if (await this.isSlugTaken(slug)) {
        return false;
      }

      const profileSlug: ProfileSlug = {
        slug,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await this.storage.set('profile_slugs', slug, profileSlug);
      return result.success;
    } catch (error) {
      console.error('Error reserving slug:', error);
      return false;
    }
  }

  /**
   * Get user ID from slug
   */
  async getUserIdFromSlug(slug: string): Promise<string | null> {
    try {
      const result = await this.storage.get('profile_slugs', slug);
      if (result.success && result.data) {
        return result.data.user_id;
      }
      return null;
    } catch (error) {
      console.error('Error getting user ID from slug:', error);
      return null;
    }
  }

  /**
   * Get slug from user ID
   */
  async getSlugFromUserId(userId: string): Promise<string | null> {
    try {
      const slugsResult = await this.storage.getAll('profile_slugs');
      
      if (!slugsResult.success) {
        return null;
      }

      // Find slug for this user
      const userSlug = slugsResult.data.items.find(
        (item: ProfileSlug) => item.user_id === userId
      );

      return userSlug ? userSlug.slug : null;
    } catch (error) {
      console.error('Error getting slug from user ID:', error);
      return null;
    }
  }

  /**
   * Update a user's slug
   */
  async updateUserSlug(userId: string, newDisplayName: string): Promise<string | null> {
    try {
      // Get current slug
      const currentSlug = await this.getSlugFromUserId(userId);
      
      // Generate new unique slug
      const newSlug = await this.generateUniqueSlug(newDisplayName, userId);
      
      // Reserve new slug
      if (!await this.reserveSlug(newSlug, userId)) {
        return null;
      }

      // Remove old slug if it exists
      if (currentSlug) {
        await this.storage.delete('profile_slugs', currentSlug);
      }

      return newSlug;
    } catch (error) {
      console.error('Error updating user slug:', error);
      return null;
    }
  }

  /**
   * Initialize slug for existing user (migration helper)
   */
  async initializeSlugForUser(userId: string, displayName: string): Promise<string | null> {
    try {
      // Check if user already has a slug
      const existingSlug = await this.getSlugFromUserId(userId);
      if (existingSlug) {
        return existingSlug;
      }

      // Generate and reserve new slug
      const slug = await this.generateUniqueSlug(displayName, userId);
      if (await this.reserveSlug(slug, userId)) {
        return slug;
      }

      return null;
    } catch (error) {
      console.error('Error initializing slug for user:', error);
      return null;
    }
  }

  /**
   * Validate slug format
   */
  isValidSlugFormat(slug: string): boolean {
    // Must be 2-50 characters, lowercase alphanumeric with hyphens
    const slugRegex = /^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$|^[a-z0-9]$/;
    return slugRegex.test(slug) && !slug.includes('--');
  }

  /**
   * Get reserved/forbidden slugs
   */
  getForbiddenSlugs(): string[] {
    return [
      'admin', 'administrator', 'api', 'app', 'auth', 'blog', 'dashboard',
      'dev', 'developer', 'docs', 'help', 'login', 'logout', 'mail',
      'news', 'profile', 'register', 'root', 'search', 'settings',
      'support', 'system', 'test', 'user', 'users', 'www', 'ftp',
      'email', 'static', 'assets', 'public', 'private', 'security',
      'legal', 'terms', 'privacy', 'about', 'contact', 'home',
      'null', 'undefined', 'void', 'delete', 'remove', 'ban', 'blocked'
    ];
  }

  /**
   * Check if slug is forbidden
   */
  isForbiddenSlug(slug: string): boolean {
    return this.getForbiddenSlugs().includes(slug.toLowerCase());
  }
}

export const profileSlugService = new ProfileSlugService();
