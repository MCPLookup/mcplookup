# MCPLookup.org FAQ 🤔

**🔥 The End of Hardcoded Lists: Frequently Asked Questions**

Everything you need to know about **the service that's eliminating hardcoded lists from AI forever**.

## 🌟 General Questions

### What is MCPLookup.org?

**MCPLookup.org is the MCP server that discovers all other MCP servers - eliminating hardcoded lists from AI forever.** Think of it as "DNS for AI tools" but more importantly, it's **the death knell for static configuration**. AI agents connect to MCPLookup.org via native MCP protocol and discover any tool they need dynamically.

### What is MCP (Model Context Protocol)?

MCP is like "APIs for AI agents" - it's a standardized way for AI assistants to connect to external tools and services. Instead of every AI having to build custom integrations, MCP provides a universal protocol that works with any compatible tool.

### Why do I need MCPLookup.org?

**Because hardcoded lists are the biggest problem in AI today.** Without MCPLookup.org, every AI agent maintains static, hardcoded lists of servers that break, become stale, and limit innovation. MCPLookup.org eliminates this forever with dynamic discovery - **making AI tools as discoverable as websites**.

### Is MCPLookup.org free to use?

Yes! MCPLookup.org is completely free and open source. The discovery API has no usage fees, and registration is free. We may offer premium features in the future, but the core service will always be free.

## 🔍 Discovery Questions

### How do I find MCP servers?

You can discover MCP servers in several ways:

1. **Web interface**: Visit [mcplookup.org/discover](https://mcplookup.org/discover)
2. **API**: Use our REST API endpoints
3. **Domain search**: Find servers for specific domains (gmail.com, slack.com)
4. **Capability search**: Find servers with specific abilities (email, calendar)

### What information do I get about each server?

For each server, you get:
- Domain and endpoint URL
- Available capabilities and tools
- Health status and response time
- Trust score and verification status
- Authentication requirements
- Connection instructions

### How accurate is the server information?

We continuously monitor all registered servers and update their status every 5 minutes. DNS-based discovery happens in real-time. However, server capabilities and descriptions depend on what server owners provide.

### Can I filter search results?

Yes! You can filter by:
- **Verification status**: Only show DNS-verified servers
- **Health status**: Only show healthy/degraded/down servers
- **Trust score**: Minimum trust score (0-100)
- **Capabilities**: Specific abilities like email, calendar, etc.

## 📝 Registration Questions

### How do I register my MCP server?

1. **Register**: POST to `/api/v1/register` with your domain and endpoint
2. **Verify**: Add the DNS TXT record we provide
3. **Confirm**: Call the verification endpoint
4. **Done**: Your server is now discoverable!

See our [User Guide](USER_GUIDE.md) for detailed steps.

### What are the requirements for registration?

Your server must:
- Implement the MCP protocol correctly
- Be accessible via HTTPS (recommended) or HTTP
- Respond to health checks within 5 seconds
- Have a stable endpoint URL
- Be owned by you (domain verification required)

### How long does verification take?

DNS verification typically takes 5-15 minutes after you add the TXT record. Some DNS providers may take longer to propagate changes globally.

### Can I update my server information?

Yes! Simply re-register with updated information. Your verification status will be preserved as long as you use the same domain.

### What if my server goes down?

We monitor all servers every 5 minutes. If your server becomes unreachable:
- Status changes to "degraded" after 2 failed checks
- Status changes to "down" after 5 failed checks
- Trust score decreases based on downtime
- Server remains discoverable but with updated status

## 🔐 Security & Trust Questions

### How do you verify domain ownership?

We use DNS TXT record verification:
1. You add a unique TXT record to `_mcp-verify.yourdomain.com`
2. We query DNS to confirm the record exists
3. Only verified domains get the "verified" badge

### What is the trust score?

Trust scores (0-100) are calculated based on:
- **Domain verification** (+30 points)
- **Uptime history** (up to +25 points)
- **Response time** (up to +20 points)
- **Protocol compliance** (up to +15 points)
- **Age of registration** (up to +10 points)

### Is my data safe?

Yes! We only store:
- Public server information (domain, endpoint, capabilities)
- Health check results
- Verification status

We don't store:
- Personal data (unless you sign in)
- Server credentials or API keys
- User interactions with servers
- Private server information

### Can I remove my server?

Yes! Contact us or submit a GitHub issue to remove your server from the registry. DNS-based discovery will continue to work if you have the appropriate records.

## 🛠️ Technical Questions

### What's the API rate limit?

- **Discovery API**: 100 requests per minute
- **Registration API**: 10 requests per hour
- **Health API**: 50 requests per minute

Higher limits available with API keys (coming soon).

### Do you support CORS?

Yes! All API endpoints support CORS, so you can call them directly from web applications.

### What response format do you use?

All APIs return JSON. Successful responses include the requested data, while errors include an error code and human-readable message.

### Can I self-host MCPLookup.org?

Absolutely! MCPLookup.org is open source and designed to be self-hostable. See our [Developer Guide](DEVELOPER_GUIDE.md) for setup instructions.

### What happens if MCPLookup.org goes down?

The service is designed for high availability:
- Deployed on Vercel's global edge network
- Serverless architecture with automatic scaling
- Multiple discovery methods (DNS, well-known endpoints)
- Open source, so you can run your own instance

## 🤖 AI Agent Integration

### How do AI agents use MCPLookup.org?

AI agents can:
1. Search for servers by capability: "Find email servers"
2. Discover servers for specific domains: "Find Gmail MCP server"
3. Filter by trust and health: "Find verified, healthy calendar servers"
4. Get connection details and start using the servers

### Is there a native MCP server?

**Yes! MCPLookup.org IS a native MCP server.** AI agents connect to `mcp://mcplookup.org/api/mcp` and use tools like `discover_mcp_servers` to find other servers dynamically. This is the key to eliminating hardcoded lists - **one MCP connection discovers all others**.

### Can I integrate MCPLookup.org into my AI application?

Yes! Our REST API is designed for easy integration. See our [API Specification](API_SPECIFICATION.md) for details.

### Do you provide SDKs or client libraries?

Not yet, but our REST API is simple to use with any HTTP client. We may provide official SDKs in the future.

## 🔥 Revolutionary Vision Questions

### What's the future you're proposing?

**The complete elimination of hardcoded lists in favor of dynamic registries.** Just like we don't manually type IP addresses anymore (thanks to DNS), AI agents shouldn't maintain hardcoded server lists. **The future is registries like MCPLookup.org** - dynamic, real-time, intelligent discovery that scales infinitely.

### How does this solve the biggest problem in AI?

**Static configuration is the bottleneck preventing AI from reaching its potential.** Every new tool requires manual integration, every server change breaks connections, every AI agent maintains its own incomplete list. **Dynamic discovery eliminates this friction** - AI agents discover tools in real-time, just like web browsers discover websites.

### What happens to existing hardcoded lists?

**They become obsolete.** MCPLookup.org provides a bridge for legacy systems, but the future is clear: **replace all hardcoded lists with registry-based discovery**. This isn't just better - it's inevitable.

## 🌍 Ecosystem Questions

### How many MCP servers are registered?

Check our [stats endpoint](https://mcplookup.org/api/v1/stats) for current numbers. The ecosystem is growing rapidly!

### What types of servers are available?

Common categories include:
- **Productivity**: Email, calendar, task management
- **Communication**: Chat, messaging, video calls
- **Data**: Databases, analytics, file storage
- **Development**: Code repositories, CI/CD, monitoring
- **Business**: CRM, accounting, project management

### Can I suggest new features?

Absolutely! We welcome suggestions:
- [GitHub Issues](https://github.com/TSavo/mcplookup.org/issues) for bugs and feature requests
- [GitHub Discussions](https://github.com/TSavo/mcplookup.org/discussions) for ideas and questions
- [Pull Requests](https://github.com/TSavo/mcplookup.org/pulls) for contributions

### How can I contribute?

Many ways to help:
- **Register your MCP server** to grow the ecosystem
- **Report issues** or suggest improvements
- **Contribute code** - we're open source!
- **Write documentation** or tutorials
- **Spread the word** about MCP and MCPLookup.org

## 🚨 Troubleshooting

### My server isn't showing up in search results

Check:
1. **Registration status**: Did verification complete successfully?
2. **Health status**: Is your server responding to health checks?
3. **Search terms**: Try broader search terms or remove filters
4. **DNS propagation**: Wait 15-30 minutes after DNS changes

### DNS verification is failing

Common issues:
1. **Wrong record name**: Use `_mcp-verify.yourdomain.com`
2. **Wrong record value**: Copy exactly from registration response
3. **DNS propagation**: Wait 10-15 minutes after adding record
4. **DNS provider**: Some providers have different interfaces

Use `dig _mcp-verify.yourdomain.com TXT` to check if the record is visible.

### My server shows as "down" but it's working

Check:
1. **Response time**: Must respond within 5 seconds
2. **MCP compliance**: Must return valid MCP responses
3. **HTTPS certificate**: Must be valid if using HTTPS
4. **Firewall**: Must be accessible from the internet

### API requests are being rate limited

- **Slow down**: Respect the rate limits
- **Cache responses**: Don't request the same data repeatedly
- **Use filters**: Be more specific in your queries
- **Contact us**: For higher limits if you have a legitimate use case

## 📞 Getting Help

### Where can I get support?

1. **Documentation**: Start with our comprehensive guides
2. **GitHub Issues**: For bugs and technical problems
3. **GitHub Discussions**: For questions and ideas
4. **Community**: Join the MCP community discussions

### How do I report a bug?

1. Check if it's already reported in [GitHub Issues](https://github.com/TSavo/mcplookup.org/issues)
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (browser, OS, etc.)

### How do I request a feature?

1. Check [GitHub Discussions](https://github.com/TSavo/mcplookup.org/discussions) for existing requests
2. Create a new discussion with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation ideas

### Is there a community forum?

Yes! Use [GitHub Discussions](https://github.com/TSavo/mcplookup.org/discussions) for:
- Questions and answers
- Feature discussions
- Sharing ideas
- Community support

---

**Still have questions?** Check our [documentation](https://mcplookup.org/docs) or [ask the community](https://github.com/TSavo/mcplookup.org/discussions)!
