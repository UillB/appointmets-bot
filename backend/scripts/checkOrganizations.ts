import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrganizations() {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        botToken: { not: null }
      },
      select: {
        id: true,
        name: true,
        botToken: true,
        botUsername: true
      }
    });

    console.log('Organizations with bots:');
    organizations.forEach(org => {
      console.log(`- ID: ${org.id}, Name: ${org.name}, Username: ${org.botUsername}, Token: ${org.botToken?.slice(0, 10)}...`);
    });

    if (organizations.length === 0) {
      console.log('No organizations with bots found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrganizations();
