import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🧩 Создание тестовых записей...");

  // Получаем услуги
  const services = await prisma.service.findMany();
  if (!services.length) {
    console.log("❌ Нет услуг. Создайте услуги сначала.");
    return;
  }

  // Получаем доступные слоты
  const slots = await prisma.slot.findMany({
    where: {
      bookings: {
        none: {} // только свободные слоты
      }
    },
    include: {
      service: true
    },
    take: 10 // берем первые 10 свободных слотов
  });

  if (!slots.length) {
    console.log("❌ Нет доступных слотов. Создайте слоты сначала.");
    return;
  }

  console.log(`📋 Найдено ${slots.length} доступных слотов`);

  // Создаем тестовые записи
  const testAppointments = [
    {
      chatId: "123456789",
      serviceId: slots[0].serviceId,
      slotId: slots[0].id,
      status: "confirmed"
    },
    {
      chatId: "987654321",
      serviceId: slots[1]?.serviceId || slots[0].serviceId,
      slotId: slots[1]?.id || slots[0].id,
      status: "pending"
    },
    {
      chatId: "555666777",
      serviceId: slots[2]?.serviceId || slots[0].serviceId,
      slotId: slots[2]?.id || slots[0].id,
      status: "confirmed"
    }
  ];

  let created = 0;
  for (const appointmentData of testAppointments) {
    try {
      // Проверяем, что слот еще свободен
      const slot = await prisma.slot.findUnique({
        where: { id: appointmentData.slotId },
        include: { bookings: true }
      });

      if (!slot) {
        console.log(`❌ Слот ${appointmentData.slotId} не найден`);
        continue;
      }

      if (slot.bookings.length > 0) {
        console.log(`❌ Слот ${appointmentData.slotId} уже занят`);
        continue;
      }

      const appointment = await prisma.appointment.create({
        data: appointmentData,
        include: {
          service: true,
          slot: true
        }
      });

      console.log(`✅ Создана запись: ID ${appointment.id}, Chat ${appointment.chatId}, ${appointment.service.name} на ${appointment.slot.startAt}`);
      created++;
    } catch (error) {
      console.log(`❌ Ошибка создания записи:`, error);
    }
  }

  console.log(`🎉 Готово! Создано записей: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
