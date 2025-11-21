/**
 * Centralized subscription plan configuration
 * 
 * This is the single source of truth for all subscription plans,
 * including limits, pricing, and feature flags.
 * 
 * All numeric values (50, 15, 500, 29, etc.) are defined here only.
 */

import { SubscriptionPlan } from '@prisma/client';

export interface PlanLimits {
  maxAppointmentsPerMonth: number; // -1 for unlimited
  maxServices: number; // -1 for unlimited
  maxOrganizations: number; // -1 for unlimited
  aiAssistantEnabled: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export interface PlanConfig {
  id: SubscriptionPlan;
  displayName: string;
  monthlyPriceUSD: number | null; // null for FREE or ENTERPRISE (custom pricing)
  limits: PlanLimits;
}

/**
 * Complete plan configuration for all subscription tiers
 */
export const PLAN_CONFIG: Record<SubscriptionPlan, PlanConfig> = {
  FREE: {
    id: 'FREE',
    displayName: 'Free',
    monthlyPriceUSD: 0,
    limits: {
      maxAppointmentsPerMonth: 50,
      maxServices: 15,
      maxOrganizations: 1,
      aiAssistantEnabled: false,
      advancedAnalytics: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  PRO: {
    id: 'PRO',
    displayName: 'Professional',
    monthlyPriceUSD: 29,
    limits: {
      maxAppointmentsPerMonth: 500,
      maxServices: 50,
      maxOrganizations: 3,
      aiAssistantEnabled: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    displayName: 'Enterprise',
    monthlyPriceUSD: null, // Custom pricing - contact sales
    limits: {
      maxAppointmentsPerMonth: -1, // Unlimited
      maxServices: -1, // Unlimited
      maxOrganizations: -1, // Unlimited
      aiAssistantEnabled: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
};

/**
 * Get complete plan configuration
 */
export function getPlanConfig(plan: SubscriptionPlan): PlanConfig {
  return PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;
}

/**
 * Get plan limits only
 */
export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return getPlanConfig(plan).limits;
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  return getPlanConfig(plan).displayName;
}

/**
 * Get plan monthly price
 */
export function getPlanPrice(plan: SubscriptionPlan): number | null {
  return getPlanConfig(plan).monthlyPriceUSD;
}

