"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Terms of Service
              </h1>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to MCPLookup.org ("Service"), operated by the MCPLookup.org team ("we," "our," or "us"). 
                These Terms of Service ("Terms") govern your use of our Model Context Protocol discovery service 
                and website located at mcplookup.org.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
                with any part of these terms, then you may not access the Service.
              </p>
            </section>

            {/* Service Description */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed">
                MCPLookup.org provides:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Discovery of Model Context Protocol (MCP) servers</li>
                <li>Registration and verification of MCP servers</li>
                <li>Health monitoring and status reporting</li>
                <li>API access for programmatic discovery</li>
                <li>Professional MCP Discovery Server for AI agent integration</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">3. Acceptable Use</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">You agree not to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Use the Service for any unlawful purpose or in violation of any laws</li>
                  <li>Register servers you do not own or control</li>
                  <li>Provide false or misleading information about MCP servers</li>
                  <li>Attempt to overwhelm our systems with excessive requests</li>
                  <li>Reverse engineer, decompile, or disassemble the Service</li>
                  <li>Use the Service to distribute malware or harmful content</li>
                  <li>Interfere with other users' access to the Service</li>
                </ul>
              </div>
            </section>

            {/* Server Registration */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">4. Server Registration</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  When registering an MCP server:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>You must own or control the domain being registered</li>
                  <li>You must complete DNS verification to prove ownership</li>
                  <li>Server information must be accurate and up-to-date</li>
                  <li>You are responsible for maintaining your server's availability</li>
                  <li>We reserve the right to remove servers that violate these terms</li>
                </ul>
              </div>
            </section>

            {/* API Usage */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">5. API Usage</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Our API is provided subject to rate limits and fair use policies:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Discovery API: 100 requests per minute</li>
                  <li>Registration API: 10 requests per hour</li>
                  <li>Health checks: 50 requests per minute</li>
                  <li>Commercial usage may require separate agreement</li>
                  <li>We may modify rate limits with reasonable notice</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall MCPLookup.org, its directors, employees, partners, agents, 
                suppliers, or affiliates be liable for any indirect, incidental, special, 
                consequential, or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            {/* Contact Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">7. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 rounded-md p-4">
                <ul className="text-gray-700 space-y-2">
                  <li><strong>Email:</strong> legal@mcplookup.org</li>
                  <li><strong>GitHub:</strong> <a href="https://github.com/TSavo/mcplookup.org/issues" className="text-blue-600 hover:underline">Report an issue</a></li>
                  <li><strong>Website:</strong> <a href="https://mcplookup.org" className="text-blue-600 hover:underline">mcplookup.org</a></li>
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
