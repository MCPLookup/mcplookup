import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitHubAutoRegister } from '@/components/registration/github-auto-register';
import { ManualRegister } from '@/components/registration/manual-register';
import { Github, Globe, Zap, Shield, Package, Code } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Register MCP Server | MCPLookup.org',
  description: 'Register your Model Context Protocol (MCP) server to make it discoverable by Claude Desktop and other MCP clients.',
  keywords: ['MCP', 'Model Context Protocol', 'Claude Desktop', 'server registration', 'GitHub', 'automation'],
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Register Your MCP Server</h1>
        <p className="text-xl text-gray-600 mb-6">
          Make your Model Context Protocol server discoverable by Claude Desktop and other MCP clients
        </p>
        
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">Instant Discovery</h3>
              <p className="text-sm text-blue-700">Users can find and install your server immediately</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">Verified Quality</h3>
              <p className="text-sm text-green-700">Domain verification ensures authenticity</p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">Rich Metadata</h3>
              <p className="text-sm text-purple-700">Complete installation and usage instructions</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Methods */}
      <Tabs defaultValue="github" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub Auto-Register
            <Badge variant="secondary" className="ml-2">Recommended</Badge>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Manual Registration
          </TabsTrigger>
        </TabsList>

        {/* GitHub Auto-Registration */}
        <TabsContent value="github" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Registration Form */}
            <div className="lg:col-span-2">
              <GitHubAutoRegister />
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Auto-Register?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Automatic Analysis</h4>
                      <p className="text-sm text-gray-600">
                        We analyze your repository to extract Claude configs, NPM packages, and environment variables
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Instant Setup</h4>
                      <p className="text-sm text-gray-600">
                        No manual form filling - we extract all metadata from your repository
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Rich Metadata</h4>
                      <p className="text-sm text-gray-600">
                        Installation commands, environment variables, and capabilities automatically detected
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What We Extract</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Claude Desktop configurations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">NPM package information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Environment variables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Installation commands</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Repository metadata (stars, topics, language)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Capability classification</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">Public GitHub repository</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">README with MCP information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full" />
                    <span className="text-sm text-gray-600">Claude Desktop config (optional)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full" />
                    <span className="text-sm text-gray-600">NPM package (optional)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Manual Registration */}
        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Registration Form */}
            <div className="lg:col-span-2">
              <ManualRegister />
            </div>

            {/* Manual Registration Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manual Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Domain Verification</h4>
                      <p className="text-sm text-gray-600">
                        Prove ownership of your domain with DNS TXT record verification
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Live Endpoints</h4>
                      <p className="text-sm text-gray-600">
                        Register servers with live HTTP endpoints for real-time access
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Custom Metadata</h4>
                      <p className="text-sm text-gray-600">
                        Full control over server description, capabilities, and configuration
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
                    <span className="text-sm">Live HTTP endpoints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Custom domain verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Non-GitHub repositories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                    <span className="text-sm">Complex configurations</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <span className="text-sm">Submit registration form</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <span className="text-sm">Receive DNS TXT record</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <span className="text-sm">Add record to your domain</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <span className="text-sm">Automatic verification</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
