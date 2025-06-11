/**
 * MCP Classification Types
 * Source of truth for MCP server classification and analysis
 */

// === MCP CLASSIFICATION TYPES ===

export type MCPClassification = 
  | "mcp_server"        // Actual, usable MCP servers
  | "mcp_framework"     // Frameworks/libraries for building MCP servers
  | "mcp_sdk"           // SDK or client libraries for MCP
  | "mcp_awesome_list"  // Curated lists/collections
  | "mcp_tool"          // Developer tools/utilities for MCP
  | "mcp_example"       // Examples/demos/tutorials
  | "mcp_template"      // Templates/boilerplates
  | "not_mcp_related"; // Not MCP-related

export type ComplexityLevel = "simple" | "moderate" | "complex";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type MaturityLevel = "experimental" | "alpha" | "beta" | "stable" | "production";

// === ANALYSIS INTERFACES ===

export interface ComputedMetrics {
  isMcpServer?: boolean;
  mcpClassification?: MCPClassification;
  mcpConfidence?: number;
  mcpReasoning?: string;
  primaryLanguage?: string;
  complexity?: ComplexityLevel;
  installationDifficulty?: DifficultyLevel;
  maturityLevel?: MaturityLevel;
  supportedPlatforms?: string[];
  tags?: string[];
  mcpTools?: string[];
  mcpResources?: string[];
  mcpPrompts?: string[];
  requiresClaudeDesktop?: boolean;
  requiresEnvironmentVars?: boolean;
  hasDocumentation?: boolean;
  hasExamples?: boolean;
}

export interface MCPServerQuality {
  score: number;                    // 0-170 quality score
  category: 'high' | 'medium' | 'low';
  trust_score: number;              // 0-100 trust rating
  verified: boolean;
  issues: string[];                 // Known quality issues
  evidence: string[];               // Quality indicators
}

export interface MCPServerPopularity {
  stars: number;                    // GitHub stars
  forks: number;                    // GitHub forks  
  downloads?: number;               // Package downloads
  rating?: number;                  // 1-5 user rating
}

export interface MCPServerCapabilities {
  tools: string[];                  // Available tool names
  resources: string[];              // Available resource types
  prompts: string[];                // Available prompts
  protocol_version?: string;        // MCP protocol version
}

export interface MCPServerAvailability {
  status: 'package_only' | 'live_service' | 'both';
  endpoint_verified: boolean;
  live_endpoint?: string;           // Live service URL
  primary_package: string;          // Preferred registry
  packages_available: boolean;
}

export interface MCPServerAPI {
  transport: 'stdio' | 'http' | 'websocket' | 'sse';
  endpoints: string[];              // Documentation/reference URLs
  cors_enabled: boolean;
  auth: {
    type: 'none' | 'api_key' | 'oauth2' | 'basic' | 'custom';
    description: string;
    required_scopes?: string[];
  };
}

// === PARSING METADATA ===

export type AIProviderType = "gemini" | "openrouter" | "together" | "claude" | "openai";

export interface ParsingMetadata {
  parsedAt: string;
  parserVersion?: string;
  parserType?: AIProviderType;
  sourceFiles?: string[];
  confidence?: number;
  processingTimeMs?: number;
  methodCount: number;
  extractionSuccessful: boolean;
  errors?: string[];
  warnings?: string[];
}

// === TYPE GUARDS ===

export function isMCPClassification(value: string): value is MCPClassification {
  const validClassifications: MCPClassification[] = [
    "mcp_server", "mcp_framework", "mcp_sdk", "mcp_awesome_list", 
    "mcp_tool", "mcp_example", "mcp_template", "not_mcp_related"
  ];
  return validClassifications.includes(value as MCPClassification);
}

export function isComplexityLevel(value: string): value is ComplexityLevel {
  const validLevels: ComplexityLevel[] = ["simple", "moderate", "complex"];
  return validLevels.includes(value as ComplexityLevel);
}

export function isDifficultyLevel(value: string): value is DifficultyLevel {
  const validLevels: DifficultyLevel[] = ["easy", "medium", "hard"];
  return validLevels.includes(value as DifficultyLevel);
}

export function isMaturityLevel(value: string): value is MaturityLevel {
  const validLevels: MaturityLevel[] = ["experimental", "alpha", "beta", "stable", "production"];
  return validLevels.includes(value as MaturityLevel);
}

export function isAIProviderType(value: string): value is AIProviderType {
  const validProviders: AIProviderType[] = ["gemini", "openrouter", "together", "claude", "openai"];
  return validProviders.includes(value as AIProviderType);
}
