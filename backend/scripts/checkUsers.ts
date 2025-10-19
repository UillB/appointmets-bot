import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👥 Checking users in database...');
    
    const users = await prisma.user.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`\n📋 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Organization: ${user.organization.name} (ID: ${user.organization.id})`);
      console.log('');
    });

    // Проверяем организации
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            services: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`\n🏢 Organizations:`);
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name} (ID: ${org.id})`);
      console.log(`   - Users: ${org._count.users}`);
      console.log(`   - Services: ${org._count.services}`);
      console.log(`   - Bot Token: ${org.botToken ? 'Yes' : 'No'}`);
      console.log(`   - Bot Username: ${org.botUsername || 'None'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
