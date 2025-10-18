import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🔍 Проверяем слоты в базе данных...\n");
  
  const slots = await prisma.slot.findMany({
    include: { bookings: true },
    orderBy: { startAt: "asc" },
    take: 10
  });
  
  console.log(`Найдено слотов: ${slots.length}`);
  
  for (const slot of slots) {
    const startDate = new Date(slot.startAt);
    const isAvailable = slot.bookings.length < slot.capacity;
    console.log(`ID: ${slot.id}, Дата: ${startDate.toISOString()}, Доступен: ${isAvailable ? '✅' : '❌'}, Записей: ${slot.bookings.length}/${slot.capacity}`);
  }
  
  // Проверим слоты на октябрь 2025
  const octoberStart = new Date('2025-10-01T00:00:00.000Z');
  const octoberEnd = new Date('2025-10-31T23:59:59.999Z');
  
  const octoberSlots = await prisma.slot.findMany({
    where: {
      startAt: { gte: octoberStart, lte: octoberEnd }
    },
    include: { bookings: true }
  });
  
  console.log(`\n📅 Слоты в октябре 2025: ${octoberSlots.length}`);
  
  // Группируем по дням
  const slotsByDay = octoberSlots.reduce((acc, slot) => {
    const day = new Date(slot.startAt).getDate();
    if (!acc[day]) acc[day] = { total: 0, available: 0 };
    acc[day].total++;
    if (slot.bookings.length < slot.capacity) {
      acc[day].available++;
    }
    return acc;
  }, {} as Record<number, { total: number; available: number }>);
  
  console.log("\nДоступность по дням:");
  for (const [day, stats] of Object.entries(slotsByDay)) {
    console.log(`  ${day} октября: ${stats.available}/${stats.total} свободно`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

