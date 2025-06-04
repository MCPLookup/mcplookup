"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Privacy Policy
              </h1>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                MCPLookup.org ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our Model Context Protocol discovery service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Information You Provide</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                    <li>Domain names and MCP server endpoints when registering servers</li>
                    <li>Contact email addresses for verification purposes</li>
                    <li>Account information if you choose to create an account</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                    <li>IP addresses and browser information for security and analytics</li>
                    <li>Usage patterns and API request logs for service improvement</li>
                    <li>DNS verification records for domain ownership validation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>To provide and maintain our MCP discovery service</li>
                <li>To verify domain ownership for server registration</li>
                <li>To monitor service health and performance</li>
                <li>To prevent abuse and ensure service security</li>
                <li>To communicate with you about service updates</li>
                <li>To improve our services based on usage analytics</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties, 
                except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>When required by law or to respond to legal process</li>
                <li>To protect our rights, property, or safety, or that of others</li>
                <li>With service providers who assist in operating our platform (under strict confidentiality)</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Data Storage and Security</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  MCPLookup.org operates on a serverless, no-database architecture:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>No persistent storage of personal data</li>
                  <li>Server information is discovered in real-time via DNS and API calls</li>
                  <li>Temporary caching for performance, with automatic expiration</li>
                  <li>Industry-standard encryption for data in transit</li>
                  <li>Regular security audits and monitoring</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Email:</strong> privacy@mcplookup.org</li>
                  <li><strong>GitHub:</strong> <a href="https://github.com/TSavo/mcplookup.org/issues" className="text-blue-600 hover:underline">Report an issue</a></li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
