'use client';

import React, { useState } from 'react';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitHubAutoRegister } from '@/components/registration/github-auto-register';
import { ManualRegister } from '@/components/registration/manual-register';
import { OfficialDomainRegister } from '@/components/registration/official-domain-register';
import { 
  Github, 
  Globe, 
  Zap, 
  Shield, 
  Package, 
  Code, 
  Star,
  CheckCircle,
  Building,
  Users,
  Sparkles,
  Award,
  Crown,
  GitBranch
} from 'lucide-react';

export default function RegisterPage() {
  const [selectedTab, setSelectedTab] = useState('github');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Register Your MCP Server</h1>
        <p className="text-xl text-gray-600 mb-6">
          Choose your registration path: GitHub community projects or official domain-verified services
        </p>
        
        {/* Server Type Classification Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Two Types of MCP Servers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub Servers */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Github className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">GitHub-Based Servers</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Community</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Open source projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Community-driven development
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Package-based installation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  GitHub repository verification
                </li>
              </ul>
            </div>

            {/* Official Servers */}
            <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Official Domain Servers</h3>
                <Badge variant="default" className="bg-purple-100 text-purple-800">Enterprise</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Domain ownership verified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Live HTTP streaming endpoints
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Enterprise-grade reliability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  DNS verification required
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Methods */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub Auto-Register
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Recommended</Badge>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            GitHub Manual
          </TabsTrigger>
          <TabsTrigger value="official" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Official Domain
            <Badge variant="default" className="ml-2 bg-purple-100 text-purple-800">Enterprise</Badge>
          </TabsTrigger>
        </TabsList>

        {/* GitHub Auto-Registration (Strongly Recommended) */}
        <TabsContent value="github" className="space-y-6">
          {/* Recommendation Banner */}          <Alert.Root className="border-green-200 bg-green-50">
            <Sparkles className="h-4 w-4 text-green-600" />
            <Alert.Description className="text-green-800">
              <strong>Highly Recommended:</strong> GitHub auto-registration provides the best experience with automatic 
              metadata extraction, package management, and community discovery. Perfect for open source MCP servers.
            </Alert.Description>
          </Alert.Root>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Registration Form */}
            <div className="lg:col-span-2">
              <GitHubAutoRegister />
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-4">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-green-600" />
                    Why GitHub Auto-Register?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Automatic Analysis</h4>
                      <p className="text-sm text-gray-600">
                        Extracts Claude configs, NPM packages, and environment variables automatically
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Zero Setup</h4>
                      <p className="text-sm text-gray-600">
                        No manual form filling - everything extracted from your repository
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Community Ready</h4>
                      <p className="text-sm text-gray-600">
                        Classified as community server with GitHub verification badges
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Package Management</h4>
                      <p className="text-sm text-gray-600">
                        Supports NPM, Docker, and other package registries
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Server Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">Type: GitHub-based</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Status: Community verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-purple-500 rounded-full" />
                    <span className="text-sm">Availability: Package-only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">GitHub verification badges</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Manual GitHub Registration */}
        <TabsContent value="manual" className="space-y-6">          <Alert.Root className="border-blue-200 bg-blue-50">
            <Github className="h-4 w-4 text-blue-600" />
            <Alert.Description className="text-blue-800">
              Manual GitHub registration for when you need more control over metadata or have private repositories.
              Still classified as a GitHub-based community server.
            </Alert.Description>
          </Alert.Root>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Registration Form */}
            <div className="lg:col-span-2">
              <ManualRegister />
            </div>

            {/* Manual Registration Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manual GitHub Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Custom Domain</h4>
                      <p className="text-sm text-gray-600">
                        Use a custom domain while maintaining GitHub-based classification
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Manual Verification</h4>
                      <p className="text-sm text-gray-600">
                        Domain verification via DNS TXT records
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Custom Metadata</h4>
                      <p className="text-sm text-gray-600">
                        Full control over server description and capabilities
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">When to Use Manual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Private repositories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Custom domains</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Complex configurations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Non-standard setups</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Official Domain Registration */}
        <TabsContent value="official" className="space-y-6">          <Alert.Root className="border-purple-200 bg-purple-50">
            <Crown className="h-4 w-4 text-purple-600" />
            <Alert.Description className="text-purple-800">
              <strong>Official Domain Registration:</strong> For enterprises and services that own domains and want 
              to provide live HTTP streaming endpoints. Requires DNS domain ownership verification.
            </Alert.Description>
          </Alert.Root>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Registration Form */}
            <div className="lg:col-span-2">
              <OfficialDomainRegister />
            </div>

            {/* Official Registration Info */}
            <div className="space-y-4">
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    Official Domain Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Enterprise Classification</h4>
                      <p className="text-sm text-gray-600">
                        Marked as official, verified enterprise service
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Domain Verification</h4>
                      <p className="text-sm text-gray-600">
                        DNS TXT record proves domain ownership
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Live Endpoints</h4>
                      <p className="text-sm text-gray-600">
                        HTTP streaming for real-time MCP protocol access
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-gold-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Trust Badges</h4>
                      <p className="text-sm text-gray-600">
                        DNS verified, registrant verified, enterprise grade
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Server Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-purple-500 rounded-full" />
                    <span className="text-sm">Type: Official domain-registered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-gold-500 rounded-full" />
                    <span className="text-sm">Status: Enterprise verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Availability: Live endpoints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">Priority in discovery results</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Own a domain (e.g., company.com)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Ability to modify DNS records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Live HTTP MCP endpoint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Business/organization email</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Comparison Table */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Server Type Comparison</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium">Feature</th>
                    <th className="text-center p-4 font-medium">GitHub Auto</th>
                    <th className="text-center p-4 font-medium">GitHub Manual</th>
                    <th className="text-center p-4 font-medium">Official Domain</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-4 font-medium">Setup Difficulty</td>
                    <td className="text-center p-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Easy</Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Advanced</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Server Type</td>
                    <td className="text-center p-4">GitHub-based</td>
                    <td className="text-center p-4">GitHub-based</td>
                    <td className="text-center p-4">Official domain</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Classification</td>
                    <td className="text-center p-4">Community</td>
                    <td className="text-center p-4">Community</td>
                    <td className="text-center p-4">Enterprise</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Discovery Priority</td>
                    <td className="text-center p-4">Standard</td>
                    <td className="text-center p-4">Standard</td>
                    <td className="text-center p-4">
                      <Badge variant="default" className="bg-purple-100 text-purple-800">High</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Trust Level</td>
                    <td className="text-center p-4">GitHub verified</td>
                    <td className="text-center p-4">Domain verified</td>
                    <td className="text-center p-4">
                      <Badge variant="default" className="bg-purple-100 text-purple-800">Enterprise</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Availability</td>
                    <td className="text-center p-4">Package-only</td>
                    <td className="text-center p-4">Package-only</td>
                    <td className="text-center p-4">Live endpoints</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-600">
        <p className="text-sm">
          Need help? Check our{' '}
          <a href="/docs/registration" className="text-blue-600 hover:underline">
            registration documentation
          </a>{' '}
          or{' '}
          <a href="/contact" className="text-blue-600 hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
