import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSlotGeneration() {
  try {
    // Параметры генерации
    const serviceId = 6;
    const startDate = '2025-10-20';
    const endDate = '2025-10-20';
    const startTime = '09:00';
    const endTime = '18:00';
    const slotDuration = 60;
    const includeWeekends = false;
    const lunchBreakStart = '13:00';
    const lunchBreakEnd = '14:00';

    console.log('Testing slot generation with params:', {
      serviceId, startDate, endDate, startTime, endTime, slotDuration, includeWeekends, lunchBreakStart, lunchBreakEnd
    });

    // Проверяем услугу
    const service = await prisma.service.findFirst({
      where: { id: serviceId }
    });

    if (!service) {
      console.error('Service not found!');
      return;
    }

    console.log('Service found:', service);

    // Парсим даты
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    console.log('Date range:', { start: start.toISOString(), end: end.toISOString() });

    // Генерируем слоты для каждого дня
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      console.log('Processing day:', date.toDateString(), 'Day of week:', date.getDay());
      
      // Пропускаем выходные если не включены
      if (!includeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        console.log('Skipping weekend');
        continue;
      }

      // Парсим время начала и окончания
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const dayStart = new Date(date);
      dayStart.setHours(startHour, startMinute, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      console.log('Day start:', dayStart.toISOString());
      console.log('Day end:', dayEnd.toISOString());

      // Генерируем слоты
      let slotCount = 0;
      for (let currentTime = new Date(dayStart); currentTime < dayEnd; currentTime.setMinutes(currentTime.getMinutes() + slotDuration)) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        console.log(`Slot ${slotCount + 1}: ${currentTime.toISOString()} - ${slotEnd.toISOString()}`);
        
        if (slotEnd > dayEnd) {
          console.log('Slot exceeds day end, breaking');
          break;
        }

        slotCount++;
      }

      console.log(`Total slots for this day: ${slotCount}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSlotGeneration();

