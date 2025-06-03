"use client"

import { Header } from "@/components/layout/header"
import { SignInButton } from "@/components/auth/signin-button"
import Link from "next/link"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-16 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 text-orange-500">🔍</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              MCPLookup.org
            </h1>
          </div>
          
          <h2 className="text-3xl font-bold max-w-4xl mx-auto">
            Universal MCP Discovery Service
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover and register Model Context Protocol servers. 
            The central registry that connects AI agents with the tools they need.
          </p>

          <div className="space-y-4">
            <p className="text-lg font-semibold">
              Get started with MCP discovery
            </p>
            <div className="flex space-x-4 justify-center">
              <Link href="/discover">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium">
                  🔍 Discover Servers
                </button>
              </Link>
              <Link href="/register">
                <button className="border border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-medium">
                  ➕ Register Server
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-blue-500 mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Discovery</h3>
            <p className="text-sm text-gray-600">
              Find MCP servers by domain, capability, or intent
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-green-500 mb-4">➕</div>
            <h3 className="text-lg font-semibold mb-2">Registration</h3>
            <p className="text-sm text-gray-600">
              Register your MCP server with DNS verification
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-purple-500 mb-4">🛡️</div>
            <h3 className="text-lg font-semibold mb-2">Verification</h3>
            <p className="text-sm text-gray-600">
              Cryptographic proof of domain ownership
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-orange-500 mb-4">🌍</div>
            <h3 className="text-lg font-semibold mb-2">Global Registry</h3>
            <p className="text-sm text-gray-600">
              Serverless, scalable, open-source platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Registry Statistics</h3>
            <div className="flex space-x-8 justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">1,247</div>
                <div className="text-sm text-gray-600">Registered Servers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">98.7%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">847</div>
                <div className="text-sm text-gray-600">Verified Domains</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
