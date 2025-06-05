"use client"

import AnimatedCard from '@/components/ui/animated-card';

export function ApiKeyDocs() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🔑 Free API Key Authentication</h1>
        <p className="text-xl text-gray-600">
          Free, secure programmatic access to MCPLookup.org API
        </p>
      </div>

      {/* Overview */}
      <AnimatedCard.Root>
        <AnimatedCard.Body>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 mb-4">
              Free API keys provide secure, authenticated access to MCPLookup.org's API endpoints.
              While discovery endpoints are public, free API keys enable:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Server registration and management</li>
              <li>Usage analytics and monitoring</li>
              <li>Higher rate limits</li>
              <li>Developer tools and features</li>
            </ul>
          </div>
        </AnimatedCard.Body>
      </AnimatedCard.Root>

      {/* Getting Started */}
      <AnimatedCard.Root>
        <AnimatedCard.Body>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Create a Free API Key</h3>
                <p className="text-gray-700 mb-2">
                  Go to your <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a> and click on the "API Keys" tab.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <code className="text-sm">Dashboard → API Keys → Create API Key</code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Configure Permissions</h3>
                <p className="text-gray-700 mb-2">Select the permissions your application needs:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><code>discovery:read</code> - Access discovery endpoints</li>
                  <li><code>servers:read</code> - Read server information</li>
                  <li><code>servers:write</code> - Register and update servers</li>
                  <li><code>analytics:read</code> - Access usage analytics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Store Securely</h3>
                <p className="text-gray-700">
                  Copy your API key immediately - it won't be shown again. Store it securely as an environment variable.
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard.Body>
      </AnimatedCard.Root>

      {/* Authentication Methods */}
      <AnimatedCard.Root>
        <AnimatedCard.Body>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Methods</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Authorization Header (Recommended)</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre><code>{`curl -H "Authorization: Bearer mcp_your_api_key_here" \\
     https://mcplookup.org/api/v1/discover`}</code></pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">X-API-Key Header</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre><code>{`curl -H "X-API-Key: mcp_your_api_key_here" \\
     https://mcplookup.org/api/v1/discover`}</code></pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Query Parameter (Less Secure)</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre><code>{`curl "https://mcplookup.org/api/v1/discover?api_key=mcp_your_api_key_here"`}</code></pre>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  ⚠️ Query parameters may be logged. Use headers when possible.
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard.Body>
      </AnimatedCard.Root>

      {/* Code Examples */}
      <AnimatedCard.Root>
        <AnimatedCard.Body>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Examples</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">JavaScript/Node.js</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre><code>{`const response = await fetch('https://mcplookup.org/api/v1/discover', {
  headers: {
    'Authorization': 'Bearer mcp_your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.servers);`}</code></pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Python</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre><code>{`import requests

headers = {
    'Authorization': 'Bearer mcp_your_api_key_here',
    'Content-Type': 'application/json'
}

response = requests.get('https://mcplookup.org/api/v1/discover', headers=headers)
data = response.json()
print(data['servers'])`}</code></pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">MCP Bridge</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre><code>{`import { MCPDiscoveryBridge } from '@mcplookup/bridge';

// Method 1: Explicit API key
const bridge = new MCPDiscoveryBridge();
const mcpServer = await bridge.createBridgeWithApiKey(
  'gmail.com',
  'mcp_your_api_key_here'
);

// Method 2: Environment variable (recommended)
// Set: export MCP_API_KEY="mcp_your_api_key_here"
const serverWithEnv = await bridge.createBridgeForDomainWithEnvAuth('gmail.com');

await mcpServer.run();`}</code></pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Environment Variables</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre><code>{`# .env file or shell export
export MCP_API_KEY="mcp_your_api_key_here"
export MCPLOOKUP_API_KEY="mcp_your_api_key_here"  # Alternative
export API_KEY="mcp_your_api_key_here"            # Fallback

# Custom headers (JSON format)
export MCP_AUTH_HEADERS='{"X-Custom-Header": "value"}'

# Usage in code (no hardcoded keys!)
const bridge = new MCPDiscoveryBridge();
const server = await bridge.createBridgeForDomainWithEnvAuth('gmail.com');`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard.Body>
      </AnimatedCard.Root>

      {/* Rate Limits */}
      <AnimatedCard.Root>
        <AnimatedCard.Body>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">User Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Per Minute</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Per Hour</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Per Day</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Anonymous</td>
                    <td className="border border-gray-300 px-4 py-2">30</td>
                    <td className="border border-gray-300 px-4 py-2">500</td>
                    <td className="border border-gray-300 px-4 py-2">5,000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Authenticated User</td>
                    <td className="border border-gray-300 px-4 py-2">60</td>
                    <td className="border border-gray-300 px-4 py-2">1,000</td>
                    <td className="border border-gray-300 px-4 py-2">10,000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Admin</td>
                    <td className="border border-gray-300 px-4 py-2">300</td>
                    <td className="border border-gray-300 px-4 py-2">10,000</td>
                    <td className="border border-gray-300 px-4 py-2">100,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Rate limit headers are included in all responses:
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mt-2">
              <code className="text-sm">
                X-RateLimit-Limit: 1000<br/>
                X-RateLimit-Remaining: 999<br/>
                X-RateLimit-Reset: 1640995200
              </code>
            </div>
          </div>
        </AnimatedCard.Body>
      </AnimatedCard.Root>

      {/* Best Practices */}
      <AnimatedCard.Root>
        <AnimatedCard.Body>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-green-600 text-xl">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Store API keys securely</h3>
                  <p className="text-gray-700">Use environment variables, never commit to version control</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-green-600 text-xl">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Use minimal permissions</h3>
                  <p className="text-gray-700">Only grant the permissions your application actually needs</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-green-600 text-xl">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Rotate keys regularly</h3>
                  <p className="text-gray-700">Create new keys and revoke old ones periodically</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-green-600 text-xl">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Monitor usage</h3>
                  <p className="text-gray-700">Check your dashboard for usage patterns and errors</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="text-red-600 text-xl">❌</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Don't share API keys</h3>
                  <p className="text-gray-700">Each application should have its own API key</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard.Body>
      </AnimatedCard.Root>
    </div>
  );
}
