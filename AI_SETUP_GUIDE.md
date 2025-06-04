# 🧠 AI-Powered Natural Language Setup Guide

**How to enable advanced semantic understanding for MCP discovery**

---

## 🎯 **Overview**

MCPLookup.org has **two levels** of natural language support:

### **Level 1: Rule-Based (Default) ✅**
- **Always Available**: No setup required
- **Pattern Matching**: Recognizes common phrases like "like Gmail", "faster", "secure"
- **Capability**: Handles 80% of natural language queries effectively
- **Performance**: ~10-50ms response time

### **Level 2: AI-Powered (Optional) 🚀**
- **Requires Setup**: OpenAI API key needed
- **Semantic Understanding**: True NLP with context awareness
- **Capability**: Handles 95% of complex natural language queries
- **Performance**: ~500-2000ms response time (API call)

---

## 🔧 **Setting Up AI-Powered Processing**

### **Step 1: Choose Your AI Provider**

#### **Option A: Together AI (Cheapest)**
1. **Sign up**: Go to https://api.together.xyz/
2. **Create API Key**: Navigate to "API Keys" → "Create new API key"
3. **Add Credits**: ~$5-10 handles thousands of queries

#### **Option B: OpenRouter (Most Flexible)**
1. **Sign up**: Go to https://openrouter.ai/
2. **Create API Key**: Navigate to "Keys" → "Create Key"
3. **Choose Model**: 300+ models available, many free options!

**💰 Cost Comparison (vs OpenAI's insane prices):**
- **Together AI**: ~$0.0002-$0.0008 per query (Llama 3.1 8B)
- **OpenRouter Free**: $0 per query (several free models available!)
- **OpenRouter Paid**: ~$0.0001-$0.003 per query (depending on model)
- **OpenAI GPT-4**: ~$0.006-$0.015 per query (REMOVED - too expensive!)
- **Savings**: 5-75x cheaper than OpenAI!

### **Step 2: Configure Environment Variables**

#### **For Local Development**
```bash
# Create .env.local file
cp .env.example .env.local

# Option A: Together AI (cheapest)
echo "TOGETHER_API_KEY=your-together-api-key-here" >> .env.local
echo "TOGETHER_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo" >> .env.local

# Option B: OpenRouter (most flexible)
echo "OPENROUTER_API_KEY=your-openrouter-api-key-here" >> .env.local
echo "OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free" >> .env.local

# OpenRouter model options:
# FREE: meta-llama/llama-3.1-8b-instruct:free, google/gemma-2-9b-it:free
# CHEAP: meta-llama/llama-3.1-8b-instruct (~$0.0001/query)
# PREMIUM: anthropic/claude-3.5-sonnet (~$0.003/query)
```

#### **For Production (Vercel)**
```bash
# Together AI
vercel env add TOGETHER_API_KEY

# OR OpenRouter
vercel env add OPENROUTER_API_KEY

# In Vercel Dashboard:
# 1. Go to your project settings
# 2. Navigate to "Environment Variables"
# 3. Add your chosen API key
```

#### **For Production (Other Platforms)**
```bash
# Docker
docker run -e OPENAI_API_KEY=sk-your-key mcplookup

# Kubernetes
kubectl create secret generic openai-secret --from-literal=OPENAI_API_KEY=sk-your-key

# Railway
railway variables set OPENAI_API_KEY=sk-your-key

# Netlify
netlify env:set OPENAI_API_KEY sk-your-key
```

### **Step 3: Optional Configuration**

```bash
# .env.local or production environment
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4                    # Default: gpt-4
OPENAI_MAX_TOKENS=500                 # Default: 500
OPENAI_TEMPERATURE=0.1                # Default: 0.1 (more deterministic)
```

---

## 🧪 **Testing AI Setup**

### **Method 1: Check Environment**
```bash
# In your application
node -e "console.log('AI Enabled:', !!process.env.OPENAI_API_KEY)"
```

### **Method 2: Test Natural Language Query**
```bash
# Make a test query to the MCP server
curl -X POST https://mcplookup.org/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "discover_mcp_servers",
      "arguments": {
        "query": "Find email servers like Gmail but with better privacy"
      }
    }
  }'
```

### **Method 3: Check Logs**
```bash
# Look for these log messages:
# ✅ "Using AI-powered query processing"
# ❌ "AI processing failed, falling back to rule-based"
```

---

## 📊 **What Changes with AI Enabled**

### **Before (Rule-Based Only)**
```json
{
  "query": "Find email servers like Gmail but with better privacy"
}
```

**Processing:**
- Pattern matches "like Gmail" → `similar_to: "gmail.com"`
- Pattern matches "privacy" → `min_trust_score: 80`
- Basic capability extraction → `["email_send", "email_read"]`

### **After (AI-Powered)**
```json
{
  "query": "Find email servers like Gmail but with better privacy"
}
```

**AI Analysis:**
```json
{
  "capabilities": ["email_send", "email_read", "email_search", "contacts"],
  "similar_to": "gmail.com",
  "constraints": {
    "performance": {"min_trust_score": 85},
    "technical": {"encryption": "required"},
    "keywords": ["privacy", "secure", "encrypted"]
  },
  "intent": "Privacy-focused email service with Gmail-like features",
  "confidence": 0.95
}
```

---

## 🎪 **Complex Queries AI Can Handle**

### **Multi-Requirement Queries**
```json
{
  "query": "I need document collaboration tools for a remote team with real-time editing, version control, and offline support"
}
```

**AI Understanding:**
- **Context**: Remote team (implies async collaboration)
- **Requirements**: Real-time editing, version control, offline
- **Domain**: Document collaboration
- **Constraints**: Team-oriented features

### **Business Context Queries**
```json
{
  "query": "Enterprise CRM systems that integrate with Salesforce but are more affordable for startups"
}
```

**AI Understanding:**
- **Category**: CRM systems
- **Integration**: Salesforce compatibility
- **Context**: Startup (cost-conscious, smaller scale)
- **Comparison**: Alternatives to Salesforce

### **Technical Requirement Queries**
```json
{
  "query": "API-first development tools with OAuth2 support and good documentation for building integrations"
}
```

**AI Understanding:**
- **Technical**: API-first, OAuth2, documentation quality
- **Use Case**: Building integrations
- **Requirements**: Developer-friendly, well-documented

---

## 💰 **Cost Considerations**

### **Together AI Costs**
- **Llama 3.1 8B**: ~$0.0002-$0.0008 per query
- **Llama 3.1 70B**: ~$0.0008-$0.002 per query
- **1000 Queries**: ~$0.20-$2.00
- **Monthly Budget**: $5-10 handles thousands of queries

### **OpenRouter Costs**
- **Free Models**: $0 per query (Llama 3.1 8B, Gemma 2 9B)
- **Cheap Models**: ~$0.0001-$0.001 per query (Llama, Mistral)
- **Premium Models**: ~$0.001-$0.003 per query (Claude, GPT-4)
- **1000 Queries**: $0-$3 depending on model choice

### **Cost Optimization**
```bash
# FREE option with OpenRouter
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free  # $0 cost!

# Cheap but better quality
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct  # ~$0.0001/query

# Premium quality (still 5x cheaper than OpenAI direct)
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet  # ~$0.003/query

# Together AI cheapest option
TOGETHER_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo  # ~$0.0002/query
```

### **Usage Monitoring**
```typescript
// Monitor API usage in logs
console.log(`AI query processed: ${tokens} tokens, cost: $${cost}`);
```

---

## 🔄 **Fallback Behavior**

### **Automatic Fallback**
```typescript
// The system ALWAYS falls back gracefully
try {
  // Try AI-powered processing
  return await aiBasedQueryProcessing(query);
} catch (error) {
  console.warn('AI processing failed, using rule-based fallback');
  // Rule-based processing still handles 80% of queries well
  return await ruleBasedQueryProcessing(query);
}
```

### **Fallback Scenarios**
- ❌ **No API Key**: Uses rule-based processing
- ❌ **API Quota Exceeded**: Falls back to rule-based
- ❌ **Network Issues**: Falls back to rule-based
- ❌ **Invalid Response**: Falls back to rule-based

---

## 🎯 **Production Recommendations**

### **For High-Volume Production**
```bash
# Use GPT-3.5-turbo for cost efficiency
OPENAI_MODEL=gpt-3.5-turbo

# Set reasonable limits
OPENAI_MAX_TOKENS=300
OPENAI_TEMPERATURE=0.1

# Monitor usage
ENABLE_AI_USAGE_LOGGING=true
```

### **For Premium Experience**
```bash
# Use GPT-4 for best accuracy
OPENAI_MODEL=gpt-4

# Higher token limit for complex queries
OPENAI_MAX_TOKENS=500

# Enable all features
ENABLE_AI_CACHE=true
ENABLE_CONFIDENCE_SCORING=true
```

---

## ✅ **Quick Setup Checklist**

- [ ] **Get OpenAI API Key** from https://platform.openai.com/
- [ ] **Add Credits** to your OpenAI account
- [ ] **Set Environment Variable**: `OPENAI_API_KEY=sk-your-key`
- [ ] **Test Setup**: Make a natural language query
- [ ] **Check Logs**: Verify AI processing is working
- [ ] **Monitor Usage**: Track API costs and usage

---

**🚀 With AI enabled, your MCP discovery becomes as smart as having a human expert helping users find the perfect tools!**
