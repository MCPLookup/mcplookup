# MCPLookup.org User Guide 📚

Complete guide for discovering, registering, and using MCP servers through MCPLookup.org.

## 🎯 Quick Start

### I'm an AI Agent Developer
**Goal**: Find MCP servers for your AI agent to use

1. **Search by domain**: `GET /api/v1/discover/domain/gmail.com`
2. **Search by capability**: `GET /api/v1/discover/capability/email`
3. **Filter results**: Add `?verified=true&health=healthy`
4. **Connect to server**: Use the returned endpoint in your MCP client

### I'm an MCP Server Developer  
**Goal**: Make your server discoverable by AI agents

1. **Register server**: `POST /api/v1/register` with your domain and endpoint
2. **Verify ownership**: Add DNS TXT record and call verify endpoint
3. **Monitor health**: We'll automatically check your server's status
4. **Update info**: Re-register to update capabilities or endpoint

### I'm Just Curious
**Goal**: Understand what MCP servers are available

1. **Browse servers**: Visit [mcplookup.org/discover](https://mcplookup.org/discover)
2. **Search by capability**: Try "email", "calendar", "database", etc.
3. **View server details**: See capabilities, health status, and trust scores
4. **Learn about MCP**: Read our [What is this?](WHAT_IS_THIS.md) guide

## 🔍 Discovery Guide

### Web Interface Discovery

Visit [mcplookup.org/discover](https://mcplookup.org/discover) for a user-friendly search interface:

**Search Options:**
- **Domain search**: Find servers for specific domains (gmail.com, slack.com)
- **Capability search**: Find servers with specific abilities (email, calendar)

**Filters:**
- **Verified only**: Show only DNS-verified servers
- **Health status**: Filter by healthy/degraded/down servers  
- **Trust score**: Minimum trust score (0-100)

**Results:**
- Server domain and endpoint
- Available capabilities
- Health status and response time
- Trust score and verification status
- "Connect" button with connection details

### API Discovery

#### Basic Search
```bash
# Find all servers
curl https://mcplookup.org/api/v1/discover

# Search with query
curl "https://mcplookup.org/api/v1/discover?q=email"

# Domain-specific search
curl https://mcplookup.org/api/v1/discover/domain/gmail.com

# Capability-specific search  
curl https://mcplookup.org/api/v1/discover/capability/email
```

#### Advanced Filtering
```bash
# Verified servers only
curl "https://mcplookup.org/api/v1/discover?verified=true"

# Healthy servers with high trust score
curl "https://mcplookup.org/api/v1/discover?health=healthy&min_trust_score=80"

# Pagination
curl "https://mcplookup.org/api/v1/discover?page=2&limit=20"

# Combined filters
curl "https://mcplookup.org/api/v1/discover?capability=email&verified=true&health=healthy"
```

#### Response Format
```json
{
  "servers": [
    {
      "domain": "gmail.com",
      "endpoint": "https://gmail.com/.well-known/mcp",
      "capabilities": ["email", "contacts"],
      "verified": true,
      "health": "healthy",
      "trust_score": 95,
      "response_time_ms": 120,
      "last_check": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total_count": 150,
    "page": 1,
    "limit": 10,
    "has_more": true
  }
}
```

## 📝 Registration Guide

### Prerequisites

Before registering your MCP server:

1. **Working MCP endpoint**: Your server must respond to MCP protocol requests
2. **Domain ownership**: You must control DNS for the domain
3. **HTTPS endpoint**: Production servers should use HTTPS
4. **Stable endpoint**: URL should remain consistent

### Step 1: Register Your Server

```bash
curl -X POST https://mcplookup.org/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "mycompany.com",
    "endpoint": "https://mycompany.com/api/mcp",
    "capabilities": ["email", "calendar", "crm"],
    "contact_email": "admin@mycompany.com",
    "description": "Company productivity tools via MCP"
  }'
```

**Response:**
```json
{
  "challenge_id": "abc123-def456-ghi789",
  "domain": "mycompany.com", 
  "txt_record_name": "_mcp-verify.mycompany.com",
  "txt_record_value": "mcp_verify_abc123def456",
  "expires_at": "2024-01-16T10:30:00Z",
  "instructions": "Add the DNS TXT record to verify ownership..."
}
```

### Step 2: Add DNS TXT Record

Add the TXT record to your DNS:

**Record Details:**
- **Type**: TXT
- **Name**: `_mcp-verify.mycompany.com` (or just `_mcp-verify` in some DNS panels)
- **Value**: `mcp_verify_abc123def456` (from registration response)
- **TTL**: 300 (5 minutes) or your DNS provider's minimum

**DNS Provider Examples:**

**Cloudflare:**
1. Go to DNS settings for your domain
2. Click "Add record"
3. Type: TXT, Name: `_mcp-verify`, Content: `mcp_verify_abc123def456`

**Namecheap:**
1. Go to Advanced DNS
2. Add New Record: TXT Record
3. Host: `_mcp-verify`, Value: `mcp_verify_abc123def456`

**GoDaddy:**
1. Go to DNS Management
2. Add record: TXT
3. Name: `_mcp-verify`, Value: `mcp_verify_abc123def456`

### Step 3: Verify Ownership

After adding the DNS record (wait 5-10 minutes for propagation):

```bash
curl -X POST https://mcplookup.org/api/v1/register/verify/abc123-def456-ghi789
```

**Success Response:**
```json
{
  "verified": true,
  "domain": "mycompany.com",
  "message": "Domain ownership verified successfully"
}
```

### Step 4: Check Registration Status

```bash
curl https://mcplookup.org/api/v1/discover/domain/mycompany.com
```

Your server should now appear in search results with `"verified": true`.

## 🔧 Server Requirements

### MCP Protocol Compliance

Your server must implement the MCP protocol:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "mcplookup-verifier",
      "version": "1.0.0"
    }
  }
}
```

### Health Check Requirements

MCPLookup.org will periodically check your server:

1. **HTTP GET** to your endpoint (should return 200-299 or 405)
2. **MCP initialize** request (should return valid MCP response)
3. **Response time** monitoring (< 5 seconds expected)

### Well-Known Endpoint (Optional)

For automatic discovery, serve MCP server info at:
```
https://yourdomain.com/.well-known/mcp
```

**Example response:**
```json
{
  "servers": [
    {
      "endpoint": "https://yourdomain.com/api/mcp",
      "capabilities": ["email", "calendar"],
      "description": "Company productivity tools"
    }
  ]
}
```

## 🎛️ Advanced Features

### Trust Scoring

Trust scores (0-100) are calculated based on:
- **Domain verification** (+30 points)
- **Uptime history** (up to +25 points)
- **Response time** (up to +20 points)
- **Protocol compliance** (up to +15 points)
- **Age of registration** (up to +10 points)

### Health Monitoring

We monitor your server every 5 minutes:
- **Healthy**: Responding normally (< 2s response time)
- **Degraded**: Slow responses (2-5s response time)
- **Down**: Not responding or errors

### Rate Limiting

**Discovery API:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

**Registration API:**
- 10 registrations per hour per IP
- 5 verification attempts per challenge

## 🚨 Troubleshooting

### Common Registration Issues

**"Domain verification failed"**
- Check DNS TXT record is correct
- Wait 10-15 minutes for DNS propagation
- Use `dig _mcp-verify.yourdomain.com TXT` to verify

**"Endpoint not responding"**
- Ensure your MCP server is running
- Check HTTPS certificate is valid
- Verify endpoint returns valid MCP responses

**"Invalid capabilities"**
- Use standard capability names: email, calendar, database, etc.
- Avoid special characters or spaces
- Maximum 10 capabilities per server

### Common Discovery Issues

**"No servers found"**
- Try broader search terms
- Remove filters to see all results
- Check if domain has registered servers

**"Server appears down"**
- Check server health status
- Verify endpoint is accessible
- Contact server administrator

### Getting Help

1. **Documentation**: [mcplookup.org/docs](https://mcplookup.org/docs)
2. **API Reference**: [mcplookup.org/api/docs](https://mcplookup.org/api/docs)
3. **GitHub Issues**: [github.com/TSavo/mcplookup.org/issues](https://github.com/TSavo/mcplookup.org/issues)
4. **Community**: [github.com/TSavo/mcplookup.org/discussions](https://github.com/TSavo/mcplookup.org/discussions)

## 📊 Monitoring Your Server

### Check Server Status
```bash
# View your server's current status
curl https://mcplookup.org/api/v1/discover/domain/yourdomain.com

# Check health history (coming soon)
curl https://mcplookup.org/api/v1/health/yourdomain.com
```

### Update Server Information
```bash
# Re-register to update capabilities or endpoint
curl -X POST https://mcplookup.org/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "yourdomain.com",
    "endpoint": "https://yourdomain.com/new-mcp-endpoint",
    "capabilities": ["email", "calendar", "tasks"]
  }'
```

---

**Need more help?** Check our [comprehensive documentation](https://mcplookup.org/docs) or [open an issue](https://github.com/TSavo/mcplookup.org/issues).
