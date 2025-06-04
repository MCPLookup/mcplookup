"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Documentation
            </h1>
            <p className="text-xl text-gray-600">
              Learn how to use MCPLookup.org to discover and register MCP servers
            </p>
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
                  <div className="text-gray-800">
                    # Find servers by domain<br/>
                    curl https://mcplookup.org/api/v1/discover/domain/gmail.com<br/><br/>
                    # Find servers by capability<br/>
                    curl https://mcplookup.org/api/v1/discover/capability/email
                  </div>
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
                  <div className="text-gray-800">
                    curl -X POST https://mcplookup.org/api/v1/register \<br/>
                    &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                    &nbsp;&nbsp;-d '{<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"domain": "mycompany.com",<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"endpoint": "https://mycompany.com/mcp",<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"capabilities": ["email", "calendar"],<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;"contact_email": "admin@mycompany.com"<br/>
                    &nbsp;&nbsp;}'
                  </div>
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
  )
}
