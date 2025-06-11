'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Github,
  Shield,
  User,
  FileText,
  GitBranch,
  Crown,
  Star,
  Edit,
  UserCheck
} from 'lucide-react';

interface OwnershipChallenge {
  challenge_id: string;
  github_repo: string;
  verification_hash: string;
  file_name: string;
  created_at: string;
  expires_at: string;
  verification_instructions: string[];
}

interface VerificationResult {
  verified: boolean;
  message: string;
  ownership_status?: string;
  badges?: string[];
}

export function GitHubOwnershipClaim() {
  const [step, setStep] = useState<'claim' | 'instructions' | 'verify' | 'success'>('claim');
  const [githubRepo, setGithubRepo] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [branchName, setBranchName] = useState('main');
  const [challenge, setChallenge] = useState<OwnershipChallenge | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/github/claim-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          github_repo: githubRepo,
          claim_reason: claimReason
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate ownership claim');
      }

      setChallenge(data.challenge);
      setStep('instructions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/github/verify-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          github_repo: challenge.github_repo,
          verification_hash: challenge.verification_hash,
          branch_name: branchName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerificationResult(data);
      setStep(data.verified ? 'success' : 'verify');
      
      if (!data.verified) {
        setError(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isValidGitHubRepo = (repo: string) => {
    return /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(repo);
  };

  // Success State
  if (step === 'success' && verificationResult?.verified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900">Repository Ownership Verified!</h3>
            <p className="text-green-700">
              You now own the GitHub repository <strong>{challenge?.github_repo}</strong> on MCPLookup.
              You can edit metadata, show it on your profile, and more.
            </p>
            
            {verificationResult.badges && (
              <div className="flex flex-wrap justify-center gap-2">
                {verificationResult.badges.map((badge) => (
                  <Badge key={badge} variant="default" className="bg-green-100 text-green-800">
                    {badge === 'github_verified' && <Github className="h-3 w-3 mr-1" />}
                    {badge === 'repo_owner' && <Crown className="h-3 w-3 mr-1" />}
                    {badge === 'metadata_editor' && <Edit className="h-3 w-3 mr-1" />}
                    {badge.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.href = `/servers/${challenge?.github_repo}`}>
                View Server Details
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard/repositories'}>
                Manage Repositories
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Instructions State
  if (step === 'instructions' && challenge) {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle>Repository Ownership Verification</CardTitle>
          </div>
          <CardDescription>
            Follow these steps to prove ownership of <strong>{challenge.github_repo}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Verification File */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Create Verification File
            </h4>
            <div className="space-y-3">
              <div>
                <Label className="text-blue-700">File Name</Label>
                <div className="font-mono bg-white border rounded px-3 py-2 mt-1 flex items-center justify-between">
                  {challenge.file_name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(challenge.file_name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-blue-700">File Content</Label>
                <div className="font-mono bg-white border rounded px-3 py-2 mt-1 flex items-center justify-between text-sm">
                  <span className="truncate">{challenge.verification_hash}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(challenge.verification_hash)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Verification Steps
            </h4>
            <ol className="space-y-3 text-sm">
              {challenge.verification_instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Repository Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Github className="h-4 w-4 text-gray-600" />
              Repository Information
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Repository:</strong> {challenge.github_repo}</p>
              <p><strong>Expires:</strong> {new Date(challenge.expires_at).toLocaleString()}</p>
              <p><strong>Challenge ID:</strong> {challenge.challenge_id}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStep('verify')} className="flex-1">
              I've Added the File - Verify Ownership
            </Button>
            <Button variant="outline" onClick={() => setStep('claim')}>
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verification State
  if (step === 'verify' && challenge) {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Verify Repository Ownership</CardTitle>
          </div>
          <CardDescription>
            Specify the branch where you added the verification file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch Name *</Label>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-gray-500" />
                <Input
                  id="branch"
                  type="text"
                  placeholder="main"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-gray-600">
                The branch where you committed the <code>mcplookup.org</code> file
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Verifying...' : 'Verify Ownership'}
              </Button>
              <Button variant="outline" onClick={() => setStep('instructions')}>
                Back to Instructions
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Claim State (Initial)
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <CardTitle>Claim GitHub Repository Ownership</CardTitle>
        </div>
        <CardDescription>
          Prove you own a GitHub repository to edit metadata, show on your profile, and gain additional privileges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleClaimSubmit} className="space-y-6">
          
          {/* Repository Input */}
          <div className="space-y-2">
            <Label htmlFor="github_repo">GitHub Repository *</Label>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-gray-500" />
              <Input
                id="github_repo"
                type="text"
                placeholder="owner/repository-name"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                required
              />
            </div>
            {githubRepo && !isValidGitHubRepo(githubRepo) && (
              <p className="text-red-500 text-sm">
                Please enter a valid GitHub repository (owner/repo)
              </p>
            )}
          </div>

          {/* Claim Reason */}
          <div className="space-y-2">
            <Label htmlFor="claim_reason">Reason for Claiming (Optional)</Label>
            <Textarea
              id="claim_reason"
              placeholder="Why are you claiming ownership of this repository? (e.g., I'm the original author, I maintain this project, etc.)"
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Benefits Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-green-900">Benefits of Repository Ownership</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li className="flex items-center gap-2">
                <Edit className="h-3 w-3" />
                Edit server metadata and descriptions
              </li>
              <li className="flex items-center gap-2">
                <User className="h-3 w-3" />
                Show repository on your profile
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-3 w-3" />
                Higher trust level in discovery
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Prevent unauthorized modifications
              </li>
            </ul>
          </div>

          {/* Verification Process Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-blue-900">Verification Process</h4>
            <ol className="space-y-1 text-sm text-blue-800">
              <li>1. We'll generate a unique verification file for you</li>
              <li>2. You commit this file to your repository</li>
              <li>3. We verify the file exists in your repo</li>
              <li>4. You gain ownership and can edit metadata</li>
            </ol>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !isValidGitHubRepo(githubRepo)} 
            className="w-full"
          >
            {loading ? 'Initiating Claim...' : 'Claim Repository Ownership'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
