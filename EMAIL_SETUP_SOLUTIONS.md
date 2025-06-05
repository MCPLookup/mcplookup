# 📧 Email Setup Solutions for Google Workspace

**Multiple solutions when "App Passwords" setting is not available**

---

## 🚨 **The Problem**

Google Workspace accounts often have the "App Passwords" setting disabled by administrators, showing:
> "The setting you are looking for is not available for your account."

---

## 🎯 **Solution 1: Resend (Recommended)**

**✅ Easiest and most reliable option**

### **Setup Steps:**

1. **Sign up at [resend.com](https://resend.com)**
2. **Get your API key** from the dashboard
3. **Add to `.env.local`:**
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```
4. **Install package:**
   ```bash
   npm install resend
   ```

### **Benefits:**
- ✅ No SMTP configuration needed
- ✅ 3,000 free emails/month
- ✅ Excellent deliverability
- ✅ Works immediately
- ✅ Built for developers

---

## 🎯 **Solution 2: Google OAuth2**

**✅ Use your Google Workspace with OAuth2**

### **Setup Steps:**

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create a new project** or select existing
3. **Enable Gmail API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. **Create OAuth2 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Add authorized redirect URI: `http://localhost:3000/auth/callback`

5. **Get Refresh Token:**
   ```bash
   # Use Google OAuth2 Playground
   # https://developers.google.com/oauthplayground/
   # Select Gmail API v1 > https://www.googleapis.com/auth/gmail.send
   # Authorize and get refresh token
   ```

6. **Add to `.env.local`:**
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   EMAIL_USER=your-email@yourdomain.com
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

## 🎯 **Solution 3: SendGrid**

**✅ Popular email service with good free tier**

### **Setup Steps:**

1. **Sign up at [sendgrid.com](https://sendgrid.com)**
2. **Create API key** in dashboard
3. **Add to `.env.local`:**
   ```bash
   SENDGRID_API_KEY=SG.your_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```
4. **Install package:**
   ```bash
   npm install @sendgrid/mail
   ```

---

## 🎯 **Solution 4: Mailgun**

**✅ Reliable email service with good API**

### **Setup Steps:**

1. **Sign up at [mailgun.com](https://mailgun.com)**
2. **Get API key and domain** from dashboard
3. **Add to `.env.local`:**
   ```bash
   MAILGUN_API_KEY=your_api_key_here
   MAILGUN_DOMAIN=your_domain.mailgun.org
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

## 🎯 **Solution 5: Alternative SMTP Providers**

**✅ If you prefer SMTP**

### **Options:**
- **Outlook/Hotmail:** `smtp-mail.outlook.com:587`
- **Yahoo:** `smtp.mail.yahoo.com:587`
- **Zoho:** `smtp.zoho.com:587`
- **Amazon SES:** AWS SMTP credentials

### **Setup Example (Outlook):**
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=your-email@outlook.com
```

---

## 🚀 **Quick Start (Resend)**

**Get email working in 5 minutes:**

1. **Sign up:** [resend.com](https://resend.com)
2. **Get API key:** Copy from dashboard
3. **Configure:**
   ```bash
   echo "RESEND_API_KEY=re_your_key_here" >> .env.local
   echo "EMAIL_FROM=noreply@yourdomain.com" >> .env.local
   ```
4. **Install:**
   ```bash
   npm install resend
   ```
5. **Test:**
   ```bash
   export TEST_EMAIL=your-email@example.com
   npx tsx scripts/test-email-sending.ts
   ```

---

## 🧪 **Testing Your Setup**

### **Method 1: Test Script**
```bash
export TEST_EMAIL=your-email@example.com
npx tsx scripts/test-email-sending.ts
```

### **Method 2: Registration Flow**
1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/auth/signin`
3. Register with real email
4. Check inbox for verification email

---

## 📊 **Comparison Table**

| Provider | Setup Difficulty | Free Tier | Deliverability | Developer Experience |
|----------|------------------|-----------|----------------|---------------------|
| **Resend** | ⭐ Easy | 3K/month | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Google OAuth2** | ⭐⭐⭐ Complex | Unlimited | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **SendGrid** | ⭐⭐ Medium | 100/day | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Mailgun** | ⭐⭐ Medium | 5K/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SMTP** | ⭐⭐ Medium | Varies | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🔧 **Current Implementation**

Your email system now supports **multiple providers automatically**:

1. **Tries Resend first** (if `RESEND_API_KEY` is set)
2. **Falls back to SendGrid** (if `SENDGRID_API_KEY` is set)
3. **Falls back to Mailgun** (if `MAILGUN_API_KEY` is set)
4. **Falls back to SMTP** (if `EMAIL_HOST` is set)

Just set the environment variables for your preferred provider!

---

## 🎉 **Recommendation**

**For immediate setup:** Use **Resend**
- Fastest to set up
- Most reliable
- Best developer experience
- No domain verification needed for testing

**For production:** Consider your needs
- **High volume:** Resend or SendGrid
- **Existing Google Workspace:** Google OAuth2
- **Budget conscious:** Mailgun
- **Enterprise:** Amazon SES

---

**🚀 Choose your preferred solution and get email verification working in minutes!**
