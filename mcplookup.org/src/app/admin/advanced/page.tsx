// Advanced Admin Features Page
// Comprehensive dashboard for security, analytics, and real-time monitoring

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { AdvancedAdminDashboard } from '@/components/admin/advanced-admin-dashboard';

export const metadata: Metadata = {
  title: 'Advanced Admin Features - MCPLookup.org',
  description: 'Advanced security monitoring, analytics, and real-time dashboard for administrators',
};

export default async function AdvancedAdminPage() {
  // Check authentication and admin permissions
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/advanced');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard?error=insufficient_permissions');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Admin Features</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive security monitoring, analytics, and real-time system management
          </p>
        </div>

        <AdvancedAdminDashboard />
      </div>
    </div>
  );
}
