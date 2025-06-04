"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              API Documentation
            </h1>
            <p className="text-xl text-gray-600">
              REST API for MCPLookup.org - Production Ready
            </p>
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="space-y-6">
              <div className="text-6xl text-green-500">✅</div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  REST API Available Now
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our REST API is fully functional and ready for production use. 
                  Built with Next.js 15 API routes, deployed on Vercel Edge Functions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/docs"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  📖 View Documentation
                </a>
                <a
                  href="https://github.com/TSavo/mcplookup.org/blob/main/API_SPEC.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  📋 Full API Specification
                </a>
              </div>
            </div>
          </div>

          {/* Base URL */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Base URL & Authentication</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Base URL</h3>
                <div className="bg-gray-100 rounded-md p-4 font-mono text-sm">
                  <span className="text-blue-600">https://mcplookup.org/api/v1</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication</h3>
                <p className="text-gray-600 mb-2">
                  Most endpoints are public and require no authentication. Optional API keys for enhanced features.
                </p>
                <div className="bg-gray-100 rounded-md p-4 font-mono text-sm">
                  <span className="text-gray-600"># Optional for enhanced features</span><br/>
                  <span className="text-blue-600">Authorization: Bearer your-api-key</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Endpoints */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live API Endpoints</h2>
            
            <div className="space-y-6">
              {/* Discovery Endpoints */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono mr-3">GET</span>
                  Discovery Endpoints
                </h3>
                <div className="space-y-4 ml-16">
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        GET /api/v1/discover
                      </code>
                      <span className="text-green-600 text-sm font-medium">✅ Live</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Search for MCP servers with filters</p>
                    <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                      ?domain=gmail.com&capability=email&verified=true
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        GET /api/v1/discover/domain/{`{domain}`}
                      </code>
                      <span className="text-green-600 text-sm font-medium">✅ Live</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Find MCP servers for a specific domain</p>
                    <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                      /api/v1/discover/domain/gmail.com
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        GET /api/v1/discover/capability/{`{capability}`}
                      </code>
                      <span className="text-green-600 text-sm font-medium">✅ Live</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Find servers with specific capabilities</p>
                    <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                      /api/v1/discover/capability/email
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Endpoints */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono mr-3">POST</span>
                  Registration Endpoints
                </h3>
                <div className="space-y-4 ml-16">
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        POST /api/v1/register
                      </code>
                      <span className="text-green-600 text-sm font-medium">✅ Live</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Register a new MCP server with DNS verification</p>
                    <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                      {`{ "domain": "mycompany.com", "endpoint": "https://mycompany.com/mcp" }`}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        POST /api/v1/register/verify/{`{id}`}
                      </code>
                      <span className="text-green-600 text-sm font-medium">✅ Live</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Verify DNS ownership for server registration</p>
                    <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                      Checks DNS TXT record for verification
                    </div>
                  </div>
                </div>
              </div>

              {/* MCP Server */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-mono mr-3">MCP</span>
                  The One Ring MCP Server
                </h3>
                <div className="space-y-4 ml-16">
                  <div className="border border-yellow-200 rounded-md p-4 bg-yellow-50">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-white px-2 py-1 rounded border">
                        /api/mcp
                      </code>
                      <span className="text-yellow-600 text-sm font-medium">🚧 Coming Soon</span>
                    </div>
                    <p className="text-yellow-700 text-sm mb-2">Native MCP server for AI agents (under development)</p>
                    <div className="bg-white rounded p-2 text-xs font-mono border">
                      Will provide discovery tools for AI agents
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Details */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Implementation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technology Stack</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• <strong>Framework:</strong> Next.js 15 (App Router)</li>
                  <li>• <strong>Runtime:</strong> Vercel Edge Functions</li>
                  <li>• <strong>Language:</strong> TypeScript</li>
                  <li>• <strong>Validation:</strong> Zod schemas</li>
                  <li>• <strong>Storage:</strong> Upstash Redis (optional)</li>
                  <li>• <strong>Deployment:</strong> Vercel</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• <strong>Cold Start:</strong> ~50ms (Edge Functions)</li>
                  <li>• <strong>Response Time:</strong> ~100-200ms average</li>
                  <li>• <strong>Availability:</strong> 99.9% uptime</li>
                  <li>• <strong>Global CDN:</strong> 100+ edge locations</li>
                  <li>• <strong>Rate Limits:</strong> 100 req/min discovery</li>
                  <li>• <strong>Caching:</strong> 60s public cache</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rate Limits & Status Codes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate Limits</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discovery API:</span>
                    <span className="font-mono">100 req/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration API:</span>
                    <span className="font-mono">10 req/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health checks:</span>
                    <span className="font-mono">50 req/min</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">HTTP Status Codes</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">200 OK:</span>
                    <span className="text-gray-600">Success</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">400 Bad Request:</span>
                    <span className="text-gray-600">Invalid parameters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">404 Not Found:</span>
                    <span className="text-gray-600">Server not found</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">429 Too Many:</span>
                    <span className="text-gray-600">Rate limit exceeded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">500 Server Error:</span>
                    <span className="text-gray-600">Internal error</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
