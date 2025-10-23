import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAppointments() {
  try {
    console.log('🔍 Checking appointments in database...\n');
    
    // Get all appointments
    const appointments = await prisma.appointment.findMany({
      include: {
        service: true,
        slot: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total appointments: ${appointments.length}\n`);

    if (appointments.length > 0) {
      console.log('📋 Recent appointments:');
      appointments.forEach((apt, index) => {
        console.log(`${index + 1}. ID: ${apt.id}`);
        console.log(`   Chat ID: ${apt.chatId}`);
        console.log(`   Service: ${apt.service.name}`);
        console.log(`   Slot: ${apt.slot.startAt.toISOString()} - ${apt.slot.endAt.toISOString()}`);
        console.log(`   Status: ${apt.status}`);
        console.log(`   Created: ${apt.createdAt.toISOString()}`);
        console.log('   ---');
      });
    } else {
      console.log('❌ No appointments found in database');
    }

    // Check organizations
    const organizations = await prisma.organization.findMany();
    console.log(`\n🏢 Organizations: ${organizations.length}`);
    organizations.forEach(org => {
      console.log(`   - ${org.name} (ID: ${org.id})`);
    });

    // Check services
    const services = await prisma.service.findMany();
    console.log(`\n🔧 Services: ${services.length}`);
    services.forEach(service => {
      console.log(`   - ${service.name} (ID: ${service.id})`);
    });

    // Check slots
    const slots = await prisma.slot.findMany();
    console.log(`\n⏰ Slots: ${slots.length}`);

  } catch (error) {
    console.error('❌ Error checking appointments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAppointments();
