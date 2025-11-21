import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { validate as uuidValidate } from 'uuid';
import { PLAN_CONFIG, getPlanConfig } from '../../lib/subscription-config';
import { getLemonSqueezyConfig, getLemonSqueezyProductUrl } from '../../lib/lemon-squeezy-config';

const router = Router();
const prisma = new PrismaClient();

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    name: string;
    role: string;
    organizationId: number;
  };
}

// JWT verification middleware
const verifyToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
      email: string;
      name: string;
      role: string;
      organizationId: number;
    };
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Validation schemas
const activateLicenseKeySchema = z.object({
  licenseKey: z.string().refine(
    (val) => uuidValidate(val),
    { message: 'License key must be a valid UUID format' }
  ),
});

const cancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
});

const downgradeSubscriptionSchema = z.object({
  targetPlan: z.enum(['FREE']),
  reason: z.string().optional(),
});

// GET /subscription/config - Get subscription plan configuration (public endpoint)
router.get('/config', async (req: Request, res: Response) => {
  try {
    // Return plan configurations for frontend
    const plans = Object.values(PLAN_CONFIG).map((config) => ({
      id: config.id,
      displayName: config.displayName,
      monthlyPriceUSD: config.monthlyPriceUSD,
      limits: config.limits,
    }));

    // Also return Lemon Squeezy product URL based on current mode
    const lemonSqueezyProductUrl = getLemonSqueezyProductUrl();

    res.json({
      plans,
      lemonSqueezyProductUrl,
    });
  } catch (error) {
    console.error('Get subscription config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /subscription - Get current organization subscription
router.get('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { organizationId } = req.user;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        licenseKey: true,
        lemonSqueezySubscriptionId: true,
        lemonSqueezyCustomerId: true,
        lemonSqueezyOrderId: true,
        subscriptionExpiresAt: true,
        subscriptionStartedAt: true,
        createdAt: true,
      },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if subscription is expired and should be marked as expired
    let actualStatus = organization.subscriptionStatus || 'ACTIVE';
    if (organization.subscriptionExpiresAt && new Date(organization.subscriptionExpiresAt) < new Date()) {
      actualStatus = 'EXPIRED';
    }

    // For FREE plan with CANCELLED status, we need to check if there's a previous plan
    // We can infer this from licenseKey or lemonSqueezySubscriptionId presence
    let previousPlan: 'FREE' | 'PRO' | 'ENTERPRISE' | null = null;
    if (organization.subscriptionPlan === 'FREE' && organization.subscriptionStatus === 'CANCELLED') {
      // If there's a license key or Lemon Squeezy subscription, it was likely PRO or ENTERPRISE
      if (organization.licenseKey || organization.lemonSqueezySubscriptionId) {
        previousPlan = 'PRO'; // Default assumption, could be enhanced
      }
    }

    res.json({
      subscription: {
        plan: organization.subscriptionPlan,
        status: actualStatus,
        expiresAt: organization.subscriptionExpiresAt,
        startedAt: organization.subscriptionStartedAt,
        hasLicenseKey: !!organization.licenseKey,
        hasLemonSqueezySubscription: !!organization.lemonSqueezySubscriptionId,
        previousPlan: previousPlan || undefined,
      },
      organization: {
        id: organization.id,
        name: organization.name,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /subscription/activate-license - Activate license key manually
router.post('/activate-license', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = activateLicenseKeySchema.parse(req.body);
    const { licenseKey } = validatedData;
    const { organizationId } = req.user;

    // Check if fake licenses are allowed
    const allowFakeLicenses = process.env.ALLOW_FAKE_LICENSES === 'true' || 
                               process.env.ALLOW_FAKE_LICENSES === undefined; // Default to true for backward compatibility

    if (!allowFakeLicenses) {
      return res.status(403).json({ 
        error: 'Manual license activation is disabled',
        code: 'SUBSCRIPTION_MANUAL_ACTIVATION_DISABLED',
      });
    }

    // Validate UUID format (Lemon Squeezy license keys are UUIDs)
    if (!uuidValidate(licenseKey)) {
      return res.status(400).json({ error: 'Invalid license key format. License key must be a valid UUID.' });
    }

    // TODO: Replace this early-alpha behavior with real Lemon Squeezy API validation
    // Currently, any valid UUID can activate PRO subscription when ALLOW_FAKE_LICENSES=true
    // This is acceptable for development but MUST be replaced with proper validation before public launch
    // In production, you should verify the license key with Lemon Squeezy API
    
    // Check if license key is already used by another organization
    const existingOrg = await prisma.organization.findFirst({
      where: { licenseKey },
    });
    
    if (existingOrg && existingOrg.id !== organizationId) {
      return res.status(400).json({ error: 'This license key is already in use by another organization' });
    }

    // Update organization with license key
    // For manual activation, we'll set it to PRO plan (you can adjust logic)
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        licenseKey,
        subscriptionPlan: 'PRO', // Or determine plan from license key
        subscriptionStatus: 'ACTIVE',
        subscriptionStartedAt: new Date(),
        // Set expiration to 1 month from now (30 days)
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month = 30 days
      },
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });

    res.json({
      message: 'License key activated successfully',
      subscription: {
        plan: organization.subscriptionPlan,
        status: organization.subscriptionStatus,
        expiresAt: organization.subscriptionExpiresAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Activate license error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /subscription/webhook/lemon-squeezy - Webhook handler for Lemon Squeezy
router.post('/webhook/lemon-squeezy', async (req: Request, res: Response) => {
  try {
    // Get Lemon Squeezy config based on environment mode
    const lemonConfig = getLemonSqueezyConfig();
    
    // Verify webhook signature (Lemon Squeezy sends a signature header)
    const signature = req.headers['x-signature'] as string;
    const webhookSecret = lemonConfig.webhookSecret;
    
    if (webhookSecret && signature) {
      // TODO: Verify webhook signature
      // const isValid = verifyLemonSqueezySignature(req.body, signature, webhookSecret);
      // if (!isValid) {
      //   return res.status(401).json({ error: 'Invalid signature' });
      // }
    }

    const event = req.body;
    const eventType = event.meta?.event_name || event.type;

    console.log('Lemon Squeezy webhook received:', eventType, event);

    // Handle different event types
    switch (eventType) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_activated':
        await handleSubscriptionActivated(event);
        break;
      
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(event);
        break;
      
      case 'subscription_payment_success':
        await handleSubscriptionPaymentSuccess(event);
        break;
      
      case 'subscription_payment_failed':
      case 'subscription_payment_recovered':
        await handleSubscriptionPaymentFailed(event);
        break;
      
      default:
        console.log('Unhandled webhook event:', eventType);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions for webhook handling
async function handleSubscriptionActivated(event: any) {
  try {
    const subscription = event.data;
    if (!subscription || !subscription.id) {
      console.error('Invalid subscription data in webhook event');
      return;
    }

    const customerEmail = subscription.attributes?.user_email || subscription.customer?.email;
    const subscriptionId = subscription.id?.toString();
    const customerId = subscription.attributes?.customer_id?.toString();
    const orderId = subscription.attributes?.order_id?.toString();
    
    if (!subscriptionId) {
      console.error('Missing subscription ID in webhook event');
      return;
    }
    
    // Determine plan from variant or product
    const variantId = subscription.attributes?.variant_id;
    let plan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'PRO'; // Default to PRO
    
    // Map Lemon Squeezy variant IDs to plans using centralized config
    const lemonConfig = getLemonSqueezyConfig();
    if (variantId) {
      if (variantId.toString() === lemonConfig.variantIds.enterprise) {
        plan = 'ENTERPRISE';
      } else if (variantId.toString() === lemonConfig.variantIds.pro) {
        plan = 'PRO';
      }
    }

    // Find organization by customer email or customer ID
    // First try to find by email (most reliable)
    let organization = customerEmail 
      ? await prisma.organization.findFirst({
          where: { email: customerEmail },
        })
      : null;

    // If not found by email, try by customer ID
    if (!organization && customerId) {
      organization = await prisma.organization.findFirst({
        where: { lemonSqueezyCustomerId: customerId },
      });
    }

    // If still not found, try to find by any user with this email
    if (!organization && customerEmail) {
      const user = await prisma.user.findUnique({
        where: { email: customerEmail },
        include: { organization: true },
      });
      if (user?.organization) {
        organization = user.organization;
      }
    }

    if (organization) {
      // Update existing organization
      await prisma.organization.update({
        where: { id: organization.id },
        data: {
          subscriptionPlan: plan,
          subscriptionStatus: 'ACTIVE',
          lemonSqueezySubscriptionId: subscriptionId,
          ...(customerId && { lemonSqueezyCustomerId: customerId }),
          ...(orderId && { lemonSqueezyOrderId: orderId }),
          subscriptionStartedAt: new Date(),
          subscriptionExpiresAt: subscription.attributes?.ends_at 
            ? new Date(subscription.attributes.ends_at) 
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 1 month if not provided
        },
      });
      
      console.log('Subscription activated automatically for organization:', {
        organizationId: organization.id,
        organizationName: organization.name,
        plan,
        subscriptionId,
      });
    } else {
      // If organization not found, log for manual review
      console.warn('Organization not found for Lemon Squeezy subscription:', {
        email: customerEmail,
        subscriptionId,
        customerId,
        orderId,
      });
    }
  } catch (error) {
    console.error('Error handling subscription activation:', error);
    throw error;
  }
}

async function handleSubscriptionCancelled(event: any) {
  try {
    const subscription = event.data;
    if (!subscription || !subscription.id) {
      console.error('Invalid subscription data in webhook event');
      return;
    }

    const subscriptionId = subscription.id?.toString();
    if (!subscriptionId) {
      console.error('Missing subscription ID in webhook event');
      return;
    }

    const organization = await prisma.organization.findUnique({
      where: { lemonSqueezySubscriptionId: subscriptionId },
    });

    if (organization) {
      await prisma.organization.update({
        where: { id: organization.id },
        data: {
          subscriptionStatus: 'CANCELLED',
          subscriptionExpiresAt: subscription.attributes?.ends_at 
            ? new Date(subscription.attributes.ends_at) 
            : null,
        },
      });
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

async function handleSubscriptionPaymentSuccess(event: any) {
  try {
    const subscription = event.data;
    if (!subscription || !subscription.id) {
      console.error('Invalid subscription data in webhook event');
      return;
    }

    const subscriptionId = subscription.id?.toString();
    if (!subscriptionId) {
      console.error('Missing subscription ID in webhook event');
      return;
    }

    const organization = await prisma.organization.findUnique({
      where: { lemonSqueezySubscriptionId: subscriptionId },
    });

    if (organization) {
      // Update subscription status to active and extend expiration
      await prisma.organization.update({
        where: { id: organization.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: subscription.attributes?.renews_at 
            ? new Date(subscription.attributes.renews_at) 
            : organization.subscriptionExpiresAt,
        },
      });
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

async function handleSubscriptionPaymentFailed(event: any) {
  try {
    const subscription = event.data;
    if (!subscription || !subscription.id) {
      console.error('Invalid subscription data in webhook event');
      return;
    }

    const subscriptionId = subscription.id?.toString();
    if (!subscriptionId) {
      console.error('Missing subscription ID in webhook event');
      return;
    }

    const organization = await prisma.organization.findUnique({
      where: { lemonSqueezySubscriptionId: subscriptionId },
    });

    if (organization) {
      await prisma.organization.update({
        where: { id: organization.id },
        data: {
          subscriptionStatus: 'PAST_DUE',
        },
      });
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

// POST /subscription/cancel - Cancel subscription
router.post('/cancel', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = cancelSubscriptionSchema.parse(req.body);
    const { organizationId } = req.user;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (organization.subscriptionPlan === 'FREE') {
      return res.status(400).json({ error: 'Cannot cancel FREE plan' });
    }

    // Cancel subscription - set status to CANCELLED and keep until expiration
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: 'CANCELLED',
        // Keep expiresAt as is - subscription remains active until expiration
      },
    });

    res.json({
      message: 'Subscription cancelled successfully. Your subscription will remain active until the end of the current billing period.',
      subscription: {
        plan: organization.subscriptionPlan,
        status: 'CANCELLED',
        expiresAt: organization.subscriptionExpiresAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /subscription/reactivate - Reactivate cancelled subscription
router.post('/reactivate', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { organizationId } = req.user;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Allow reactivation for FREE plan if it was downgraded (has license key or Lemon Squeezy subscription)
    const isDowngraded = organization.subscriptionPlan === 'FREE' && 
                         (organization.licenseKey || organization.lemonSqueezySubscriptionId);
    
    if (organization.subscriptionPlan === 'FREE' && !isDowngraded) {
      return res.status(400).json({ error: 'Cannot reactivate FREE plan without previous subscription' });
    }

    if (organization.subscriptionStatus !== 'CANCELLED') {
      return res.status(400).json({ error: 'Subscription is not cancelled' });
    }

    // Check if subscription is still within expiration period
    if (organization.subscriptionExpiresAt && new Date(organization.subscriptionExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'Subscription has expired. Please purchase a new subscription.' });
    }

    // Reactivate subscription - restore to ACTIVE status
    // If it's FREE with CANCELLED status, restore to previous plan (PRO by default if license exists)
    let restoredPlan = organization.subscriptionPlan;
    if (organization.subscriptionPlan === 'FREE' && organization.subscriptionStatus === 'CANCELLED') {
      // Restore to PRO if there's a license key or Lemon Squeezy subscription
      if (organization.licenseKey || organization.lemonSqueezySubscriptionId) {
        restoredPlan = 'PRO';
      }
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionPlan: restoredPlan,
        subscriptionStatus: 'ACTIVE',
        // Restore expiration date if it was set (for downgraded subscriptions)
        subscriptionExpiresAt: organization.subscriptionExpiresAt || (restoredPlan !== 'FREE' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month from now
          : null),
      },
    });

    res.json({
      message: `Subscription reactivated successfully. Restored to ${restoredPlan} plan.`,
      subscription: {
        plan: restoredPlan,
        status: 'ACTIVE',
        expiresAt: organization.subscriptionExpiresAt || (restoredPlan !== 'FREE' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null),
      },
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /subscription/downgrade - Downgrade subscription (e.g., PRO -> FREE)
router.post('/downgrade', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = downgradeSubscriptionSchema.parse(req.body);
    const { targetPlan, reason } = validatedData;
    const { organizationId } = req.user;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (targetPlan === 'FREE' && organization.subscriptionPlan === 'FREE') {
      return res.status(400).json({ error: 'Already on FREE plan' });
    }

    if (targetPlan !== 'FREE') {
      return res.status(400).json({ error: 'Only downgrade to FREE is currently supported' });
    }

    // Downgrade to FREE - immediately change plan and cancel subscription
    // Store the previous plan in a note or keep it for reference
    const previousPlan = organization.subscriptionPlan;
    
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'CANCELLED',
        subscriptionExpiresAt: null,
        // Keep license key and Lemon Squeezy IDs for reference
      },
    });

    // Check for limit violations and return information
    const limits = await import('../../lib/subscription-limits');
    const freeLimits = limits.getSubscriptionLimits('FREE');
    
    // Check services count
    const servicesCount = await prisma.service.count({
      where: { organizationId },
    });
    
    // Check appointments count (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const appointmentsCount = await prisma.appointment.count({
      where: {
        service: {
          organizationId,
        },
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const violations = [];
    if (servicesCount > freeLimits.maxServices) {
      violations.push({
        type: 'services',
        current: servicesCount,
        limit: freeLimits.maxServices,
      });
      console.warn(`Organization ${organizationId} has services limit violation: ${servicesCount}/${freeLimits.maxServices}`);
    }
    if (appointmentsCount > freeLimits.maxAppointmentsPerMonth) {
      violations.push({
        type: 'appointments',
        current: appointmentsCount,
        limit: freeLimits.maxAppointmentsPerMonth,
      });
      console.warn(`Organization ${organizationId} has appointments limit violation: ${appointmentsCount}/${freeLimits.maxAppointmentsPerMonth}`);
    }

    res.json({
      message: 'Subscription downgraded to FREE successfully. Some features may be limited.',
      subscription: {
        plan: 'FREE',
        status: 'CANCELLED',
        expiresAt: null,
      },
      violations: violations.length > 0 ? violations : undefined,
      warning: violations.length > 0 
        ? `You have ${violations.length} limit violation(s). Existing items will remain, but you won't be able to create new ones until you upgrade or remove excess items.`
        : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Downgrade subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

