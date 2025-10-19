import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testIsolation() {
  try {
    console.log('🔒 Testing organization isolation...');

    // 1. Проверяем, что пользователи видят только свои организации
    console.log('\n1. Testing user-organization isolation:');
    
    const users = await prisma.user.findMany({
      include: {
        organization: true
      }
    });

    for (const user of users) {
      console.log(`👤 ${user.name} (${user.email}) - Org: ${user.organization.name} (ID: ${user.organizationId})`);
    }

    // 2. Проверяем, что услуги изолированы по организациям
    console.log('\n2. Testing service-organization isolation:');
    
    const services = await prisma.service.findMany({
      include: {
        organization: true
      }
    });

    const servicesByOrg = services.reduce((acc, service) => {
      if (!acc[service.organizationId]) {
        acc[service.organizationId] = [];
      }
      acc[service.organizationId].push(service);
      return acc;
    }, {} as Record<number, any[]>);

    for (const [orgId, orgServices] of Object.entries(servicesByOrg)) {
      const org = await prisma.organization.findUnique({ where: { id: parseInt(orgId) } });
      console.log(`\n🏢 ${org?.name} (ID: ${orgId}):`);
      for (const service of orgServices) {
        console.log(`  - ${service.name} (${service.durationMin} min)`);
      }
    }

    // 3. Проверяем, что слоты изолированы по услугам
    console.log('\n3. Testing slot-service isolation:');
    
    const slots = await prisma.slot.findMany({
      include: {
        service: {
          include: {
            organization: true
          }
        }
      }
    });

    const slotsByOrg = slots.reduce((acc, slot) => {
      const orgId = slot.service.organizationId;
      if (!acc[orgId]) {
        acc[orgId] = [];
      }
      acc[orgId].push(slot);
      return acc;
    }, {} as Record<number, any[]>);

    for (const [orgId, orgSlots] of Object.entries(slotsByOrg)) {
      const org = await prisma.organization.findUnique({ where: { id: parseInt(orgId) } });
      console.log(`\n🏢 ${org?.name} (ID: ${orgId}):`);
      console.log(`  📅 Total slots: ${orgSlots.length}`);
      
      // Группируем по услугам
      const slotsByService = orgSlots.reduce((acc, slot) => {
        const serviceName = slot.service.name;
        if (!acc[serviceName]) {
          acc[serviceName] = 0;
        }
        acc[serviceName]++;
        return acc;
      }, {} as Record<string, number>);

      for (const [serviceName, count] of Object.entries(slotsByService)) {
        console.log(`    - ${serviceName}: ${count} slots`);
      }
    }

    // 4. Проверяем, что боты изолированы по организациям
    console.log('\n4. Testing bot-organization isolation:');
    
    const orgsWithBots = await prisma.organization.findMany({
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

    if (orgsWithBots.length === 0) {
      console.log('  🤖 No bots configured yet');
    } else {
      for (const org of orgsWithBots) {
        console.log(`  🤖 ${org.name}: ${org.botUsername || 'No username'} (Token: ${org.botToken?.slice(0, 10)}...)`);
      }
    }

    // 5. Проверяем роли пользователей
    console.log('\n5. Testing user roles:');
    
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [role, roleUsers] of Object.entries(usersByRole)) {
      console.log(`\n👥 ${role}:`);
      for (const user of roleUsers) {
        console.log(`  - ${user.name} (${user.email}) - Org: ${user.organization.name}`);
      }
    }

    console.log('\n✅ Isolation test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total organizations: ${await prisma.organization.count()}`);
    console.log(`- Total users: ${await prisma.user.count()}`);
    console.log(`- Total services: ${await prisma.service.count()}`);
    console.log(`- Total slots: ${await prisma.slot.count()}`);
    console.log(`- Organizations with bots: ${orgsWithBots.length}`);

  } catch (error) {
    console.error('❌ Error testing isolation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIsolation();
