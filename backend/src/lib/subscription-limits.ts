import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

/**
 * Check if organization can perform an action based on subscription limits
 */
export async function checkSubscriptionLimit(
  organizationId: number,
  limitType: keyof SubscriptionLimits
): Promise<{ allowed: boolean; reason?: string }> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      subscriptionPlan: true,
      subscriptionStatus: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!organization) {
    return { allowed: false, reason: 'Organization not found' };
  }

  // Check if subscription is active
  if (organization.subscriptionStatus !== 'ACTIVE') {
    return { allowed: false, reason: 'Subscription is not active' };
  }

  // Check if subscription is expired
  if (organization.subscriptionExpiresAt && new Date(organization.subscriptionExpiresAt) < new Date()) {
    return { allowed: false, reason: 'Subscription has expired' };
  }

  const limits = getSubscriptionLimits(organization.subscriptionPlan);

  // For boolean limits (features)
  if (typeof limits[limitType] === 'boolean') {
    return {
      allowed: limits[limitType] as boolean,
      reason: limits[limitType] ? undefined : `This feature is not available in ${organization.subscriptionPlan} plan`,
    };
  }

  // For numeric limits (counts)
  if (typeof limits[limitType] === 'number') {
    const maxValue = limits[limitType] as number;
    
    // Unlimited
    if (maxValue === -1) {
      return { allowed: true };
    }

    // Check current usage
    let currentCount = 0;
    
    switch (limitType) {
      case 'maxAppointmentsPerMonth':
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        currentCount = await prisma.appointment.count({
          where: {
            service: {
              organizationId,
            },
            createdAt: {
              gte: startOfMonth,
            },
          },
        });
        break;
      
      case 'maxServices':
        currentCount = await prisma.service.count({
          where: { organizationId },
        });
        break;
      
      case 'maxOrganizations':
        // For organizations, we check user's organization count
        // This is a special case - usually users belong to one org
        currentCount = 1; // Simplified - in multi-org scenarios, count user's orgs
        break;
    }

    return {
      allowed: currentCount < maxValue,
      reason: currentCount >= maxValue 
        ? `You have reached the limit of ${maxValue} ${limitType.replace('max', '').toLowerCase()} for ${organization.subscriptionPlan} plan`
        : undefined,
    };
  }

  return { allowed: true };
}

/**
 * Middleware to check subscription limits for API routes
 */
export async function requireSubscriptionFeature(
  organizationId: number,
  feature: 'aiAssistant' | 'advancedAnalytics' | 'apiAccess' | 'prioritySupport'
): Promise<{ allowed: boolean; error?: string }> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      subscriptionPlan: true,
      subscriptionStatus: true,
      subscriptionExpiresAt: true,
    },
  });

  if (!organization) {
    return { allowed: false, error: 'Organization not found' };
  }

  // Check if subscription is active
  if (organization.subscriptionStatus !== 'ACTIVE') {
    return { allowed: false, error: 'Subscription is not active' };
  }

  // Check if subscription is expired
  if (organization.subscriptionExpiresAt && new Date(organization.subscriptionExpiresAt) < new Date()) {
    return { allowed: false, error: 'Subscription has expired' };
  }

  const limits = getSubscriptionLimits(organization.subscriptionPlan);
  
  const featureMap: Record<typeof feature, keyof SubscriptionLimits> = {
    aiAssistant: 'aiAssistantEnabled',
    advancedAnalytics: 'advancedAnalytics',
    apiAccess: 'apiAccess',
    prioritySupport: 'prioritySupport',
  };

  const featureKey = featureMap[feature];
  const isEnabled = limits[featureKey] as boolean;

  if (!isEnabled) {
    return {
      allowed: false,
      error: `This feature is only available in PRO or ENTERPRISE plans. Your current plan: ${organization.subscriptionPlan}`,
    };
  }

  return { allowed: true };
}

