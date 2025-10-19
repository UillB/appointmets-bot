import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllBots() {
  try {
    console.log('🤖 Checking all bots in database...');
    
    const organizations = await prisma.organization.findMany({
      where: {
        botToken: { not: null }
      },
      select: {
        id: true,
        name: true,
        botToken: true,
        botUsername: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`\n📋 Found ${organizations.length} organizations with bots:`);
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name} (ID: ${org.id})`);
      console.log(`   - Bot Username: @${org.botUsername}`);
      console.log(`   - Bot Token: ${org.botToken?.slice(0, 10)}...`);
      console.log('');
    });

    // Проверяем услуги для каждой организации
    console.log('\n🔍 Services by organization:');
    for (const org of organizations) {
      const services = await prisma.service.findMany({
        where: { organizationId: org.id },
        select: {
          id: true,
          name: true,
          organizationId: true
        }
      });

      console.log(`\n📋 ${org.name} (ID: ${org.id}):`);
      if (services.length === 0) {
        console.log('   No services found');
      } else {
        services.forEach(service => {
          console.log(`   - "${service.name}" (ID: ${service.id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllBots();
