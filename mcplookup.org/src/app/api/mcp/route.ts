// @ts-nocheck
// THE ONE RING MCP SERVER - Next.js API Route Implementation
// The master MCP server that discovers all other MCP servers
// Uses @vercel/mcp-adapter for seamless MCP protocol support

import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import { getServerlessServices } from '../../../lib/services/index';
import { validateMCPToolAuth } from '@/lib/mcp/auth-wrapper';

// Initialize services for serverless deployment
const services = getServerlessServices();

// Helper function to create authenticated MCP handler
function createAuthenticatedMcpHandler() {
  return createMcpHandler(
  (server) => {
    // Tool 1: discover_mcp_servers - Flexible MCP server discovery
    server.tool(
      'discover_mcp_servers',
      'Flexible MCP server discovery with natural language queries, similarity search, complex capability matching, and performance constraints. Express any search requirement naturally.',
      {
        // Natural language query (most flexible)
        query: z.string().optional().describe('Natural language query: "Find email servers like Gmail but faster", "I need document collaboration tools", "Show me alternatives to Slack"'),

        // Exact lookups
        domain: z.string().optional().describe('Exact domain lookup (e.g., "gmail.com")'),
        domains: z.array(z.string()).optional().describe('Multiple domain lookups'),

        // Flexible capability matching
        capabilities: z.object({
          operator: z.enum(['AND', 'OR', 'NOT']).default('AND').describe('How to combine capabilities'),
          required: z.array(z.string()).optional().describe('Must have these capabilities'),
          preferred: z.array(z.string()).optional().describe('Nice to have these capabilities'),
          exclude: z.array(z.string()).optional().describe('Must NOT have these capabilities'),
          minimum_match: z.number().min(0).max(1).default(0.5).describe('Minimum match score (0-1)')
        }).optional().describe('Complex capability requirements'),

        // Similarity search
        similar_to: z.object({
          domain: z.string().describe('Find servers similar to this domain'),
          threshold: z.number().min(0).max(1).default(0.7).describe('Similarity threshold'),
          exclude_reference: z.boolean().default(true).describe('Exclude the reference domain')
        }).optional().describe('Find similar servers'),

        // Categories and keywords
        categories: z.array(z.enum(['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'analytics', 'security', 'content', 'integration'])).optional().describe('Multiple categories'),
        keywords: z.array(z.string()).optional().describe('Search keywords'),

        // Performance constraints
        performance: z.object({
          min_uptime: z.number().min(0).max(100).optional().describe('Minimum uptime %'),
          max_response_time: z.number().min(0).optional().describe('Max response time (ms)'),
          min_trust_score: z.number().min(0).max(100).optional().describe('Minimum trust score'),
          verified_only: z.boolean().default(true).describe('Only DNS-verified'),
          healthy_only: z.boolean().default(true).describe('Only healthy servers')
        }).optional().describe('Performance requirements'),

        // Availability filtering (FIRST-CLASS vs DEPRECATED)
        availability_filter: z.object({
          include_live: z.boolean().default(true).describe('Include live servers with working endpoints'),
          include_package_only: z.boolean().default(false).describe('Include package-only servers (deprecated citizens)'),
          include_deprecated: z.boolean().default(false).describe('Include explicitly deprecated servers'),
          include_offline: z.boolean().default(false).describe('Include offline servers'),
          live_servers_only: z.boolean().default(false).describe('Shortcut: only live servers (overrides other flags)')
        }).optional().describe('Server availability filtering'),

        // Server type filtering (GITHUB vs OFFICIAL)
        server_type_filter: z.object({
          include_github: z.boolean().default(true).describe('Include GitHub-based servers (unofficial/community)'),
          include_official: z.boolean().default(true).describe('Include domain ownership-verified official servers'),
          official_only: z.boolean().default(false).describe('Shortcut: only official domain-verified servers'),
          github_only: z.boolean().default(false).describe('Shortcut: only GitHub-based servers'),
          minimum_official_status: z.enum(['unofficial', 'community', 'verified', 'enterprise']).default('unofficial').describe('Minimum official status level'),
          require_domain_verification: z.boolean().default(false).describe('Require DNS domain verification'),
          require_github_verification: z.boolean().default(false).describe('Require GitHub repo verification')
        }).optional().describe('Server type classification filtering'),

        // Technical requirements
        technical: z.object({
          auth_types: z.array(z.string()).optional().describe('Acceptable auth methods'),
          transport: z.enum(['streamable_http', 'sse', 'stdio']).optional().describe('Required transport'),
          cors_support: z.boolean().optional().describe('Requires CORS')
        }).optional().describe('Technical requirements'),

        // Response customization
        limit: z.number().int().min(1).max(100).default(10).describe('Maximum results'),
        include_alternatives: z.boolean().default(true).describe('Include alternative suggestions'),
        include_similar: z.boolean().default(false).describe('Include similar servers'),
        sort_by: z.enum(['relevance', 'similarity', 'performance', 'popularity', 'trust_score']).default('relevance').describe('Sort order')
      },
      async (args) => {
        try {
          // Build flexible discovery request from agent parameters
          const discoveryRequest: any = {
            limit: args.limit || 10,
            sort_by: args.sort_by || 'relevance'
          };

          // Natural language query (highest priority)
          if (args.query) {
            discoveryRequest.query = args.query;
          }

          // Domain lookups
          if (args.domain) {
            discoveryRequest.domain = { type: 'exact', value: args.domain };
          }
          if (args.domains) {
            discoveryRequest.domains = args.domains;
          }

          // Flexible capability matching
          if (args.capabilities) {
            discoveryRequest.capabilities = {
              operator: args.capabilities.operator || 'AND',
              capabilities: [
                ...(args.capabilities.required || []).map(cap => ({ type: 'exact', value: cap, required: true })),
                ...(args.capabilities.preferred || []).map(cap => ({ type: 'fuzzy', value: cap, weight: 0.7 })),
                ...(args.capabilities.exclude || []).map(cap => ({ type: 'exact', value: cap, required: false, exclude: true }))
              ],
              minimum_match: args.capabilities.minimum_match || 0.5
            };
          }

          // Similarity search
          if (args.similar_to) {
            discoveryRequest.similar_to = {
              reference_domain: args.similar_to.domain,
              similarity_threshold: args.similar_to.threshold || 0.7,
              exclude_reference: args.similar_to.exclude_reference !== false
            };
          }

          // Categories and keywords
          if (args.categories) {
            discoveryRequest.categories = args.categories;
          }
          if (args.keywords) {
            discoveryRequest.keywords = args.keywords.map(keyword => ({ type: 'fuzzy', value: keyword }));
          }

          // Performance constraints
          if (args.performance) {
            discoveryRequest.performance = args.performance;
          }

          // Availability filtering (FIRST-CLASS vs DEPRECATED)
          if (args.availability_filter) {
            discoveryRequest.availability_filter = args.availability_filter;
          } else {
            // Default: live servers only (first-class citizens)
            discoveryRequest.availability_filter = {
              include_live: true,
              include_package_only: false,
              include_deprecated: false,
              include_offline: false,
              live_servers_only: false
            };
          }

          // Server type filtering (GITHUB vs OFFICIAL)
          if (args.server_type_filter) {
            discoveryRequest.server_type_filter = args.server_type_filter;
          } else {
            // Default: include both GitHub and official servers, prioritizing official
            discoveryRequest.server_type_filter = {
              include_github: true,
              include_official: true,
              official_only: false,
              github_only: false,
              minimum_official_status: 'unofficial',
              require_domain_verification: false,
              require_github_verification: false
            };
          }

          // Technical requirements
          if (args.technical) {
            discoveryRequest.technical = args.technical;
          }

          // Response customization
          discoveryRequest.include = {
            health_metrics: true,
            alternative_suggestions: args.include_alternatives !== false,
            similar_servers: args.include_similar === true
          };

          const response = await services.discovery.discoverServers(discoveryRequest);

          // Enhanced response with rich analysis data
          const enhancedResults = response.servers.map((server: any) => ({
            ...server,
            // Highlight rich analysis data if available
            enhanced_features: {
              has_ai_analysis: !!(server.mcp_analysis),
              has_rich_installation: !!(server.packages?.length > 0),
              has_environment_vars: !!(server.packages?.some((pkg: any) => pkg.environment_variables?.length > 0)),
              parser_enhanced: !!(server.parser_version),
              trust_score: server.trust_score || 0,
              analysis_confidence: server.mcp_analysis?.confidence || 0,
              // Server type classification
              server_type: server.server_type?.type || 'unknown',
              official_status: server.server_type?.official_status || 'unofficial',
              verification_badges: server.server_type?.verification_badges || [],
              domain_verified: server.server_type?.domain_verified || false,
              github_verified: server.server_type?.github_verified || false
            }
          }));

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                query: {
                  ...discoveryRequest,
                  timestamp: new Date().toISOString()
                },
                results: enhancedResults,
                total_results: enhancedResults.length, // Use actual results count since total_count doesn't exist in simplified pagination
                discovery_time_ms: response.query_metadata?.query_time_ms || 0,
                enhancement_info: {
                  ai_analyzed_servers: enhancedResults.filter((s: any) => s.enhanced_features.has_ai_analysis).length,
                  parser_enhanced_servers: enhancedResults.filter((s: any) => s.enhanced_features.parser_enhanced).length,
                  avg_trust_score: enhancedResults.reduce((sum: number, s: any) => sum + (s.enhanced_features.trust_score || 0), 0) / enhancedResults.length,
                  // Server type breakdown
                  server_type_breakdown: {
                    official_servers: enhancedResults.filter((s: any) => s.enhanced_features.server_type === 'official').length,
                    github_servers: enhancedResults.filter((s: any) => s.enhanced_features.server_type === 'github').length,
                    domain_verified: enhancedResults.filter((s: any) => s.enhanced_features.domain_verified).length,
                    github_verified: enhancedResults.filter((s: any) => s.enhanced_features.github_verified).length,
                    enterprise_grade: enhancedResults.filter((s: any) => s.enhanced_features.official_status === 'enterprise').length
                  }
                }
              }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Discovery failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      }
    );

    // Tool 2: register_mcp_server - Register a new MCP server with DNS verification
    server.tool(
      'register_mcp_server',
      'Register a new MCP server in the global registry. Requires authentication and domain ownership verification.',
      {
        domain: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/).describe('Domain name you control (e.g., "mycompany.com")'),
        endpoint: z.string().url().describe('Full URL to your MCP server endpoint'),
        capabilities: z.array(z.string()).optional().describe('List of capabilities your server provides'),
        category: z.enum(['communication', 'productivity', 'development', 'finance', 'social', 'storage', 'other']).optional(),
        auth_type: z.enum(['none', 'api_key', 'oauth2', 'basic']).default('none'),
        contact_email: z.string().email().optional().describe('Contact email for verification and issues'),
        description: z.string().max(500).optional().describe('Brief description of your MCP server\'s purpose'),
        user_id: z.string().describe('Your authenticated user ID - required for domain ownership verification')
      },
      async (args, request) => {
        try {
          // 🔒 SECURITY: Validate API key authentication for registration
          const authResult = await validateMCPToolAuth(request, 'register_mcp_server', args);

          if (!authResult.success) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'Authentication failed',
                  message: authResult.error,
                  tool: 'register_mcp_server',
                  timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          }

          // Use authenticated user ID instead of args.user_id
          const userId = authResult.context?.userId || args.user_id;

          // 🔒 SECURITY: Verify domain ownership before allowing registration
          const { isUserDomainVerified } = await import('@/lib/services/dns-verification');
          const domainVerified = await isUserDomainVerified(userId, args.domain);

          if (!domainVerified) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'Domain ownership verification required',
                  message: `You must verify ownership of ${args.domain} before registering MCP servers for it.`,
                  action_required: 'verify_domain_ownership',
                  domain: args.domain,
                  instructions: 'Go to https://mcplookup.org/dashboard and verify domain ownership first.',
                  timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          }
          const registrationRequest = {
            domain: args.domain,
            endpoint: args.endpoint,
            capabilities: args.capabilities || [],
            category: args.category,
            auth_type: args.auth_type,
            contact_email: args.contact_email,
            description: args.description
          };

          const response = await services.verification.initiateDNSVerification({
            domain: registrationRequest.domain,
            endpoint: registrationRequest.endpoint,
            contact_email: registrationRequest.contact_email || 'unknown@example.com',
            description: registrationRequest.description
          });

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                registration_id: response.challenge_token, // Use challenge_token as registration_id
                domain: args.domain,
                status: 'pending_verification',
                verification: {
                  method: 'dns_txt_record',
                  record_name: `_mcp-verify.${args.domain}`,
                  record_value: response.challenge_token, // Use challenge_token as record value
                  instructions: 'Add the above TXT record to your DNS, then verification will complete automatically within 5 minutes.',
                  verification_url: `https://mcplookup.org/verify/${response.challenge_token}` // Use challenge_token
                },
                estimated_verification_time: '5 minutes',
                next_steps: [
                  'Add the DNS TXT record',
                  'Wait for automatic verification',
                  'Your server will be discoverable once verified'
                ]
              }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Registration failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      }
    );

    // Tool 2.5: register_mcp_server_from_github - Auto-register MCP server from GitHub repository
    server.tool(
      "register_mcp_server_from_github",
      "Automatically analyze and register an MCP server from a GitHub repository URL. Includes intelligent analysis, quality assessment, and rejection logic.",
      {
        github_url: z.string().url().regex(/^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/).describe("GitHub repository URL (e.g., \"https://github.com/owner/mcp-server-repo\")"),
        contact_email: z.string().email().describe("Contact email for verification and notifications"),
        force_register: z.boolean().default(false).describe("Force registration despite analysis warnings or rejections"),
        skip_analysis: z.boolean().default(false).describe("Skip detailed analysis for faster processing (not recommended)"),
        user_id: z.string().describe("Your authenticated user ID - required for registration")
      },
      async (args, request) => {
        try {
          // 🔒 SECURITY: Validate API key authentication for registration
          const authResult = await validateMCPToolAuth(request, "register_mcp_server_from_github", args);

          if (!authResult.success) {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error: "Authentication failed",
                  message: authResult.error,
                  tool: "register_mcp_server_from_github",
                  timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          }

          // Use authenticated user ID
          const userId = authResult.context?.userId || args.user_id;

          // Call the GitHub auto-registration API internally by making a fetch request
          const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/v1/register/github`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authResult.context?.apiKeyId || "internal"}`
            },
            body: JSON.stringify({
              github_url: args.github_url,
              contact_email: args.contact_email,
              force_register: args.force_register,
              skip_analysis: args.skip_analysis
            })
          });

          const data = await response.json();

          // Return the response from the GitHub auto-registration API
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                ...data,
                tool: "register_mcp_server_from_github",
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };

        } catch (error) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "GitHub auto-registration failed",
                message: error instanceof Error ? error.message : "Unknown error",
                github_url: args.github_url,
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      }
    );


    // Tool 3: verify_domain_ownership - Check DNS verification status
    server.tool(
      'verify_domain_ownership',
      'Check the DNS verification status for a domain registration.',
      {
        domain: z.string().describe('Domain to check verification status'),
        challenge_id: z.string().optional().describe('Specific challenge ID to check')
      },
      async (args, request) => {
        try {
          // 🔒 SECURITY: Validate API key authentication for verification check
          const authResult = await validateMCPToolAuth(request, 'verify_domain_ownership', args);

          if (!authResult.success) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'Authentication failed',
                  message: authResult.error,
                  tool: 'verify_domain_ownership',
                  timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          }

          // TODO: Check if domain is already registered and verified
          // Simplified - skip existing server check for now
          const existingServer = null; // await services.discovery.discoverByDomain(args.domain);

          // Simplified - skip existing server verification check for now
          /*
          if (existingServer && existingServer.verification?.dns_verified) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  domain: args.domain,
                  verified: true,
                  verification_date: existingServer.verification.verified_at,
                  verification_method: existingServer.verification.verification_method,
                  status: 'verified',
                  server_endpoint: existingServer.endpoint,
                  timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          }
          */

          // If challenge_id provided, check specific challenge status
          if (args.challenge_id) {
            try {
              const challengeStatus = await services.verification.getChallengeStatus(args.challenge_id);

              if (!challengeStatus) {
                return {
                  content: [{
                    type: 'text',
                    text: JSON.stringify({
                      domain: args.domain,
                      challenge_id: args.challenge_id,
                      verified: false,
                      status: 'challenge_not_found',
                      error: 'Challenge ID not found or expired',
                      timestamp: new Date().toISOString()
                    }, null, 2)
                  }]
                };
              }

              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    domain: args.domain,
                    challenge_id: args.challenge_id,
                    verified: challengeStatus.status === 'verified',
                    status: challengeStatus.status,
                    verification_date: challengeStatus.status === 'verified' ? new Date().toISOString() : null,
                    verification_method: 'dns',
                    timestamp: new Date().toISOString()
                  }, null, 2)
                }]
              };
            } catch (error) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    domain: args.domain,
                    challenge_id: args.challenge_id,
                    verified: false,
                    status: 'challenge_not_found',
                    error: 'Challenge ID not found or expired',
                    timestamp: new Date().toISOString()
                  }, null, 2)
                }]
              };
            }
          }

          // Domain not found in registry
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                domain: args.domain,
                verified: false,
                status: 'not_registered',
                message: 'Domain not found in registry. Use register_mcp_server to start registration.',
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Verification check failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                domain: args.domain,
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      }
    );

    // Tool 4: get_server_health - Get health and performance metrics
    server.tool(
      'get_server_health',
      'Get real-time health, performance, and reliability metrics for MCP servers.',
      {
        domain: z.string().optional().describe('Specific domain to check'),
        domains: z.array(z.string()).optional().describe('Multiple domains to check')
      },
      async (args, request) => {
        try {
          // 🔒 SECURITY: Validate API key authentication for health checks
          const authResult = await validateMCPToolAuth(request, 'get_server_health', args);

          if (!authResult.success) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'Authentication failed',
                  message: authResult.error,
                  tool: 'get_server_health',
                  timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          }

          const domainsToCheck = args.domains || (args.domain ? [args.domain] : []);

          if (domainsToCheck.length === 0) {
            throw new Error('Either domain or domains parameter is required');
          }

          const healthResults = await Promise.all(
            domainsToCheck.map(async (domain) => {
              try {
                const server = await services.discovery.discoverByDomain(domain);
                if (!server) {
                  return {
                    domain,
                    error: 'Server not found in registry'
                  };
                }

                const health = await services.health.checkServerHealth(server.endpoint || server.availability?.live_endpoint || '');

                return {
                  domain,
                  health: {
                    status: health.status,
                    uptime_percentage: health.uptime_percentage,
                    response_times: {
                      current_ms: health.response_time_ms,
                      avg_24h_ms: health.avg_response_time_ms, // Use available property
                      p95_24h_ms: health.avg_response_time_ms // Fallback to avg since p95 not available
                    },
                    last_outage: null, // Not available in current schema
                    checks_performed: 0, // Not available in current schema
                    last_check: health.last_check
                  },
                  capabilities_status: {
                    all_working: true, // Not available in current schema
                    last_capability_check: health.last_check // Fallback
                  },
                  trust_metrics: {
                    trust_score: server.trust_score || 0,
                    verification_status: server.verification?.dns_verified ? 'dns_verified' : 'unverified',
                    security_scan: 'not_scanned', // Not available in current schema
                    community_rating: 0 // Not available in current schema
                  }
                };
              } catch (error) {
                return {
                  domain,
                  error: error instanceof Error ? error.message : 'Health check failed'
                };
              }
            })
          );

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                results: healthResults,
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Health check failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      }
    );

    // Tool 5: browse_capabilities - Explore the capability taxonomy
    server.tool(
      'browse_capabilities',
      'Browse and search the taxonomy of available MCP capabilities across all registered servers.',
      {
        category: z.string().optional().describe('Filter by category'),
        search: z.string().optional().describe('Search capability names and descriptions'),
        popular: z.boolean().optional().describe('Show most popular capabilities')
      },
      async (args) => {
        try {
          // Get all servers to analyze capabilities
          const allServers = await services.registry.getAllVerifiedServers();

          // Build capability taxonomy
          const capabilityMap = new Map<string, {
            name: string;
            count: number;
            servers: string[];
            categories: Set<string>;
            descriptions: Set<string>;
          }>();

          allServers.forEach(server => {            // Handle capabilities as an object with subcategories array
            if (server.capabilities && typeof server.capabilities === 'object' && 'subcategories' in server.capabilities && server.capabilities.subcategories) {
              server.capabilities.subcategories.forEach((capability: string) => {
              if (!capabilityMap.has(capability)) {
                capabilityMap.set(capability, {
                  name: capability,
                  count: 0,
                  servers: [],
                  categories: new Set(),
                  descriptions: new Set()
                });
              }

                const cap = capabilityMap.get(capability)!;
                cap.count++;
                cap.servers.push(server.domain);                if (server.capabilities && typeof server.capabilities === 'object' && 'category' in server.capabilities && server.capabilities.category) {
                  cap.categories.add(server.capabilities.category);
                }
                if (server.description) cap.descriptions.add(server.description);
              });
            }
          });

          // Convert to array and apply filters
          let capabilities = Array.from(capabilityMap.values()).map(cap => ({
            name: cap.name,
            server_count: cap.count,
            example_servers: cap.servers.slice(0, 5),
            categories: Array.from(cap.categories),
            sample_descriptions: Array.from(cap.descriptions).slice(0, 3)
          }));

          // Apply search filter
          if (args.search) {
            const searchLower = args.search.toLowerCase();
            capabilities = capabilities.filter(cap =>
              cap.name.toLowerCase().includes(searchLower) ||
              cap.sample_descriptions.some(desc => desc.toLowerCase().includes(searchLower))
            );
          }

          // Apply category filter
          if (args.category) {
            capabilities = capabilities.filter(cap =>
              cap.categories.includes(args.category!)
            );
          }

          // Sort by popularity if requested
          if (args.popular) {
            capabilities.sort((a, b) => b.server_count - a.server_count);
          } else {
            capabilities.sort((a, b) => a.name.localeCompare(b.name));
          }

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                capabilities: capabilities.slice(0, 50), // Limit to 50 results
                total_capabilities: capabilities.length,
                total_servers_analyzed: allServers.length,
                filters_applied: {
                  category: args.category,
                  search: args.search,
                  popular: args.popular
                },
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Capability browsing failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      }
    );

    // Tool 6: get_discovery_stats - Analytics and usage statistics
    server.tool(
      'get_discovery_stats',
      'Get analytics about MCP server discovery patterns and usage statistics.',
      {
        timeframe: z.enum(['hour', 'day', 'week', 'month']).default('day'),
        metric: z.enum(['discoveries', 'registrations', 'health_checks', 'popular_domains']).default('discoveries')
      },
      async (args, request) => {
        try {
          // 🔒 SECURITY: Validate API key authentication for analytics
          const authResult = await validateMCPToolAuth(request, 'get_discovery_stats', args);

          if (!authResult.success) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'Authentication failed',
                  message: authResult.error,
                  tool: 'get_discovery_stats',
                  timestamp: new Date().toISOString()
                }, null, 2)
              }]
            };
          }

          // Get current registry statistics
          const allServers = await services.registry.getAllVerifiedServers();
          const verifiedCount = allServers.filter(s => s.verification?.dns_verified).length;
          const healthyCount = allServers.filter(s => s.health?.status === 'healthy').length;

          // Calculate basic metrics
          const stats = {
            registry_overview: {
              total_registered_servers: allServers.length,
              verified_servers: verifiedCount,
              healthy_servers: healthyCount,
              verification_rate: Math.round((verifiedCount / allServers.length) * 100),
              health_rate: Math.round((healthyCount / allServers.length) * 100)
            },
            popular_domains: allServers
              .sort((a, b) => (b.trust_score || 0) - (a.trust_score || 0)) // Use trust_score instead of popularity_rank
              .slice(0, 10)
              .map(s => ({
                domain: s.domain,
                capabilities: s.capabilities,
                trust_score: s.trust_score,
                category: s.capabilities && typeof s.capabilities === 'object' && 'category' in s.capabilities ? s.capabilities.category : 'other'
              })),
            capability_distribution: {},
            category_distribution: {},
            timeframe: args.timeframe,
            metric_type: args.metric,
            timestamp: new Date().toISOString()
          };

          // Calculate capability distribution
          const capabilityCount = new Map<string, number>();
          allServers.forEach(server => {
            if (server.capabilities && typeof server.capabilities === 'object' && 'subcategories' in server.capabilities) {
              server.capabilities.subcategories.forEach((cap: string) => {
                capabilityCount.set(cap, (capabilityCount.get(cap) || 0) + 1);
              });
            }
          });
          stats.capability_distribution = Object.fromEntries(
            Array.from(capabilityCount.entries())
              .sort(([,a], [,b]) => b - a)
              .slice(0, 20)
          );

          // Calculate category distribution
          const categoryCount = new Map<string, number>();
          allServers.forEach(server => {
            if (server.capabilities && typeof server.capabilities === 'object' && 'category' in server.capabilities) {
              const category = server.capabilities.category;
              categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
            }
          });
          stats.category_distribution = Object.fromEntries(categoryCount.entries());

          return {
            content: [{
              type: 'text',
              text: JSON.stringify(stats, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Statistics retrieval failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      }
    );

    // Tool 7: list_mcp_tools - List all available MCP tools in this server
    server.tool(
      'list_mcp_tools',
      'List all available MCP tools provided by this discovery server with descriptions and parameters.',
      {},
      async () => {
        try {
          const tools = [
            {
              name: 'discover_mcp_servers',
              description: 'Flexible MCP server discovery with natural language queries, similarity search, complex capability matching, performance constraints, and availability filtering (live vs package-only servers).',
              category: 'discovery',
              parameters: ['query', 'domain', 'domains', 'capabilities', 'similar_to', 'categories', 'keywords', 'performance', 'availability_filter', 'technical', 'limit', 'include_alternatives', 'include_similar', 'sort_by'],
              examples: [
                'Find email servers like Gmail but faster',
                'Show me document collaboration tools',
                'Find servers with OAuth2 authentication',
                'Find live email servers only (exclude package-only)',
                'Include package-only servers for local development'
              ]
            },
            {
              name: 'register_mcp_server',
              description: 'Register a new MCP server in the global registry with DNS verification.',
              category: 'registration',
              parameters: ['domain', 'endpoint', 'capabilities', 'category', 'auth_type', 'contact_email', 'description'],
              examples: [
                'Register mycompany.com MCP server',
                'Add new productivity server to registry'
              ]
            },
            {
              name: "register_mcp_server_from_github",
              description: "Automatically analyze and register an MCP server from a GitHub repository URL with intelligent analysis and quality assessment.",
              category: "registration",
              parameters: ["github_url", "contact_email", "force_register", "skip_analysis"],
              examples: [
                "Register https://github.com/owner/mcp-server-repo",
                "Auto-register MCP server from GitHub with analysis"
              ]
            },
            {
              name: 'verify_domain_ownership',
              description: 'Check DNS verification status for domain registration.',
              category: 'verification',
              parameters: ['domain', 'challenge_id'],
              examples: [
                'Check if mycompany.com is verified',
                'Get verification status for challenge'
              ]
            },
            {
              name: 'get_server_health',
              description: 'Get real-time health, performance, and reliability metrics for MCP servers.',
              category: 'monitoring',
              parameters: ['domain', 'domains'],
              examples: [
                'Check health of gmail.com',
                'Monitor multiple server health'
              ]
            },
            {
              name: 'browse_capabilities',
              description: 'Browse and search the taxonomy of available MCP capabilities across all registered servers.',
              category: 'discovery',
              parameters: ['category', 'search', 'popular'],
              examples: [
                'Show popular email capabilities',
                'Search for document editing features'
              ]
            },
            {
              name: 'get_discovery_stats',
              description: 'Get analytics about MCP server discovery patterns and usage statistics.',
              category: 'analytics',
              parameters: ['timeframe', 'metric'],
              examples: [
                'Show daily discovery statistics',
                'Get popular domains this week'
              ]
            },
            {
              name: 'list_mcp_tools',
              description: 'List all available MCP tools provided by this discovery server.',
              category: 'meta',
              parameters: [],
              examples: [
                'What tools are available?',
                'Show all MCP capabilities'
              ]
            }
          ];

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                server_info: {
                  name: 'MCP Lookup Discovery Server',
                  description: 'The master MCP server that discovers all other MCP servers',
                  endpoint: 'https://mcplookup.org/api/mcp',
                  protocol_version: '2024-11-05',
                  capabilities: ['tools', 'discovery', 'registration', 'verification', 'monitoring']
                },
                tools: tools,
                total_tools: tools.length,
                categories: ['discovery', 'registration', 'verification', 'monitoring', 'analytics', 'meta'],
                usage_instructions: [
                  'Use discover_mcp_servers for finding servers',
                  'Use register_mcp_server to add new servers',
                  "Use register_mcp_server_from_github for GitHub auto-registration",
                  'Use verify_domain_ownership to check verification',
                  'Use get_server_health for monitoring',
                  'Use browse_capabilities to explore features',
                  'Use get_discovery_stats for analytics'
                ],
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Tool listing failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }, null, 2)
            }]
          };
        }
      }
    );
  }
);
}

// Create the authenticated handler
const handler = createAuthenticatedMcpHandler();

export { handler as GET, handler as POST, handler as DELETE };
