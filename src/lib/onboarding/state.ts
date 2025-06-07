// User Onboarding State Management
// Tracks user progress through onboarding steps

import { createStorage } from '../services/storage/factory';
import { isSuccessResult } from '../services/storage/unified-storage';

export interface OnboardingState {
  user_id: string;
  current_step: OnboardingStep;
  completed_steps: OnboardingStep[];
  progress_percentage: number;
  needs_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export type OnboardingStep = 
  | 'welcome'
  | 'domain_verify' 
  | 'server_register'
  | 'dashboard_tour'
  | 'training_impact'
  | 'completed';

export interface OnboardingProgress {
  current_step: OnboardingStep;
  progress: number;
  completed_steps: OnboardingStep[];
  needs_onboarding: boolean;
  next_step?: {
    name: OnboardingStep;
    title: string;
    description: string;
  };
}

export interface UserAnalytics {
  servers_registered: number;
  domains_verified: number;
  api_calls_30d: number;
  discovery_queries_30d: number;
  last_activity: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'domain_verify',
  'server_register', 
  'dashboard_tour',
  'training_impact',
  'completed'
];

const STEP_TITLES: Record<OnboardingStep, string> = {
  welcome: 'Welcome to MCPLookup.org',
  domain_verify: 'Verify Domain Ownership',
  server_register: 'Register Your First Server',
  dashboard_tour: 'Explore Dashboard Features',
  training_impact: 'Learn About Training Impact',
  completed: 'Onboarding Complete'
};

const STEP_DESCRIPTIONS: Record<OnboardingStep, string> = {
  welcome: 'Get started with the universal MCP discovery service',
  domain_verify: 'Verify ownership of your domain to register servers',
  server_register: 'Add your first MCP server to the directory',
  dashboard_tour: 'Learn about analytics and monitoring features',
  training_impact: 'Understand how your data helps improve the service',
  completed: 'You\'re all set! Start discovering and registering servers'
};

/**
 * Get user's onboarding state
 */
export async function getUserOnboardingState(userId: string): Promise<OnboardingState | null> {
  const storage = createStorage();
  
  const result = await storage.get<OnboardingState>('onboarding', userId);
  
  if (!isSuccessResult(result)) {
    return null;
  }
  
  return result.data;
}

/**
 * Get onboarding progress for user
 */
export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
  const state = await getUserOnboardingState(userId);
  
  if (!state) {
    // New user - start with welcome step
    return {
      current_step: 'welcome',
      progress: 0,
      completed_steps: [],
      needs_onboarding: true,
      next_step: {
        name: 'welcome',
        title: STEP_TITLES.welcome,
        description: STEP_DESCRIPTIONS.welcome
      }
    };
  }
  
  const currentIndex = ONBOARDING_STEPS.indexOf(state.current_step);
  const progress = Math.round((state.completed_steps.length / ONBOARDING_STEPS.length) * 100);
  
  let next_step = undefined;
  if (state.current_step !== 'completed') {
    const nextStepName = ONBOARDING_STEPS[currentIndex + 1] || 'completed';
    next_step = {
      name: nextStepName,
      title: STEP_TITLES[nextStepName],
      description: STEP_DESCRIPTIONS[nextStepName]
    };
  }
  
  return {
    current_step: state.current_step,
    progress,
    completed_steps: state.completed_steps,
    needs_onboarding: state.current_step !== 'completed',
    next_step
  };
}

/**
 * Update user's onboarding step
 */
export async function updateOnboardingStep(
  userId: string, 
  step: OnboardingStep, 
  completed: boolean = false
): Promise<OnboardingState> {
  const storage = createStorage();
  
  let state = await getUserOnboardingState(userId);
  
  if (!state) {
    // Create new onboarding state
    state = {
      user_id: userId,
      current_step: 'welcome',
      completed_steps: [],
      progress_percentage: 0,
      needs_onboarding: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  // Update current step
  state.current_step = step;
  state.updated_at = new Date().toISOString();
  
  // Mark step as completed if requested
  if (completed && !state.completed_steps.includes(step)) {
    state.completed_steps.push(step);
  }
  
  // Calculate progress
  state.progress_percentage = Math.round((state.completed_steps.length / ONBOARDING_STEPS.length) * 100);
  
  // Check if onboarding is complete
  if (step === 'completed' || state.completed_steps.length === ONBOARDING_STEPS.length) {
    state.current_step = 'completed';
    state.needs_onboarding = false;
    state.progress_percentage = 100;
  }
  
  // Save updated state
  const result = await storage.set('onboarding', userId, state);
  
  if (!isSuccessResult(result)) {
    throw new Error(`Failed to update onboarding state: ${result.error}`);
  }
  
  return state;
}

/**
 * Check if user needs onboarding
 */
export async function needsOnboarding(userId: string): Promise<boolean> {
  const state = await getUserOnboardingState(userId);
  
  if (!state) {
    return true; // New users need onboarding
  }
  
  return state.needs_onboarding && state.current_step !== 'completed';
}

/**
 * Get user analytics for onboarding
 */
export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  const storage = createStorage();
  
  // Get analytics data (simplified version)
  // In a real implementation, this would aggregate data from various sources
  
  const analyticsResult = await storage.get<UserAnalytics>('user_analytics', userId);
  
  if (isSuccessResult(analyticsResult) && analyticsResult.data) {
    return analyticsResult.data;
  }
  
  // Return default analytics for new users
  return {
    servers_registered: 0,
    domains_verified: 0,
    api_calls_30d: 0,
    discovery_queries_30d: 0,
    last_activity: new Date().toISOString()
  };
}

/**
 * Update user analytics
 */
export async function updateUserAnalytics(
  userId: string, 
  updates: Partial<UserAnalytics>
): Promise<void> {
  const storage = createStorage();
  
  const current = await getUserAnalytics(userId);
  const updated = {
    ...current,
    ...updates,
    last_activity: new Date().toISOString()
  };
  
  const result = await storage.set('user_analytics', userId, updated);
  
  if (!isSuccessResult(result)) {
    console.error('Failed to update user analytics:', result.error);
  }
}

/**
 * Auto-advance onboarding based on user actions
 */
export async function autoAdvanceOnboarding(userId: string, action: string): Promise<void> {
  const state = await getUserOnboardingState(userId);
  
  if (!state || state.current_step === 'completed') {
    return; // No onboarding needed
  }
  
  // Auto-advance based on actions
  switch (action) {
    case 'domain_verified':
      if (state.current_step === 'domain_verify') {
        await updateOnboardingStep(userId, 'server_register', true);
      }
      break;
      
    case 'server_registered':
      if (state.current_step === 'server_register') {
        await updateOnboardingStep(userId, 'dashboard_tour', true);
      }
      break;
      
    case 'dashboard_visited':
      if (state.current_step === 'dashboard_tour') {
        await updateOnboardingStep(userId, 'training_impact', true);
      }
      break;
      
    case 'training_acknowledged':
      if (state.current_step === 'training_impact') {
        await updateOnboardingStep(userId, 'completed', true);
      }
      break;
  }
}
