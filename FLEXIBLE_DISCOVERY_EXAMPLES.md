# 🔍 Flexible Discovery Protocol Examples

**How AI agents can express complex search requirements naturally**

---

## 🎯 **The Problem with Rigid Discovery**

### **Before: Rigid and Limited**
```json
// Old way: Agents forced into predefined boxes
{
  "capability": "email",           // Only one capability
  "category": "communication",     // Predefined enum
  "verified_only": true           // Boolean only
}
```

**Limitations:**
- ❌ Can't combine capabilities: "email AND calendar"
- ❌ Can't express preferences: "like Gmail but faster"
- ❌ Can't exclude options: "NOT Slack"
- ❌ Can't do similarity search: "similar to GitHub"

### **After: Flexible and Expressive**
```json
// New way: Agents can express complex requirements naturally
{
  "query": "Find email servers like Gmail but with better privacy",
  "capabilities": {
    "operator": "AND",
    "required": ["email_send", "email_read"],
    "preferred": ["calendar", "contacts"],
    "exclude": ["social_media"]
  },
  "similar_to": {
    "domain": "gmail.com",
    "threshold": 0.7,
    "exclude_reference": true
  },
  "performance": {
    "min_trust_score": 80,
    "max_response_time": 200
  }
}
```

---

## 🚀 **Discovery Examples**

### **1. Natural Language Queries**

#### **Simple Intent**
```json
{
  "query": "I need to send emails"
}
```

#### **Complex Requirements**
```json
{
  "query": "Find document collaboration tools like Google Docs but with better privacy and offline support"
}
```

#### **Comparative Search**
```json
{
  "query": "Show me alternatives to Slack that are faster and have better file sharing"
}
```

### **2. Capability Combinations**

#### **Required Capabilities (AND)**
```json
{
  "capabilities": {
    "operator": "AND",
    "required": ["email_send", "calendar", "contacts"],
    "minimum_match": 1.0
  }
}
```

#### **Flexible Capabilities (OR)**
```json
{
  "capabilities": {
    "operator": "OR", 
    "preferred": ["file_storage", "document_editing", "collaboration"],
    "minimum_match": 0.6
  }
}
```

#### **Exclusion (NOT)**
```json
{
  "capabilities": {
    "operator": "AND",
    "required": ["messaging"],
    "exclude": ["social_media", "public_channels"]
  }
}
```

### **3. Similarity-Based Discovery**

#### **Find Alternatives**
```json
{
  "similar_to": {
    "domain": "github.com",
    "threshold": 0.8,
    "exclude_reference": true
  },
  "performance": {
    "min_trust_score": 70
  }
}
```

#### **Find Competitors**
```json
{
  "similar_to": {
    "domain": "slack.com",
    "threshold": 0.6
  },
  "technical": {
    "auth_types": ["oauth2"],
    "cors_support": true
  }
}
```

### **4. Performance-Constrained Search**

#### **High-Performance Requirements**
```json
{
  "categories": ["productivity", "communication"],
  "performance": {
    "min_uptime": 99.5,
    "max_response_time": 100,
    "min_trust_score": 90,
    "verified_only": true,
    "healthy_only": true
  }
}
```

#### **Relaxed Performance**
```json
{
  "query": "Find any email servers, even experimental ones",
  "performance": {
    "verified_only": false,
    "healthy_only": false,
    "min_trust_score": 30
  }
}
```

### **5. Technical Requirements**

#### **Specific Auth Methods**
```json
{
  "capabilities": {
    "required": ["api_access"]
  },
  "technical": {
    "auth_types": ["oauth2", "api_key"],
    "transport": "streamable_http",
    "cors_support": true
  }
}
```

#### **Enterprise Requirements**
```json
{
  "query": "Enterprise-grade CRM systems",
  "technical": {
    "auth_types": ["oauth2", "saml"],
    "rate_limits": {
      "min_requests_per_hour": 10000
    }
  },
  "performance": {
    "min_uptime": 99.9,
    "min_trust_score": 95
  }
}
```

### **6. Multi-Domain Lookups**

#### **Batch Domain Check**
```json
{
  "domains": ["gmail.com", "outlook.com", "protonmail.com"],
  "include": {
    "health_metrics": true,
    "similar_servers": true
  }
}
```

### **7. Keyword and Category Search**

#### **Flexible Keyword Matching**
```json
{
  "keywords": ["collaboration", "real-time", "documents"],
  "categories": ["productivity", "content"],
  "sort_by": "relevance"
}
```

### **8. Custom Ranking**

#### **Performance-Focused Ranking**
```json
{
  "query": "Fast email servers",
  "sort_by": "performance",
  "ranking_weights": {
    "performance": 0.6,
    "trust_score": 0.3,
    "relevance": 0.1
  }
}
```

---

## 🎪 **Real-World Agent Scenarios**

### **Scenario 1: Email Migration**
```json
{
  "query": "I'm migrating from Gmail, need something with similar features but better privacy",
  "similar_to": {
    "domain": "gmail.com",
    "threshold": 0.8,
    "exclude_reference": true
  },
  "capabilities": {
    "required": ["email_send", "email_read", "calendar"],
    "preferred": ["contacts", "labels", "search"]
  },
  "keywords": ["privacy", "secure", "encrypted"],
  "performance": {
    "min_trust_score": 80
  }
}
```

### **Scenario 2: Development Workflow**
```json
{
  "query": "I need development tools that integrate well together",
  "capabilities": {
    "operator": "OR",
    "preferred": ["code_repository", "ci_cd", "issue_tracking", "deployment"]
  },
  "technical": {
    "auth_types": ["oauth2"],
    "cors_support": true
  },
  "include": {
    "similar_servers": true,
    "alternative_suggestions": true
  }
}
```

### **Scenario 3: Productivity Suite**
```json
{
  "query": "Complete productivity suite for small business",
  "capabilities": {
    "operator": "AND",
    "required": ["document_editing", "file_storage"],
    "preferred": ["calendar", "email", "video_calls", "project_management"]
  },
  "performance": {
    "min_uptime": 99.0,
    "verified_only": true
  },
  "technical": {
    "auth_types": ["oauth2", "saml"]
  }
}
```

---

## 🎯 **Benefits of Flexible Discovery**

### **For AI Agents**
- ✅ **Natural Expression**: Query in natural language
- ✅ **Complex Logic**: AND/OR/NOT capability combinations
- ✅ **Similarity Search**: Find alternatives and competitors
- ✅ **Performance Tuning**: Custom ranking weights
- ✅ **Constraint Handling**: Technical and performance requirements

### **For Users**
- ✅ **Better Results**: More precise matching
- ✅ **Contextual Suggestions**: Alternatives and similar options
- ✅ **Flexible Criteria**: Express exactly what they need
- ✅ **Discovery Learning**: Explore related tools

### **For the Ecosystem**
- ✅ **Richer Queries**: More sophisticated discovery patterns
- ✅ **Better Matching**: Semantic understanding of requirements
- ✅ **Ecosystem Growth**: Easier to find niche and specialized tools
- ✅ **Innovation**: Enables new discovery use cases

---

**🚀 The discovery protocol is now as flexible as the agents that use it!**
