// MCP Client Types
// Generated on 2025-06-05T06:13:11.196Z

import { Client } from '@modelcontextprotocol/sdk/client/index.js';

// ============================================================================
// MCP CLIENT INTERFACES
// ============================================================================

export interface MCPClient {
  client: Client;
  endpoint: string;
  connected: boolean;
  tools: MCPToolDefinition[];
  resources: MCPResourceDefinition[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// ============================================================================
// BRIDGE CLIENT INTERFACE
// ============================================================================

export interface MCPBridgeClient {
  discoverServers(args: DiscoverMCPServersArgs): Promise<MCPToolResult>;
  connectAndListTools(args: ConnectAndListToolsArgs): Promise<MCPToolResult>;
  callToolOnServer(args: CallToolOnServerArgs): Promise<MCPToolResult>;
  readResourceFromServer(args: ReadResourceFromServerArgs): Promise<MCPToolResult>;
  discoverAndCallTool(args: DiscoverAndCallToolArgs): Promise<MCPToolResult>;
  getBridgeStatus(): Promise<MCPToolResult>;
}

export interface ReadResourceFromServerArgs {
  endpoint: string;
  uri: string;
  auth_headers?: Record<string, string>;
}

export interface DiscoverAndCallToolArgs {
  query?: string;
  domain?: string;
  capability?: string;
  tool_name: string;
  arguments?: Record<string, any>;
  server_index?: number;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export interface MCPClientFactory {
  createMainServerClient(): Promise<MCPClient>;
  createBridgeClient(endpoint?: string): Promise<MCPBridgeClient>;
  createClientForDomain(domain: string): Promise<MCPClient>;
  createClientForCapability(capability: string): Promise<MCPClient>;
}
