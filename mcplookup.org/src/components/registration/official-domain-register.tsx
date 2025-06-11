// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/chakra-compat-simple';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  X, 
  Copy, 
  Crown,
  Shield,
  Globe,
  Building,
  Mail,
  Link as LinkIcon,
  AlertTriangle
} from 'lucide-react';

interface OfficialDomainData {
  domain: string;
  endpoint: string;
  organization_name: string;
  contact_email: string;
  business_email: string;
  description: string;
  capabilities: string[];
  category: string;
  github_repo?: string;
  support_url?: string;
  documentation_url?: string;
}

interface DomainVerificationStatus {
  verification_id: string;
  verified: boolean;
  dns_record: {
    name: string;
    type: string;
    value: string;
  };
  challenge_expires_at: string;
  verification_steps: string[];
}

const CATEGORIES = [
  'communication',
  'productivity', 
  'development',
  'finance',
  'social',
  'storage',
  'analytics',
  'security',
  'content',
  'integration'
];

export function OfficialDomainRegister() {
  const [formData, setFormData] = useState<OfficialDomainData>({
    domain: '',
    endpoint: '',
    organization_name: '',
    contact_email: '',
    business_email: '',
    description: '',
    capabilities: [],
    category: 'productivity',
    github_repo: '',
    support_url: '',
    documentation_url: ''
  });

  const [capabilityInput, setCapabilityInput] = useState('');
  const [verification, setVerification] = useState<DomainVerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof OfficialDomainData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCapability = () => {
    if (capabilityInput.trim() && !formData.capabilities.includes(capabilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, capabilityInput.trim()]
      }));
      setCapabilityInput('');
    }
  };

  const removeCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/register/official', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          server_type: 'official',
          requires_domain_verification: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Registration failed');
      }

      if (data.verification_required) {
        setVerification({
          verification_id: data.verification_id,
          verified: false,
          dns_record: data.dns_record,
          challenge_expires_at: data.challenge_expires_at,
          verification_steps: data.verification_steps
        });
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkVerification = async () => {
    if (!verification) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/register/verify/official/${verification.verification_id}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.verified) {
        setVerification(prev => prev ? { ...prev, verified: true } : null);
        setSuccess(true);
      } else {
        setError('Domain ownership verification failed. Please ensure the DNS record is properly configured.');
      }
    } catch (err) {
      setError('Verification check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Success State
  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900">Official Domain Registration Successful!</h3>
            <p className="text-green-700">
              Your MCP server has been successfully registered as an official domain-verified service.
              It will now appear with enterprise classification and priority in discovery results.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="default" className="bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                Official Domain
              </Badge>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Domain Verified
              </Badge>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enterprise Grade
              </Badge>
            </div>
            <Button onClick={() => window.location.href = `/servers/${formData.domain}`}>
              View Server Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Domain Verification State
  if (verification && !verification.verified) {
    return (
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <CardTitle>Domain Ownership Verification Required</CardTitle>
          </div>
          <CardDescription>
            Prove ownership of <strong>{formData.domain}</strong> by adding the following DNS record.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DNS Record */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              DNS TXT Record
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-purple-700">Record Type</Label>
                <div className="font-mono bg-white border rounded px-2 py-1 mt-1">
                  {verification.dns_record.type}
                </div>
              </div>
              <div>
                <Label className="text-purple-700">Name</Label>
                <div className="font-mono bg-white border rounded px-2 py-1 mt-1 flex items-center justify-between">
                  {verification.dns_record.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(verification.dns_record.name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-purple-700">Value</Label>
                <div className="font-mono bg-white border rounded px-2 py-1 mt-1 flex items-center justify-between">
                  <span className="truncate">{verification.dns_record.value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(verification.dns_record.value)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Verification Steps
            </h4>
            <ol className="space-y-2 text-sm">
              {verification.verification_steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Expiry Warning */}          <Alert.Root className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <Alert.Description className="text-orange-800">
              This verification challenge expires on {new Date(verification.challenge_expires_at).toLocaleString()}.
              DNS propagation can take up to 24 hours.
            </Alert.Description>          </Alert.Root>

          {error && (
            <Alert.Root className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <Alert.Description className="text-red-800">{error}</Alert.Description>
            </Alert.Root>
          )}

          <div className="flex gap-3">
            <Button onClick={checkVerification} disabled={loading} className="flex-1">
              {loading ? 'Verifying...' : 'Check Domain Verification'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setVerification(null);
                setFormData({
                  domain: '',
                  endpoint: '',
                  organization_name: '',
                  contact_email: '',
                  business_email: '',
                  description: '',
                  capabilities: [],
                  category: 'productivity',
                  github_repo: '',
                  support_url: '',
                  documentation_url: ''
                });
              }}
            >
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Registration Form
  return (
    <Card className="border-purple-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-purple-600" />
          <CardTitle>Official Domain Registration</CardTitle>
        </div>
        <CardDescription>
          Register an enterprise-grade MCP server with domain ownership verification.
          Provides live HTTP streaming endpoints and priority discovery status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Domain Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              Domain Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="api.company.com"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">MCP Endpoint URL *</Label>
                <Input
                  id="endpoint"
                  type="url"
                  placeholder="https://api.company.com/mcp"
                  value={formData.endpoint}
                  onChange={(e) => handleInputChange('endpoint', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              Organization Information
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization Name *</Label>
                <Input
                  id="organization_name"
                  type="text"
                  placeholder="Your Company Inc."
                  value={formData.organization_name}
                  onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_email">Business Email *</Label>
                  <Input
                    id="business_email"
                    type="email"
                    placeholder="admin@company.com"
                    value={formData.business_email}
                    onChange={(e) => handleInputChange('business_email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Technical Contact *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="tech@company.com"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Server Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Server Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_repo">GitHub Repository (Optional)</Label>
                <Input
                  id="github_repo"
                  type="text"
                  placeholder="company/mcp-server"
                  value={formData.github_repo}
                  onChange={(e) => handleInputChange('github_repo', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your MCP server's capabilities and use cases..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>

          {/* Additional URLs */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-purple-600" />
              Documentation & Support (Optional)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentation_url">Documentation URL</Label>
                <Input
                  id="documentation_url"
                  type="url"
                  placeholder="https://docs.company.com/mcp"
                  value={formData.documentation_url}
                  onChange={(e) => handleInputChange('documentation_url', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_url">Support URL</Label>
                <Input
                  id="support_url"
                  type="url"
                  placeholder="https://support.company.com"
                  value={formData.support_url}
                  onChange={(e) => handleInputChange('support_url', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-4">
            <h4 className="font-medium">Capabilities</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Add capability (e.g., email, database, analytics)"
                value={capabilityInput}
                onChange={(e) => setCapabilityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
              />
              <Button type="button" variant="outline" onClick={addCapability}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary" className="flex items-center gap-1">
                    {capability}
                    <button
                      type="button"
                      onClick={() => removeCapability(capability)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Domain Verification Notice */}
          <Alert className="border-purple-200 bg-purple-50">
            <Shield className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Domain Verification Required:</strong> After submission, you'll receive DNS TXT record 
              instructions to prove ownership of your domain. This ensures only legitimate domain owners 
              can register official servers.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
            {loading ? 'Registering...' : 'Register Official Domain Server'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
