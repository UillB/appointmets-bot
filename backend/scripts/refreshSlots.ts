import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🧹 Очистка старых слотов...");
  
  // Удаляем все старые слоты (до вчера)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setUTCHours(23, 59, 59, 999);
  
  const deletedSlots = await prisma.slot.deleteMany({
    where: {
      endAt: { lt: yesterday }
    }
  });
  
  console.log(`✅ Удалено ${deletedSlots.count} старых слотов`);
  
  // Удаляем все записи, связанные с удаленными слотами
  const deletedAppointments = await prisma.appointment.deleteMany({
    where: {
      slot: {
        endAt: { lt: yesterday }
      }
    }
  });
  
  console.log(`✅ Удалено ${deletedAppointments.count} старых записей`);
  
  console.log("📅 Генерация новых слотов...");
  
  // Получаем все услуги
  const services = await prisma.service.findMany();
  if (!services.length) {
    console.log("❌ Нет услуг в базе данных");
    return;
  }
  
  const today = new Date();
  const DAYS_AHEAD = 31; // месяц вперед
  const START_HOUR = 9;   // 9:00 UTC
  const END_HOUR = 18;    // 18:00 UTC
  const STEP_MIN = 30;    // каждые 30 минут
  const CAPACITY = 1;     // по 1 человеку на слот
  
  let totalCreated = 0;
  
  for (const service of services) {
    console.log(`📋 Генерируем слоты для услуги: ${service.name}`);
    
    for (let d = 0; d < DAYS_AHEAD; d++) {
      const day = new Date(today);
      day.setUTCDate(day.getUTCDate() + d);
      
      // Пропускаем выходные (0=воскресенье, 6=суббота)
      const dow = day.getUTCDay();
      if (dow === 0 || dow === 6) continue;
      
      const y = day.getUTCFullYear();
      const m = day.getUTCMonth();
      const dd = day.getUTCDate();
      
      // Проверяем, есть ли уже слоты на этот день
      const dayStart = new Date(Date.UTC(y, m, dd, 0, 0, 0, 0));
      const dayEnd = new Date(Date.UTC(y, m, dd, 23, 59, 59, 999));
      
      const existingSlots = await prisma.slot.findMany({
        where: { 
          serviceId: service.id, 
          startAt: { gte: dayStart, lte: dayEnd } 
        }
      });
      
      if (existingSlots.length > 0) {
        console.log(`  ⏭️  ${dd}.${m + 1}.${y} - слоты уже существуют (${existingSlots.length})`);
        continue;
      }
      
      // Создаем слоты на день
      const slots = [];
      for (let h = START_HOUR; h < END_HOUR; h++) {
        const steps = Math.floor(60 / STEP_MIN);
        for (let idx = 0; idx < steps; idx++) {
          const minute = idx * STEP_MIN;
          
          const startAt = new Date(Date.UTC(y, m, dd, h, minute, 0, 0));
          const endAt = new Date(startAt.getTime() + service.durationMin * 60 * 1000);
          
          // Пропускаем прошлое время
          if (endAt <= today) continue;
          
          slots.push({
            serviceId: service.id,
            startAt,
            endAt,
            capacity: CAPACITY
          });
        }
      }
      
      if (slots.length > 0) {
        await prisma.slot.createMany({ data: slots });
        totalCreated += slots.length;
        console.log(`  ✅ ${dd}.${m + 1}.${y} - создано ${slots.length} слотов`);
      }
    }
  }
  
  console.log(`\n🎉 Готово! Создано ${totalCreated} новых слотов на ${DAYS_AHEAD} дней`);
  
  // Показываем статистику
  const totalSlots = await prisma.slot.count();
  const availableSlots = await prisma.slot.count({
    where: {
      bookings: {
        none: {}
      }
    }
  });
  
  console.log(`\n📊 Статистика:`);
  console.log(`   Всего слотов: ${totalSlots}`);
  console.log(`   Свободных: ${availableSlots}`);
  console.log(`   Занятых: ${totalSlots - availableSlots}`);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

