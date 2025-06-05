# 📧 Quick Setup: Resend Email Service

**The easiest way to get email verification working in 5 minutes**

---

## 🚀 **Step 1: Sign Up for Resend**

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your account

---

## 🔑 **Step 2: Get API Key**

1. Go to your [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it "MCPLookup.org"
4. Copy the API key (starts with `re_`)

---

## ⚙️ **Step 3: Configure Environment**

Add to your `.env.local` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# Optional: Your domain (for better deliverability)
# RESEND_DOMAIN=yourdomain.com
```

**Example:**
```bash
RESEND_API_KEY=re_AbCdEf123456789
EMAIL_FROM=noreply@mcplookup.org
```

---

## 📦 **Step 4: Install Resend Package**

```bash
npm install resend
```

---

## 🧪 **Step 5: Test Email Sending**

```bash
# Set your test email
export TEST_EMAIL=your-email@example.com

# Test the email service
npx tsx scripts/test-email-sending.ts
```

---

## ✅ **Step 6: Verify Setup**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit registration page:**
   ```
   http://localhost:3000/auth/signin
   ```

3. **Register with a real email address**

4. **Check your inbox for verification email**

---

## 🎯 **Benefits of Resend**

- ✅ **No SMTP configuration needed**
- ✅ **Generous free tier** (3,000 emails/month)
- ✅ **Excellent deliverability**
- ✅ **Simple API**
- ✅ **Built for developers**
- ✅ **Great documentation**
- ✅ **No domain verification required** (for testing)

---

## 🔧 **Domain Setup (Optional - For Production)**

For better deliverability in production:

1. **Add your domain in Resend dashboard**
2. **Add DNS records** (SPF, DKIM, DMARC)
3. **Verify domain**
4. **Update EMAIL_FROM** to use your domain

---

## 🐛 **Troubleshooting**

### **❌ "API key not found"**
- Check your `.env.local` file
- Make sure `RESEND_API_KEY` is set correctly
- Restart your development server

### **❌ "Invalid from address"**
- Use a valid email format for `EMAIL_FROM`
- For testing, any email works
- For production, use your verified domain

### **❌ Emails not arriving**
- Check spam folder
- Verify the recipient email address
- Check Resend dashboard for delivery status

---

## 📊 **Monitoring**

- **Resend Dashboard:** View email delivery status
- **Logs:** Check your application logs for email sending status
- **Analytics:** Track open rates and delivery rates

---

**🎉 That's it! Your email verification system is now ready with Resend!**

The system will automatically:
- Send verification emails on registration
- Send welcome emails after verification  
- Send password reset emails when requested

All with beautiful, branded HTML templates! 🚀
