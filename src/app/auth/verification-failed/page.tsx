"use client"

import Link from "next/link"
import { XCircleIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/24/solid"

export default function VerificationFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Verification Failed
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We couldn't verify your email address
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Verification Link Invalid
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      This verification link is either invalid, expired, or has already been used.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Common Reasons</h3>
              <div className="text-left space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Link expired:</strong> Verification links expire after 24 hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Already verified:</strong> Your email may already be verified
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Invalid link:</strong> The link may have been corrupted
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-sm text-blue-700">
                <p className="font-medium">Need a new verification link?</p>
                <p className="mt-1">
                  Try signing in to your account. If your email isn't verified, 
                  we'll automatically send you a new verification link.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Signing In
              </Link>
              
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New Account
              </Link>
              
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
