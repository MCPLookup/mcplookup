// Authentication and User Management Integration Tests
// Tests complete auth flows from registration to profile management

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getStorageService, setStorageService } from '@/lib/storage';

// Import API route handlers for direct testing
import { POST as authRegisterPOST } from '@/app/api/auth/register/route';
import { POST as verifyEmailPOST } from '@/app/api/auth/verify-email/route';
import { POST as forgotPasswordPOST } from '@/app/api/auth/forgot-password/route';
import { POST as resetPasswordPOST } from '@/app/api/auth/reset-password/route';

// Mock auth module
vi.mock('@/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    }
  })
}));

// Mock external dependencies
vi.mock('@/lib/services/resend-email', () => ({
  sendEmailVerification: vi.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true })
}));

// Create a simple in-memory store for test users
const testUsers = new Map();

vi.mock('@/lib/auth/storage-adapter', () => ({
  createUserWithPassword: vi.fn().mockImplementation(async (email, name) => {
    // Check if user already exists (atomic check-and-create)
    if (testUsers.has(email)) {
      throw new Error(`User with email ${email} already exists`);
    }

    const user = {
      id: `user-${Date.now()}`,
      email: email,
      name: name,
      emailVerified: false,
      createdAt: new Date()
    };
    testUsers.set(email, user);
    return user;
  }),
  createEmailVerificationToken: vi.fn().mockResolvedValue(true),
  getUserByEmail: vi.fn().mockImplementation((email) => {
    // Check in-memory store first
    if (testUsers.has(email)) {
      return Promise.resolve(testUsers.get(email));
    }

    // Pre-existing test users
    if (email === 'existing@example.com') {
      return Promise.resolve({
        id: 'existing-user',
        email: 'existing@example.com',
        name: 'Existing User',
        emailVerified: true
      });
    }

    if (email === 'test@example.com') {
      return Promise.resolve({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false
      });
    }

    return Promise.resolve(null);
  }),
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  generateSecureToken: vi.fn().mockReturnValue('secure-token-123'),
  hashToken: vi.fn().mockResolvedValue('hashed-token'),
  getEmailVerificationToken: vi.fn().mockResolvedValue({
    id: 'token-123',
    email: 'test@example.com',
    hashedToken: 'hashed-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }),
  deleteEmailVerificationToken: vi.fn().mockResolvedValue(true),
  markEmailAsVerified: vi.fn().mockResolvedValue(true),
  createPasswordResetToken: vi.fn().mockResolvedValue(true),
  getPasswordResetToken: vi.fn().mockImplementation((email, token) => {
    if (email === 'existing@example.com' && token === 'secure-token-123') {
      return Promise.resolve({
        id: 'reset-token-123',
        email: 'existing@example.com',
        hashedToken: 'hashed-reset-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      });
    }
    return Promise.resolve(null);
  }),
  deletePasswordResetToken: vi.fn().mockResolvedValue(true),
  updateUserPassword: vi.fn().mockResolvedValue(true)
}));

describe('Authentication and User Management Integration Tests', () => {
  let baseUrl: string;

  beforeEach(() => {
    // Reset storage for each test
    setStorageService(null as any);

    // Clear test users
    testUsers.clear();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Clear all mocks
    vi.clearAllMocks();

    // Set base URL for API calls
    baseUrl = 'http://localhost:3000';
  });

  describe('User Registration Workflow', () => {
    it('should handle complete user registration flow', async () => {
      // Fixed: Auth import resolution issue resolved with proper mocking
      // Step 1: Register new user
      const registrationRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!',
          name: 'New User'
        })
      });

      const registrationResponse = await authRegisterPOST(registrationRequest);
      expect(registrationResponse.status).toBe(201);

      const registrationData = await registrationResponse.json();
      expect(registrationData.message).toContain('Registration successful');
      expect(registrationData.user).toBeDefined();
      expect(registrationData.user.email).toBe('newuser@example.com');
      expect(registrationData.user.emailVerified).toBe(false);

      // Verify email verification was triggered
      const { sendEmailVerification } = await import('@/lib/services/resend-email');
      expect(sendEmailVerification).toHaveBeenCalledWith('newuser@example.com', 'secure-token-123');

      // Step 2: Verify email
      const verificationRequest = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@example.com',
          token: 'secure-token-123'
        })
      });

      const verificationResponse = await verifyEmailPOST(verificationRequest);
      expect(verificationResponse.status).toBe(200);

      const verificationData = await verificationResponse.json();
      expect(verificationData.success).toBe(true);
      expect(verificationData.message).toContain('verified');

      // Verify welcome email was sent
      const { sendWelcomeEmail } = await import('@/lib/services/resend-email');
      expect(sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should prevent duplicate user registration', async () => {
      // Fixed: Auth import resolution issue resolved
      const duplicateRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!',
          name: 'Duplicate User'
        })
      });

      const response = await authRegisterPOST(duplicateRequest);
      expect(response.status).toBe(409);

      const errorData = await response.json();
      expect(errorData.error).toContain('already exists');
    });

    it('should validate registration input', async () => {
      // Test weak password
      const weakPasswordRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123', // Too weak
          confirmPassword: '123',
          name: 'Test User'
        })
      });

      const weakPasswordResponse = await authRegisterPOST(weakPasswordRequest);
      expect(weakPasswordResponse.status).toBe(400);

      // Test invalid email
      const invalidEmailRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!',
          name: 'Test User'
        })
      });

      const invalidEmailResponse = await authRegisterPOST(invalidEmailRequest);
      expect(invalidEmailResponse.status).toBe(400);

      // Test missing name
      const missingNameRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!'
          // name missing
        })
      });

      const missingNameResponse = await authRegisterPOST(missingNameRequest);
      expect(missingNameResponse.status).toBe(400);
    });
  });

  describe('Email Verification Workflow', () => {
    // Fixed: Auth import resolution issue resolved
    it('should handle email verification with valid token', async () => {
      const verificationRequest = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          token: 'secure-token-123'
        })
      });

      const response = await verifyEmailPOST(verificationRequest);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('verified');

      // Verify token cleanup
      const { deleteEmailVerificationToken } = await import('@/lib/auth/storage-adapter');
      expect(deleteEmailVerificationToken).toHaveBeenCalled();
    });

    it('should handle invalid verification token', async () => {
      // Mock invalid token
      const { getEmailVerificationToken } = await import('@/lib/auth/storage-adapter');
      vi.mocked(getEmailVerificationToken).mockResolvedValueOnce(null);

      const invalidTokenRequest = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          token: 'invalid-token'
        })
      });

      const response = await verifyEmailPOST(invalidTokenRequest);
      expect(response.status).toBe(400); // Invalid token error
    });

    it('should handle expired verification token', async () => {
      // Mock expired token
      const { getEmailVerificationToken } = await import('@/lib/auth/storage-adapter');
      vi.mocked(getEmailVerificationToken).mockResolvedValueOnce({
        id: 'expired-token',
        email: 'test@example.com',
        hashedToken: 'hashed-token',
        expiresAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      });

      const expiredTokenRequest = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          token: 'expired-token'
        })
      });

      const response = await verifyEmailPOST(expiredTokenRequest);
      expect(response.status).toBe(400); // Expired token error
    });
  });

  describe('Password Reset Workflow', () => {
    // Fixed: Auth import resolution issue resolved
    it('should handle complete password reset flow', async () => {
      // Step 1: Request password reset
      const resetRequest = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@example.com'
        })
      });

      const resetResponse = await forgotPasswordPOST(resetRequest);
      expect(resetResponse.status).toBe(200);

      const resetData = await resetResponse.json();
      expect(resetData.success).toBe(true);
      expect(resetData.message).toContain('reset email');

      // Verify reset email was sent
      const { sendPasswordResetEmail } = await import('@/lib/services/resend-email');
      expect(sendPasswordResetEmail).toHaveBeenCalledWith('existing@example.com', 'secure-token-123');

      // Step 2: Reset password with token
      const newPasswordRequest = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@example.com',
          token: 'secure-token-123',
          newPassword: 'NewSecurePassword123!'
        })
      });

      const newPasswordResponse = await resetPasswordPOST(newPasswordRequest);
      expect(newPasswordResponse.status).toBe(200);

      const newPasswordData = await newPasswordResponse.json();
      expect(newPasswordData.success).toBe(true);
      expect(newPasswordData.message).toContain('updated');

      // Verify password was updated
      const { updateUserPassword } = await import('@/lib/auth/storage-adapter');
      expect(updateUserPassword).toHaveBeenCalled();
    });

    it('should handle password reset for non-existent user', async () => {
      const nonExistentRequest = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com'
        })
      });

      const response = await forgotPasswordPOST(nonExistentRequest);
      expect(response.status).toBe(200); // Still return success for security

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('reset email');

      // But no email should actually be sent
      const { sendPasswordResetEmail } = await import('@/lib/services/resend-email');
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should validate new password strength', async () => {
      const weakPasswordRequest = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'existing@example.com',
          token: 'secure-token-123',
          newPassword: '123' // Too weak
        })
      });

      const response = await resetPasswordPOST(weakPasswordRequest);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.error).toContain('password');
    });
  });

  describe('Error Handling and Security', () => {
    // Fixed: Auth import resolution issue resolved
    it('should handle malformed requests gracefully', async () => {
      const malformedRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{'
      });

      const response = await authRegisterPOST(malformedRequest);
      expect(response.status).toBe(400);
    });

    it('should handle email service failures gracefully', async () => {
      // Mock email service failure
      const { sendEmailVerification } = await import('@/lib/services/resend-email');
      vi.mocked(sendEmailVerification).mockResolvedValueOnce({ 
        success: false, 
        error: 'Email service unavailable' 
      });

      const registrationRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'emailfailure@example.com',
          password: 'SecurePassword123!',
          confirmPassword: 'SecurePassword123!',
          name: 'Test User'
        })
      });

      const response = await authRegisterPOST(registrationRequest);
      expect(response.status).toBe(201); // User still created

      const data = await response.json();
      expect(data.success).toBe(true);
      
      // Should log warning about email failure
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send verification email'),
        expect.any(String)
      );
    });

    it('should handle concurrent registration attempts', async () => {
      const userData = {
        email: 'concurrent@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        name: 'Concurrent User'
      };

      // Create multiple concurrent registration requests
      const requests = Array.from({ length: 3 }, () => 
        new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
      );

      // Execute all requests concurrently
      const responses = await Promise.all(
        requests.map(request => authRegisterPOST(request))
      );

      // Only one should succeed, others should fail with duplicate error
      const successfulResponses = responses.filter(response => response.status === 201);
      const failedResponses = responses.filter(response => response.status === 409);

      expect(successfulResponses.length).toBe(1);
      expect(failedResponses.length).toBe(2);
    });
  });
});
