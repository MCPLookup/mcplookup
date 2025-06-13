// Register MCP Server Tool - Clean, testable implementation
// Handles server registration with domain verification

import { z } from 'zod';
import { BaseMCPTool, ToolContext, MCPToolResponse } from './base-tool';

/**
 * Schema for register_mcp_server tool arguments
 */
const RegisterServerSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  endpoint: z.string().url('Valid endpoint URL is required'),
  capabilities: z.array(z.string()).optional().default([]),
  category: z.string().optional(),
  auth_type: z.enum(['none', 'api_key', 'oauth', 'custom']).optional().default('none'),
  contact_email: z.string().email().optional(),
  description: z.string().optional(),
  user_id: z.string().optional() // Injected by auth middleware
});

type RegisterServerArgs = z.infer<typeof RegisterServerSchema>;

/**
 * MCP Server Registration Tool
 * Handles server registration with domain verification requirements
 */
export class RegisterServerTool extends BaseMCPTool<RegisterServerArgs> {
  constructor() {
    super({
      name: 'register_mcp_server',
      description: 'Register a new MCP server with domain verification and capability specification.',
      schema: RegisterServerSchema,
      requiredPermissions: ['servers:write']
    });
  }

  protected async executeInternal(
    args: RegisterServerArgs,
    context: ToolContext
  ): Promise<MCPToolResponse> {
    const { storage, analytics, verification, dns } = context.services;

    try {
      // Validate domain ownership
      const domainVerified = await this.validateDomainOwnership(
        args.domain,
        context.auth?.userId || args.user_id,
        dns
      );

      if (!domainVerified) {
        return this.createErrorResponse(
          'Domain ownership verification required',
          {
            message: `You must verify ownership of ${args.domain} before registering MCP servers for it.`,
            action_required: 'verify_domain_ownership',
            domain: args.domain,
            instructions: 'Go to https://mcplookup.org/dashboard and verify domain ownership first.'
          }
        );
      }

      // Check if server already exists
      const existingServer = await this.checkExistingServer(args.domain, storage);
      if (existingServer) {
        return this.createErrorResponse(
          'Server already registered',
          {
            domain: args.domain,
            existing_server: existingServer,
            message: 'A server is already registered for this domain. Use update instead.'
          }
        );
      }

      // Create verification challenge
      const challenge = await verification.createChallenge(args.domain, 'dns_txt_record');

      // Prepare registration data
      const registrationData = {
        domain: args.domain,
        endpoint: args.endpoint,
        capabilities: args.capabilities,
        category: args.category,
        auth_type: args.auth_type,
        contact_email: args.contact_email,
        description: args.description,
        user_id: context.auth?.userId || args.user_id,
        status: 'pending_verification',
        created_at: new Date().toISOString()
      };

      // Register server
      const registrationResult = await storage.registerServer(registrationData);

      // Record analytics
      if (context.auth?.userId) {
        await analytics.recordEvent({
          user_id: context.auth.userId,
          event_type: 'mcp_server_registered',
          event_data: {
            domain: args.domain,
            endpoint: args.endpoint,
            capabilities: args.capabilities,
            category: args.category
          }
        });
      }

      // Return success response with verification instructions
      return this.createSuccessResponse({
        registration_id: challenge.challenge_token,
        domain: args.domain,
        status: 'pending_verification',
        verification: {
          method: 'dns_txt_record',
          record_name: `_mcp-verify.${args.domain}`,
          record_value: challenge.challenge_token,
          instructions: 'Add the above TXT record to your DNS, then verification will complete automatically within 5 minutes.',
          verification_url: `https://mcplookup.org/verify/${challenge.challenge_token}`
        },
        estimated_verification_time: '5 minutes',
        next_steps: [
          'Add the DNS TXT record',
          'Wait for automatic verification',
          'Your server will be discoverable once verified'
        ],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return this.createErrorResponse(
        'Server registration failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Validate domain ownership for the user
   */
  private async validateDomainOwnership(
    domain: string,
    userId: string | undefined,
    dns: any
  ): Promise<boolean> {
    if (!userId) {
      return false;
    }

    try {
      return await dns.isUserDomainVerified(userId, domain);
    } catch (error) {
      console.error('Domain verification check failed:', error);
      return false;
    }
  }

  /**
   * Check if server already exists for domain
   */
  private async checkExistingServer(domain: string, storage: any): Promise<any> {
    try {
      const server = await storage.getServer(domain);
      return server;
    } catch (error) {
      // Server doesn't exist, which is what we want
      return null;
    }
  }
}

/**
 * Verify Domain Ownership Tool
 * Handles domain verification challenges
 */
export class VerifyDomainTool extends BaseMCPTool {
  constructor() {
    super({
      name: 'verify_domain_ownership',
      description: 'Verify domain ownership using DNS TXT record challenge.',
      schema: z.object({
        domain: z.string().min(1, 'Domain is required'),
        challenge_token: z.string().optional()
      }),
      requiredPermissions: ['domains:verify']
    });
  }

  protected async executeInternal(
    args: any,
    context: ToolContext
  ): Promise<MCPToolResponse> {
    const { verification, analytics } = context.services;

    try {
      // Get or create verification challenge
      let challenge;
      if (args.challenge_token) {
        // Verify existing challenge
        challenge = await verification.verifyChallenge(args.challenge_token, args.domain);
      } else {
        // Create new challenge
        challenge = await verification.createChallenge(args.domain, 'dns_txt_record');
      }

      // Record analytics
      if (context.auth?.userId) {
        await analytics.recordEvent({
          user_id: context.auth.userId,
          event_type: 'domain_verification_attempted',
          event_data: {
            domain: args.domain,
            has_token: !!args.challenge_token
          }
        });
      }

      if (challenge.verified) {
        return this.createSuccessResponse({
          domain: args.domain,
          verified: true,
          verification_date: new Date().toISOString(),
          message: 'Domain ownership verified successfully!'
        });
      } else {
        return this.createSuccessResponse({
          domain: args.domain,
          verified: false,
          challenge: {
            record_name: `_mcp-verify.${args.domain}`,
            record_value: challenge.challenge_token,
            instructions: 'Add this TXT record to your DNS and try again.'
          },
          message: 'Domain verification pending. Please add the DNS TXT record.'
        });
      }

    } catch (error) {
      return this.createErrorResponse(
        'Domain verification failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
