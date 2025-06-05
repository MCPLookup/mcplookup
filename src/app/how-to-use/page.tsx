"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimatedButton } from "@/components/ui/animated-button"
import AnimatedCard from "@/components/ui/animated-card"
import Link from "next/link"

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-5xl mx-auto py-16 px-4">

        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            How to Use MCPLookup.org
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get started with dynamic MCP server discovery in minutes. Choose the installation method that works best for you.
          </p>
        </div>

        {/* Installation Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <AnimatedCard.Root hoverScale={1.01} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl mb-4">🐳</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Docker (Recommended)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Run the MCP bridge in a container. No local dependencies needed.
                </p>
                <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-4">
                  ✅ Isolated environment<br/>
                  ✅ Easy deployment<br/>
                  ✅ No dependency conflicts<br/>
                  ✅ Production ready
                </div>
                <Link href="#docker-setup">
                  <AnimatedButton
                    variant="solid"
                    size="sm"
                    className="bg-slate-700 hover:bg-slate-800 text-white"
                    hoverScale={1.02}
                  >
                    🐳 Docker Setup
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.01} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">NPM Package</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Install as a Node.js package for direct integration.
                </p>
                <div className="bg-green-50 p-3 rounded text-xs text-green-700 mb-4">
                  ✅ Direct integration<br/>
                  ✅ Customizable<br/>
                  ✅ TypeScript support<br/>
                  ✅ Local development
                </div>
                <Link href="#npm-setup">
                  <AnimatedButton
                    variant="solid"
                    size="sm"
                    className="bg-slate-700 hover:bg-slate-800 text-white"
                    hoverScale={1.02}
                  >
                    📦 NPM Setup
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.01} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Start</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Clone and run directly from source code.
                </p>
                <div className="bg-purple-50 p-3 rounded text-xs text-purple-700 mb-4">
                  ✅ Latest features<br/>
                  ✅ Easy debugging<br/>
                  ✅ Contribution ready<br/>
                  ✅ Full source access
                </div>
                <Link href="#source-setup">
                  <AnimatedButton
                    variant="solid"
                    size="sm"
                    className="bg-slate-700 hover:bg-slate-800 text-white"
                    hoverScale={1.02}
                  >
                    ⚡ Source Setup
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>

          <AnimatedCard.Root hoverScale={1.01} borderOnHover>
            <AnimatedCard.Body>
              <div className="text-center p-6">
                <div className="text-3xl mb-4">☁️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cloud Deployment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Deploy on VPS or cloud for team/organizational use.
                </p>
                <div className="bg-orange-50 p-3 rounded text-xs text-orange-700 mb-4">
                  ✅ Team sharing<br/>
                  ✅ Centralized management<br/>
                  ✅ HTTP streaming support<br/>
                  ✅ Enterprise ready
                </div>
                <Link href="#cloud-setup">
                  <AnimatedButton
                    variant="solid"
                    size="sm"
                    className="bg-slate-700 hover:bg-slate-800 text-white"
                    hoverScale={1.02}
                  >
                    ☁️ Cloud Setup
                  </AnimatedButton>
                </Link>
              </div>
            </AnimatedCard.Body>
          </AnimatedCard.Root>
        </div>

        {/* Docker Setup */}
        <AnimatedCard.Root id="docker-setup" hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">🐳</span>
                Docker Setup (Recommended)
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-medium">
                  <strong>Easiest way to get started:</strong> Run the MCP bridge in a Docker container with zero local dependencies.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">📋 Step 1: Get the Bridge</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400"># Clone the repository</div>
                      <div>git clone https://github.com/TSavo/mcplookup.org</div>
                      <div>cd mcplookup.org</div>
                      <div className="mt-2 text-gray-400"># Run with Docker Compose</div>
                      <div>docker-compose -f docker-compose.bridge.yml up -d</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">⚙️ Step 2: Configure Claude Desktop</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400">// ~/.config/claude-desktop/config.json</div>
                      <div className="text-yellow-400">{`{`}</div>
                      <div className="text-yellow-400">  "mcpServers": {`{`}</div>
                      <div className="text-green-400">    "universal-bridge": {`{`}</div>
                      <div className="text-green-400">      "command": "docker",</div>
                      <div className="text-green-400">      "args": ["exec", "-i", "mcp-universal-bridge", "tsx", "scripts/mcp-bridge.ts"]</div>
                      <div className="text-green-400">    {`}`}</div>
                      <div className="text-yellow-400">  {`}`}</div>
                      <div className="text-yellow-400">{`}`}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">🎯 Step 3: Test It Works</h3>
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
                  <h4 className="font-semibold text-green-800 mb-2">✅ Success!</h4>
                  <p className="text-green-700 text-sm">
                    You now have dynamic access to all MCP servers through the universal bridge running in Docker.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* NPM Setup */}
        <AnimatedCard.Root id="npm-setup" hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">📦</span>
                NPM Package Setup
              </h2>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <p className="text-green-800 font-medium">
                  <strong>For developers:</strong> Install the MCP bridge as a Node.js package for direct integration.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">📋 Step 1: Install Package</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400"># Install globally</div>
                      <div>npm install -g @mcplookup/bridge</div>
                      <div className="mt-2 text-gray-400"># Or install locally</div>
                      <div>npm install @mcplookup/bridge</div>
                      <div className="mt-2 text-gray-400"># Or use npx (no install)</div>
                      <div>npx @mcplookup/bridge</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">⚙️ Step 2: Configure Claude Desktop</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400">// ~/.config/claude-desktop/config.json</div>
                      <div className="text-yellow-400">{`{`}</div>
                      <div className="text-yellow-400">  "mcpServers": {`{`}</div>
                      <div className="text-green-400">    "universal-bridge": {`{`}</div>
                      <div className="text-green-400">      "command": "npx",</div>
                      <div className="text-green-400">      "args": ["@mcplookup/bridge"]</div>
                      <div className="text-green-400">    {`}`}</div>
                      <div className="text-yellow-400">  {`}`}</div>
                      <div className="text-yellow-400">{`}`}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tip</h4>
                  <p className="text-blue-700 text-sm">
                    The NPM package is perfect for development and custom integrations. You can also import the bridge
                    programmatically in your own Node.js applications.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Source Setup */}
        <AnimatedCard.Root id="source-setup" hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">⚡</span>
                Source Code Setup
              </h2>

              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
                <p className="text-purple-800 font-medium">
                  <strong>For contributors:</strong> Run directly from source code for the latest features and easy debugging.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">📋 Step 1: Clone & Install</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400"># Clone the repository</div>
                      <div>git clone https://github.com/TSavo/mcplookup.org</div>
                      <div>cd mcplookup.org</div>
                      <div className="mt-2 text-gray-400"># Install dependencies</div>
                      <div>npm install</div>
                      <div className="mt-2 text-gray-400"># Build the project</div>
                      <div>npm run build</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">⚙️ Step 2: Configure Claude Desktop</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400">// ~/.config/claude-desktop/config.json</div>
                      <div className="text-yellow-400">{`{`}</div>
                      <div className="text-yellow-400">  "mcpServers": {`{`}</div>
                      <div className="text-green-400">    "universal-bridge": {`{`}</div>
                      <div className="text-green-400">      "command": "tsx",</div>
                      <div className="text-green-400">      "args": ["/path/to/mcplookup.org/scripts/mcp-bridge.ts"]</div>
                      <div className="text-green-400">    {`}`}</div>
                      <div className="text-yellow-400">  {`}`}</div>
                      <div className="text-yellow-400">{`}`}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">🔧 Development Mode</h4>
                  <p className="text-orange-700 text-sm">
                    Running from source gives you access to the latest features and makes it easy to contribute back to the project.
                    You can modify the bridge behavior and test changes immediately.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Cloud Deployment */}
        <AnimatedCard.Root id="cloud-setup" hoverScale={1.01} borderOnHover>
          <AnimatedCard.Body>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">☁️</span>
                Cloud Deployment
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-medium">
                  <strong>For teams & organizations:</strong> Deploy the MCP bridge on a VPS or cloud server for centralized access.
                  Supports both HTTP streaming and SSE protocols for maximum compatibility.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">🚀 VPS Deployment</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400"># On your VPS (Ubuntu/Debian)</div>
                      <div>git clone https://github.com/TSavo/mcplookup.org</div>
                      <div>cd mcplookup.org</div>
                      <div className="mt-2 text-gray-400"># Simple Docker deployment</div>
                      <div>docker-compose -f docker-compose.cloud.yml up -d</div>
                      <div className="mt-2 text-gray-400"># Bridge runs on port 3001</div>
                      <div>curl http://your-server.com:3001/health</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">🌐 Team Access</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                      <div className="text-gray-400">// Team members configure Claude Desktop:</div>
                      <div className="text-yellow-400">{`{`}</div>
                      <div className="text-yellow-400">  "mcpServers": {`{`}</div>
                      <div className="text-green-400">    "team-bridge": {`{`}</div>
                      <div className="text-green-400">      "command": "curl",</div>
                      <div className="text-green-400">      "args": ["-X", "POST", "http://your-server.com:3001/mcp"]</div>
                      <div className="text-green-400">    {`}`}</div>
                      <div className="text-yellow-400">  {`}`}</div>
                      <div className="text-yellow-400">{`}`}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Benefits</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Centralized management</li>
                      <li>• Team sharing</li>
                      <li>• Consistent configuration</li>
                      <li>• Better monitoring</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🔧 Use Cases</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Enterprise deployments</li>
                      <li>• Development teams</li>
                      <li>• Internal tools</li>
                      <li>• Shared environments</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">🛡️ Security</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Firewall port 3001 access</li>
                      <li>• VPN for internal access</li>
                      <li>• Environment variables</li>
                      <li>• Regular updates</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips</h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Use <code>docker-compose.cloud.yml</code> for production deployment</li>
                    <li>• Monitor with health checks on <code>http://server:3001/health</code></li>
                    <li>• Set up log rotation for <code>./logs</code> directory</li>
                    <li>• Consider using a VPN for secure team access</li>
                  </ul>
                </div>
              </div>
            </div>
          </AnimatedCard.Body>
        </AnimatedCard.Root>

        {/* Next Steps */}
        <div className="text-center mt-12 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">What's Next?</h2>
            <p className="text-blue-800 mb-6">
              Once you have the bridge running, you can discover and connect to any MCP server dynamically.
              No more maintaining hardcoded lists!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/discover">
                <AnimatedButton
                  variant="solid"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  hoverScale={1.02}
                >
                  🔍 Discover Servers
                </AnimatedButton>
              </Link>
              <Link href="/register">
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  hoverScale={1.02}
                >
                  📡 Register Your Server
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
