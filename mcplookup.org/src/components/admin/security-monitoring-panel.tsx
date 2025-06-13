"use client"

import { useState, useEffect } from 'react';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  domain?: string;
  message: string;
  timestamp: string;
  details?: any;
}

interface DomainChallenge {
  challenge_id: string;
  domain: string;
  challenge_type: string;
  status: string;
  expires_at: string;
  challenger_ip: string;
}

export function SecurityMonitoringPanel() {
  const [securityData, setSecurityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/security');
      
      if (response.ok) {
        const data = await response.json();
        setSecurityData(data);
      } else {
        setError('Failed to load security data');
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const initiateDomainChallenge = async () => {
    if (!selectedDomain) {
      alert('Please enter a domain name');
      return;
    }

    try {
      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate_domain_challenge',
          domain: selectedDomain,
          challengeType: 'ownership_transfer',
          reason: 'Admin-initiated ownership verification'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Domain challenge initiated successfully. Challenge ID: ${result.challenge.challenge_id}`);
        setSelectedDomain('');
        loadSecurityData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Failed to initiate challenge: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to initiate domain challenge:', error);
      alert('Failed to initiate domain challenge');
    }
  };

  const runSecuritySweep = async () => {
    try {
      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_security_sweep' })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Security sweep completed successfully');
        loadSecurityData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Failed to run security sweep: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to run security sweep:', error);
      alert('Failed to run security sweep');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadSecurityData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {securityData?.summary?.total_challenges || 0}
          </div>
          <div className="text-sm text-blue-600">Pending Challenges</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {securityData?.summary?.expired_registrations || 0}
          </div>
          <div className="text-sm text-yellow-600">Expired Registrations</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {securityData?.summary?.security_events || 0}
          </div>
          <div className="text-sm text-red-600">Security Events</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {securityData?.summary?.threat_level || 'Low'}
          </div>
          <div className="text-sm text-green-600">Threat Level</div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initiate Domain Challenge
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                placeholder="Enter domain name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={initiateDomainChallenge}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Challenge
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Security
            </label>
            <button
              onClick={runSecuritySweep}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Run Security Sweep
            </button>
          </div>
        </div>
      </div>

      {/* Pending Challenges */}
      {securityData?.data?.pending_challenges && securityData.data.pending_challenges.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Domain Challenges</h3>
          <div className="space-y-3">
            {securityData.data.pending_challenges.map((challenge: DomainChallenge) => (
              <div key={challenge.challenge_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{challenge.domain}</div>
                    <div className="text-sm text-gray-600">
                      Type: {challenge.challenge_type} | Status: {challenge.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      Expires: {new Date(challenge.expires_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    From: {challenge.challenger_ip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Security Events */}
      {securityData?.data?.security_events && securityData.data.security_events.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Security Events</h3>
          <div className="space-y-3">
            {securityData.data.security_events.slice(0, 10).map((event: SecurityEvent) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">{event.type}</span>
                      {event.domain && (
                        <span className="text-sm text-gray-600">({event.domain})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{event.message}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Summary */}
      {securityData?.data?.threat_summary && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {securityData.data.threat_summary.activeThreats || 0}
              </div>
              <div className="text-sm text-gray-600">Active Threats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {securityData.data.threat_summary.mitigatedThreats || 0}
              </div>
              <div className="text-sm text-gray-600">Mitigated Threats</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                securityData.data.threat_summary.threatLevel === 'low' ? 'text-green-600' :
                securityData.data.threat_summary.threatLevel === 'medium' ? 'text-yellow-600' :
                securityData.data.threat_summary.threatLevel === 'high' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {securityData.data.threat_summary.threatLevel?.toUpperCase() || 'UNKNOWN'}
              </div>
              <div className="text-sm text-gray-600">Threat Level</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
