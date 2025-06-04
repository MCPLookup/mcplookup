// Next.js API Route - The One Ring MCP Server HTTP Endpoint
// Streaming HTTP MCP Server using @vercel/mcp-adapter

import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import { getServerlessServices } from '@/lib/services';

// Create the MCP handler with our discovery tools
const handler = createMcpHandler(
  (server) => {
    // Tool 1: Discover MCP servers by domain, capability, or intent
    server.tool(
      'discover_mcp_servers',
      'Universal directory for AI tool discovery. Find MCP servers by domain, capability, or intent.',
      {
        domain: z.string().optional().describe('Domain name to search for (e.g., "gmail.com")'),
        capability: z.string().optional().describe('Capability to search for (e.g., "email", "calendar")'),
        intent: z.string().optional().describe('Intent-based search (e.g., "send email", "manage calendar")'),
        category: z.enum(['communication', 'productivity', 'data', 'development', 'content', 'integration', 'analytics', 'security', 'finance', 'ecommerce', 'social', 'other']).optional().describe('Category filter'),
        auth_types: z.array(z.string()).optional().describe('Acceptable authentication types'),
        transport: z.enum(['streamable_http', 'sse', 'stdio']).optional().describe('Required transport protocol'),
        limit: z.number().int().min(1).max(50).default(10).describe('Maximum number of results'),
        offset: z.number().int().min(0).default(0).describe('Pagination offset'),
        include_health: z.boolean().default(true).describe('Include real-time health metrics'),
        include_tools: z.boolean().default(true).describe('Include tool definitions'),
        include_resources: z.boolean().default(false).describe('Include resource definitions'),
        sort_by: z.enum(['relevance', 'uptime', 'response_time', 'created_at']).default('relevance').describe('Sort order')
      },
      async (args) => {
        try {
          const { discovery } = getServerlessServices();
          const result = await discovery.discoverServers(args);

          return {
            content: [{
              type: 'text',
              text: `Found ${result.servers.length} MCP servers:\n\n` +
                result.servers.map(server =>
                  `🔗 **${server.name}** (${server.domain})\n` +
                  `   Endpoint: ${server.endpoint}\n` +
                  `   Capabilities: ${server.capabilities.intent_keywords.join(', ')}\n` +
                  `   Transport: ${server.transport}\n` +
                  `   Health: ${server.health.status} (${server.health.uptime_percentage}% uptime)\n`
                ).join('\n')
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    // Tool 2: Register a new MCP server
    server.tool(
      'register_mcp_server',
      'Register a new MCP server in the global registry. Requires DNS verification to prove domain ownership.',
      {
        domain: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/).describe('Domain name you control (e.g., "mycompany.com")'),
        endpoint: z.string().url().describe('Full URL to your MCP server endpoint'),
        capabilities: z.array(z.string()).optional().describe('List of capabilities your server provides'),
        category: z.enum(['communication', 'productivity', 'data', 'development', 'content', 'integration', 'analytics', 'security', 'finance', 'ecommerce', 'social', 'other']).describe('Primary category'),
        description: z.string().optional().describe('Description of your MCP server')
      },
      async (args) => {
        try {
          const { verification } = getServerlessServices();

          // Start the registration process
          const registrationRequest = {
            domain: args.domain,
            endpoint: args.endpoint,
            contact_email: 'admin@' + args.domain, // Default email
            description: args.description
          };

          const challenge = await verification.initiateDNSVerification(registrationRequest);

          return {
            content: [{
              type: 'text',
              text: `🔐 **Registration Started for ${args.domain}**\n\n` +
                `To complete registration, add this TXT record to your DNS:\n\n` +
                `**Record Type:** TXT\n` +
                `**Name:** ${challenge.txt_record_name}\n` +
                `**Value:** ${challenge.txt_record_value}\n\n` +
                `Challenge ID: ${challenge.challenge_id}\n\n` +
                `Once added, verification will happen automatically. Your server will be discoverable within minutes of successful verification.`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    // Tool 3: Verify domain ownership status
    server.tool(
      'verify_domain_ownership',
      'Check the DNS verification status for a challenge ID.',
      {
        challenge_id: z.string().describe('Challenge ID from registration process')
      },
      async (args) => {
        try {
          const { verification } = getServerlessServices();
          const challenge = await verification.getChallengeStatus(args.challenge_id);

          if (!challenge) {
            return {
              content: [{
                type: 'text',
                text: `❌ **Challenge Not Found**\n\nThe challenge ID ${args.challenge_id} was not found or has expired.`
              }]
            };
          }

          if (challenge.status === 'verified') {
            return {
              content: [{
                type: 'text',
                text: `✅ **Domain Verified: ${challenge.domain}**\n\nYour domain is successfully verified and your MCP server is discoverable in the registry.`
              }]
            };
          } else {
            return {
              content: [{
                type: 'text',
                text: `⏳ **Verification Pending: ${challenge.domain}**\n\nDNS verification is still pending. Please ensure the TXT record is properly configured:\n\n` +
                  `**Record Type:** TXT\n` +
                  `**Name:** ${challenge.txt_record_name}\n` +
                  `**Value:** ${challenge.txt_record_value}\n\n` +
                  `Allow up to 24 hours for DNS propagation.`
              }]
            };
          }
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Verification check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );
  }
);

export { handler as GET, handler as POST, handler as DELETE };
