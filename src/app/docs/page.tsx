"use client";

import { DocsLayout } from "@/components/docs/docs-layout";
import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const documentationSections = [
    {
      id: "getting-started",
      title: "🚀 Getting Started",
      description: "New to MCPLookup.org? Start here for a complete introduction.",
      items: [
        { title: "What is MCPLookup.org?", href: "/docs/introduction", icon: "🤔", description: "Complete introduction to MCP discovery", difficulty: "Beginner" },
        { title: "Quick Start Guide", href: "/docs/quickstart", icon: "⚡", description: "Get up and running in 5 minutes", difficulty: "Beginner" },
        { title: "Architecture Overview", href: "/docs/architecture", icon: "🏗️", description: "Understanding the system design", difficulty: "Intermediate" },
        { title: "Core Concepts", href: "/docs/concepts", icon: "💡", description: "Key concepts and terminology", difficulty: "Beginner" }
      ]
    },
    {
      id: "user-guides",
      title: "👤 User Guides",
      description: "Step-by-step guides for different user types.",
      items: [
        { title: "Discovering Servers", href: "/docs/discovery", icon: "🔍", description: "Find MCP servers for your needs", difficulty: "Beginner" },
        { title: "Registering Your Server", href: "/docs/registration", icon: "📝", description: "Add your MCP server to the registry", difficulty: "Intermediate" },
        { title: "DNS Verification", href: "/docs/verification", icon: "🔐", description: "Verify domain ownership", difficulty: "Intermediate" },
        { title: "Troubleshooting", href: "/docs/troubleshooting", icon: "🔧", description: "Common issues and solutions", difficulty: "All Levels" }
      ]
    },
    {
      id: "api-reference",
      title: "⚡ API Reference",
      description: "Complete REST API documentation with examples.",
      items: [
        { title: "API Overview", href: "/docs/api", icon: "📋", description: "REST API introduction and basics", difficulty: "Intermediate" },
        { title: "Discovery Endpoints", href: "/docs/api/discovery", icon: "🔍", description: "Find and search MCP servers", difficulty: "Intermediate" },
        { title: "Registration Endpoints", href: "/docs/api/registration", icon: "📝", description: "Register and manage servers", difficulty: "Intermediate" },
        { title: "Interactive API Explorer", href: "/api/docs", icon: "🧪", description: "Live API testing interface", difficulty: "All Levels" }
      ]
    },
    {
      id: "mcp-integration",
      title: "🔗 MCP Integration",
      description: "Native MCP server integration and tools.",
      items: [
        { title: "The One Ring MCP Server", href: "/docs/mcp-server", icon: "💍", description: "Native MCP server for discovery", difficulty: "Advanced" },
        { title: "MCP Tools Reference", href: "/docs/mcp-tools", icon: "🛠️", description: "Available MCP tools and usage", difficulty: "Intermediate" },
        { title: "AI Agent Integration", href: "/docs/ai-integration", icon: "🤖", description: "Integrate with AI agents", difficulty: "Advanced" },
        { title: "SDK Documentation", href: "/docs/sdk", icon: "📦", description: "Official SDKs and libraries", difficulty: "Intermediate" }
      ]
    },
    {
      id: "developers",
      title: "🛠️ Developer Resources",
      description: "For developers contributing to or extending MCPLookup.org.",
      items: [
        { title: "Development Setup", href: "/docs/development", icon: "⚙️", description: "Local development environment", difficulty: "Intermediate" },
        { title: "Contributing Guide", href: "/docs/contributing", icon: "🤝", description: "How to contribute to the project", difficulty: "Intermediate" },
        { title: "Architecture Deep Dive", href: "/docs/architecture-deep", icon: "🏗️", description: "Detailed system architecture", difficulty: "Advanced" },
        { title: "Storage System", href: "/docs/storage", icon: "🗄️", description: "Multi-provider storage architecture", difficulty: "Advanced" }
      ]
    },
    {
      id: "tutorials",
      title: "📚 Tutorials & Examples",
      description: "Step-by-step tutorials and real-world examples.",
      items: [
        { title: "Building Your First Integration", href: "/docs/tutorials/first-integration", icon: "🎯", description: "Complete integration walkthrough", difficulty: "Beginner" },
        { title: "Advanced Discovery Patterns", href: "/docs/tutorials/advanced-discovery", icon: "🔍", description: "Complex discovery scenarios", difficulty: "Advanced" },
        { title: "Production Deployment", href: "/docs/tutorials/deployment", icon: "🚀", description: "Deploy to production", difficulty: "Advanced" },
        { title: "Performance Optimization", href: "/docs/tutorials/performance", icon: "⚡", description: "Optimize for scale", difficulty: "Advanced" }
      ]
    }
  ];

  const filteredSections = documentationSections.filter(section => {
    if (selectedCategory !== "all" && section.id !== selectedCategory) return false;
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return section.title.toLowerCase().includes(searchLower) ||
           section.description.toLowerCase().includes(searchLower) ||
           section.items.some(item =>
             item.title.toLowerCase().includes(searchLower) ||
             item.description.toLowerCase().includes(searchLower)
           );
  });

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-gray-900">
              📚 MCPLookup.org Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              World-class documentation for the universal MCP server discovery service.
              Everything you need to discover, register, and integrate with MCP servers.
            </p>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  All Docs
                </button>
                {documentationSections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedCategory(section.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === section.id
                        ? "bg-orange-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documentation Sections */}
          <div className="space-y-8">
            {filteredSections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow-md p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
                  <p className="text-gray-600">{section.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <div className="group p-6 border border-gray-200 rounded-lg hover:shadow-lg hover:border-orange-300 transition-all duration-200 cursor-pointer">
                        <div className="flex items-start space-x-4">
                          <div className="text-2xl group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-2 mb-3">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.difficulty === "Beginner" ? "bg-green-100 text-green-800" :
                                item.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-800" :
                                item.difficulty === "Advanced" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {item.difficulty}
                              </span>
                              <div className="text-orange-600 group-hover:translate-x-1 transition-transform">
                                →
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🔗 Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="text-3xl">🚀</div>
                <h3 className="font-semibold text-gray-900">Live Demo</h3>
                <p className="text-gray-600 text-sm">Try the discovery API right now</p>
                <Link href="/discover">
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Discover Servers
                  </button>
                </Link>
              </div>

              <div className="text-center space-y-3">
                <div className="text-3xl">📝</div>
                <h3 className="font-semibold text-gray-900">Register Server</h3>
                <p className="text-gray-600 text-sm">Add your MCP server to the registry</p>
                <Link href="/register">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Register Now
                  </button>
                </Link>
              </div>

              <div className="text-center space-y-3">
                <div className="text-3xl">🧪</div>
                <h3 className="font-semibold text-gray-900">API Playground</h3>
                <p className="text-gray-600 text-sm">Interactive API testing interface</p>
                <Link href="/api/docs">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Test API
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Support & Community */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🤝 Support & Community</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="text-3xl">📚</div>
                <h3 className="font-semibold text-gray-900">GitHub Repository</h3>
                <p className="text-gray-600 text-sm">Source code, issues, and contributions</p>
                <a
                  href="https://github.com/TSavo/mcplookup.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  View on GitHub
                </a>
              </div>

              <div className="text-center space-y-3">
                <div className="text-3xl">💬</div>
                <h3 className="font-semibold text-gray-900">Community Discussions</h3>
                <p className="text-gray-600 text-sm">Ask questions and share ideas</p>
                <a
                  href="https://github.com/TSavo/mcplookup.org/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Discussion
                </a>
              </div>

              <div className="text-center space-y-3">
                <div className="text-3xl">🐛</div>
                <h3 className="font-semibold text-gray-900">Report Issues</h3>
                <p className="text-gray-600 text-sm">Found a bug or have a feature request?</p>
                <a
                  href="https://github.com/TSavo/mcplookup.org/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Report Issue
                </a>
              </div>
=======
    <DocsLayout
      title="📚 MCPLookup.org Documentation"
      description="Complete guide to the universal MCP server discovery service"
    >
      <div className="p-8">
        <div className="space-y-12">
          {/* Quick Navigation */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Getting Started</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/docs/what-is-this" className="group">
                <div className="text-center space-y-4 p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group-hover:bg-blue-50">
                  <div className="text-4xl">🤔</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">What is this?</h3>
                  <p className="text-gray-600 text-sm group-hover:text-blue-700">
                    New to MCP? Start here to understand what MCPLookup.org does and why it matters.
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md group-hover:bg-blue-700 transition-colors">
                    📖 Read Introduction
                  </div>
                </div>
              </Link>

              <Link href="/docs/user-guide" className="group">
                <div className="text-center space-y-4 p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all group-hover:bg-green-50">
                  <div className="text-4xl">👤</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-900">User Guide</h3>
                  <p className="text-gray-600 text-sm group-hover:text-green-700">
                    Step-by-step guide for discovering servers, registering your own, and troubleshooting.
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md group-hover:bg-green-700 transition-colors">
                    📚 User Guide
                  </div>
                </div>
              </Link>

              <Link href="/docs/api-specification" className="group">
                <div className="text-center space-y-4 p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all group-hover:bg-purple-50">
                  <div className="text-4xl">⚡</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-900">API Reference</h3>
                  <p className="text-gray-600 text-sm group-hover:text-purple-700">
                    Complete REST API specification with examples, error codes, and response formats.
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md group-hover:bg-purple-700 transition-colors">
                    🔌 API Docs
                  </div>
                </div>
              </Link>
>>>>>>> ba0512b (fix)
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center">
              <p className="text-gray-700">
                <strong>🌟 Love MCPLookup.org?</strong> Star us on GitHub and help spread the word about universal MCP discovery!
              </p>
            </div>
          </div>
<<<<<<< HEAD
=======

          {/* All Documentation */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 All Documentation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Guides */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">📚 Guides</h3>
                <div className="space-y-3">
                  <Link href="/docs/developer-guide" className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🛠️</span>
                      <div>
                        <div className="font-medium text-gray-900">Developer Guide</div>
                        <div className="text-sm text-gray-600">Architecture, setup, and contribution guide</div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/docs/deployment-guide" className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🚀</span>
                      <div>
                        <div className="font-medium text-gray-900">Deployment Guide</div>
                        <div className="text-sm text-gray-600">Production deployment instructions</div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/docs/faq" className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">❓</span>
                      <div>
                        <div className="font-medium text-gray-900">FAQ</div>
                        <div className="text-sm text-gray-600">Frequently asked questions</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Reference */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">📖 Reference</h3>
                <div className="space-y-3">
                  <Link href="/docs/project-spec" className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📋</span>
                      <div>
                        <div className="font-medium text-gray-900">Project Specification</div>
                        <div className="text-sm text-gray-600">Complete project overview</div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/docs/mcp-server-spec" className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💍</span>
                      <div>
                        <div className="font-medium text-gray-900">MCP Server Spec</div>
                        <div className="text-sm text-gray-600">The One Ring MCP server details</div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/docs/security" className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🛡️</span>
                      <div>
                        <div className="font-medium text-gray-900">Security Guide</div>
                        <div className="text-sm text-gray-600">Security best practices</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Start</h2>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔍 Discovering MCP Servers
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use our discovery API to find MCP servers:
                  </p>
                  <div className="bg-gray-900 text-gray-100 rounded-md p-4 font-mono text-sm">
                    <div>
                      # Find servers by domain<br/>
                      curl https://mcplookup.org/api/v1/discover/domain/gmail.com<br/><br/>
                      # Find servers by capability<br/>
                      curl https://mcplookup.org/api/v1/discover/capability/email
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    ➕ Registering Your Server
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Register your MCP server to make it discoverable:
                  </p>
                  <div className="bg-gray-900 text-gray-100 rounded-md p-4 font-mono text-sm">
                    <div>
                      curl -X POST https://mcplookup.org/api/v1/register \<br/>
                      &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                      &nbsp;&nbsp;-d '{`{"domain": "mycompany.com"}`}'
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-blue-800 text-center">
                  <strong>📖 Need more details?</strong> Check out our{" "}
                  <Link href="/docs/api-specification" className="underline hover:text-blue-600">
                    complete API documentation
                  </Link>{" "}
                  for examples and specifications.
                </p>
              </div>
            </div>
          </div>

>>>>>>> ba0512b (fix)
        </div>
      </div>
    </DocsLayout>
  );
}
