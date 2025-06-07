# @mcplookup-org/mcpl-cli

**🖥️ Enhanced MCP Server Management CLI - Discovery, Installation & Lifecycle Management**

[\![npm version](https://badge.fury.io/js/@mcplookup-org%2Fmcpl-cli.svg)](https://badge.fury.io/js/@mcplookup-org%2Fmcpl-cli)
[\![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[\![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The complete CLI tool for discovering, installing, and managing MCP servers with enterprise-grade features and beautiful user experience.**

## 🎯 **What is MCPL CLI?**

MCPL CLI is a comprehensive command-line tool that makes working with MCP (Model Context Protocol) servers effortless. It provides:

- **🔍 Smart Discovery** - Find servers using natural language or technical filters
- **📦 Easy Installation** - Multiple installation modes (direct, bridge, global)
- **🔧 Lifecycle Management** - Start, stop, restart, and monitor servers
- **⚙️ Configuration Management** - Centralized settings and API key management
- **🎨 Beautiful Interface** - Rich CLI with colors, spinners, and progress bars

## ⚡ **Quick Start**

### Installation

```bash
npm install -g @mcplookup-org/mcpl-cli
```

### Setup

```bash
# Set your API key
export MCPLOOKUP_API_KEY=your-api-key

# Or use the login command
mcpl login --key your-api-key
```

Get your API key from [mcplookup.org/dashboard](https://mcplookup.org/dashboard).

### Basic Usage

```bash
# Search for servers
mcpl search "filesystem tools"

# Install a server
mcpl install @modelcontextprotocol/server-filesystem

# List installed servers
mcpl list

# Check server status
mcpl status
```

## 📖 **Commands Reference**

### **🔍 Discovery Commands**

#### `mcpl search <query>`
Search for MCP servers using natural language or technical terms.

```bash
# Natural language search
mcpl search "email automation tools"
mcpl search "file management for cloud storage"

# Technical search
mcpl search --capability email --verified-only
mcpl search --domain gmail.com --include-health

# Smart AI-powered search
mcpl search "I need tools for customer support" --smart
```

**Options:**
- `--smart` - Use AI-powered discovery
- `--capability <name>` - Filter by capability
- `--category <category>` - Filter by category
- `--transport <type>` - Filter by transport protocol
- `--verified-only` - Only show verified servers
- `--limit <number>` - Maximum results (default: 10)
- `--json` - Output as JSON

#### `mcpl list available`
Browse all available servers in the registry.

```bash
mcpl list available --category productivity
mcpl list available --verified-only --limit 20
```

### **📦 Installation Commands**

#### `mcpl install <package>`
Install an MCP server with various configuration options.

```bash
# Direct mode (default) - Adds to Claude Desktop config
mcpl install @modelcontextprotocol/server-filesystem

# Bridge mode - Dynamic proxy with tool prefixing
mcpl install @company/server --mode bridge --auto-start

# Global mode - Install on host system (Smithery-style)
mcpl install @company/server --global

# With Docker isolation
mcpl install @company/server --docker --memory-limit 512m
```

**Installation Modes:**

1. **Direct Mode** (default)
   - Adds server to Claude Desktop configuration
   - Docker isolated by default
   - Static configuration

2. **Bridge Mode**
   - Dynamic proxy with tool prefixing
   - Lifecycle management
   - Real-time health monitoring

3. **Global Mode**
   - Installs on host system
   - Smithery-compatible
   - No isolation

**Options:**
- `--mode <mode>` - Installation mode (direct|bridge|global)
- `--auto-start` - Start server automatically
- `--docker` - Force Docker isolation
- `--global` - Install globally on host
- `--memory-limit <size>` - Docker memory limit
- `--cpu-limit <limit>` - Docker CPU limit
- `--env <key=value>` - Environment variables
- `--config <file>` - Custom configuration file

### **🔧 Management Commands**

#### `mcpl list`
List installed servers and their status.

```bash
# List all servers
mcpl list

# Show detailed status
mcpl list --status --health

# Filter by mode
mcpl list --mode bridge
mcpl list --mode direct

# JSON output
mcpl list --json
```

#### `mcpl status [server]`
Check server status and health metrics.

```bash
# Check all servers
mcpl status

# Check specific server
mcpl status filesystem-server

# Real-time monitoring
mcpl status --watch --interval 5

# Detailed health metrics
mcpl status --detailed --include-logs
```

#### `mcpl control <server> <action>`
Control server lifecycle (start, stop, restart).

```bash
# Start a server
mcpl control filesystem-server start

# Stop a server
mcpl control filesystem-server stop

# Restart a server
mcpl control filesystem-server restart

# Restart all servers
mcpl control --all restart
```

**Actions:**
- `start` - Start the server
- `stop` - Stop the server
- `restart` - Restart the server
- `enable` - Enable auto-start
- `disable` - Disable auto-start

#### `mcpl health [server]`
Monitor server health and performance.

```bash
# Health overview
mcpl health

# Specific server health
mcpl health gmail-server

# Real-time monitoring
mcpl health --watch

# Health history
mcpl health --history --days 7
```

### **⚙️ Configuration Commands**

#### `mcpl config`
Manage CLI configuration and settings.

```bash
# Show current configuration
mcpl config show

# Set configuration values
mcpl config set defaultMode bridge
mcpl config set autoStart true
mcpl config set dockerEnabled true

# Get configuration value
mcpl config get defaultMode

# Reset to defaults
mcpl config reset
```

**Configuration Options:**
- `defaultMode` - Default installation mode (direct|bridge|global)
- `autoStart` - Auto-start servers after installation
- `dockerEnabled` - Enable Docker by default
- `healthCheckInterval` - Health check interval in seconds
- `maxConcurrentServers` - Maximum concurrent servers
- `logLevel` - Logging level (error|warn|info|debug)

#### `mcpl login`
Manage API authentication.

```bash
# Set API key
mcpl login --key your-api-key

# Login interactively
mcpl login

# Check login status
mcpl login --status

# Logout
mcpl logout
```

### **🔍 Information Commands**

#### `mcpl info <server>`
Get detailed information about a server.

```bash
mcpl info @modelcontextprotocol/server-filesystem
mcpl info gmail.com
mcpl info filesystem-server --local
```

#### `mcpl logs <server>`
View server logs and debugging information.

```bash
# View recent logs
mcpl logs filesystem-server

# Follow logs in real-time
mcpl logs filesystem-server --follow

# Filter by log level
mcpl logs filesystem-server --level error

# Export logs
mcpl logs filesystem-server --export logs.txt
```

#### `mcpl doctor`
Diagnose common issues and system health.

```bash
# Run full diagnostic
mcpl doctor

# Check specific component
mcpl doctor --check docker
mcpl doctor --check api
mcpl doctor --check config

# Fix common issues
mcpl doctor --fix
```

## 🎨 **User Experience Features**

### **Rich CLI Interface**
- **🌈 Colorized Output** - Easy-to-read colored text and icons
- **⏳ Progress Indicators** - Spinners and progress bars for long operations
- **📊 Formatted Tables** - Beautiful tabular data display
- **🎯 Interactive Prompts** - Guided setup and configuration

### **Smart Defaults**
- **Auto-Detection** - Automatically detects optimal settings
- **Intelligent Suggestions** - Suggests relevant servers and configurations
- **Error Recovery** - Helpful error messages with suggested fixes
- **Context Awareness** - Remembers previous choices and preferences

### **Output Formats**
```bash
# Human-readable (default)
mcpl list

# JSON for scripting
mcpl list --json

# CSV for spreadsheets
mcpl list --csv

# YAML for configuration
mcpl config show --yaml
```

## 🔧 **Advanced Usage**

### **Batch Operations**
```bash
# Install multiple servers
mcpl install @company/server1 @company/server2 --mode bridge

# Control multiple servers
mcpl control --tag email restart
mcpl control --all stop

# Bulk configuration
mcpl config set --servers filesystem,email autoStart true
```

### **Scripting Support**
```bash
#\!/bin/bash
# Automated server setup script

# Set API key
export MCPLOOKUP_API_KEY="your-api-key"

# Install servers
mcpl install @company/email-server --mode bridge --auto-start --json
mcpl install @company/file-server --mode direct --docker --json

# Wait for startup
mcpl status --wait-for-healthy --timeout 60

# Verify installation
mcpl doctor --check all --json
```

### **Configuration Files**
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

## 🐳 **Docker Integration**

### **Automatic Docker Management**
- **Image Pulling** - Automatically pulls required Docker images
- **Container Lifecycle** - Manages container creation, startup, and cleanup
- **Resource Management** - Configurable memory and CPU limits
- **Security Hardening** - Read-only filesystem, no new privileges
- **Health Monitoring** - Container health checks and auto-recovery

### **Docker Configuration**
```bash
# Configure Docker defaults
mcpl config set docker.memoryLimit 1g
mcpl config set docker.cpuLimit 1.0
mcpl config set docker.readOnly true

# Install with custom Docker settings
mcpl install @company/server \
  --docker \
  --memory-limit 2g \
  --cpu-limit 1.5 \
  --env API_KEY=secret \
  --volume /data:/app/data
```

## 📊 **Monitoring & Analytics**

### **Real-time Monitoring**
```bash
# Live dashboard
mcpl status --watch --dashboard

# Performance metrics
mcpl health --metrics --watch

# Resource usage
mcpl status --resources --watch
```

### **Historical Data**
```bash
# Usage statistics
mcpl analytics --usage --days 30

# Performance trends
mcpl analytics --performance --server filesystem

# Error analysis
mcpl analytics --errors --level warn
```

## 🔗 **Integration**

### **CI/CD Integration**
```yaml
# GitHub Actions example
- name: Setup MCP Servers
  run: |
    npm install -g @mcplookup-org/mcpl-cli
    mcpl login --key ${{ secrets.MCPLOOKUP_API_KEY }}
    mcpl install @company/test-server --mode bridge --auto-start
    mcpl status --wait-for-healthy --timeout 120
```

### **API Integration**
```bash
# Export server list for external tools
mcpl list --json > servers.json

# Import configuration
mcpl config import config.yaml

# Webhook notifications
mcpl config set webhooks.health_change https://api.company.com/webhooks/mcp
```

## 🔗 **Related Packages**

- **[@mcplookup-org/mcp-sdk](https://github.com/MCPLookup-org/mcp-sdk)** - Shared SDK and utilities
- **[@mcplookup-org/mcp-server](https://github.com/MCPLookup-org/mcp-server)** - MCP Bridge Server

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 **Support**

- **GitHub Issues**: [Report bugs and request features](https://github.com/MCPLookup-org/mcpl-cli/issues)
- **Documentation**: [Full documentation](https://mcplookup.org/docs)
- **Community**: [Join our Discord](https://discord.gg/mcplookup)

---

**🖥️ Making MCP server management effortless**
