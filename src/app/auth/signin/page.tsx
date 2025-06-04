"use client"

import { SignInButton } from "@/components/auth/signin-button"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/">
            <div className="text-center cursor-pointer">
              <div className="text-5xl text-orange-500 mb-2">🔍</div>
              <h1 className="text-2xl font-bold text-orange-500">
                MCPLookup
              </h1>
            </div>
          </Link>

          {/* Sign In Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Welcome back</h2>
                <p className="text-gray-600 mt-2">
                  Sign in to your account to continue
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium">
                  Choose your preferred authentication method
                </p>
              </div>

              <div className="space-y-4">
                <SignInButton
                  provider="github"
                  width="full"
                  size="lg"
                />
                <SignInButton
                  provider="google"
                  width="full"
                  size="lg"
                />
              </div>

              <p className="text-sm text-gray-500 text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
