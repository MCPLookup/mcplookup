# Domain Transfer Security Specification

## 🚨 **The Problem**

**Current Vulnerability**: Once a domain is verified, the original registrant can make changes indefinitely, even after transferring domain ownership.

**Attack Scenario**:
1. Alice owns `company.com`, registers MCP server
2. Alice sells domain to Bob
3. Alice retains ability to update MCP registration
4. Alice could redirect Bob's traffic to malicious endpoints

## 🔒 **Solution: Real-Time Verification**

### **Core Principles**

1. **Verify When It Matters**: Check domain ownership only when making significant changes
2. **No Arbitrary Expiry**: Registrations remain valid until proven otherwise
3. **Challenge-Response**: New owners can challenge existing registrations anytime
4. **Immediate Verification**: Changes require immediate proof of current ownership

### **Implementation Strategy**

#### **1. Smart Verification Triggers**
```typescript
interface DomainRegistration {
  domain: string;
  endpoint: string;
  verified_at: Date;
  last_verification_check: Date;  // NEW: Last time we verified ownership
  verification_method: 'dns_txt' | 'dns_cname' | 'well_known';
  verification_status: 'verified' | 'challenged' | 'revoked';
}

// No arbitrary expiry - verify when needed
const REQUIRES_VERIFICATION = [
  'endpoint_change',     // Changing MCP endpoint URL
  'major_capability_change', // Adding/removing core capabilities
  'ownership_challenge', // Someone challenges ownership
  'security_incident'    // Suspicious activity detected
];
```

#### **2. Real-Time Verification Logic**
```typescript
async function requiresOwnershipVerification(
  currentRegistration: DomainRegistration,
  updateRequest: UpdateRequest
): Promise<boolean> {
  // Always verify for endpoint changes (security critical)
  if (updateRequest.endpoint && updateRequest.endpoint !== currentRegistration.endpoint) {
    return true;
  }

  // Verify for major capability changes
  if (updateRequest.capabilities) {
    const currentCaps = new Set(currentRegistration.capabilities);
    const newCaps = new Set(updateRequest.capabilities);

    // Check if adding/removing core capabilities
    const coreCaps = ['file_system', 'database', 'network', 'authentication'];
    const coreChanges = coreCaps.some(cap =>
      currentCaps.has(cap) !== newCaps.has(cap)
    );

    if (coreChanges) return true;
  }

  // Minor changes don't require verification
  return false;
}

async function verifyCurrentOwnership(domain: string): Promise<boolean> {
  // Check if current DNS records still prove ownership
  const verificationRecord = `_mcp-verify.${domain}`;

  try {
    const records = await dns.resolveTxt(verificationRecord);
    // Look for any valid MCPLookup verification record
    return records.some(record =>
      record.join('').includes('mcplookup-verify=')
    );
  } catch {
    // No verification record found - ownership questionable
    return false;
  }
}
```

#### **3. Challenge System**
```typescript
// New owners can challenge existing registrations
interface DomainChallenge {
  challenge_id: string;
  domain: string;
  challenger_ip: string;
  challenge_type: 'ownership_transfer' | 'expired_verification';
  txt_record_name: string;
  txt_record_value: string;
  created_at: Date;
  expires_at: Date;
  status: 'pending' | 'verified' | 'failed' | 'expired';
}

async function initiateDomainChallenge(domain: string): Promise<DomainChallenge> {
  const token = generateSecureToken();
  const challenge: DomainChallenge = {
    challenge_id: randomUUID(),
    domain,
    challenger_ip: getClientIP(),
    challenge_type: 'ownership_transfer',
    txt_record_name: `_mcp-challenge.${domain}`,
    txt_record_value: `mcp_challenge_${token}`,
    created_at: new Date(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    status: 'pending'
  };
  
  await storageService.storeChallenge(challenge);
  return challenge;
}
```

#### **4. Automatic Monitoring**
```typescript
// Background job to check for expired verifications
async function monitorVerificationExpiry() {
  const expiredRegistrations = await storageService.getExpiredVerifications();
  
  for (const registration of expiredRegistrations) {
    // Mark as expired
    await storageService.updateRegistrationStatus(
      registration.domain, 
      'expired'
    );
    
    // Notify via webhook if configured
    await notificationService.sendExpiryNotification(registration);
    
    // Start grace period (30 days to re-verify)
    await scheduleGracePeriodExpiry(registration.domain);
  }
}

// Run every hour
setInterval(monitorVerificationExpiry, 60 * 60 * 1000);
```

### **Security Workflow**

#### **Scenario 1: Legitimate Update**
```typescript
// User wants to update endpoint
async function updateRegistration(domain: string, updates: UpdateRequest) {
  const current = await getRegistration(domain);
  
  if (await requiresReverification(current, updates)) {
    // Require fresh DNS verification
    const challenge = await initiateVerification(domain);
    return {
      status: 'verification_required',
      challenge,
      message: 'DNS verification required for this change'
    };
  }
  
  // Minor update, no verification needed
  await updateRegistrationDirect(domain, updates);
  return { status: 'updated' };
}
```

#### **Scenario 2: Domain Transfer**
```typescript
// New owner wants to claim domain
async function claimDomain(domain: string) {
  const existing = await getRegistration(domain);
  
  if (!existing) {
    // No existing registration, proceed normally
    return await initiateVerification(domain);
  }
  
  if (existing.verification_status === 'expired') {
    // Expired registration, new owner can claim
    return await initiateVerification(domain);
  }
  
  // Active registration exists, initiate challenge
  const challenge = await initiateDomainChallenge(domain);
  
  // Notify current registrant
  await notificationService.sendChallengeNotification(existing, challenge);
  
  return {
    status: 'challenge_initiated',
    challenge,
    message: 'Domain ownership challenge initiated. Current owner will be notified.'
  };
}
```

#### **Scenario 3: Challenge Resolution**
```typescript
async function resolveChallenge(challengeId: string) {
  const challenge = await getChallenge(challengeId);
  const verified = await verifyDNSRecord(
    challenge.txt_record_name, 
    challenge.txt_record_value
  );
  
  if (verified) {
    // Challenger proved ownership
    const existing = await getRegistration(challenge.domain);
    
    if (existing) {
      // Transfer ownership
      await archiveRegistration(existing, 'ownership_transferred');
    }
    
    // Create new registration for challenger
    await createNewRegistration(challenge.domain, challenge.challenger_ip);
    
    return { status: 'ownership_transferred' };
  }
  
  return { status: 'challenge_failed' };
}
```

### **Grace Periods & Notifications**

#### **Expiry Warning System**
```typescript
// Warn users before verification expires
const WARNING_PERIODS = [30, 14, 7, 1]; // days before expiry

async function sendExpiryWarnings() {
  for (const days of WARNING_PERIODS) {
    const expiringRegistrations = await getRegistrationsExpiringIn(days);
    
    for (const registration of expiringRegistrations) {
      await emailService.sendExpiryWarning(registration, days);
    }
  }
}
```

#### **Grace Period After Expiry**
```typescript
// 30-day grace period after expiry
const GRACE_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days

async function handleExpiredRegistration(domain: string) {
  const registration = await getRegistration(domain);
  
  // Mark as expired but keep discoverable
  await updateRegistrationStatus(domain, 'expired');
  
  // Schedule final removal after grace period
  setTimeout(async () => {
    const current = await getRegistration(domain);
    if (current.verification_status === 'expired') {
      await archiveRegistration(current, 'grace_period_expired');
    }
  }, GRACE_PERIOD);
}
```

### **API Endpoints**

#### **Challenge Domain Ownership**
```http
POST /api/v1/challenge/domain
{
  "domain": "example.com",
  "reason": "ownership_transfer"
}

Response:
{
  "challenge_id": "chg_abc123",
  "txt_record_name": "_mcp-challenge.example.com",
  "txt_record_value": "mcp_challenge_xyz789",
  "expires_at": "2024-01-16T10:00:00Z",
  "current_owner_notified": true
}
```

#### **Check Verification Status**
```http
GET /api/v1/verify/status/example.com

Response:
{
  "domain": "example.com",
  "verification_status": "verified",
  "verified_at": "2024-01-01T10:00:00Z",
  "expires_at": "2024-04-01T10:00:00Z",
  "days_until_expiry": 45,
  "pending_challenges": []
}
```

### **Migration Strategy**

#### **Existing Registrations**
```typescript
// Migrate existing registrations to new system
async function migrateExistingRegistrations() {
  const allRegistrations = await getAllRegistrations();
  
  for (const registration of allRegistrations) {
    // Set expiry date based on verification date
    const expiryDate = new Date(
      new Date(registration.verified_at).getTime() + VERIFICATION_TTL
    );
    
    await updateRegistration(registration.domain, {
      verification_expires_at: expiryDate,
      verification_status: new Date() > expiryDate ? 'expired' : 'verified'
    });
  }
}
```

### **Benefits**

1. **Security**: Prevents stale ownership claims
2. **Transparency**: Clear ownership transfer process
3. **Fairness**: New owners can claim their domains
4. **Reliability**: Expired registrations are cleaned up
5. **Trust**: Users know registrations are actively maintained

### **Implementation Timeline**

1. **Phase 1**: Add expiry tracking to existing registrations
2. **Phase 2**: Implement challenge system
3. **Phase 3**: Add monitoring and notifications
4. **Phase 4**: Migrate existing data with grace periods
