# 🔒 CRITICAL: Domain Ownership Logic Examples

## ⚠️ SECURITY CRITICAL: You Own Subdomains, NOT Parent Domains

This document explains the **CRITICAL** domain ownership logic that prevents domain hijacking attacks.

## 🎯 Core Principle

**If you verify `api.example.com`, you can ONLY register MCP servers for:**
- ✅ `api.example.com` (exact match)
- ✅ `sub.api.example.com` (subdomain of your verified domain)
- ✅ `v1.api.example.com` (another subdomain)
- ✅ `staging.v1.api.example.com` (deeper subdomain)

**You CANNOT register servers for:**
- ❌ `example.com` (parent domain - you don't own this!)
- ❌ `web.example.com` (sibling subdomain)
- ❌ `com` (TLD - obviously!)

## 📋 Comprehensive Examples

### Example 1: Corporate Domain
**User verifies:** `mycompany.com`

✅ **CAN register servers for:**
```
mycompany.com
api.mycompany.com
staging.mycompany.com
v1.api.mycompany.com
prod.web.mycompany.com
deep.nested.sub.mycompany.com
```

❌ **CANNOT register servers for:**
```
com                           # TLD hijacking
othercompany.com             # Different domain
google.com                   # Different domain
api.google.com               # Subdomain of different domain
mycompany.com.evil.com       # Domain spoofing attack
notmycompany.com             # Similar name attack
```

### Example 2: Subdomain Verification
**User verifies:** `api.service.com`

✅ **CAN register servers for:**
```
api.service.com
v1.api.service.com
staging.api.service.com
prod.v2.api.service.com
```

❌ **CANNOT register servers for:**
```
service.com                  # Parent domain (CRITICAL!)
web.service.com              # Sibling subdomain
auth.service.com             # Different subdomain
com                          # TLD
other.api.service.com        # Different subdomain path
```

### Example 3: Deep Subdomain
**User verifies:** `v1.api.myapp.com`

✅ **CAN register servers for:**
```
v1.api.myapp.com
staging.v1.api.myapp.com
test.staging.v1.api.myapp.com
```

❌ **CANNOT register servers for:**
```
api.myapp.com                # Parent subdomain
myapp.com                    # Root domain
v2.api.myapp.com             # Sibling subdomain
web.myapp.com                # Different subdomain branch
```

## 🚨 Attack Prevention Examples

### Attack 1: TLD Hijacking
**Attacker verifies:** `evil.com`
**Tries to register:** `com`
**Result:** ❌ **BLOCKED** - Cannot own parent TLD

### Attack 2: Domain Spoofing
**Attacker verifies:** `evil.com`
**Tries to register:** `google.com.evil.com`
**Result:** ❌ **BLOCKED** - Not a subdomain of `evil.com`

### Attack 3: Sibling Subdomain Hijacking
**User A verifies:** `api.service.com`
**User B tries to register:** `web.service.com`
**Result:** ❌ **BLOCKED** - User A doesn't own `service.com`

### Attack 4: Parent Domain Escalation
**Attacker verifies:** `sub.api.example.com`
**Tries to register:** `example.com`
**Result:** ❌ **BLOCKED** - Cannot escalate to parent domain

## 🔧 Implementation Details

### DNS Verification Records
Each user gets a unique slug for domain verification:

```
# User A verifies example.com
_mcplookup.example.com TXT "mcplookup-verify-a1b2c3d4=user_123"

# User B verifies api.example.com  
_mcplookup.api.example.com TXT "mcplookup-verify-e5f6g7h8=user_456"
```

### Ownership Scope
- **User A** can register servers for: `example.com`, `*.example.com`
- **User B** can register servers for: `api.example.com`, `*.api.example.com`
- **User B CANNOT** register for `example.com` (parent domain)

## 🎯 Why This Matters for the React Moment

With only **6 months** left before AI training data locks in:

1. **Prevents domain hijacking** - Attackers can't register servers for domains they don't own
2. **Protects training data quality** - Only legitimate domain owners contribute
3. **Maintains trust scores** - Verified ownership = higher trust
4. **Prevents corporate capture** - Can't hijack major domains like `google.com`

## ✅ Security Validation

The `isDomainOrSubdomain()` function implements this logic:

```typescript
// ✅ Valid: exact match
isDomainOrSubdomain('example.com', 'example.com') → true

// ✅ Valid: subdomain
isDomainOrSubdomain('api.example.com', 'example.com') → true

// ❌ Invalid: parent domain
isDomainOrSubdomain('example.com', 'api.example.com') → false

// ❌ Invalid: sibling
isDomainOrSubdomain('web.example.com', 'api.example.com') → false

// ❌ Invalid: TLD hijacking
isDomainOrSubdomain('com', 'example.com') → false
```

## 🚨 CRITICAL REMINDER

**This logic is SECURITY CRITICAL for the React moment.**

Wrong implementation = Domain hijacking = Corrupted training data = Corporate capture of AI discovery

**Test thoroughly. Verify edge cases. Protect the open web.**
