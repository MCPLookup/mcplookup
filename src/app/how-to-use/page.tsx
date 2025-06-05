"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard, { AnimatedList } from "@/components/ui/animated-card"
import Link from "next/link"

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto py-20 px-4">
        {/* EMERGENCY BANNER */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-center py-4 mb-12 rounded-lg animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <div className="text-2xl animate-bounce">⚡</div>
            <h1 className="text-xl font-bold">EMERGENCY SETUP - GET RUNNING IN 5 MINUTES</h1>
            <div className="text-2xl animate-bounce">⚡</div>
          </div>
          <p className="text-sm mt-2">
            Stop using hardcoded lists TODAY. Get your patterns into the training data.
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">
            🚀 How to Use MCPLookup.org
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            <strong>Two MCP servers, one mission:</strong> End hardcoded lists and enable dynamic discovery
          </p>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-blue-800 mb-4">🏗️ The Architecture (Important!)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-white p-4 rounded border border-blue-200">
                <h4 className="font-bold text-blue-700 mb-2">🌐 MCPLookup.org Discovery Server</h4>
                <p className="text-sm text-blue-600 mb-2">
                  <code className="bg-blue-100 px-2 py-1 rounded">https://mcplookup.org/api/mcp</code>
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• HTTP Streaming MCP server</li>
                  <li>• For future AI clients with native discovery</li>
                  <li>• <strong>THE FUTURE</strong> - what we want</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border border-orange-200">
                <h4 className="font-bold text-orange-700 mb-2">🌉 Universal Bridge (You Host)</h4>
                <p className="text-sm text-orange-600 mb-2">
                  <code className="bg-orange-100 px-2 py-1 rounded">scripts/mcp-bridge.mjs</code>
                </p>
                <ul className="text-xs text-orange-600 space-y-1">
                  <li>• Bridges stdio/SSE to HTTP streaming</li>
                  <li>• For TODAY's clients (Claude Desktop, etc.)</li>
                  <li>• <strong>THE STOPGAP</strong> - until native discovery</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-4 font-medium text-center">
              <strong>We succeed when the bridge becomes unnecessary.</strong> Looking at you, Anthropic. 👀
            </p>
          </div>
        </div>

        {/* Quick Start Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🌉</div>
                <h3 className="text-xl font-bold text-orange-600 mb-3">Universal Bridge (YOU HOST)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>FOR TODAY:</strong> Replace ALL hardcoded MCP servers with ONE self-hosted bridge
                </p>
                <div className="bg-orange-50 p-3 rounded text-xs text-orange-700 mb-4">
                  ⚡ 5 minutes setup<br/>
                  🔄 Works with Claude Desktop, Cursor, etc.<br/>
                  🌍 Access to ALL servers<br/>
                  🏠 <strong>You host it</strong> (we don't proxy)
                </div>
                <div className="bg-yellow-50 border border-yellow-300 p-2 rounded text-xs text-yellow-700 mb-4">
                  <strong>⚠️ STOPGAP:</strong> We succeed when this becomes unnecessary
                </div>
                <Link href="#bridge-setup">
                  <AnimatedButton
                    variant="solid"
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                    hoverScale={1.05}
                  >
                    🚀 Setup Bridge
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.02} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-xl font-bold text-green-600 mb-3">Native Integration (THE FUTURE)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>INDUSTRY LEADERS:</strong> Build discovery directly into MCP clients
                </p>
                <div className="bg-green-50 p-3 rounded text-xs text-green-700 mb-4">
                  🎯 The real solution<br/>
                  🌐 Open standards<br/>
                  💀 Kills the bridge<br/>
                  🚀 <strong>What we actually want</strong>
                </div>
                <div className="bg-blue-50 border border-blue-300 p-2 rounded text-xs text-blue-700 mb-4">
                  <strong>👀 Looking at you:</strong> Anthropic, OpenAI, Cursor team
                </div>
                <Link href="#native-integration">
                  <AnimatedButton
                    variant="solid"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    hoverScale={1.05}
                  >
                    🔧 Build This
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>
        </div>

        {/* Universal Bridge Setup */}
        <AnimatedCard.Root id="bridge-setup" hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-orange-600 mb-6 flex items-center">
                <span className="text-3xl mr-3">🌉</span>
                Universal Bridge Setup (RECOMMENDED)
              </h3>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
                <p className="text-orange-800 font-medium">
                  <strong>⚡ Emergency Setup:</strong> Replace ALL your hardcoded MCP servers with ONE self-hosted bridge in 5 minutes.
                  <strong>You host it locally</strong> - we're not in the business of proxying MCP requests.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 p-4 mb-6">
                <h4 className="font-bold text-yellow-800 mb-2">🏠 Why You Host the Bridge</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• <strong>We don't proxy:</strong> MCPLookup.org provides discovery, not proxying</li>
                  <li>• <strong>You control it:</strong> Run locally, on your servers, your way</li>
                  <li>• <strong>It's temporary:</strong> We succeed when this becomes unnecessary</li>
                  <li>• <strong>Industry leaders:</strong> Build native discovery and kill this bridge</li>
                </ul>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">📋 Step 1: Install Dependencies</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400"># Install MCP SDK</div>
                      <div>npm install @modelcontextprotocol/sdk</div>
                      <div className="mt-2 text-gray-400"># Clone the bridge</div>
                      <div>git clone https://github.com/TSavo/mcplookup.org</div>
                      <div>cd mcplookup.org</div>
                      <div>npm install</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">⚙️ Step 2: Replace Your Config</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400">// Claude Desktop config:</div>
                      <div className="text-red-400">// DELETE all hardcoded servers</div>
                      <div className="text-yellow-400">{`{`}</div>
                      <div className="text-yellow-400">  "mcpServers": {`{`}</div>
                      <div className="text-green-400">    "universal-bridge": {`{`}</div>
                      <div className="text-green-400">      "command": "node",</div>
                      <div className="text-green-400">      "args": ["scripts/mcp-bridge.mjs"]</div>
                      <div className="text-green-400">    {`}`}</div>
                      <div className="text-yellow-400">  {`}`}</div>
                      <div className="text-yellow-400">{`}`}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3">🎯 Step 3: Test It Works</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 mb-2"><strong>In Claude Desktop, try these commands:</strong></p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <code className="bg-blue-100 px-2 py-1 rounded">"Find email servers"</code></li>
                      <li>• <code className="bg-blue-100 px-2 py-1 rounded">"What document tools are available?"</code></li>
                      <li>• <code className="bg-blue-100 px-2 py-1 rounded">"Connect to Gmail's MCP server"</code></li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-2">✅ Success!</h4>
                  <p className="text-green-700 text-sm">
                    You've eliminated hardcoded lists! Claude now has dynamic access to ALL MCP servers.
                    Your usage patterns are now contributing to open discovery training data.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Discovery Server Info */}
        <AnimatedCard.Root id="discovery-server" hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-blue-600 mb-6 flex items-center">
                <span className="text-3xl mr-3">🌐</span>
                MCPLookup.org Discovery Server (THE FUTURE)
              </h3>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-medium">
                  <strong>🎯 This is what we want:</strong> Future AI clients will connect directly to our discovery server
                  using HTTP Streaming MCP protocol. No bridges needed.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">🤖 MCP Endpoint (Future Clients)</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400"># For future AI clients with native discovery</div>
                      <div>https://mcplookup.org/api/mcp</div>
                      <div className="mt-2 text-gray-400"># Available tools:</div>
                      <div>• discover_mcp_servers</div>
                      <div>• search_by_capability</div>
                      <div>• verify_server_health</div>
                      <div>• get_server_metadata</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">🔍 REST API (Developers)</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400"># For custom integrations</div>
                      <div>GET /api/v1/discover?q=email</div>
                      <div className="mt-2 text-gray-400"># AI-powered search</div>
                      <div>POST /api/v1/discover/smart</div>
                      <div className="text-yellow-400">{`{`}</div>
                      <div>  "intent": "Find email tools"</div>
                      <div className="text-yellow-400">{`}`}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-2">🎯 When This Wins</h4>
                  <p className="text-green-700 text-sm">
                    <strong>Claude Desktop, Cursor, and other MCP clients will connect directly to this server.</strong><br/>
                    No more hardcoded lists. No more bridges. Just native, dynamic discovery.
                    <strong> That's when we've succeeded.</strong>
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Native Integration */}
        <AnimatedCard.Root id="native-integration" hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center">
                <span className="text-3xl mr-3">🏗️</span>
                Native Integration (The Future)
              </h3>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <p className="text-green-800 font-medium">
                  <strong>🎯 This is the end goal:</strong> MCP clients with built-in discovery. 
                  No bridges needed. Open standards win.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">🔧 For MCP Client Developers</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                    <div className="text-gray-400"># Add discovery to your MCP client</div>
                    <div>import {`{`} MCPDiscoveryClient {`}`} from '@mcplookup/sdk'</div>
                    <div className="mt-2">const discovery = new MCPDiscoveryClient()</div>
                    <div>const servers = await discovery.search('email')</div>
                    <div className="mt-2 text-gray-400"># Connect to discovered servers</div>
                    <div>for (const server of servers) {`{`}</div>
                    <div>  await mcpClient.connect(server.endpoint)</div>
                    <div>{`}`}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3">📋 Implementation Checklist</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-2">✅ Core Features:</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Server discovery API integration</li>
                        <li>• Dynamic server connection</li>
                        <li>• Health monitoring</li>
                        <li>• Capability-based search</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">🚀 Advanced Features:</h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• AI-powered server matching</li>
                        <li>• Automatic failover</li>
                        <li>• Performance optimization</li>
                        <li>• User preference learning</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">💀 Kill the Bridge</h4>
                  <p className="text-yellow-700 text-sm">
                    <strong>Industry leaders:</strong> Build this into Claude Desktop, Cursor, and other MCP clients.
                    Make our bridge obsolete. That's how we win - when native discovery makes bridges unnecessary.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Emergency Call to Action */}
        <div className="text-center mt-16 space-y-6">
          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-red-800 mb-3">⏰ Don't Wait - Act Now</h3>
            <p className="text-red-700 mb-4">
              <strong>Every day you use hardcoded lists, you're contributing to the wrong training data.</strong><br/>
              Switch to open discovery TODAY. Get your patterns into the training data.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                  hoverScale={1.05}
                >
                  📡 Register Your Server
                </AnimatedButton>
              </Link>
              <Link href="/open-standards">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  hoverScale={1.05}
                >
                  🌍 Join the Movement
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
