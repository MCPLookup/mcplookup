"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              📚 MCPLookup.org Documentation
            </h1>
            <p className="text-xl text-gray-600">
              Complete guide to the universal MCP server discovery service
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Documentation Hub</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-4xl">🤔</div>
                <h3 className="text-lg font-semibold text-gray-900">What is this?</h3>
                <p className="text-gray-600 text-sm">
                  New to MCP? Start here to understand what MCPLookup.org does and why it matters.
                </p>
                <a
                  href="https://github.com/TSavo/mcplookup.org/blob/main/WHAT_IS_THIS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  📖 Read Introduction
                </a>
              </div>

              <div className="text-center space-y-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-4xl">👤</div>
                <h3 className="text-lg font-semibold text-gray-900">User Guide</h3>
                <p className="text-gray-600 text-sm">
                  Step-by-step guide for discovering servers, registering your own, and troubleshooting.
                </p>
                <a
                  href="https://github.com/TSavo/mcplookup.org/blob/main/USER_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  📚 User Guide
                </a>
              </div>

              <div className="text-center space-y-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-4xl">⚡</div>
                <h3 className="text-lg font-semibold text-gray-900">API Reference</h3>
                <p className="text-gray-600 text-sm">
                  Complete REST API specification with examples, error codes, and response formats.
                </p>
                <a
                  href="https://github.com/TSavo/mcplookup.org/blob/main/API_SPECIFICATION.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  🔌 API Docs
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-center">
                <strong>💡 Pro Tip:</strong> Start with "What is this?" if you're new to MCP, then move to the User Guide for hands-on instructions, and finally check the API Reference for technical integration details.
              </p>
            </div>
          </div>

          {/* Quick Start */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🔍 Discovering MCP Servers
                </h3>
                <p className="text-gray-600 mb-4">
                  Use our discovery API to find MCP servers by domain or capability:
                </p>
                <div className="bg-gray-100 rounded-md p-4 font-mono text-sm">
                  <pre className="text-gray-800 whitespace-pre-wrap">
{`# Find servers by domain
curl https://mcplookup.org/api/v1/discover/domain/gmail.com

# Find servers by capability
curl https://mcplookup.org/api/v1/discover/capability/email`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ➕ Registering Your MCP Server
                </h3>
                <p className="text-gray-600 mb-4">
                  Register your MCP server to make it discoverable:
                </p>
                <div className="bg-gray-100 rounded-md p-4 font-mono text-sm">
                  <pre className="text-gray-800 whitespace-pre-wrap">
{`curl -X POST https://mcplookup.org/api/v1/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "mycompany.com",
    "endpoint": "https://mycompany.com/mcp",
    "capabilities": ["email", "calendar"],
    "contact_email": "admin@mycompany.com"
  }'`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">API Reference</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Discovery Endpoints</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      GET /api/v1/discover
                    </code>
                    <p className="text-gray-600 mt-1">Search for MCP servers with filters</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      GET /api/v1/discover/domain/{`{domain}`}
                    </code>
                    <p className="text-gray-600 mt-1">Find servers for a specific domain</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      GET /api/v1/discover/capability/{`{capability}`}
                    </code>
                    <p className="text-gray-600 mt-1">Find servers with specific capabilities</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Endpoints</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      POST /api/v1/register
                    </code>
                    <p className="text-gray-600 mt-1">Register a new MCP server</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      POST /api/v1/register/verify/{`{id}`}
                    </code>
                    <p className="text-gray-600 mt-1">Verify DNS ownership for registration</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800">
                <strong>📖 Full API Documentation:</strong> Visit our{" "}
                <Link href="/api/docs" className="underline hover:text-blue-600">
                  interactive API docs
                </Link>{" "}
                for complete specifications and examples.
              </p>
            </div>
          </section>

          {/* Architecture Overview */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Architecture Overview</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🏗️ Serverless, Zero-Infrastructure Design
                </h3>
                <p className="text-gray-600 mb-4">
                  MCPLookup.org is built with a truly serverless architecture:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="font-semibold text-green-800 mb-2">✅ What We Use</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Next.js 15 (App Router)</li>
                      <li>• Vercel Edge Functions</li>
                      <li>• Upstash Redis (optional)</li>
                      <li>• DNS-based verification</li>
                      <li>• In-memory caching</li>
                      <li>• TypeScript + Zod validation</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="font-semibold text-red-800 mb-2">❌ What We Don't Need</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      <li>• No traditional database</li>
                      <li>• No persistent servers</li>
                      <li>• No file system storage</li>
                      <li>• No complex infrastructure</li>
                      <li>• No manual scaling</li>
                      <li>• No maintenance overhead</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🔄 Smart Storage Strategy
                </h3>
                <p className="text-gray-600 mb-4">
                  Our storage automatically adapts to the environment:
                </p>
                <div className="bg-gray-100 rounded-md p-4 font-mono text-sm">
                  <div className="text-gray-800">
                    # Production: Upstash Redis (serverless)<br/>
                    UPSTASH_REDIS_REST_URL=https://your-db.upstash.io<br/><br/>
                    # Development: In-memory (zero setup)<br/>
                    # No configuration needed!<br/><br/>
                    # Testing: Automatic in-memory<br/>
                    NODE_ENV=test
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🔍 Real-time Discovery
                </h3>
                <p className="text-gray-600 mb-4">
                  We discover MCP servers through multiple methods:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Registered servers:</strong> Stored in Redis with DNS verification</li>
                  <li><strong>Well-known endpoints:</strong> Auto-discovery via /.well-known/mcp</li>
                  <li><strong>DNS TXT records:</strong> Real-time DNS queries for _mcp records</li>
                  <li><strong>Health monitoring:</strong> Live endpoint testing and status</li>
                </ul>
              </div>
            </div>
          </section>

          {/* MCP Integration */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">MCP Integration</h2>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  🚧 The One Ring MCP Server (Coming Soon)
                </h3>
                <p className="text-yellow-700 mb-4">
                  The native MCP server endpoint is currently under development. For now, use our REST API:
                </p>
                <div className="bg-white rounded-md p-4 font-mono text-sm border">
                  <div className="text-gray-800">
                    # Current: REST API<br/>
                    curl https://mcplookup.org/api/v1/discover/domain/gmail.com<br/><br/>
                    # Coming: Native MCP Server<br/>
                    # mcp connect https://mcplookup.org/mcp
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  AI Agent Integration (Current)
                </h3>
                <p className="text-gray-600 mb-4">
                  How AI agents can use MCPLookup.org today:
                </p>
                <div className="bg-gray-100 rounded-md p-4 font-mono text-sm">
                  <div className="text-gray-800">
                    // User: "Check my Gmail"<br/>
                    const response = await fetch(<br/>
                    &nbsp;&nbsp;'https://mcplookup.org/api/v1/discover/domain/gmail.com'<br/>
                    );<br/>
                    const server = await response.json();<br/><br/>
                    // Connect to discovered server<br/>
                    const mcpClient = new MCPClient(server.endpoint);<br/>
                    await mcpClient.connect();<br/><br/>
                    // Use Gmail tools<br/>
                    const emails = await mcpClient.callTool('read_emails', {`{ limit: 10 }`});
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Support & Community</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📚 Resources
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <Link href="https://github.com/TSavo/mcplookup.org" className="text-blue-600 hover:underline">
                      GitHub Repository
                    </Link>
                  </li>
                  <li>
                    <Link href="/api/docs" className="text-blue-600 hover:underline">
                      API Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="https://modelcontextprotocol.io" className="text-blue-600 hover:underline">
                      MCP Specification
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🤝 Community
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <Link href="https://github.com/TSavo/mcplookup.org/issues" className="text-blue-600 hover:underline">
                      Report Issues
                    </Link>
                  </li>
                  <li>
                    <Link href="https://github.com/TSavo/mcplookup.org/discussions" className="text-blue-600 hover:underline">
                      Discussions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
