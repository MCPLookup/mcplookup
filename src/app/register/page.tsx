"use client"

import React, { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

interface RegistrationData {
  domain: string
  endpoint: string
  capabilities: string[]
  contact_email: string
}

interface VerificationStatus {
  token: string
  verified: boolean
  dns_record: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegistrationData>({
    domain: "",
    endpoint: "",
    capabilities: [],
    contact_email: ""
  })
  const [capabilityInput, setCapabilityInput] = useState("")
  const [verification, setVerification] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCapability = () => {
    if (capabilityInput.trim() && !formData.capabilities.includes(capabilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, capabilityInput.trim()]
      }))
      setCapabilityInput("")
    }
  }

  const removeCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(cap => cap !== capability)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to register server")
      }

      const data = await response.json()
      setVerification(data)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const checkVerification = async () => {
    if (!verification) return

    try {
      const response = await fetch(`/api/v1/register/verify?domain=${formData.domain}&token=${verification.token}`)
      const data = await response.json()
      
      setVerification(prev => prev ? { ...prev, verified: data.verified } : null)
    } catch (err) {
      console.error("Failed to check verification:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Register MCP Server</h1>
            <p className="text-lg text-gray-600">
              Add your Model Context Protocol server to the global registry
            </p>
          </div>

          {/* API Key Requirement Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-lg">🔑</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">API Key Required</h3>
                <p className="text-blue-800 mb-4">
                  Server registration requires an API key. Discovery is free, but registering your own MCP servers
                  needs authentication to prevent spam and ensure quality.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔑 Get API Keys
                  </a>
                  <a
                    href="/discover"
                    className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    🔍 Discover Servers (Free)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {!success ? (
            /* Registration Form */
            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain *
                  </label>
                  <input
                    type="text"
                    placeholder="example.com"
                    value={formData.domain}
                    onChange={(e) => handleInputChange("domain", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MCP Endpoint *
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/mcp"
                    value={formData.endpoint}
                    onChange={(e) => handleInputChange("endpoint", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capabilities
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add capability (e.g., email, calendar)"
                      value={capabilityInput}
                      onChange={(e) => setCapabilityInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCapability())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addCapability}
                      disabled={!capabilityInput.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  {formData.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.capabilities.map((cap) => (
                        <span
                          key={cap}
                          onClick={() => removeCapability(cap)}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md cursor-pointer hover:bg-blue-200"
                        >
                          {cap} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange("contact_email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                      <strong>Error:</strong> {error}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !formData.domain || !formData.endpoint}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Registering..." : "🖥️ Register Server"}
                </button>
              </form>
            </div>
          ) : (
            /* Verification Instructions */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-green-800">
                  <strong>Registration Submitted!</strong> Your server has been registered. Complete DNS verification to make it discoverable.
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">DNS Verification Required</h3>
                  
                  <p>Add the following TXT record to your DNS configuration:</p>
                  
                  <div className="bg-gray-100 p-4 rounded-md">
                    <div className="space-y-2">
                      <div><strong>Record Type:</strong> TXT</div>
                      <div><strong>Name:</strong> <code className="bg-gray-200 px-1 rounded">{verification?.dns_record}</code></div>
                      <div><strong>Value:</strong> <code className="bg-gray-200 px-1 rounded">{verification?.token}</code></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className={verification?.verified ? "text-green-500" : "text-yellow-500"}>
                        {verification?.verified ? "✅" : "⏰"}
                      </span>
                      <span>Status: {verification?.verified ? "Verified" : "Pending"}</span>
                    </div>
                    
                    <button
                      onClick={checkVerification}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Check Status
                    </button>
                  </div>

                  {verification?.verified && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="text-green-800">
                        <strong>Verification Complete!</strong> Your server is now discoverable in the MCP registry.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
