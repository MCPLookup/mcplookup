# 🖥️ Complete User Interface Guide

**How to Use MCPL CLI and MCP Servers Together - From Zero to Hero**

## 🎯 **Overview: The Complete MCPL Workflow**

This guide shows you how to use the MCPL CLI and MCP servers together to create a powerful, dynamic AI tool ecosystem.

### **🔄 The Complete Flow**
```
1. 🔍 Discover → 2. 📦 Install → 3. 🔧 Configure → 4. 🚀 Use → 5. 📊 Monitor
```

---

## 🚀 **Quick Start: 5-Minute Setup**

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

### **Step 4: Discover and Install Your First Server**
```bash
# Search for servers
mcpl search "filesystem tools"

# Install a server
mcpl install @modelcontextprotocol/server-filesystem

# Check status
mcpl status
```

### **Step 5: Use in Claude Desktop**
Your server is now available in Claude Desktop\! Try asking:
> "Can you help me list the files in my Documents folder?"

---

## 📖 **Complete User Workflows**

### **🔍 Workflow 1: Discovery and Exploration**

#### **Natural Language Search**
```bash
# Find servers using natural language
mcpl search "I need tools for email automation"
mcpl search "file management for cloud storage"
mcpl search "customer support and ticketing"
```

#### **Technical Search**
```bash
# Search by specific criteria
mcpl search --capability email --verified-only
mcpl search --domain gmail.com --transport streamable_http
mcpl search --category productivity --limit 20
```

#### **AI-Powered Smart Search**
```bash
# Let AI recommend the best servers
mcpl search "I'm building a customer service bot" --smart
mcpl search "Need tools for data analysis and visualization" --smart
```

#### **Browse Available Servers**
```bash
# Browse by category
mcpl list available --category communication
mcpl list available --category development
mcpl list available --verified-only
```

### **📦 Workflow 2: Installation and Configuration**

#### **Installation Modes Explained**

##### **🎯 Direct Mode (Recommended for Most Users)**
Adds servers directly to Claude Desktop configuration with Docker isolation.

```bash
# Install in direct mode (default)
mcpl install @modelcontextprotocol/server-filesystem

# With custom configuration
mcpl install @company/email-server --memory-limit 1g --auto-start
```

**What happens:**
- ✅ Server added to Claude Desktop config
- ✅ Docker container created for security
- ✅ Automatic startup when Claude starts
- ✅ Tools available immediately in Claude

##### **🌉 Bridge Mode (Advanced Users)**
Dynamic proxy with tool prefixing and lifecycle management.

```bash
# Install in bridge mode
mcpl install @company/server --mode bridge --auto-start

# Multiple servers in bridge mode
mcpl install @company/email-server --mode bridge
mcpl install @company/calendar-server --mode bridge
mcpl install @company/crm-server --mode bridge
```

**What happens:**
- ✅ Servers managed by the bridge
- ✅ Tools prefixed with server names
- ✅ Dynamic discovery and health monitoring
- ✅ Single entry point in Claude Desktop

##### **🌐 Global Mode (Developers)**
Install directly on host system (Smithery-compatible).

```bash
# Install globally on host
mcpl install @company/dev-server --global
```

#### **Configuration Examples**

##### **Basic Installation**
```bash
# Simple installation
mcpl install @modelcontextprotocol/server-filesystem
```

##### **Custom Docker Settings**
```bash
# With resource limits
mcpl install @company/server \
  --memory-limit 2g \
  --cpu-limit 1.5 \
  --env API_KEY=secret \
  --env DEBUG=true
```

##### **Development Setup**
```bash
# Development environment
mcpl install @company/dev-server \
  --mode bridge \
  --auto-start \
  --env NODE_ENV=development \
  --volume /local/code:/app/code
```

### **🔧 Workflow 3: Management and Monitoring**

#### **Server Management**
```bash
# List all installed servers
mcpl list

# Check detailed status
mcpl list --status --health

# Filter by installation mode
mcpl list --mode bridge
mcpl list --mode direct
```

#### **Lifecycle Control**
```bash
# Start/stop individual servers
mcpl control filesystem-server start
mcpl control email-server stop
mcpl control crm-server restart

# Bulk operations
mcpl control --all restart
mcpl control --tag email stop
```

#### **Health Monitoring**
```bash
# Check health of all servers
mcpl health

# Monitor specific server
mcpl health gmail-server --watch

# Health history
mcpl health --history --days 7
```

#### **Real-time Monitoring**
```bash
# Live dashboard
mcpl status --watch --dashboard

# Performance metrics
mcpl health --metrics --watch

# Resource usage monitoring
mcpl status --resources --watch
```

### **🔍 Workflow 4: Troubleshooting and Diagnostics**

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

#### **Log Analysis**
```bash
# View server logs
mcpl logs filesystem-server

# Follow logs in real-time
mcpl logs email-server --follow

# Filter by log level
mcpl logs crm-server --level error

# Export logs for analysis
mcpl logs --all --export system-logs.txt
```

#### **Server Information**
```bash
# Get detailed server info
mcpl info @modelcontextprotocol/server-filesystem
mcpl info gmail.com
mcpl info filesystem-server --local
```

---

## 🎨 **Claude Desktop Integration Examples**

### **Example 1: File Management Setup**

#### **1. Install File Server**
```bash
mcpl install @modelcontextprotocol/server-filesystem --auto-start
```

#### **2. Claude Desktop Config (Auto-Generated)**
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

#### **3. Usage in Claude**
Now you can ask Claude:
- "List all files in my Documents folder"
- "Create a new file called notes.txt with my meeting agenda"
- "Search for all PDF files in my Downloads folder"
- "Move all images from Desktop to Pictures folder"

### **Example 2: Email Automation Setup**

#### **1. Install Email Server**
```bash
mcpl install @company/email-server \
  --env GMAIL_API_KEY=your-key \
  --env SMTP_HOST=smtp.gmail.com \
  --auto-start
```

#### **2. Usage in Claude**
Ask Claude to:
- "Send an email to john@company.com about the project update"
- "Check my inbox for emails from the marketing team"
- "Schedule an email to be sent tomorrow morning"
- "Create a draft email for the quarterly report"

### **Example 3: Bridge Mode Multi-Server Setup**

#### **1. Install Multiple Servers**
```bash
# Install bridge server first
mcpl install @mcplookup-org/mcp-server --mode bridge

# Install multiple servers in bridge mode
mcpl install @company/email-server --mode bridge
mcpl install @company/calendar-server --mode bridge
mcpl install @company/crm-server --mode bridge
mcpl install @modelcontextprotocol/server-filesystem --mode bridge
```

#### **2. Claude Desktop Config (Single Entry)**
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

#### **3. Usage in Claude**
Claude now has access to ALL servers through the bridge:
- "email_send an update to the team about the project"
- "calendar_schedule a meeting for next Tuesday"
- "crm_lookup customer information for Acme Corp"
- "filesystem_list files in the project directory"

---

## 🔧 **Advanced Configuration**

### **Configuration File Setup**

Create `~/.mcpl/config.yaml`:
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

### **Batch Operations**

#### **Install Multiple Servers**
```bash
# Install a complete productivity suite
mcpl install @company/email-server @company/calendar-server @company/crm-server \
  --mode bridge \
  --auto-start \
  --memory-limit 1g
```

#### **Environment-Specific Setup**
```bash
# Development environment
mcpl config set defaultMode bridge
mcpl config set autoStart true
mcpl config set docker.memoryLimit 2g

# Production environment
mcpl config set defaultMode direct
mcpl config set docker.readOnly true
mcpl config set health.autoRestart true
```

### **Automation and Scripting**

#### **Setup Script Example**
```bash
#\!/bin/bash
# Automated MCPL setup script

# Set API key
export MCPLOOKUP_API_KEY="your-api-key"

# Install core servers
mcpl install @modelcontextprotocol/server-filesystem --auto-start
mcpl install @company/email-server --mode bridge --auto-start
mcpl install @company/calendar-server --mode bridge --auto-start

# Wait for servers to be healthy
mcpl status --wait-for-healthy --timeout 120

# Verify installation
mcpl doctor --check all

echo "✅ MCPL setup complete\!"
```

#### **CI/CD Integration**
```yaml
# GitHub Actions example
- name: Setup MCP Servers
  run: |
    npm install -g @mcplookup-org/mcpl-cli
    mcpl login --key ${{ secrets.MCPLOOKUP_API_KEY }}
    mcpl install @company/test-server --mode bridge --auto-start
    mcpl status --wait-for-healthy --timeout 120
```

---

## 📊 **Monitoring and Analytics**

### **Performance Monitoring**
```bash
# Real-time performance dashboard
mcpl status --watch --dashboard

# Server performance metrics
mcpl health --metrics --server email-server

# Resource usage tracking
mcpl status --resources --watch --interval 5
```

### **Usage Analytics**
```bash
# Usage statistics
mcpl analytics --usage --days 30

# Performance trends
mcpl analytics --performance --server filesystem

# Error analysis
mcpl analytics --errors --level warn --days 7
```

### **Health Monitoring**
```bash
# Continuous health monitoring
mcpl health --watch --alert-on-failure

# Health history and trends
mcpl health --history --server email-server --days 30

# Export health data
mcpl health --export health-report.json --days 7
```

---

## 🎯 **Best Practices**

### **🔒 Security Best Practices**

1. **Use Docker Isolation**
   ```bash
   # Always use Docker for isolation
   mcpl install @company/server --docker --read-only
   ```

2. **Resource Limits**
   ```bash
   # Set appropriate resource limits
   mcpl install @company/server \
     --memory-limit 1g \
     --cpu-limit 1.0
   ```

3. **Environment Variables**
   ```bash
   # Use environment variables for secrets
   mcpl install @company/server \
     --env API_KEY=secret \
     --env DATABASE_URL=encrypted-url
   ```

### **🚀 Performance Best Practices**

1. **Use Bridge Mode for Multiple Servers**
   ```bash
   # More efficient than multiple direct mode servers
   mcpl install @company/server1 --mode bridge
   mcpl install @company/server2 --mode bridge
   ```

2. **Enable Auto-Restart**
   ```bash
   # Ensure high availability
   mcpl config set health.autoRestart true
   ```

3. **Monitor Resource Usage**
   ```bash
   # Regular monitoring
   mcpl status --resources --watch
   ```

### **🔧 Maintenance Best Practices**

1. **Regular Health Checks**
   ```bash
   # Daily health check
   mcpl doctor --check all
   ```

2. **Log Rotation**
   ```bash
   # Configure log rotation
   mcpl config set logging.maxSize 10MB
   mcpl config set logging.maxFiles 5
   ```

3. **Update Management**
   ```bash
   # Check for updates
   mcpl update --check
   
   # Update servers
   mcpl update --all
   ```

---

## 🆘 **Common Issues and Solutions**

### **Issue 1: Server Won't Start**

**Symptoms:**
```bash
mcpl status
# Shows: filesystem-server: FAILED
```

**Solutions:**
```bash
# Check logs
mcpl logs filesystem-server

# Check Docker status
mcpl doctor --check docker

# Restart server
mcpl control filesystem-server restart

# Reinstall if needed
mcpl uninstall filesystem-server
mcpl install @modelcontextprotocol/server-filesystem
```

### **Issue 2: Claude Can't See Tools**

**Symptoms:**
- Claude doesn't respond to tool requests
- "No tools available" message

**Solutions:**
```bash
# Check server status
mcpl status --detailed

# Verify Claude Desktop config
mcpl config show --claude-desktop

# Restart Claude Desktop application

# Check bridge connection (if using bridge mode)
mcpl health mcplookup-bridge
```

### **Issue 3: Performance Issues**

**Symptoms:**
- Slow tool responses
- High memory usage

**Solutions:**
```bash
# Check resource usage
mcpl status --resources

# Adjust resource limits
mcpl control server-name stop
mcpl config set docker.memoryLimit 2g
mcpl control server-name start

# Monitor performance
mcpl health --metrics --watch
```

### **Issue 4: API Key Issues**

**Symptoms:**
- Authentication errors
- "Invalid API key" messages

**Solutions:**
```bash
# Check login status
mcpl login --status

# Re-login with new key
mcpl login --key your-new-api-key

# Verify API key works
mcpl search "test" --limit 1
```

---

## 🎓 **Learning Path: Beginner to Expert**

### **🌱 Beginner (Week 1)**
1. Install MCPL CLI
2. Get API key and login
3. Install your first server (filesystem)
4. Use basic tools in Claude
5. Learn `mcpl status` and `mcpl list`

### **🌿 Intermediate (Week 2-3)**
1. Install multiple servers
2. Learn different installation modes
3. Use configuration files
4. Monitor server health
5. Troubleshoot common issues

### **🌳 Advanced (Week 4+)**
1. Set up bridge mode with multiple servers
2. Create automation scripts
3. Implement CI/CD integration
4. Performance optimization
5. Custom server development

### **🚀 Expert (Ongoing)**
1. Contribute to MCPL ecosystem
2. Develop custom MCP servers
3. Help community with troubleshooting
4. Optimize enterprise deployments
5. Integrate with existing infrastructure

---

## 📞 **Getting Help**

### **📚 Documentation**
- **[CLI Reference](https://github.com/MCPLookup-org/mcpl-cli#readme)** - Complete command documentation
- **[MCP Server Guide](https://github.com/MCPLookup-org/mcp-server#readme)** - Bridge server documentation
- **[SDK Documentation](https://github.com/MCPLookup-org/mcp-sdk#readme)** - Developer resources

### **🆘 Support Channels**
- **GitHub Issues**: [Report bugs and request features](https://github.com/MCPLookup-org/mcpl-cli/issues)
- **Community Discord**: [Join our Discord](https://discord.gg/mcplookup)
- **Documentation**: [Full documentation](https://mcplookup.org/docs)

### **🔧 Self-Help Tools**
```bash
# Built-in help
mcpl --help
mcpl search --help
mcpl install --help

# System diagnostics
mcpl doctor

# Check configuration
mcpl config show
```

---

**🎉 You're now ready to master the MCPL ecosystem\! Start with the Quick Start guide and work your way up to advanced configurations.** 🚀
