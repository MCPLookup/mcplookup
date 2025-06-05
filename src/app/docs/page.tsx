"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const documentationSections = [
    {
      id: "getting-started",
      title: "🚀 Getting Started",
      description: "New to MCPLookup.org? Learn the basics of dynamic MCP server discovery.",
      items: [
        { title: "What is MCPLookup.org?", href: "/docs/introduction", icon: "🔍", description: "Introduction to dynamic MCP server discovery", difficulty: "Beginner" },
        { title: "Quick Start Guide", href: "/docs/quickstart", icon: "⚡", description: "Get started with MCP discovery in minutes", difficulty: "Beginner" },
        { title: "Architecture Overview", href: "/docs/architecture", icon: "🏗️", description: "System architecture and design principles", difficulty: "Intermediate" },
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
        { title: "MCP Discovery Server", href: "/docs/mcp-server", icon: "🔍", description: "Native MCP server for discovery", difficulty: "Advanced" },
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Documentation
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete guide to dynamic MCP server discovery, from basic usage to advanced integrations and API development.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {documentationSections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Start Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/docs/introduction" className="group">
                <div className="text-center space-y-4 p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group-hover:bg-blue-50">
                  <div className="text-4xl">🤔</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900">Introduction</h3>
                  <p className="text-gray-600 text-sm group-hover:text-blue-700">
                    Learn about dynamic MCP server discovery and how it works.
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md group-hover:bg-blue-700 transition-colors">
                    📖 Read Introduction
                  </div>
                </div>
              </Link>

              <Link href="/docs/quickstart" className="group">
                <div className="text-center space-y-4 p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all group-hover:bg-green-50">
                  <div className="text-4xl">⚡</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-900">Quick Start</h3>
                  <p className="text-gray-600 text-sm group-hover:text-green-700">
                    Get up and running in minutes with step-by-step installation instructions.
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md group-hover:bg-green-700 transition-colors">
                    🚀 Quick Start
                  </div>
                </div>
              </Link>

              <Link href="/docs/api" className="group">
                <div className="text-center space-y-4 p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all group-hover:bg-purple-50">
                  <div className="text-4xl">⚡</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-900">API Reference</h3>
                  <p className="text-gray-600 text-sm group-hover:text-purple-700">
                    Complete API documentation with examples and interactive testing tools.
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md group-hover:bg-purple-700 transition-colors">
                    🔌 API Docs
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Documentation Sections */}
          <div className="space-y-8">
            {filteredSections.map((section) => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-gray-600 mt-1">{section.description}</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href} className="group">
                        <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group-hover:bg-blue-50">
                          <span className="text-2xl flex-shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-900">{item.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                                {item.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 group-hover:text-blue-700">{item.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-700 mb-4">
              Can't find what you're looking for? Check out our FAQ or reach out to the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/docs/faq" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                ❓ View FAQ
              </Link>
              <Link href="https://github.com/mcplookup/mcplookup.org" className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors">
                🐙 GitHub
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
