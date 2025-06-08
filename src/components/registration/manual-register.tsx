'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Plus, X, Copy } from 'lucide-react';

interface RegistrationData {
  domain: string;
  endpoint: string;
  capabilities: string[];
  contact_email: string;
}

interface VerificationStatus {
  token: string;
  verified: boolean;
  dns_record: string;
}

export function ManualRegister() {
  const [formData, setFormData] = useState<RegistrationData>({
    domain: '',
    endpoint: '',
    capabilities: [],
    contact_email: ''
  });
  const [capabilityInput, setCapabilityInput] = useState('');
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
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
      const response = await fetch('/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Registration failed');
      }

      if (data.verification_required) {
        setVerification({
          token: data.verification_token,
          verified: false,
          dns_record: data.dns_record
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
      const response = await fetch(`/api/v1/register/verify/${verification.token}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.verified) {
        setVerification(prev => prev ? { ...prev, verified: true } : null);
        setSuccess(true);
      } else {
        setError('DNS verification failed. Please ensure the TXT record is properly set.');
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

  if (success) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h3 className="text-xl font-semibold">Registration Successful\!</h3>
            <p className="text-gray-600">
              Your MCP server has been successfully registered and is now discoverable.
            </p>
            <Button onClick={() => window.location.href = `/servers/${formData.domain}`}>
              View Server Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (verification && !verification.verified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Verification Required</CardTitle>
          <CardDescription>
            Please add the following DNS TXT record to verify domain ownership.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>DNS TXT Record</Label>
            <div className="flex items-center gap-2">
              <Input
                value={verification.dns_record}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(verification.dns_record)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Alert.Root>
            <Alert.Icon />
            <AlertDescription>
              Add this TXT record to your domain's DNS settings. The record name should be your domain root.
              DNS propagation may take up to 24 hours.
            </AlertDescription>
          </Alert.Root>

          <div className="flex gap-2">
            <Button onClick={checkVerification} disabled={loading}>
              {loading ? 'Checking...' : 'Check Verification'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setVerification(null);
                setFormData({
                  domain: '',
                  endpoint: '',
                  capabilities: [],
                  contact_email: ''
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Server Registration</CardTitle>
        <CardDescription>
          Register your MCP server with domain verification for live endpoints.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>
            <Input
              id="domain"
              type="text"
              placeholder="api.example.com"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL</Label>
            <Input
              id="endpoint"
              type="url"
              placeholder="https://api.example.com/mcp"
              value={formData.endpoint}
              onChange={(e) => handleInputChange('endpoint', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email *</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.contact_email}
              onChange={(e) => handleInputChange('contact_email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Capabilities</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add capability (e.g., email, database)"
                value={capabilityInput}
                onChange={(e) => setCapabilityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
              />
              <Button type="button" variant="outline" onClick={addCapability}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
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

          {error && (
            <Alert.Root status="error">
              <Alert.Icon />
              <AlertDescription>{error}</AlertDescription>
            </Alert.Root>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Registering...' : 'Register Server'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
