// Generated API Client for MCPLookup.org API
// This file provides a type-safe client for the MCPLookup.org API

import createClient from 'openapi-fetch';
import type { paths } from './client';

// Create the API client with proper typing
export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mcplookup.org/api/v1',
});

// Type-safe API methods
export class MCPLookupAPIClient {
  private client = apiClient;

  constructor(baseUrl?: string, apiKey?: string) {
    if (baseUrl) {
      this.client = createClient<paths>({ baseUrl });
    }
    
    if (apiKey) {
      this.client.use({
        onRequest({ request }) {
          request.headers.set('Authorization', `Bearer ${apiKey}`);
          return request;
        },
      });
    }
  }

  // Discovery endpoints
  async discover(params: paths['/discover']['post']['requestBody']['content']['application/json']) {
    const { data, error } = await this.client.POST('/discover', {
      body: params,
    });
    
    if (error) throw new Error(`Discovery failed: ${error}`);
    return data;
  }

  async discoverSmart(params: paths['/discover/smart']['post']['requestBody']['content']['application/json']) {
    const { data, error } = await this.client.POST('/discover/smart', {
      body: params,
    });
    
    if (error) throw new Error(`Smart discovery failed: ${error}`);
    return data;
  }

  // Registration endpoints
  async register(params: paths['/register']['post']['requestBody']['content']['application/json']) {
    const { data, error } = await this.client.POST('/register', {
      body: params,
    });
    
    if (error) throw new Error(`Registration failed: ${error}`);
    return data;
  }

  async verifyRegistration(challengeId: string) {
    const { data, error } = await this.client.POST('/register/verify/{challengeId}', {
      params: { path: { challengeId } },
    });
    
    if (error) throw new Error(`Verification failed: ${error}`);
    return data;
  }

  async getRegistrationStatus(challengeId: string) {
    const { data, error } = await this.client.GET('/register/status/{challengeId}', {
      params: { path: { challengeId } },
    });
    
    if (error) throw new Error(`Status check failed: ${error}`);
    return data;
  }

  // Domain verification endpoints
  async startDomainVerification(domain: string) {
    const { data, error } = await this.client.POST('/verify', {
      body: { domain },
    });
    
    if (error) throw new Error(`Domain verification start failed: ${error}`);
    return data;
  }

  async getDomainVerifications() {
    const { data, error } = await this.client.GET('/verify');
    
    if (error) throw new Error(`Get verifications failed: ${error}`);
    return data;
  }

  async checkDomainOwnership(domain: string) {
    const { data, error } = await this.client.GET('/domain-check', {
      params: { query: { domain } },
    });
    
    if (error) throw new Error(`Domain check failed: ${error}`);
    return data;
  }

  // Health endpoints
  async getServerHealth(domain: string, realtime = false) {
    const { data, error } = await this.client.GET('/health/{domain}', {
      params: { 
        path: { domain },
        query: { realtime },
      },
    });
    
    if (error) throw new Error(`Health check failed: ${error}`);
    return data;
  }

  // Onboarding endpoints
  async getOnboardingState() {
    const { data, error } = await this.client.GET('/onboarding');
    
    if (error) throw new Error(`Get onboarding state failed: ${error}`);
    return data;
  }

  async updateOnboardingProgress(step: 'welcome' | 'domain_verify' | 'server_register' | 'dashboard_tour' | 'training_impact' | 'completed', completed = false) {
    const { data, error } = await this.client.POST('/onboarding', {
      body: { step, completed },
    });
    
    if (error) throw new Error(`Update onboarding failed: ${error}`);
    return data;
  }
}

// Export a default instance
export const mcpLookupAPI = new MCPLookupAPIClient();

// Export types for external use
export type { paths } from './client';
export type DiscoverRequest = paths['/discover']['post']['requestBody']['content']['application/json'];
export type DiscoverResponse = paths['/discover']['post']['responses']['200']['content']['application/json'];
export type SmartDiscoverRequest = paths['/discover/smart']['post']['requestBody']['content']['application/json'];
export type SmartDiscoverResponse = paths['/discover/smart']['post']['responses']['200']['content']['application/json'];
export type RegisterRequest = paths['/register']['post']['requestBody']['content']['application/json'];
export type RegisterResponse = paths['/register']['post']['responses']['200']['content']['application/json'];
export type HealthResponse = paths['/health/{domain}']['get']['responses']['200']['content']['application/json'];
export type OnboardingResponse = paths['/onboarding']['get']['responses']['200']['content']['application/json'];
