/**
 * Subscription limits for frontend
 * This mirrors the backend limits
 */

export interface SubscriptionLimits {
  maxAppointmentsPerMonth: number;
  maxServices: number;
  maxOrganizations: number;
  aiAssistantEnabled: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

/**
 * Get subscription limits based on plan
 */
export function getSubscriptionLimits(plan: 'FREE' | 'PRO' | 'ENTERPRISE'): SubscriptionLimits {
  switch (plan) {
    case 'FREE':
      return {
        maxAppointmentsPerMonth: 50,
        maxServices: 15,
        maxOrganizations: 1,
        aiAssistantEnabled: false,
        advancedAnalytics: false,
        apiAccess: false,
        prioritySupport: false,
      };
    case 'PRO':
      return {
        maxAppointmentsPerMonth: 500,
        maxServices: 50,
        maxOrganizations: 3,
        aiAssistantEnabled: true,
        advancedAnalytics: true,
        apiAccess: true,
        prioritySupport: true,
      };
    case 'ENTERPRISE':
      return {
        maxAppointmentsPerMonth: -1, // Unlimited
        maxServices: -1, // Unlimited
        maxOrganizations: -1, // Unlimited
        aiAssistantEnabled: true,
        advancedAnalytics: true,
        apiAccess: true,
        prioritySupport: true,
      };
    default:
      return getSubscriptionLimits('FREE');
  }
}

