import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkServices() {
  try {
    console.log('🔍 Checking services in database...');
    
    const services = await prisma.service.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📋 Found ${services.length} services:`);
    services.forEach((service, index) => {
      console.log(`${index + 1}. "${service.name}"`);
      console.log(`   - ID: ${service.id}`);
      console.log(`   - Organization: ${service.organization.name} (ID: ${service.organization.id})`);
      console.log(`   - Created: ${service.createdAt.toISOString()}`);
      console.log('');
    });

    // Проверяем слоты
    const slots = await prisma.slot.findMany({
      include: {
        service: {
          include: {
            organization: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      },
      take: 10
    });

    console.log(`\n⏰ Found ${slots.length} recent slots:`);
    slots.forEach((slot, index) => {
      console.log(`${index + 1}. Slot ID: ${slot.id}`);
      console.log(`   - Service: "${slot.service.name}"`);
      console.log(`   - Organization: ${slot.service.organization.name} (ID: ${slot.service.organization.id})`);
      console.log(`   - Start: ${slot.startAt.toISOString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();
