// Core Zod schemas for the MCPLookup.org discovery service  
// UPDATED: Now imports unified types from SDK instead of defining them locally

import { z } from 'zod';
import { SecureURLSchema, SecureDomainSchema } from '../security/url-validation';
import { 
  MCPServer 
} from '@mcplookup-org/mcp-sdk';

// Use SDK types for the main server record
export type MCPServerRecord = MCPServer;

// Simplified schemas - removed complex schemas that aren't needed for basic functionality
export const CapabilityCategoryEnum = z.enum([
  'communication', 'productivity', 'data', 'development', 'content', 
  'integration', 'analytics', 'security', 'finance', 'ecommerce', 'social', 'other'
]);

export type CapabilityCategory = z.infer<typeof CapabilityCategoryEnum>;

// Basic discovery request schema - simplified
export const DiscoveryRequestSchema = z.object({
  query: z.string().optional().describe("Natural language query"),
  domain: z.string().optional().describe("Domain to search for"), 
  capability: z.string().optional().describe("Capability to search for"),
  category: CapabilityCategoryEnum.optional().describe("Category filter"),
  keywords: z.array(z.string()).optional().describe("Keywords to search for"),
  limit: z.number().min(1).max(100).default(10).describe("Maximum results"),
  offset: z.number().min(0).default(0).describe("Pagination offset")
});

// Basic discovery response schema - simplified
export const DiscoveryResponseSchema = z.object({
  servers: z.array(z.any()).describe("Matching MCP servers (validated as MCPServer from SDK)"),
  pagination: z.object({
    offset: z.number().describe("Current pagination offset"),
    limit: z.number().describe("Number of results requested"),
    has_more: z.boolean().describe("Whether more results are available")
  }).optional().describe("Pagination information"),
  query_metadata: z.object({
    query_time_ms: z.number().describe("Query execution time in milliseconds"),
    cache_hit: z.boolean().describe("Whether result was served from cache"),
    filters_applied: z.array(z.string()).describe("List of filters that were applied")
  }).optional().describe("Query execution metadata")
});

// Registration request schema
export const RegistrationRequestSchema = z.object({
  domain: SecureDomainSchema.describe("Domain to register (e.g., 'api.example.com')"),
  endpoint: SecureURLSchema.describe("MCP endpoint URL"),
  contact_email: z.string().email().describe("Contact email for verification"),
  description: z.string().optional().describe("Server description")
});

// Export types
export type DiscoveryRequest = z.infer<typeof DiscoveryRequestSchema>;
export type DiscoveryResponse = z.infer<typeof DiscoveryResponseSchema>;
export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;
