// backend/prisma/seed.ts
import { prisma } from "../src/lib/prisma";

export default async function seed() {
  const service = await prisma.service.upsert({
    where: { id: 1 },
    create: { name: "Консультация", durationMin: 30 },
    update: {},
  });

  const base = new Date();
  base.setDate(base.getDate() + 1); // <-- добавляем сутки
  base.setUTCHours(9, 0, 0, 0);


  const slots = Array.from({ length: 8 }).map((_, i) => ({
    serviceId: service.id,
    startAt: new Date(base.getTime() + i * 30 * 60 * 1000),
    endAt: new Date(base.getTime() + (i + 1) * 30 * 60 * 1000),
    capacity: 1,
  }));

  await prisma.slot.createMany({ data: slots });
  console.log("Seeded ✔");
}
