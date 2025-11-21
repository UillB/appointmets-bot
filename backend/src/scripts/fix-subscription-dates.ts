/**
 * Script to fix subscription expiration dates that were set to 1 year instead of 1 month
 * Run this once to fix existing subscriptions in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSubscriptionDates() {
  try {
    console.log('Starting subscription date fix...');

    // Find all organizations with subscriptions that expire more than 2 months from now
    // (indicating they were set to 1 year instead of 1 month)
    const now = new Date();
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days

    const organizations = await prisma.organization.findMany({
      where: {
        subscriptionPlan: {
          not: 'FREE',
        },
        subscriptionExpiresAt: {
          gt: twoMonthsFromNow, // More than 2 months away
        },
      },
    });

    console.log(`Found ${organizations.length} organizations with incorrect expiration dates`);

    for (const org of organizations) {
      if (!org.subscriptionStartedAt) {
        console.log(`Skipping org ${org.id} - no start date`);
        continue;
      }

      // Calculate correct expiration (1 month from start date)
      const startDate = new Date(org.subscriptionStartedAt);
      const correctExpiration = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await prisma.organization.update({
        where: { id: org.id },
        data: {
          subscriptionExpiresAt: correctExpiration,
        },
      });

      console.log(`Fixed org ${org.id} (${org.name}): ${org.subscriptionExpiresAt} -> ${correctExpiration.toISOString()}`);
    }

    console.log('Subscription date fix completed!');
  } catch (error) {
    console.error('Error fixing subscription dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fixSubscriptionDates()
    .then(() => {
      console.log('Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { fixSubscriptionDates };

