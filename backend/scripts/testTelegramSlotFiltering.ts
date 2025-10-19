import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSlotFiltering() {
  try {
    const serviceId = 6; // Test Service One (1 hour)
    const date = '2025-10-20';
    
    console.log(`Testing slot filtering for service ${serviceId} on ${date}`);
    
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    // Получаем слоты для услуги
    const slots = await prisma.slot.findMany({
      where: { serviceId: serviceId, startAt: { gte: dayStart, lte: dayEnd } },
      include: { bookings: true, service: true },
      orderBy: { startAt: "asc" }, take: 40,
    });

    console.log(`Found ${slots.length} slots for service ${serviceId}`);

    // Получаем все активные записи в организации
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        service: {
          organizationId: slots[0]?.service?.organizationId
        },
        status: { not: 'cancelled' }
      },
      include: {
        slot: true,
        service: true
      }
    });

    console.log(`Found ${activeAppointments.length} active appointments in organization`);
    activeAppointments.forEach(apt => {
      console.log(`- ${apt.service.name}: ${apt.slot.startAt} - ${apt.slot.endAt}`);
    });

    const cutoffTs = Date.now() + 30 * 60 * 1000; // 30 minutes from now
    
    // Фильтруем слоты
    const filtered = slots.filter(slot => {
      // Проверяем, что слот не в прошлом
      if (new Date(slot.startAt).getTime() < cutoffTs) {
        console.log(`Slot ${slot.startAt} - ${slot.endAt}: FILTERED (in past)`);
        return false;
      }

      // Проверяем конфликты с другими записями
      const slotStart = new Date(slot.startAt);
      const slotEnd = new Date(slot.endAt);
      
      for (const appointment of activeAppointments) {
        const appointmentStart = new Date(appointment.slot.startAt);
        const appointmentEnd = new Date(appointment.slot.endAt);
        
        // Проверяем пересечение времени
        if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
          console.log(`Slot ${slot.startAt} - ${slot.endAt}: FILTERED (conflicts with ${appointment.service.name} ${appointmentStart} - ${appointmentEnd})`);
          return false; // Слот конфликтует, не показываем его
        }
      }
      
      console.log(`Slot ${slot.startAt} - ${slot.endAt}: AVAILABLE`);
      return true; // Слот доступен
    });

    console.log(`\nResult: ${filtered.length} available slots out of ${slots.length} total`);
    filtered.forEach(slot => {
      console.log(`✅ ${slot.startAt} - ${slot.endAt}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSlotFiltering();
