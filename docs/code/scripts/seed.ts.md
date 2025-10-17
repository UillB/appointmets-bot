# scripts/seed.ts

```ts
import { prisma } from "../src/lib/prisma";

async function main() {
  // Очистим таблицы
  await prisma.appointment.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.service.deleteMany();

  const service = await prisma.service.create({
    data: { name: "Консультация", durationMin: 30 },
  });

  const base = new Date();
  base.setDate(base.getDate() + 1); // слоты на завтра
  base.setUTCHours(9, 0, 0, 0);

  const slots = Array.from({ length: 8 }).map((_, i) => ({
    serviceId: service.id,
    startAt: new Date(base.getTime() + i * 30 * 60 * 1000),
    endAt: new Date(base.getTime() + (i + 1) * 30 * 60 * 1000),
    capacity: 1,
  }));

  await prisma.slot.createMany({ data: slots });
  console.log("✅ Seeded 1 service with 8 slots for tomorrow");
}

main().finally(() => process.exit(0));

```
