import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Check and downgrade expired subscriptions to FREE
 * This should be run as a cron job daily
 */
export async function checkAndDowngradeExpiredSubscriptions() {
  try {
    const now = new Date();
    
    // Find all organizations with expired subscriptions that are not already FREE
    const expiredSubscriptions = await prisma.organization.findMany({
      where: {
        subscriptionPlan: {
          not: 'FREE',
        },
        subscriptionExpiresAt: {
          lte: now,
        },
        subscriptionStatus: {
          in: ['ACTIVE', 'CANCELLED', 'EXPIRED'],
        },
      },
    });

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions to downgrade`);

    // Downgrade each expired subscription to FREE
    for (const org of expiredSubscriptions) {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          subscriptionPlan: 'FREE',
          subscriptionStatus: 'EXPIRED',
          subscriptionExpiresAt: null,
        },
      });

      console.log(`Downgraded organization ${org.id} (${org.name}) from ${org.subscriptionPlan} to FREE`);
    }

    return {
      success: true,
      downgraded: expiredSubscriptions.length,
    };
  } catch (error) {
    console.error('Error checking and downgrading expired subscriptions:', error);
    throw error;
  }
}

