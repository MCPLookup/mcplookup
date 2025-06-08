"use client"

import Link from "next/link"
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid"

export default function PasswordResetSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Password Reset Successful
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your password has been successfully updated
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <LockClosedIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Password Updated
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your password has been successfully changed. You can now sign in 
                      with your new password.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-sm text-blue-700">
                <p className="font-medium">Security Tips:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Keep your password secure and don't share it</li>
                  <li>Use a unique password for your MCPLookup.org account</li>
                  <li>Consider using a password manager</li>
                  <li>Sign out from shared devices</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In Now
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
