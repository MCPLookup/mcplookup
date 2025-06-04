# Security Guide for MCPLookup.org

## 🔐 Environment Variables & Secrets Management

### **Critical: Never Commit Secrets to Git**

❌ **NEVER do this:**
```bash
# Bad - secrets in code
UPSTASH_REDIS_REST_TOKEN=AZUTAAIjcDEyNWE3YjlkODFmYWE0MTdmYTY4ZWUzOWJiM2Y4NTNiOXAxMA
```

✅ **DO this instead:**
```bash
# Good - placeholder in example files
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### **Environment File Structure**

```
.env.example          # ✅ Safe to commit - contains placeholders
.env.production.example # ✅ Safe to commit - contains placeholders  
.env.local           # ❌ NEVER commit - contains real secrets
.env.production      # ❌ NEVER commit - contains real secrets
.env                 # ❌ NEVER commit - contains real secrets
```

### **Setting Up Secrets Locally**

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your real credentials:**
   ```bash
   # .env.local (this file is git-ignored)
   UPSTASH_REDIS_REST_URL=https://tender-reptile-38163.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AZUTAAIjcDEyNWE3YjlkODFmYWE0MTdmYTY4ZWUzOWJiM2Y4NTNiOXAxMA
   ```

3. **Verify it's git-ignored:**
   ```bash
   git status  # .env.local should NOT appear
   ```

### **Production Deployment**

#### **Vercel (Recommended)**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - `UPSTASH_REDIS_REST_URL` = `https://tender-reptile-38163.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `AZUTAAIjcDEyNWE3YjlkODFmYWE0MTdmYTY4ZWUzOWJiM2Y4NTNiOXAxMA`

#### **Docker Production**
```bash
# Use environment variables or Docker secrets
docker run -e UPSTASH_REDIS_REST_URL=https://... \
           -e UPSTASH_REDIS_REST_TOKEN=... \
           mcplookup/app
```

#### **Other Platforms**
- **Netlify**: Site settings → Environment variables
- **Railway**: Variables tab in project dashboard  
- **Render**: Environment tab in service settings
- **AWS/GCP/Azure**: Use their secret management services

### **Testing with Secrets**

```bash
# Test storage with your real credentials
UPSTASH_REDIS_REST_URL=https://tender-reptile-38163.upstash.io \
UPSTASH_REDIS_REST_TOKEN=AZUTAAIjcDEyNWE3YjlkODFmYWE0MTdmYTY4ZWUzOWJiM2Y4NTNiOXAxMA \
npm run test:storage
```

### **Git Safety Checklist**

✅ **Before every commit:**
```bash
# 1. Check what you're committing
git diff --cached

# 2. Ensure no secrets are included
grep -r "AZUTAAIjcDEyNWE3YjlkODFmYWE0MTdmYTY4ZWUzOWJiM2Y4NTNiOXAxMA" .

# 3. Verify .env files are ignored
git status | grep -E "\.env"  # Should return nothing
```

### **If You Accidentally Commit Secrets**

1. **Immediately rotate the credentials** in Upstash console
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (⚠️ dangerous if others have cloned):
   ```bash
   git push origin --force --all
   ```

### **Additional Security Measures**

#### **Redis Security**
- ✅ Use TLS connections (Upstash enforces this)
- ✅ Rotate tokens regularly
- ✅ Use least-privilege access
- ✅ Monitor access logs

#### **Application Security**
- ✅ Validate all inputs
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Regular dependency updates

#### **Development Security**
- ✅ Use different credentials for dev/prod
- ✅ Never share credentials in chat/email
- ✅ Use secure password managers
- ✅ Enable 2FA on all accounts

### **Emergency Contacts**

If you suspect a security breach:
1. **Immediately rotate all credentials**
2. **Check Upstash access logs**
3. **Review application logs**
4. **Contact the team**

---

## 🛡️ Remember: Security is Everyone's Responsibility

- **Think before you commit**
- **Use placeholders in examples**
- **Keep secrets in environment variables**
- **Rotate credentials regularly**
