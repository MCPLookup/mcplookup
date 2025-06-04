# 🚨 Critical Security Vulnerabilities & Fixes

## 🔴 **IMMEDIATE ACTION REQUIRED**

### **1. SSRF (Server-Side Request Forgery) - CRITICAL**

**Risk**: Attackers can access internal services, cloud metadata, scan networks

**Affected Files**:
- `src/lib/services/verification.ts`
- `src/lib/services/health.ts` 
- `src/lib/mcp/bridge.ts`

**Fix Required**:
```typescript
// Add URL validation function
function isValidExternalURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Block internal/private IPs
    const hostname = parsed.hostname;
    
    // Block localhost variants
    if (['localhost', '127.0.0.1', '::1'].includes(hostname)) {
      return false;
    }
    
    // Block private IP ranges
    const privateRanges = [
      /^10\./,                    // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./,              // 192.168.0.0/16
      /^169\.254\./,              // Link-local (AWS metadata)
      /^fc00:/,                   // IPv6 private
      /^fe80:/                    // IPv6 link-local
    ];
    
    return !privateRanges.some(range => range.test(hostname));
  } catch {
    return false;
  }
}

// Use before all fetch() calls
if (!isValidExternalURL(endpoint)) {
  throw new Error('Invalid or unsafe URL');
}
```

### **2. DNS Rebinding Protection - CRITICAL**

**Risk**: Attackers can manipulate DNS to access internal services

**Fix Required**:
```typescript
// Add DNS validation
async function validateDNSResolution(domain: string): Promise<boolean> {
  try {
    const addresses = await dns.resolve4(domain);
    
    // Check if any resolved IP is private/internal
    for (const ip of addresses) {
      if (isPrivateIP(ip)) {
        console.warn(`Blocked DNS resolution to private IP: ${ip} for domain: ${domain}`);
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  // 127.0.0.0/8 (localhost)
  if (parts[0] === 127) return true;
  
  // 169.254.0.0/16 (link-local/AWS metadata)
  if (parts[0] === 169 && parts[1] === 254) return true;
  
  return false;
}
```

### **3. Implement Rate Limiting - HIGH PRIORITY**

**Risk**: API abuse, DDoS attacks, brute force

**Fix Required**:
```typescript
// Create rate limiting middleware
import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < windowStart) {
        rateLimitMap.delete(key);
      }
    }
    
    const current = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
    
    if (current.count >= maxRequests && current.resetTime > now) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
          }
        }
      );
    }
    
    current.count++;
    rateLimitMap.set(ip, current);
    
    return null; // Allow request
  };
}

// Apply to API routes
export const discoveryRateLimit = rateLimit(100, 60000); // 100/min
export const registrationRateLimit = rateLimit(10, 3600000); // 10/hour
export const healthRateLimit = rateLimit(50, 60000); // 50/min
```

### **4. Fix CORS Configuration - MEDIUM PRIORITY**

**Risk**: Unauthorized cross-origin requests

**Fix Required**:
```typescript
// Replace wildcard CORS with specific origins
const allowedOrigins = [
  'https://mcplookup.org',
  'https://www.mcplookup.org',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean);

function getCORSHeaders(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };
}
```

### **5. Enhanced Input Validation - HIGH PRIORITY**

**Fix Required**:
```typescript
// Enhanced URL validation schema
export const SecureURLSchema = z.string()
  .url()
  .refine((url) => {
    try {
      const parsed = new URL(url);
      
      // Only HTTPS in production
      if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
        return false;
      }
      
      // Block internal URLs
      return isValidExternalURL(url);
    } catch {
      return false;
    }
  }, "URL must be a valid external HTTPS URL");

// Enhanced domain validation
export const SecureDomainSchema = z.string()
  .min(1)
  .max(253)
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/)
  .refine((domain) => {
    // Block internal domains
    const internalDomains = ['localhost', 'local', 'internal'];
    return !internalDomains.some(internal => domain.includes(internal));
  }, "Domain cannot be internal");
```

### **6. Fix Authentication Security - MEDIUM PRIORITY**

**Fix Required**:
```typescript
// In auth.ts - remove trustHost or make conditional
export const config = {
  // ... other config
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60, // Reduce to 7 days
  },
  trustHost: process.env.NODE_ENV === 'development', // Only in dev
  // ... rest of config
} satisfies NextAuthConfig;
```

## 📋 **IMPLEMENTATION PRIORITY**

### **Phase 1 (This Week) - Critical**
1. ✅ Implement SSRF protection
2. ✅ Add DNS rebinding protection  
3. ✅ Implement rate limiting
4. ✅ Fix CORS configuration

### **Phase 2 (Next Week) - High**
1. ✅ Enhanced input validation
2. ✅ Fix authentication security
3. ✅ Add security logging
4. ✅ Implement monitoring

### **Phase 3 (This Month) - Medium**
1. ✅ Dependency updates
2. ✅ Security testing
3. ✅ Penetration testing
4. ✅ Security documentation

## 🛠️ **TESTING SECURITY FIXES**

```bash
# Test SSRF protection
curl -X POST /api/v1/register \
  -d '{"endpoint":"http://localhost:8080/evil","domain":"test.com"}'
# Should return: Invalid or unsafe URL

# Test rate limiting
for i in {1..101}; do
  curl /api/v1/discover
done
# Should return 429 after 100 requests

# Test DNS rebinding
curl -X POST /api/v1/register \
  -d '{"endpoint":"https://internal.company.com","domain":"evil.com"}'
# Should be blocked if internal.company.com resolves to private IP
```

## 🚨 **SECURITY INCIDENT RESPONSE**

If any of these vulnerabilities are exploited:

1. **Immediately block suspicious IPs**
2. **Review access logs for exploitation attempts**
3. **Rotate any potentially compromised credentials**
4. **Apply emergency patches**
5. **Notify users if data may be compromised**

---

**Status**: 🔴 CRITICAL - Immediate action required  
**Next Review**: After fixes implemented  
**Estimated Fix Time**: 2-3 days for critical issues
