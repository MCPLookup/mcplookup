import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            🏗️ Architecture Overview
          </h1>
          <p className="text-xl text-gray-600">
            Understanding the serverless, zero-infrastructure design of MCPLookup.org
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2 text-blue-800">
            <Link href="/docs" className="hover:underline">📚 Documentation</Link>
            <span>→</span>
            <span className="font-semibold">Architecture Overview</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2>System Architecture</h2>
          <p>MCPLookup.org is built with a serverless-first architecture designed for global scale and zero maintenance.</p>
          
          <h3>Core Components</h3>
          <ul>
            <li><strong>Frontend:</strong> Next.js 15 with TypeScript and Tailwind CSS</li>
            <li><strong>Backend:</strong> Vercel Edge Functions for global distribution</li>
            <li><strong>Storage:</strong> Multi-provider storage (Redis, In-Memory, File System)</li>
            <li><strong>Security:</strong> DNS-based verification, no stored credentials</li>
          </ul>

<<<<<<< HEAD
          {/* High-Level Architecture Diagram */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">🌐 System Architecture</h2>
            <PredefinedDiagram type="architecture" className="mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="text-3xl">⚡</div>
                <h3 className="font-semibold text-gray-900">Serverless First</h3>
                <p className="text-gray-600 text-sm">
                  Built on Vercel Edge Functions with global distribution and automatic scaling
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="text-3xl">🗄️</div>
                <h3 className="font-semibold text-gray-900">Smart Storage</h3>
                <p className="text-gray-600 text-sm">
                  Multi-provider storage with automatic environment detection
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="text-3xl">🔐</div>
                <h3 className="font-semibold text-gray-900">DNS Verified</h3>
                <p className="text-gray-600 text-sm">
                  Cryptographic domain ownership proof for trust and security
                </p>
              </div>
            </div>
          </section>

          {/* Discovery Flow */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">🔍 Discovery Flow</h2>
            <PredefinedDiagram type="discoveryFlow" className="mb-6" />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">How Discovery Works</h3>
              <ol className="space-y-2 text-blue-700">
                <li><strong>1. User Request:</strong> AI agent receives user intent (e.g., "Check my Gmail")</li>
                <li><strong>2. Query MCPLookup:</strong> Agent queries our discovery API for relevant servers</li>
                <li><strong>3. Multi-Method Discovery:</strong> We check registered servers, DNS records, and well-known endpoints</li>
                <li><strong>4. Health Verification:</strong> Real-time health checks ensure server availability</li>
                <li><strong>5. Trusted Results:</strong> Return verified, high-trust-score servers</li>
                <li><strong>6. Automatic Connection:</strong> Agent connects to discovered server and executes tools</li>
              </ol>
            </div>
          </section>

          {/* Storage Architecture */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">🗄️ Storage Architecture</h2>
            <PredefinedDiagram type="storageArchitecture" className="mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">🚀 Production</h4>
                <p className="text-green-700 text-sm mb-2">Upstash Redis</p>
                <ul className="text-green-600 text-xs space-y-1">
                  <li>• Serverless Redis</li>
                  <li>• Global distribution</li>
                  <li>• Automatic scaling</li>
                  <li>• 99.9% uptime</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🛠️ Development</h4>
                <p className="text-blue-700 text-sm mb-2">In-Memory Storage</p>
                <ul className="text-blue-600 text-xs space-y-1">
                  <li>• Zero configuration</li>
                  <li>• Instant startup</li>
                  <li>• Perfect for testing</li>
                  <li>• No external deps</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">🧪 Testing</h4>
                <p className="text-purple-700 text-sm mb-2">Automatic In-Memory</p>
                <ul className="text-purple-600 text-xs space-y-1">
                  <li>• Isolated test data</li>
                  <li>• Fast test execution</li>
                  <li>• Deterministic results</li>
                  <li>• Easy cleanup</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Trust Scoring */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">📊 Trust Scoring System</h2>
            <PredefinedDiagram type="trustScoring" className="mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Trust Score Components</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Uptime (0-40 points):</strong> Server availability percentage</li>
                  <li>• <strong>Response Time (0-20 points):</strong> Average response speed</li>
                  <li>• <strong>DNS Verification (0-20 points):</strong> Domain ownership proof</li>
                  <li>• <strong>Community Feedback (0-20 points):</strong> User ratings and reports</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Trust Levels</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span><strong>90-100:</strong> Excellent (Highly recommended)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span><strong>70-89:</strong> Good (Recommended)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span><strong>50-69:</strong> Fair (Use with caution)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span><strong>0-49:</strong> Poor (Not recommended)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 Technology Stack</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend & API</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span><strong>Next.js 15</strong> - App Router with server-side rendering</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span><strong>TypeScript</strong> - Type safety throughout the codebase</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span><strong>Tailwind CSS</strong> - Utility-first CSS framework</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span><strong>Zod</strong> - Runtime type validation and schema parsing</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure & Data</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span><strong>Vercel</strong> - Serverless deployment and edge functions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span><strong>Upstash Redis</strong> - Serverless Redis for production</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span><strong>DNS Queries</strong> - Real-time TXT record lookups</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span><strong>In-memory</strong> - Zero-setup development storage</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Performance & Scaling */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Performance & Scaling</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="text-3xl">🌍</div>
                <h3 className="font-semibold text-gray-900">Global Edge</h3>
                <p className="text-gray-600 text-sm">
                  Deployed on Vercel's global edge network for &lt;100ms response times worldwide
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="text-3xl">📈</div>
                <h3 className="font-semibold text-gray-900">Auto Scaling</h3>
                <p className="text-gray-600 text-sm">
                  Serverless functions automatically scale from 0 to millions of requests
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="text-3xl">💾</div>
                <h3 className="font-semibold text-gray-900">Smart Caching</h3>
                <p className="text-gray-600 text-sm">
                  Multi-layer caching with TTL-based expiration and cache invalidation
                </p>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Discovery Latency:</strong> &lt;100ms global average</li>
                    <li>• <strong>Server Uptime:</strong> &gt;99.9% for verified servers</li>
                    <li>• <strong>DNS Verification:</strong> &lt;60 seconds end-to-end</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• <strong>Cache Hit Rate:</strong> &gt;95% for popular servers</li>
                    <li>• <strong>API Rate Limit:</strong> 1000 req/min per IP</li>
                    <li>• <strong>Concurrent Users:</strong> Unlimited (serverless)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🎯 Dive Deeper</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">📚 Technical Deep Dives</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/docs/storage" className="text-blue-600 hover:underline">
                      🗄️ Storage System Architecture
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/verification" className="text-blue-600 hover:underline">
                      🔐 DNS Verification Protocol
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/mcp-server" className="text-blue-600 hover:underline">
                      💍 The One Ring MCP Server
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/development" className="text-blue-600 hover:underline">
                      ⚙️ Development Environment Setup
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">🚀 Get Started</h3>
                <div className="space-y-3">
                  <Link href="/docs/quickstart">
                    <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      ⚡ Quick Start Guide
                    </button>
                  </Link>
                  <Link href="/docs/api">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      📋 API Reference
                    </button>
                  </Link>
                  <Link href="/docs/tutorials/first-integration">
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      🎯 First Integration Tutorial
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
=======
          <h3>Design Principles</h3>
          <ul>
            <li><strong>Zero Infrastructure:</strong> No servers to manage, fully serverless</li>
            <li><strong>Security First:</strong> No API keys or credentials stored</li>
            <li><strong>Data Ownership:</strong> Servers control their own registration data</li>
            <li><strong>Performance:</strong> Global edge deployment for fast responses</li>
          </ul>
>>>>>>> 6f40b1d5753db3f8009af3b63c7ec9fb64a2b1c1
        </div>
      </div>
      <Footer />
    </div>
  );
}
