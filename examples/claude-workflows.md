# 🌉 Universal MCP Bridge - Claude Workflows

This document shows how Claude can use the Universal MCP Bridge to dynamically discover and use any MCP server.

## 🖥️ Claude Desktop Setup

Add this **single bridge** to your Claude Desktop config to access ALL MCP servers:

```json
{
  "mcpServers": {
    "universal-mcp-bridge": {
      "command": "node",
      "args": ["scripts/mcp-bridge.mjs"]
    }
  }
}
```

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

## 🎯 Claude Workflow Examples

### 1. Email Workflow
**User**: "Find email servers and send an email"

**Claude's approach**:
```
1. discover_mcp_servers(capability="email")
   → Finds Gmail, Outlook, etc.

2. discover_and_call_tool(
     domain="gmail.com", 
     tool_name="send_email", 
     arguments={
       to: "user@example.com",
       subject: "Hello",
       body: "Test email"
     }
   )
   → Discovers Gmail server, connects, and sends email
```

### 2. Document Collaboration
**User**: "What document collaboration tools are available?"

**Claude's approach**:
```
1. discover_mcp_servers(query="document collaboration tools")
   → Finds Google Docs, Notion, Confluence, etc.

2. connect_and_list_tools(endpoint="https://docs.google.com/mcp")
   → Lists available tools: create_doc, edit_doc, share_doc, etc.

3. call_tool_on_server(
     endpoint="https://docs.google.com/mcp",
     tool_name="create_doc",
     arguments={title: "Meeting Notes", content: "..."}
   )
```

### 3. Code Repository Management
**User**: "Check my GitHub issues and create a new one"

**Claude's approach**:
```
1. discover_and_call_tool(
     domain="github.com",
     tool_name="list_issues",
     arguments={repo: "myrepo", state: "open"}
   )
   → Discovers GitHub server and lists issues

2. discover_and_call_tool(
     domain="github.com",
     tool_name="create_issue",
     arguments={
       title: "Bug fix needed",
       body: "Description...",
       labels: ["bug"]
     }
   )
```

### 4. Multi-Server Workflow
**User**: "Find the best email server and the best calendar server, then schedule a meeting"

**Claude's approach**:
```
1. discover_mcp_servers(capability="email", limit=3)
   → Compares Gmail, Outlook, etc.

2. discover_mcp_servers(capability="calendar", limit=3)
   → Compares Google Calendar, Outlook Calendar, etc.

3. discover_and_call_tool(
     domain="calendar.google.com",
     tool_name="create_event",
     arguments={
       title: "Team Meeting",
       start: "2024-01-15T10:00:00Z",
       attendees: ["team@company.com"]
     }
   )

4. discover_and_call_tool(
     domain="gmail.com",
     tool_name="send_email",
     arguments={
       to: "team@company.com",
       subject: "Meeting Scheduled",
       body: "Meeting created for Jan 15th..."
     }
   )
```

### 5. Discovery and Exploration
**User**: "What AI tools are available?"

**Claude's approach**:
```
1. discover_mcp_servers(query="AI tools machine learning")
   → Finds OpenAI, Anthropic, Hugging Face servers

2. For each discovered server:
   connect_and_list_tools(endpoint="server_endpoint")
   → Explores available AI capabilities

3. Present comparison of available AI tools and their capabilities
```

## 🛠️ Available Bridge Tools

### Discovery Tools
- **`discover_mcp_servers`** - Find servers using mcplookup.org
  - By domain: `discover_mcp_servers(domain="gmail.com")`
  - By capability: `discover_mcp_servers(capability="email")`
  - By query: `discover_mcp_servers(query="document collaboration")`

### Connection Tools
- **`connect_and_list_tools`** - Connect to any server and explore
  - `connect_and_list_tools(endpoint="https://api.example.com/mcp")`

### Execution Tools
- **`call_tool_on_server`** - Call any tool on any server
  - `call_tool_on_server(endpoint="...", tool_name="...", arguments={...})`

- **`read_resource_from_server`** - Read resources from any server
  - `read_resource_from_server(endpoint="...", uri="config://app")`

### Workflow Tools
- **`discover_and_call_tool`** - One-step discovery + execution
  - `discover_and_call_tool(domain="gmail.com", tool_name="send_email", arguments={...})`

### Status Tools
- **`bridge_status`** - Get bridge information and capabilities

## 🚀 Benefits for Claude

1. **Dynamic Discovery**: No need to hardcode server endpoints
2. **Universal Access**: One bridge connects to all MCP servers
3. **Intelligent Routing**: Can find the best server for each task
4. **Fallback Support**: Automatically handles different transport types
5. **Real-time**: Always uses the latest server information from mcplookup.org

## 🔄 Migration Path

**Current MCP Limitation**: Static tools defined at startup
**Bridge Solution**: Dynamic tool discovery and calling
**Future MCP**: Native support for dynamic tools (when available)

The bridge provides the missing dynamic capabilities until the MCP protocol evolves to support them natively.
