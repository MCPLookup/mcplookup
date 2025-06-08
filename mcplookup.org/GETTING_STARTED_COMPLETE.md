# 🚀 Getting Started with MCPL - Complete Guide

**From Zero to MCP Hero in 30 Minutes**

## 🎯 **What You'll Learn**

By the end of this guide, you'll be able to:
- ✅ Install and configure the MCPL CLI
- ✅ Discover and install MCP servers
- ✅ Use MCP tools in Claude Desktop
- ✅ Monitor and manage your servers
- ✅ Troubleshoot common issues

---

## ⚡ **Quick Start (5 Minutes)**

### **Step 1: Install the CLI**
```bash
npm install -g @mcplookup-org/mcpl-cli
```

### **Step 2: Get Your API Key**
1. Visit [mcplookup.org/dashboard](https://mcplookup.org/dashboard)
2. Sign up or log in
3. Copy your API key

### **Step 3: Login**
```bash
mcpl login --key your-api-key
```

### **Step 4: Install Your First Server**
```bash
# Search for filesystem tools
mcpl search "filesystem tools"

# Install the filesystem server
mcpl install @modelcontextprotocol/server-filesystem

# Check status
mcpl status
```

### **Step 5: Test in Claude Desktop**
Open Claude Desktop and try:
> "Can you list the files in my Documents folder?"

🎉 **Congratulations\!** You now have a working MCP server\!

---

## 📚 **Complete Tutorial**

### **🔍 Part 1: Discovery and Search**

#### **Natural Language Search**
The easiest way to find servers is using natural language:

```bash
# Find email tools
mcpl search "email automation and management"

# Find development tools
mcpl search "code analysis and git integration"

# Find productivity tools
mcpl search "calendar scheduling and task management"
```

#### **Technical Search**
For more specific searches, use technical filters:

```bash
# Search by capability
mcpl search --capability email --verified-only

# Search by domain
mcpl search --domain gmail.com

# Search by category
mcpl search --category productivity --limit 10

# Search by transport protocol
mcpl search --transport streamable_http
```

#### **AI-Powered Smart Search**
Let AI recommend the best servers for your needs:

```bash
# Describe your use case
mcpl search "I'm building a customer service chatbot" --smart

# Get personalized recommendations
mcpl search "I need tools for data analysis and reporting" --smart
```

#### **Browse Available Servers**
Explore all available servers:

```bash
# Browse by category
mcpl list available --category communication
mcpl list available --category development
mcpl list available --category productivity

# Browse verified servers only
mcpl list available --verified-only

# Browse with health information
mcpl list available --include-health
```

### **📦 Part 2: Installation Modes**

#### **🎯 Direct Mode (Recommended for Beginners)**

Direct mode adds servers directly to your Claude Desktop configuration with Docker isolation.

```bash
# Basic installation
mcpl install @modelcontextprotocol/server-filesystem

# With auto-start
mcpl install @company/email-server --auto-start

# With custom memory limit
mcpl install @company/heavy-server --memory-limit 2g

# With environment variables
mcpl install @company/api-server --env API_KEY=secret --env DEBUG=true
```

**What happens:**
- ✅ Server added to Claude Desktop config
- ✅ Docker container created for security
- ✅ Automatic startup when Claude starts
- ✅ Tools available immediately in Claude

**Claude Desktop Config (Auto-Generated):**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcplookup/filesystem-server"],
      "env": {}
    }
  }
}
```

#### **🌉 Bridge Mode (Advanced Users)**

Bridge mode uses a single bridge server to manage multiple MCP servers dynamically.

```bash
# Install bridge server first
mcpl install @mcplookup-org/mcp-server --mode bridge

# Install servers in bridge mode
mcpl install @company/email-server --mode bridge --auto-start
mcpl install @company/calendar-server --mode bridge --auto-start
mcpl install @company/crm-server --mode bridge --auto-start
```

**What happens:**
- ✅ All servers managed by the bridge
- ✅ Tools prefixed with server names (e.g., `email_send`, `calendar_schedule`)
- ✅ Dynamic discovery and health monitoring
- ✅ Single entry point in Claude Desktop

**Claude Desktop Config (Single Entry):**
```json
{
  "mcpServers": {
    "mcplookup-bridge": {
      "command": "mcp-bridge",
      "env": {
        "MCPLOOKUP_API_KEY": "your-api-key"
      }
    }
  }
}
```

#### **🌐 Global Mode (Developers)**

Global mode installs servers directly on your host system (Smithery-compatible).

```bash
# Install globally
mcpl install @company/dev-server --global

# Install with custom configuration
mcpl install @company/local-server --global --config ./server-config.json
```

**What happens:**
- ✅ Server installed on host system
- ✅ No Docker isolation
- ✅ Direct access to local filesystem
- ✅ Compatible with existing tools

### **🔧 Part 3: Management and Monitoring**

#### **Server Status and Health**

```bash
# List all installed servers
mcpl list

# Show detailed status
mcpl list --status --health

# Filter by installation mode
mcpl list --mode bridge
mcpl list --mode direct

# Show resource usage
mcpl list --resources
```

**Example Output:**
```
┌─────────────────────────────────────────────────────────────┐
│                    MCPL Server Status                      │
├─────────────────────────────────────────────────────────────┤
│ Server Name          │ Status  │ Mode   │ Health │ Uptime  │
├─────────────────────────────────────────────────────────────┤
│ filesystem-server    │ 🟢 UP   │ Direct │ 98%    │ 2d 4h   │
│ email-server         │ 🟢 UP   │ Bridge │ 95%    │ 1d 12h  │
│ calendar-server      │ 🟡 WARN │ Bridge │ 87%    │ 3h 22m  │
│ crm-server          │ 🔴 DOWN │ Bridge │ 0%     │ 0m      │
└─────────────────────────────────────────────────────────────┘
```

#### **Server Control**

```bash
# Start/stop individual servers
mcpl control filesystem-server start
mcpl control email-server stop
mcpl control calendar-server restart

# Bulk operations
mcpl control --all restart
mcpl control --tag email stop
mcpl control --mode bridge restart
```

#### **Health Monitoring**

```bash
# Check health of all servers
mcpl health

# Monitor specific server
mcpl health email-server

# Real-time monitoring
mcpl health --watch

# Detailed health metrics
mcpl health email-server --detailed

# Health history
mcpl health --history --days 7
```

#### **Real-time Dashboard**

```bash
# Live status dashboard
mcpl status --watch --dashboard

# Performance metrics
mcpl health --metrics --watch

# Resource usage monitoring
mcpl status --resources --watch --interval 5
```

### **🔍 Part 4: Using MCP Tools in Claude**

#### **Direct Mode Usage**

With direct mode, tools are available directly in Claude:

```
User: "List the files in my Documents folder"
Claude: I'll help you list the files in your Documents folder.

[Uses filesystem tool: list_directory]

Here are the files in your Documents folder:
- project-notes.txt
- meeting-agenda.pdf
- budget-2024.xlsx
- presentation.pptx
```

#### **Bridge Mode Usage**

With bridge mode, tools are prefixed with server names:

```
User: "Send an email and schedule a meeting"
Claude: I'll help you send an email and schedule a meeting.

[Uses email_send tool from email-server]
[Uses calendar_schedule tool from calendar-server]

I've sent the email to john@company.com and scheduled the meeting for next Tuesday at 2 PM.
```

#### **Available Tool Categories**

**📁 File Management**
- `list_directory` - List files and folders
- `read_file` - Read file contents
- `write_file` - Create or update files
- `move_file` - Move or rename files
- `delete_file` - Delete files

**📧 Email Management**
- `send_email` - Send emails
- `read_inbox` - Read inbox messages
- `search_emails` - Search email content
- `create_draft` - Create email drafts

**📅 Calendar Management**
- `schedule_meeting` - Schedule meetings
- `list_events` - List calendar events
- `update_event` - Update existing events
- `cancel_event` - Cancel events

**👥 CRM Management**
- `lookup_contact` - Find contact information
- `create_contact` - Add new contacts
- `update_contact` - Update contact details
- `list_opportunities` - List sales opportunities

### **🛠️ Part 5: Configuration and Customization**

#### **Configuration File**

Create `~/.mcpl/config.yaml` for persistent settings:

```yaml
# MCPL CLI Configuration
api:
  key: your-api-key
  base_url: https://mcplookup.org/api/v1

defaults:
  mode: bridge
  auto_start: true
  docker_enabled: true

docker:
  memory_limit: 512m
  cpu_limit: 0.5
  read_only: true

health:
  check_interval: 30
  auto_restart: true
  max_failures: 3

logging:
  level: info
  file: ~/.mcpl/logs/mcpl.log
  max_size: 10MB
```

#### **Environment Variables**

```bash
# Set global environment variables
export MCPLOOKUP_API_KEY=your-api-key
export MCPLOOKUP_BASE_URL=https://mcplookup.org/api/v1

# Server-specific environment variables
mcpl install @company/server \
  --env API_KEY=secret \
  --env DATABASE_URL=postgres://... \
  --env DEBUG=true
```

#### **Docker Configuration**

```bash
# Custom Docker settings
mcpl install @company/server \
  --memory-limit 2g \
  --cpu-limit 1.5 \
  --read-only \
  --no-new-privileges \
  --volume /local/data:/app/data
```

### **🔧 Part 6: Troubleshooting**

#### **System Diagnostics**

```bash
# Run full system check
mcpl doctor

# Check specific components
mcpl doctor --check docker
mcpl doctor --check api
mcpl doctor --check config

# Auto-fix common issues
mcpl doctor --fix
```

#### **Common Issues and Solutions**

**Issue 1: Server Won't Start**
```bash
# Check logs
mcpl logs server-name

# Check Docker status
mcpl doctor --check docker

# Restart server
mcpl control server-name restart

# Reinstall if needed
mcpl uninstall server-name
mcpl install @package/server-name
```

**Issue 2: Claude Can't See Tools**
```bash
# Check server status
mcpl status --detailed

# Verify Claude Desktop config
cat ~/.claude/config.json

# Restart Claude Desktop application

# Check bridge connection (if using bridge mode)
mcpl health mcplookup-bridge
```

**Issue 3: Performance Issues**
```bash
# Check resource usage
mcpl status --resources

# Increase memory limit
mcpl control server-name stop
mcpl config set docker.memoryLimit 2g
mcpl control server-name start

# Monitor performance
mcpl health --metrics --watch
```

**Issue 4: API Authentication**
```bash
# Check login status
mcpl login --status

# Re-login with new key
mcpl login --key your-new-api-key

# Test API connection
mcpl search "test" --limit 1
```

#### **Log Analysis**

```bash
# View server logs
mcpl logs server-name

# Follow logs in real-time
mcpl logs server-name --follow

# Filter by log level
mcpl logs server-name --level error

# Export logs for analysis
mcpl logs --all --export system-logs.txt
```

---

## 🎓 **Learning Paths**

### **🌱 Beginner Path (Week 1)**
1. ✅ Install MCPL CLI and get API key
2. ✅ Install your first server (filesystem)
3. ✅ Use basic tools in Claude Desktop
4. ✅ Learn `mcpl status` and `mcpl list` commands
5. ✅ Practice with different server types

### **🌿 Intermediate Path (Week 2-3)**
1. ✅ Install multiple servers
2. ✅ Learn different installation modes
3. ✅ Create configuration files
4. ✅ Monitor server health and performance
5. ✅ Troubleshoot common issues

### **🌳 Advanced Path (Week 4+)**
1. ✅ Set up bridge mode with multiple servers
2. ✅ Create automation scripts
3. ✅ Implement CI/CD integration
4. ✅ Optimize performance and resource usage
5. ✅ Develop custom MCP servers

### **🚀 Expert Path (Ongoing)**
1. ✅ Contribute to the MCPL ecosystem
2. ✅ Help community members with troubleshooting
3. ✅ Optimize enterprise deployments
4. ✅ Integrate with existing infrastructure
5. ✅ Mentor new users

---

## 📊 **Success Metrics**

### **✅ Beginner Success**
- [ ] CLI installed and configured
- [ ] API key set up and working
- [ ] First server installed and running
- [ ] Successfully used tools in Claude
- [ ] Can check server status

### **✅ Intermediate Success**
- [ ] Multiple servers installed and managed
- [ ] Configuration file created and customized
- [ ] Health monitoring set up
- [ ] Can troubleshoot basic issues
- [ ] Understands different installation modes

### **✅ Advanced Success**
- [ ] Bridge mode configured with multiple servers
- [ ] Automation scripts created
- [ ] Performance optimized
- [ ] Custom configurations implemented
- [ ] Can help others with setup

### **✅ Expert Success**
- [ ] Contributing to the ecosystem
- [ ] Developing custom servers
- [ ] Mentoring community members
- [ ] Enterprise deployment experience
- [ ] Infrastructure integration expertise

---

## 🔗 **Next Steps**

### **📚 Additional Resources**
- **[CLI Reference](https://github.com/MCPLookup-org/mcpl-cli#readme)** - Complete command documentation
- **[MCP Server Guide](https://github.com/MCPLookup-org/mcp-server#readme)** - Bridge server documentation
- **[SDK Documentation](https://github.com/MCPLookup-org/mcp-sdk#readme)** - Developer resources
- **[Visual Workflow Guide](./VISUAL_WORKFLOW_GUIDE.md)** - Interactive diagrams and flowcharts

### **🤝 Community**
- **[Discord Community](https://discord.gg/mcplookup)** - Get help and share experiences
- **[GitHub Discussions](https://github.com/MCPLookup-org/mcpl-cli/discussions)** - Technical discussions
- **[Issue Tracker](https://github.com/MCPLookup-org/mcpl-cli/issues)** - Report bugs and request features

### **🔧 Advanced Topics**
- **[Custom Server Development](./CUSTOM_SERVER_GUIDE.md)** - Build your own MCP servers
- **[Enterprise Deployment](./ENTERPRISE_GUIDE.md)** - Large-scale deployment strategies
- **[Performance Optimization](./PERFORMANCE_GUIDE.md)** - Optimize for production use

---

**🎉 Congratulations\! You're now ready to master the MCPL ecosystem. Start with the Quick Start guide and work your way through the learning paths at your own pace.** 🚀

**Need help?** Join our [Discord community](https://discord.gg/mcplookup) or check the [troubleshooting section](#part-6-troubleshooting) above.
