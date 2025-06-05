# 📧 Email/Password Authentication Setup Guide

**Complete guide to enable email/password authentication with Google Workspace**

---

## 🎯 **Overview**

MCPLookup.org now supports three authentication methods:
- **GitHub OAuth** - Sign in with GitHub account
- **Google OAuth** - Sign in with Google account  
- **Email/Password** - Traditional email/password with verification ✨ **NEW**

---

## 🔧 **Google Workspace SMTP Setup**

### **Step 1: Enable 2-Factor Authentication**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. This is required for App Passwords

### **Step 2: Generate App Password**

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (custom name)** as the device
4. Enter: `MCPLookup.org SMTP`
5. Click **Generate**
6. **Save the 16-character password** - you'll need it for EMAIL_PASS

### **Step 3: Configure Environment Variables**

Add these to your `.env.local` file:

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**Example:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=admin@mcplookup.org
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=noreply@mcplookup.org
```

---

## 🚀 **Features Included**

### **✅ User Registration**
- Email/password registration form
- Real-time password strength validation
- Secure password hashing with bcrypt
- Email verification required before sign-in

### **✅ Email Verification**
- Automatic verification emails sent on registration
- Secure token-based verification (24-hour expiry)
- Beautiful HTML email templates
- Welcome email sent after verification

### **✅ Password Reset**
- "Forgot Password" functionality
- Secure reset tokens (1-hour expiry)
- Password reset emails with branded templates
- Strong password requirements enforced

### **✅ Security Features**
- Passwords hashed with bcrypt (12 rounds)
- Secure random token generation
- Email verification required
- Password strength validation
- Rate limiting on auth attempts
- Protection against common passwords

---

## 📱 **User Experience**

### **Registration Flow**
1. User clicks "Sign up" on sign-in page
2. Fills out registration form with email/password
3. Real-time password strength feedback
4. Account created (unverified)
5. Verification email sent automatically
6. User clicks link in email to verify
7. Welcome email sent
8. User can now sign in

### **Sign-In Flow**
1. User enters email/password
2. System verifies credentials
3. Checks if email is verified
4. Signs user in or shows verification message

### **Password Reset Flow**
1. User clicks "Forgot Password"
2. Enters email address
3. Reset email sent (if account exists)
4. User clicks reset link
5. Sets new password with strength validation
6. Redirected to sign-in

---

## 🎨 **Email Templates**

All emails use branded HTML templates with:
- MCPLookup.org branding and colors
- Responsive design for mobile/desktop
- Clear call-to-action buttons
- Professional styling
- Fallback text versions

### **Email Types:**
- **Verification Email** - Sent on registration
- **Welcome Email** - Sent after verification
- **Password Reset Email** - Sent on password reset request

---

## 🔒 **Security Considerations**

### **Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character
- Maximum 128 characters
- Protection against common passwords

### **Token Security:**
- Cryptographically secure random tokens
- Tokens are hashed before storage
- Short expiration times (1-24 hours)
- One-time use tokens
- Automatic cleanup of expired tokens

### **Email Security:**
- SMTP over TLS (port 587)
- App passwords instead of account passwords
- No sensitive data in email content
- Secure token transmission

---

## 🧪 **Testing the Setup**

### **1. Test Email Configuration**
```bash
# In your development environment
npm run dev

# Check the console for email service initialization
# Should see: "Email service initialized successfully"
```

### **2. Test Registration Flow**
1. Go to `/auth/signin`
2. Click to switch to "Sign up" mode
3. Fill out the registration form
4. Check your email for verification link
5. Click the verification link
6. Try signing in with your new account

### **3. Test Password Reset**
1. Go to `/auth/forgot-password`
2. Enter your email address
3. Check your email for reset link
4. Click the reset link and set new password
5. Sign in with the new password

---

## 🐛 **Troubleshooting**

### **Email Not Sending**
```bash
# Check environment variables
echo $EMAIL_HOST
echo $EMAIL_USER
echo $EMAIL_PASS

# Check console logs for errors
# Look for: "Email service not configured" or SMTP errors
```

### **Common Issues:**

**❌ "Email service not configured"**
- Check all EMAIL_* environment variables are set
- Restart your development server

**❌ "Authentication failed"**
- Verify your App Password is correct (16 characters)
- Make sure 2FA is enabled on your Google account
- Try generating a new App Password

**❌ "Connection timeout"**
- Check your firewall/network settings
- Verify EMAIL_HOST and EMAIL_PORT are correct
- Try using port 465 with secure: true

**❌ Emails going to spam**
- Add your domain to SPF records
- Set up DKIM signing
- Use a dedicated sending domain

---

## 📊 **Admin Integration**

The email/password authentication integrates seamlessly with the existing admin system:

- **First User Setup**: First registered user can be promoted to admin
- **Admin User Management**: Admins can create email/password users
- **Role Management**: Email users get same role system as OAuth users
- **User Dashboard**: All authentication methods use same dashboard

---

## 🔄 **Migration from OAuth-Only**

If you're upgrading from OAuth-only authentication:

1. **No database changes needed** - uses existing storage system
2. **Existing users unaffected** - OAuth continues to work
3. **Admin users preserved** - existing admin roles maintained
4. **Gradual rollout** - can enable email auth alongside OAuth

---

## 🚀 **Production Deployment**

### **Environment Variables for Production:**
```bash
# Required for email auth
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=admin@yourdomain.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Required for NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret

# Optional: Keep OAuth providers
AUTH_GITHUB_ID=your-github-id
AUTH_GITHUB_SECRET=your-github-secret
AUTH_GOOGLE_ID=your-google-id
AUTH_GOOGLE_SECRET=your-google-secret
```

### **DNS Configuration (Optional but Recommended):**
```
# Add SPF record to prevent emails going to spam
TXT @ "v=spf1 include:_spf.google.com ~all"

# Add DMARC record for email security
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com"
```

---

**🎉 Your email/password authentication is now ready! Users can register with email, verify their accounts, and reset passwords seamlessly.**
