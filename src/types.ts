// Shared types for the MCP Bridge system

export interface ManagedServer {
  name: string;
  type: 'docker' | 'npm';
  mode: 'bridge' | 'direct';
  command: string[];
  client?: any; // MCP Client
  endpoint?: string;
  tools: string[];
  status: 'installing' | 'running' | 'stopped' | 'error';
}

export interface ClaudeConfig {
  mcpServers?: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export interface ServerInstallOptions {
  name: string;
  type: 'docker' | 'npm';
  command: string;
  mode?: 'bridge' | 'direct';
  auto_start?: boolean;
  global_install?: boolean;
  env?: Record<string, string>;
}

export interface ToolCallResult {
  [x: string]: unknown;
  content: Array<{
    [x: string]: unknown;
    type: 'text';
    text: string;
  }>;
  _meta?: {
    [x: string]: unknown;
  };
  structuredContent?: {
    [x: string]: unknown;
  };
  isError?: boolean;
}

export interface DiscoveryOptions {
  query?: string;
  intent?: string;
  domain?: string;
  capability?: string;
  category?: 'communication' | 'productivity' | 'development' | 'finance' | 'social' | 'storage' | 'other';
  transport?: 'sse' | 'stdio' | 'http';
  verified_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface RegistrationOptions {
  domain: string;
  endpoint: string;
  contact_email: string;
  description?: string;
}

export interface InvokeToolOptions {
  endpoint: string;
  tool_name: string;
  arguments: Record<string, any>;
  headers?: Record<string, string>;
}

export interface ServerControlOptions {
  name: string;
  action: 'start' | 'stop' | 'restart' | 'remove';
}

export interface HealthCheckOptions {
  server_id?: string;
  limit?: number;
}

export interface SmartDiscoveryOptions {
  query: string;
  context?: string;
  limit?: number;
}

export interface DomainVerificationOptions {
  domain: string;
}

export interface DomainOwnershipOptions {
  domain: string;
}
