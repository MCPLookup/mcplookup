'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Github, Package, Star, Code, ExternalLink } from 'lucide-react';

interface GitHubAnalysis {
  repository: {
    owner: string;
    repo: string;
    stars: number;
    language: string;
    topics: string[];
  };
  mcp_features: {
    has_claude_config: boolean;
    npm_package: string | null;
    installation_command: string | null;
    environment_variables: string[];
    suggested_auth_type: string;
  };
  capabilities: string[];
}

interface RegistrationResult {
  success: boolean;
  message: string;
  server: {
    domain: string;
    name: string;
    description: string;
    github_url: string;
    registration_type: string;
  };
  analysis: GitHubAnalysis;
  next_steps: string[];
}

export function GitHubAutoRegister() {
  const [githubUrl, setGithubUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/v1/register/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          github_url: githubUrl,
          contact_email: contactEmail,
          deployment_preference: 'package_only'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Registration failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidGitHubUrl = (url: string) => {
    return url.includes('github.com/') && url.split('/').length >= 5;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Auto-Register from GitHub
          </CardTitle>
          <CardDescription>
            Automatically register your MCP server by providing a GitHub repository URL. 
            We'll analyze the repository and extract MCP configuration, installation instructions, and metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-url">GitHub Repository URL</Label>
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/owner/mcp-server-repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                required
              />
              {githubUrl && !isValidGitHubUrl(githubUrl) && (
                <p className="text-sm text-red-600">
                  Please enter a valid GitHub repository URL
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="your.email@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !isValidGitHubUrl(githubUrl)}
              className="w-full"
            >
              {isLoading ? 'Analyzing Repository...' : 'Auto-Register MCP Server'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {result.message}
            </AlertDescription>
          </Alert>

          {/* Server Information */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Server</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Server Name</Label>
                  <p className="text-sm text-gray-600">{result.server.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Domain</Label>
                  <p className="text-sm text-gray-600">{result.server.domain}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600">{result.server.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Repository Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Repository Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <span className="font-medium">
                    {result.analysis.repository.owner}/{result.analysis.repository.repo}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">{result.analysis.repository.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Code className="h-4 w-4" />
                    <span className="text-sm">{result.analysis.repository.language}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Topics</Label>
                <div className="flex flex-wrap gap-1">
                  {result.analysis.repository.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Detected Capabilities</Label>
                <div className="flex flex-wrap gap-1">
                  {result.analysis.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MCP Features */}
          <Card>
            <CardHeader>
              <CardTitle>MCP Features Detected</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    result.analysis.mcp_features.has_claude_config ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm">Claude Desktop Config</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    result.analysis.mcp_features.npm_package ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm">NPM Package</span>
                </div>
              </div>

              {result.analysis.mcp_features.npm_package && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Package Information</Label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4" />
                      <code className="text-sm">{result.analysis.mcp_features.npm_package}</code>
                    </div>
                    {result.analysis.mcp_features.installation_command && (
                      <code className="text-xs text-gray-600 block">
                        {result.analysis.mcp_features.installation_command}
                      </code>
                    )}
                  </div>
                </div>
              )}

              {result.analysis.mcp_features.environment_variables.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Environment Variables</Label>
                  <div className="flex flex-wrap gap-1">
                    {result.analysis.mcp_features.environment_variables.map((envVar) => (
                      <Badge key={envVar} variant="outline" className="text-xs font-mono">
                        {envVar}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Authentication Type</Label>
                <Badge variant={result.analysis.mcp_features.suggested_auth_type === 'none' ? 'secondary' : 'default'}>
                  {result.analysis.mcp_features.suggested_auth_type}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {result.next_steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button asChild>
              <a href={`/servers/${result.server.domain}`} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                View Server Details
              </a>
            </Button>
            <Button variant="outline" onClick={() => {
              setResult(null);
              setGithubUrl('');
              setContactEmail('');
            }}>
              Register Another Server
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
