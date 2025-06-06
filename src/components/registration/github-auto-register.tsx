'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Github, 
  Package, 
  Star, 
  Code, 
  ExternalLink,
  AlertTriangle,
  Info,
  Shield,
  Zap,
  FileText,
  Settings,
  Container
} from 'lucide-react';

interface DeploymentOptions {
  npm_package: boolean;
  docker_support: boolean;
  has_dockerfile: boolean;
  live_url_detected: boolean;
  python_package: boolean;
  rust_crate: boolean;
  go_module: boolean;
}

interface AnalysisReport {
  is_mcp_server: boolean;
  confidence_score: number;
  usability_score: number;
  rejection_reasons: string[];
  warning_flags: string[];
  positive_indicators: string[];
  installation_complexity: 'simple' | 'moderate' | 'complex' | 'unclear';
  documentation_quality: 'poor' | 'fair' | 'good' | 'excellent';
  recommended_action: 'accept' | 'accept_with_warnings' | 'reject' | 'needs_review';
}

interface RegistrationResult {
  success?: boolean;
  error?: string;
  message?: string;
  rejection_reasons?: string[];
  suggestions?: string[];
  force_register_option?: {
    message: string;
    warning: string;
  };
  server?: {
    domain: string;
    name: string;
    description: string;
    github_url: string;
    registration_type: string;
  };
  analysis?: {
    repository: {
      owner: string;
      repo: string;
      stars: number;
      language: string;
      topics: string[];
      license: string;
    };
    deployment_options: DeploymentOptions;
    mcp_features: {
      has_claude_config: boolean;
      npm_package: string | null;
      installation_command: string | null;
      environment_variables: string[];
      suggested_auth_type: string;
    };
    quality_assessment: {
      confidence_score: number;
      usability_score: number;
      installation_complexity: string;
      documentation_quality: string;
      recommended_action: string;
    };
    feedback: {
      positive_indicators: string[];
      warning_flags: string[];
      rejection_reasons: string[];
    };
  };
  next_steps?: string[];
  recommendations?: string[];
}

export function GitHubAutoRegister() {
  const [githubUrl, setGithubUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [forceRegister, setForceRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
          force_register: forceRegister,
          skip_analysis: false
        }),
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok && response.status !== 422) {
        // 422 is expected for rejections
        throw new Error(data.details || data.error || 'Registration failed');
      }

    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceRegister = () => {
    setForceRegister(true);
    handleSubmit(new Event('submit') as any);
  };

  const isValidGitHubUrl = (url: string) => {
    return url.includes('github.com/') && url.split('/').length >= 5;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplexityBadge = (complexity: string) => {
    const variants = {
      simple: 'default',
      moderate: 'secondary',
      complex: 'destructive',
      unclear: 'outline'
    } as const;
    return variants[complexity as keyof typeof variants] || 'outline';
  };

  const getQualityBadge = (quality: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      fair: 'outline',
      poor: 'destructive'
    } as const;
    return variants[quality as keyof typeof variants] || 'outline';
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
            Automatically analyze and register your MCP server from a GitHub repository. 
            Our intelligent analysis will evaluate deployment options, documentation quality, and MCP compatibility.
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
              {isLoading ? 'Analyzing Repository...' : 'Analyze & Register MCP Server'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result?.error && !result?.analysis && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}

      {/* Rejection with Analysis */}
      {result?.error && result?.analysis && (
        <div className="space-y-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {result.error}
            </AlertDescription>
          </Alert>

          {/* Analysis Results for Rejected Repository */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Analysis Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="deployment">Deployment</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>MCP Confidence Score</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={result.analysis.quality_assessment.confidence_score} className="flex-1" />
                        <span className={`text-sm font-medium ${getScoreColor(result.analysis.quality_assessment.confidence_score)}`}>
                          {result.analysis.quality_assessment.confidence_score}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Usability Score</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={result.analysis.quality_assessment.usability_score} className="flex-1" />
                        <span className={`text-sm font-medium ${getScoreColor(result.analysis.quality_assessment.usability_score)}`}>
                          {result.analysis.quality_assessment.usability_score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Installation Complexity</Label>
                      <Badge variant={getComplexityBadge(result.analysis.quality_assessment.installation_complexity)} className="mt-1">
                        {result.analysis.quality_assessment.installation_complexity}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Documentation Quality</Label>
                      <Badge variant={getQualityBadge(result.analysis.quality_assessment.documentation_quality)} className="mt-1">
                        {result.analysis.quality_assessment.documentation_quality}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="deployment" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Available Deployment Options</Label>
                      <div className="space-y-1">
                        {Object.entries(result.analysis.deployment_options).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Repository Info</Label>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          <span className="text-sm">{result.analysis.repository.stars} stars</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          <span className="text-sm">{result.analysis.repository.language}</span>
                        </div>
                        {result.analysis.repository.license && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">{result.analysis.repository.license}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                  {result.analysis.feedback.rejection_reasons.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-red-600">Rejection Reasons</Label>
                      <ul className="space-y-1">
                        {result.analysis.feedback.rejection_reasons.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.analysis.feedback.warning_flags.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-yellow-600">Warning Flags</Label>
                      <ul className="space-y-1">
                        {result.analysis.feedback.warning_flags.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.analysis.feedback.positive_indicators.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-green-600">Positive Indicators</Label>
                      <ul className="space-y-1">
                        {result.analysis.feedback.positive_indicators.map((indicator, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Improvement Suggestions</Label>
                      <ol className="space-y-2">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm">{suggestion}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {result.force_register_option && (
                    <div className="space-y-4">
                      <Separator />
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p>{result.force_register_option.message}</p>
                            <p className="text-sm text-yellow-600">{result.force_register_option.warning}</p>
                          </div>
                        </AlertDescription>
                      </Alert>
                      <Button 
                        variant="outline" 
                        onClick={handleForceRegister}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Force Register Anyway
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Successful Registration */}
      {result?.success && result?.server && (
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

          {/* Comprehensive Analysis Display */}
          {result.analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">MCP Features</TabsTrigger>
                    <TabsTrigger value="deployment">Deployment</TabsTrigger>
                    <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>MCP Confidence Score</Label>
                        <div className="flex items-center gap-2">
                          <Progress value={result.analysis.quality_assessment.confidence_score} className="flex-1" />
                          <span className={`text-sm font-medium ${getScoreColor(result.analysis.quality_assessment.confidence_score)}`}>
                            {result.analysis.quality_assessment.confidence_score}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Usability Score</Label>
                        <div className="flex items-center gap-2">
                          <Progress value={result.analysis.quality_assessment.usability_score} className="flex-1" />
                          <span className={`text-sm font-medium ${getScoreColor(result.analysis.quality_assessment.usability_score)}`}>
                            {result.analysis.quality_assessment.usability_score}%
                          </span>
                        </div>
                      </div>
                    </div>

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
                  </TabsContent>

                  <TabsContent value="features" className="space-y-4">
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
                  </TabsContent>

                  <TabsContent value="deployment" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Deployment Options</Label>
                        <div className="space-y-1">
                          {Object.entries(result.analysis.deployment_options).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Quality Indicators</Label>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Installation Complexity</Label>
                            <Badge variant={getComplexityBadge(result.analysis.quality_assessment.installation_complexity)} className="ml-2">
                              {result.analysis.quality_assessment.installation_complexity}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-xs">Documentation Quality</Label>
                            <Badge variant={getQualityBadge(result.analysis.quality_assessment.documentation_quality)} className="ml-2">
                              {result.analysis.quality_assessment.documentation_quality}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="next-steps" className="space-y-4">
                    {result.next_steps && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Next Steps</Label>
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
                      </div>
                    )}

                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Recommendations</Label>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

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
              setForceRegister(false);
            }}>
              Register Another Server
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
