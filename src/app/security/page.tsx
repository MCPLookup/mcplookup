"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Security
            </h1>
            <p className="text-xl text-gray-600">
              Our commitment to keeping MCPLookup.org secure and trustworthy
            </p>
          </div>

          {/* Security Overview */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Security is fundamental to MCPLookup.org's mission of providing a trusted discovery 
              service for Model Context Protocol servers. We implement multiple layers of security 
              to protect our users and the integrity of the MCP ecosystem.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl text-green-600 mb-2">🔒</div>
                <h3 className="font-semibold text-green-900">Encryption</h3>
                <p className="text-sm text-green-700">All data encrypted in transit</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl text-blue-600 mb-2">🛡️</div>
                <h3 className="font-semibold text-blue-900">Verification</h3>
                <p className="text-sm text-blue-700">DNS-based domain ownership</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl text-purple-600 mb-2">🔍</div>
                <h3 className="font-semibold text-purple-900">Monitoring</h3>
                <p className="text-sm text-purple-700">24/7 security monitoring</p>
              </div>
            </div>
          </div>

          {/* Infrastructure Security */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Infrastructure Security</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Serverless Architecture</h3>
                <p className="text-gray-700">
                  Our serverless design eliminates many traditional attack vectors by having no 
                  persistent servers to compromise. Each request is handled by isolated functions 
                  that automatically scale and terminate.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Minimal Data Storage</h3>
                <p className="text-gray-700">
                  We use Upstash Redis (serverless) for registered server metadata only.
                  All data has automatic TTL expiration. No traditional databases,
                  no file system storage, minimal attack surface.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Edge Network</h3>
                <p className="text-gray-700">
                  Deployed on Vercel's global edge network with built-in DDoS protection, 
                  automatic SSL/TLS certificates, and geographic distribution for resilience.
                </p>
              </div>
            </div>
          </div>

          {/* Domain Verification */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Domain Verification</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We use cryptographic DNS verification to ensure only legitimate domain owners 
                can register MCP servers:
              </p>
              
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Verification Process:</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Generate unique cryptographic challenge for each registration</li>
                  <li>Require TXT record addition to domain's DNS</li>
                  <li>Verify record exists and matches expected value</li>
                  <li>Only then allow server to be discoverable</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-blue-800">
                  <strong>Security Benefit:</strong> This prevents unauthorized users from 
                  registering servers for domains they don't control, maintaining trust in 
                  the discovery service.
                </p>
              </div>
            </div>
          </div>

          {/* Responsible Disclosure */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Responsible Disclosure</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We welcome security researchers and encourage responsible disclosure of 
                security vulnerabilities. If you discover a security issue:
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Reporting Guidelines:</h4>
                <ol className="list-decimal list-inside text-yellow-700 space-y-2">
                  <li>Email security@mcplookup.org with details</li>
                  <li>Include steps to reproduce the vulnerability</li>
                  <li>Allow reasonable time for investigation and fix</li>
                  <li>Avoid accessing or modifying user data</li>
                  <li>Don't publicly disclose until we've addressed the issue</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Security Questions?
            </h3>
            <p className="text-blue-700 mb-4">
              Have questions about our security practices or need to report a security issue?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:security@mcplookup.org"
                className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 bg-white rounded-md hover:bg-blue-50 transition-colors"
              >
                📧 security@mcplookup.org
              </a>
              <a
                href="https://github.com/TSavo/mcplookup.org/security"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 bg-white rounded-md hover:bg-blue-50 transition-colors"
              >
                🔒 Security Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
