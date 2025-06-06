# @mcplookup-org/mcpl-cli

MCPL CLI - Enhanced MCP server management tool with discovery, installation, and lifecycle management.

## Installation

```bash
npm install -g @mcplookup-org/mcpl-cli
```

## Quick Start

```bash
# Set your API key
export MCPLOOKUP_API_KEY=your-api-key

# Search for servers
mcpl search "filesystem tools"

# Install a server
mcpl install @modelcontextprotocol/server-filesystem

# List installed servers
mcpl list

# Check server status
mcpl status
```

## Commands

### Discovery
- `mcpl search <query>` - Search for MCP servers
- `mcpl search <query> --smart` - AI-powered search
- `mcpl list available` - Browse available servers

### Installation
- `mcpl install <package>` - Install server (direct mode, Docker isolated)
- `mcpl install <package> --mode bridge` - Install in bridge mode
- `mcpl install <package> --global` - Install on host system

### Management
- `mcpl list` - List installed servers
- `mcpl status` - Check server status
- `mcpl control <server> <action>` - Control server lifecycle
- `mcpl health` - Health monitoring

### Configuration
- `mcpl login --key <api-key>` - Set API key
- `mcpl config show` - Show configuration
- `mcpl config set <key> <value>` - Set configuration

## Installation Modes

### Direct Mode (Default)
Adds servers to Claude Desktop configuration with Docker isolation.

```bash
mcpl install @company/server
```

### Bridge Mode
Dynamic proxy with tool prefixing and lifecycle management.

```bash
mcpl install @company/server --mode bridge --auto-start
```

### Global Mode
Install on host system (Smithery-style).

```bash
mcpl install @company/server --global
```

## Authentication

Get your API key from [mcplookup.org/dashboard](https://mcplookup.org/dashboard):

```bash
# Set via environment variable
export MCPLOOKUP_API_KEY=your-api-key

# Or use login command
mcpl login --key your-api-key

# Or pass with each command
mcpl search "tools" --api-key your-api-key
```

## Examples

```bash
# Search and install workflow
mcpl search "email automation" --smart
mcpl install @company/email-server --auto-start

# Manage servers
mcpl list --status
mcpl control email-server restart
mcpl health --watch

# Configuration
mcpl config set defaultMode bridge
mcpl config set autoStart true
```

## License

MIT
