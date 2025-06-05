// Generated TypeScript types from OpenAPI spec
// Generated on 2025-06-05T06:06:38.866Z

export interface MCPServerRecord {
  domain: string;
  endpoint: string;
  name: string;
  description: string;
  capabilities: string[];
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    last_check: string;
  };
  verified: boolean;
  trust_score: number;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryResponse {
  servers: MCPServerRecord[];
  total: number;
  query_analysis: Record<string, any>;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

// MCP Tool definitions
export interface MCPTool {
  name: string;
  description: string;
  category?: string;
  server: 'main' | 'bridge';
}

// API route information
export interface APIRoute {
  path: string;
  methods: string[];
  description: string;
  tags: string[];
}

// Generated from 19 routes and 12 MCP tools
