# DNS VERIFICATION PROTOCOL SPECIFICATION

**The cryptographic proof-of-control system for MCP server registration**

---

## 🔐 OVERVIEW

DNS verification ensures only domain owners can register MCP servers for their domains. This prevents hijacking and establishes trust in the registry.

**Security Model**: Same as Let's Encrypt, Google Search Console, GitHub Pages

---

## 📋 VERIFICATION PROCESS

### 1. Registration Request
```http
POST /api/v1/register
{
  "domain": "example.com",
  "endpoint": "https://example.com/mcp",
  "capabilities": ["custom_tool"]
}
```

### 2. Challenge Generation
```json
{
  "registration_id": "reg_abc123xyz",
  "verification": {
    "method": "dns_txt_record",
    "record_name": "_mcp-verify.example.com",
    "record_value": "mcp_verify_xyz789abc123",
    "expires_at": "2025-06-04T10:00:00Z"
  }
}
```

### 3. DNS Record Creation
**Domain owner adds TXT record:**
```dns
_mcp-verify.example.com.    300    TXT    "mcp_verify_xyz789abc123"
```

### 4. Automatic Verification
- System polls DNS every 30 seconds
- Verification completes within 5 minutes
- Auto-approval on successful verification

### 5. Permanent Service Record
**System creates permanent discovery record:**
```dns
_mcp.example.com.           3600   TXT    "v=mcp1 endpoint=https://example.com/mcp"
```

---

## 🏗️ DNS RECORD FORMATS

### Verification Record (Temporary)
```dns
# Record Name Pattern
_mcp-verify.{DOMAIN}

# Record Value Pattern  
mcp_verify_{RANDOM_TOKEN}

# Example
_mcp-verify.gmail.com.      TXT    "mcp_verify_abc123xyz789"
```

### Service Discovery Record (Permanent)
```dns
# Basic Service Record
_mcp.{DOMAIN}               TXT    "v=mcp1 endpoint={ENDPOINT_URL}"

# Extended Service Record (Optional)
_mcp-meta.{DOMAIN}          TXT    "v=mcp1 capabilities={CAP1,CAP2} auth={AUTH_TYPE}"

# Examples
_mcp.gmail.com.             TXT    "v=mcp1 endpoint=https://gmail.com/mcp"
_mcp-meta.gmail.com.        TXT    "v=mcp1 capabilities=email,calendar auth=oauth2"
```

---

## 🔄 VERIFICATION ALGORITHMS

### Token Generation
```typescript
function generateVerificationToken(): string {
  // Cryptographically secure random token
  const randomBytes = crypto.randomBytes(16);
  return randomBytes.toString('hex');
}

function createVerificationChallenge(domain: string) {
  const token = generateVerificationToken();
  return {
    record_name: `_mcp-verify.${domain}`,
    record_value: `mcp_verify_${token}`,
    token,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  };
}
```

### DNS Verification Check
```typescript
async function verifyDNSRecord(domain: string, expectedToken: string): Promise<boolean> {
  try {
    const recordName = `_mcp-verify.${domain}`;
    
    // Resolve TXT records
    const records = await dns.resolveTxt(recordName);
    
    // Check if any record contains our token
    const found = records.some(recordArray => {
      const recordValue = recordArray.join('');
      return recordValue.includes(`mcp_verify_${expectedToken}`);
    });
    
    return found;
  } catch (dnsError) {
    // DNS lookup failed - record doesn't exist
    return false;
  }
}
```

### Continuous Verification Polling
```typescript
async function pollVerification(challenge: VerificationChallenge) {
  const maxAttempts = 40; // 20 minutes of polling
  const pollInterval = 30000; // 30 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const verified = await verifyDNSRecord(challenge.domain, challenge.token);
    
    if (verified) {
      await markDomainVerified(challenge.domain);
      await createPermanentServiceRecord(challenge.domain);
      return { success: true, verified_at: new Date() };
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  return { success: false, reason: 'timeout' };
}
```

---

## 🛡️ SECURITY CONSIDERATIONS

### Token Entropy
```typescript
// Minimum 128 bits of entropy
const TOKEN_LENGTH = 16; // 16 bytes = 128 bits
const TOKEN_CHARSET = '0123456789abcdef'; // Hex encoding

// Collision probability: 1 in 2^128 (negligible)
```

### Time-based Expiration
```typescript
const CHALLENGE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const VERIFICATION_WINDOW = 20 * 60 * 1000; // 20 minutes max polling

// Prevents replay attacks and stale challenges
```

### DNS Cache Considerations
```typescript
// Use multiple DNS resolvers for verification
const DNS_RESOLVERS = [
  '8.8.8.8',    // Google
  '1.1.1.1',    // Cloudflare  
  '208.67.222.222', // OpenDNS
];

// Check against multiple resolvers to avoid cache issues
async function verifyWithMultipleResolvers(domain: string, token: string) {
  const promises = DNS_RESOLVERS.map(resolver => 
    verifyDNSRecord(domain, token, { resolver })
  );
  
  const results = await Promise.allSettled(promises);
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  
  // Require majority consensus (2 out of 3)
  return successCount >= 2;
}
```

---

## 📊 VERIFICATION STATES

### State Machine
```typescript
enum VerificationStatus {
  PENDING = 'pending',           // Challenge created, waiting for DNS
  VERIFYING = 'verifying',       // DNS record found, confirming
  VERIFIED = 'verified',         // Successfully verified
  FAILED = 'failed',             // Verification failed
  EXPIRED = 'expired',           // Challenge expired
  REVOKED = 'revoked'            // Manually revoked
}

interface VerificationRecord {
  registration_id: string;
  domain: string;
  status: VerificationStatus;
  challenge_token: string;
  created_at: Date;
  verified_at?: Date;
  expires_at: Date;
  attempts: number;
  last_check: Date;
}
```

### State Transitions
```
pending → verifying → verified
       ↘ failed
       ↘ expired

verified → revoked (manual action)
```

---

## 🔧 IMPLEMENTATION DETAILS

### Database Schema
```sql
CREATE TABLE domain_verifications (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  challenge_token VARCHAR(64) NOT NULL,
  record_name VARCHAR(300) NOT NULL,
  record_value VARCHAR(300) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  last_check TIMESTAMP,
  failure_reason TEXT
);

CREATE INDEX idx_domain_verifications_domain ON domain_verifications(domain);
CREATE INDEX idx_domain_verifications_status ON domain_verifications(status);
CREATE INDEX idx_domain_verifications_expires ON domain_verifications(expires_at);
```

### Background Job Processing
```typescript
// Redis-based job queue for verification polling
import Bull from 'bull';

const verificationQueue = new Bull('dns verification', {
  redis: { host: 'localhost', port: 6379 }
});

// Add verification job
async function scheduleVerification(challenge: VerificationChallenge) {
  await verificationQueue.add('verify-dns', challenge, {
    delay: 30000, // Start checking after 30 seconds
    repeat: { every: 30000 }, // Check every 30 seconds
    removeOnComplete: true,
    removeOnFail: false
  });
}

// Process verification jobs
verificationQueue.process('verify-dns', async (job) => {
  const challenge = job.data;
  const result = await verifyDNSRecord(challenge.domain, challenge.token);
  
  if (result) {
    await markDomainVerified(challenge.domain);
    await job.remove(); // Stop polling
    return { verified: true };
  }
  
  // Continue polling if not expired
  if (Date.now() > challenge.expires_at.getTime()) {
    await markVerificationExpired(challenge.registration_id);
    await job.remove();
    throw new Error('Verification expired');
  }
  
  return { verified: false };
});
```

---

## 🌐 WELL-KNOWN ENDPOINTS

### Auto-Discovery Support
```http
# Standard well-known endpoint for MCP discovery
GET /.well-known/mcp

Response:
{
  "version": "mcp1",
  "endpoint": "https://example.com/mcp",
  "capabilities": ["email", "calendar"],
  "auth_type": "oauth2",
  "documentation": "https://example.com/docs/mcp"
}
```

### DNS-Based Discovery
```dns
# Alternative: DNS-only discovery (no HTTP required)
_mcp.example.com.     TXT "v=mcp1 endpoint=https://example.com/mcp"
_mcp.example.com.     TXT "capabilities=email,calendar"
_mcp.example.com.     TXT "auth=oauth2"
```

---

## 🔍 MONITORING & ALERTS

### Verification Metrics
```typescript
interface VerificationMetrics {
  total_challenges_created: number;
  successful_verifications: number;
  failed_verifications: number;
  expired_challenges: number;
  avg_verification_time_seconds: number;
  dns_lookup_errors: number;
}
```

### Alert Conditions
```yaml
alerts:
  verification_failure_rate:
    threshold: 10%
    window: 1h
    severity: warning
    
  dns_resolver_errors:
    threshold: 5%
    window: 15m
    severity: critical
    
  verification_timeout_rate:
    threshold: 20%
    window: 1h
    severity: warning
```

---

**This DNS verification system ensures only legitimate domain owners can register MCP servers, creating a trusted and secure discovery ecosystem.**

🔐 **Cryptographically secure. Automatically verified. Impossible to fake.**
