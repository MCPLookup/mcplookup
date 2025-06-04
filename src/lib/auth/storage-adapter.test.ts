import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createStorageAdapter } from './storage-adapter';
import type { AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters';

// Mock the storage
vi.mock('../services/storage/storage', () => ({
  getUserStorage: vi.fn()
}));

// Mock crypto
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'mock-uuid-123')
}));

describe('NextAuth Storage Adapter', () => {
  let mockUserStorage: any;
  let adapter: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserStorage = {
      storeUser: vi.fn(),
      getUser: vi.fn(),
      getUserByEmail: vi.fn(),
      getUserByAccount: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      linkAccount: vi.fn(),
      unlinkAccount: vi.fn(),
      createSession: vi.fn(),
      getSessionAndUser: vi.fn(),
      updateSession: vi.fn(),
      deleteSession: vi.fn(),
      createVerificationToken: vi.fn(),
      useVerificationToken: vi.fn(),
      healthCheck: vi.fn(),
      getStats: vi.fn(),
      cleanup: vi.fn()
    };

    const { getUserStorage } = require('../services/storage/storage');
    getUserStorage.mockReturnValue(mockUserStorage);

    adapter = createStorageAdapter();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('user operations', () => {
    const mockUser: AdapterUser = {
      id: 'user-123',
      email: 'test@example.com',
      emailVerified: new Date(),
      name: 'Test User',
      image: 'https://example.com/avatar.jpg'
    };

    describe('createUser', () => {
      it('should create a new user', async () => {
        mockUserStorage.storeUser.mockResolvedValue({ success: true });

        const userData = {
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg'
        };

        const result = await adapter.createUser(userData);

        expect(result).toEqual({
          id: 'mock-uuid-123',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          emailVerified: null
        });

        expect(mockUserStorage.storeUser).toHaveBeenCalledWith(
          'mock-uuid-123',
          expect.objectContaining({
            id: 'mock-uuid-123',
            email: 'test@example.com',
            name: 'Test User',
            image: 'https://example.com/avatar.jpg'
          })
        );
      });

      it('should handle storage errors', async () => {
        mockUserStorage.storeUser.mockResolvedValue({ 
          success: false, 
          error: 'Storage error' 
        });

        const userData = {
          email: 'test@example.com',
          name: 'Test User'
        };

        await expect(adapter.createUser(userData)).rejects.toThrow('Failed to create user');
      });
    });

    describe('getUser', () => {
      it('should retrieve a user by ID', async () => {
        const mockUserProfile = {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          email_verified: true,
          created_at: '2025-06-04T00:00:00Z',
          updated_at: '2025-06-04T00:00:00Z'
        };

        mockUserStorage.getUser.mockResolvedValue({ 
          success: true, 
          data: mockUserProfile 
        });

        const result = await adapter.getUser('user-123');

        expect(result).toEqual({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          emailVerified: expect.any(Date)
        });

        expect(mockUserStorage.getUser).toHaveBeenCalledWith('user-123');
      });

      it('should return null for non-existent user', async () => {
        mockUserStorage.getUser.mockResolvedValue({ 
          success: true, 
          data: null 
        });

        const result = await adapter.getUser('non-existent');

        expect(result).toBeNull();
      });

      it('should handle storage errors', async () => {
        mockUserStorage.getUser.mockResolvedValue({ 
          success: false, 
          error: 'Storage error' 
        });

        const result = await adapter.getUser('user-123');

        expect(result).toBeNull();
      });
    });

    describe('getUserByEmail', () => {
      it('should retrieve a user by email', async () => {
        const mockUserProfile = {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          email_verified: true,
          created_at: '2025-06-04T00:00:00Z'
        };

        mockUserStorage.getUserByEmail.mockResolvedValue({ 
          success: true, 
          data: mockUserProfile 
        });

        const result = await adapter.getUserByEmail('test@example.com');

        expect(result).toEqual({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: expect.any(Date)
        });

        expect(mockUserStorage.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      });

      it('should return null for non-existent email', async () => {
        mockUserStorage.getUserByEmail.mockResolvedValue({ 
          success: true, 
          data: null 
        });

        const result = await adapter.getUserByEmail('nonexistent@example.com');

        expect(result).toBeNull();
      });
    });

    describe('updateUser', () => {
      it('should update user data', async () => {
        const existingUser = {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          email_verified: true,
          created_at: '2025-06-04T00:00:00Z',
          updated_at: '2025-06-04T00:00:00Z'
        };

        const updatedUser = {
          ...existingUser,
          name: 'Updated User',
          updated_at: '2025-06-04T01:00:00Z'
        };

        mockUserStorage.getUser.mockResolvedValue({ 
          success: true, 
          data: existingUser 
        });
        mockUserStorage.updateUser.mockResolvedValue({ 
          success: true, 
          data: updatedUser 
        });

        const updateData = {
          id: 'user-123',
          name: 'Updated User'
        };

        const result = await adapter.updateUser(updateData);

        expect(result).toEqual({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Updated User',
          emailVerified: expect.any(Date)
        });

        expect(mockUserStorage.updateUser).toHaveBeenCalledWith(
          'user-123',
          expect.objectContaining({
            name: 'Updated User'
          })
        );
      });

      it('should handle non-existent user', async () => {
        mockUserStorage.getUser.mockResolvedValue({ 
          success: true, 
          data: null 
        });

        const updateData = {
          id: 'non-existent',
          name: 'Updated User'
        };

        await expect(adapter.updateUser(updateData)).rejects.toThrow('User not found');
      });
    });

    describe('deleteUser', () => {
      it('should delete a user', async () => {
        mockUserStorage.deleteUser.mockResolvedValue({ success: true });

        await adapter.deleteUser('user-123');

        expect(mockUserStorage.deleteUser).toHaveBeenCalledWith('user-123');
      });

      it('should handle storage errors', async () => {
        mockUserStorage.deleteUser.mockResolvedValue({ 
          success: false, 
          error: 'Storage error' 
        });

        await expect(adapter.deleteUser('user-123')).rejects.toThrow('Failed to delete user');
      });
    });
  });

  describe('account operations', () => {
    const mockAccount: AdapterAccount = {
      userId: 'user-123',
      type: 'oauth',
      provider: 'github',
      providerAccountId: 'github-123',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'Bearer',
      scope: 'read:user'
    };

    describe('linkAccount', () => {
      it('should link an account to a user', async () => {
        mockUserStorage.linkAccount.mockResolvedValue({ success: true });

        await adapter.linkAccount(mockAccount);

        expect(mockUserStorage.linkAccount).toHaveBeenCalledWith(
          'user-123',
          expect.objectContaining({
            provider: 'github',
            provider_id: 'github-123',
            type: 'oauth'
          })
        );
      });

      it('should handle storage errors', async () => {
        mockUserStorage.linkAccount.mockResolvedValue({ 
          success: false, 
          error: 'Storage error' 
        });

        await expect(adapter.linkAccount(mockAccount)).rejects.toThrow('Failed to link account');
      });
    });

    describe('unlinkAccount', () => {
      it('should unlink an account', async () => {
        mockUserStorage.unlinkAccount.mockResolvedValue({ success: true });

        await adapter.unlinkAccount({
          provider: 'github',
          providerAccountId: 'github-123'
        });

        expect(mockUserStorage.unlinkAccount).toHaveBeenCalledWith('github', 'github-123');
      });
    });

    describe('getUserByAccount', () => {
      it('should get user by account', async () => {
        const mockUserProfile = {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          email_verified: true,
          created_at: '2025-06-04T00:00:00Z'
        };

        mockUserStorage.getUserByAccount.mockResolvedValue({ 
          success: true, 
          data: mockUserProfile 
        });

        const result = await adapter.getUserByAccount({
          provider: 'github',
          providerAccountId: 'github-123'
        });

        expect(result).toEqual({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: expect.any(Date)
        });

        expect(mockUserStorage.getUserByAccount).toHaveBeenCalledWith('github', 'github-123');
      });

      it('should return null for non-existent account', async () => {
        mockUserStorage.getUserByAccount.mockResolvedValue({ 
          success: true, 
          data: null 
        });

        const result = await adapter.getUserByAccount({
          provider: 'github',
          providerAccountId: 'non-existent'
        });

        expect(result).toBeNull();
      });
    });
  });

  describe('session operations', () => {
    const mockSession: AdapterSession = {
      sessionToken: 'session-token-123',
      userId: 'user-123',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    describe('createSession', () => {
      it('should create a new session', async () => {
        mockUserStorage.createSession.mockResolvedValue({ success: true });

        const result = await adapter.createSession(mockSession);

        expect(result).toEqual(mockSession);
        expect(mockUserStorage.createSession).toHaveBeenCalledWith(
          'user-123',
          expect.objectContaining({
            token: 'session-token-123',
            expires_at: mockSession.expires.toISOString()
          })
        );
      });
    });

    describe('getSessionAndUser', () => {
      it('should get session and user', async () => {
        const mockSessionData = {
          id: 'session-123',
          user_id: 'user-123',
          token: 'session-token-123',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: '2025-06-04T00:00:00Z'
        };

        const mockUserProfile = {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          email_verified: true,
          created_at: '2025-06-04T00:00:00Z'
        };

        mockUserStorage.getSessionAndUser.mockResolvedValue({ 
          success: true, 
          data: { session: mockSessionData, user: mockUserProfile }
        });

        const result = await adapter.getSessionAndUser('session-token-123');

        expect(result).toEqual({
          session: {
            sessionToken: 'session-token-123',
            userId: 'user-123',
            expires: expect.any(Date)
          },
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: expect.any(Date)
          }
        });
      });

      it('should return null for invalid session', async () => {
        mockUserStorage.getSessionAndUser.mockResolvedValue({ 
          success: true, 
          data: null 
        });

        const result = await adapter.getSessionAndUser('invalid-token');

        expect(result).toBeNull();
      });
    });

    describe('updateSession', () => {
      it('should update session', async () => {
        const mockUpdatedSession = {
          id: 'session-123',
          user_id: 'user-123',
          token: 'session-token-123',
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          created_at: '2025-06-04T00:00:00Z'
        };

        mockUserStorage.updateSession.mockResolvedValue({ 
          success: true, 
          data: mockUpdatedSession 
        });

        const updateData = {
          sessionToken: 'session-token-123',
          expires: new Date(Date.now() + 48 * 60 * 60 * 1000)
        };

        const result = await adapter.updateSession(updateData);

        expect(result).toEqual({
          sessionToken: 'session-token-123',
          userId: 'user-123',
          expires: expect.any(Date)
        });
      });
    });

    describe('deleteSession', () => {
      it('should delete session', async () => {
        mockUserStorage.deleteSession.mockResolvedValue({ success: true });

        await adapter.deleteSession('session-token-123');

        expect(mockUserStorage.deleteSession).toHaveBeenCalledWith('session-token-123');
      });
    });
  });

  describe('verification token operations', () => {
    const mockVerificationToken: VerificationToken = {
      identifier: 'test@example.com',
      token: 'verification-token-123',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    describe('createVerificationToken', () => {
      it('should create verification token', async () => {
        mockUserStorage.createVerificationToken.mockResolvedValue({ success: true });

        const result = await adapter.createVerificationToken(mockVerificationToken);

        expect(result).toEqual(mockVerificationToken);
        expect(mockUserStorage.createVerificationToken).toHaveBeenCalledWith(
          expect.objectContaining({
            identifier: 'test@example.com',
            token: 'verification-token-123',
            expires_at: mockVerificationToken.expires.toISOString()
          })
        );
      });
    });

    describe('useVerificationToken', () => {
      it('should use verification token', async () => {
        const mockTokenData = {
          identifier: 'test@example.com',
          token: 'verification-token-123',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: '2025-06-04T00:00:00Z'
        };

        mockUserStorage.useVerificationToken.mockResolvedValue({ 
          success: true, 
          data: mockTokenData 
        });

        const result = await adapter.useVerificationToken({
          identifier: 'test@example.com',
          token: 'verification-token-123'
        });

        expect(result).toEqual({
          identifier: 'test@example.com',
          token: 'verification-token-123',
          expires: expect.any(Date)
        });
      });

      it('should return null for invalid token', async () => {
        mockUserStorage.useVerificationToken.mockResolvedValue({ 
          success: true, 
          data: null 
        });

        const result = await adapter.useVerificationToken({
          identifier: 'test@example.com',
          token: 'invalid-token'
        });

        expect(result).toBeNull();
      });
    });
  });
});
