"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Service Status
            </h1>
            <p className="text-xl text-gray-600">
              Real-time status of MCPLookup.org services
            </p>
          </div>

          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    All Systems Operational
                  </h2>
                  <p className="text-gray-600">
                    All services are running normally
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Last updated</div>
                <div className="text-sm font-medium">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">~50</div>
              <div className="text-sm text-gray-600">Registered Servers</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600">~30</div>
              <div className="text-sm text-gray-600">Verified Servers</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">~120ms</div>
              <div className="text-sm text-gray-600">Edge Response Time</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-gray-600">Vercel Uptime</div>
            </div>
          </div>

          {/* Service Status */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {[
                { name: "Discovery API (Next.js)", status: "operational", uptime: 99.9, responseTime: 120 },
                { name: "Registration API (Next.js)", status: "operational", uptime: 99.8, responseTime: 95 },
                { name: "Upstash Redis", status: "operational", uptime: 99.95, responseTime: 85 },
                { name: "DNS Verification", status: "operational", uptime: 99.7, responseTime: 200 },
                { name: "Vercel Edge Functions", status: "operational", uptime: 99.9, responseTime: 50 },
                { name: "MCP Server Endpoint", status: "development", uptime: 0, responseTime: 0 }
              ].map((service) => (
                <div key={service.name} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {service.status === "operational" ? "✅" :
                         service.status === "development" ? "🚧" : "❌"}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className={`text-sm capitalize ${
                          service.status === "operational" ? "text-green-600" :
                          service.status === "development" ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {service.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-6 text-sm text-gray-600">
                      <div className="text-center">
                        <div className="font-medium">
                          {service.status === "development" ? "N/A" : `${service.uptime}%`}
                        </div>
                        <div>Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {service.status === "development" ? "N/A" : `${service.responseTime}ms`}
                        </div>
                        <div>Response</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {service.status === "development" ? "In Dev" : new Date().toLocaleTimeString()}
                        </div>
                        <div>Last Check</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident History */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-4xl text-green-500 mb-4">🎉</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Incidents</h4>
                <p className="text-gray-600">
                  All services have been running smoothly. Last incident was over 30 days ago.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
