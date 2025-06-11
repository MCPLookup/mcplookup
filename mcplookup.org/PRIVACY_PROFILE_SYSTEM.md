# Privacy & Profile Visibility System

## 🔒 **Privacy-First Profile System**

The MCPLookup.org user profile system is designed with **privacy by default** - all new accounts start with private profiles and users must explicitly choose to make their information public.

## **Privacy Settings Overview**

### **Profile Visibility Levels**

| Setting | GitHub Repos | Registered Servers | Activity Stats | Description |
|---------|-------------|-------------------|----------------|-------------|
| **Private** (default) | 🔒 "Private" | 🔒 "Private" | 🔒 "Private" | Complete privacy - nothing visible publicly |
| **Public** | ✅ Configurable | ✅ Configurable | ✅ Configurable | Fine-grained control over what's shown |

### **Individual Privacy Controls**

When profile is set to **Public**, users can individually control:

- 📚 **Show GitHub Repositories** - Display owned/verified repositories
- 🖥️ **Show Registered Servers** - Display registered MCP servers  
- 📊 **Show Activity Statistics** - Display server counts, GitHub stats, etc.

## **Privacy Implementation**

### **Backend Services**

All data services respect privacy settings:

```typescript
// GitHub Ownership Service
getUserOwnedRepositoriesWithPrivacy(userId, userPreferences)
getUserGitHubStats(userId, userPreferences)

// User Server Service  
getUserServersWithPrivacy(userId, userPreferences)
getUserServerStatsWithPrivacy(userId, userPreferences)
```

**Returns:** `'Private'` string when privacy settings restrict access, actual data when public.

### **API Endpoints**

#### **Dashboard APIs** (authenticated user only)
- `/api/dashboard/profile` - User's own profile management
- `/api/dashboard/servers` - User's own servers (respects privacy for display)

#### **Public APIs** (anyone can access)
- `/api/profile/[userId]` - Public profile viewing (respects privacy settings)

### **Privacy Defaults**

**New User Defaults (Secure by Default):**
```typescript
{
  profile_visibility: 'private',     // Profile is private
  show_github_repos: false,          // Don't show repositories
  show_registered_servers: false,    // Don't show servers
  show_activity_stats: false         // Don't show statistics
}
```

## **User Experience**

### **Private Profile Display**

When information is private, users see:
- 🔒 **"Private"** badges instead of counts
- 👁️‍🗨️ **Privacy explanations** in empty sections
- 🛡️ **Clear messaging** about privacy controls

### **Privacy Messaging Examples**

```
"GitHub repositories are private"
"Enable 'Show GitHub Repositories' and set profile to 'Public' to display your owned repositories"

"Registered servers are private"  
"Enable 'Show Registered Servers' and set profile to 'Public' to display your registered MCP servers"
```

## **Security Features**

### **Privacy Hierarchy**

1. **Profile Visibility = Private** → Everything private (overrides individual settings)
2. **Profile Visibility = Public** → Respect individual show_* settings
3. **Individual Settings** → Fine-grained control when public

### **Data Protection**

- **No Data Leakage:** Private settings return `'Private'` string, not empty arrays
- **Consistent UX:** All privacy states clearly indicated with icons and messaging
- **API Safety:** All endpoints check privacy before returning data

### **Visual Privacy Indicators**

- 👁️ **Eye icon** for public/visible content
- 👁️‍🗨️ **Eye-slash icon** for private/hidden content
- 🔒 **Lock icons** in privacy settings
- 🛡️ **Privacy badges** throughout the UI

## **API Examples**

### **Public Profile API Response**

**Private Profile:**
```json
{
  "id": "user123",
  "name": "Private User",
  "profile_visibility": "private",
  "github_repos": "Private",
  "registered_servers": "Private", 
  "activity_stats": "Private",
  "message": "This user has set their profile to private"
}
```

**Public Profile:**
```json
{
  "id": "user123",
  "name": "John Doe",
  "profile_visibility": "public",
  "github_repos": ["owner/repo1", "owner/repo2"],
  "registered_servers": [...],
  "activity_stats": {
    "github": { "total_repos": 2, "verification_count": 2 },
    "servers": { "total_servers": 5, "owned_servers": 3 }
  }
}
```

## **Implementation Benefits**

✅ **GDPR Compliant** - Users control their data visibility  
✅ **Security First** - Private by default prevents accidental exposure  
✅ **Granular Control** - Fine-tuned privacy settings  
✅ **Clear UX** - Always obvious what's private vs public  
✅ **Developer Friendly** - Consistent API patterns  
✅ **Scalable** - Easy to add new privacy controls

## **Future Enhancements**

- 🌐 **Public Profile Pages** - Dedicated user profile pages
- 📧 **Email Privacy** - Hide/show email addresses
- 🏷️ **Profile Descriptions** - User-written profile descriptions
- 📅 **Activity History Privacy** - Control over activity timestamps
- 🔗 **Social Links** - Optional social media links with privacy controls

The privacy system is **production-ready** and provides a strong foundation for user data protection while maintaining usability! 🚀
