// backend/prisma/seed.ts
import { prisma } from "../src/lib/prisma";

export default async function seed() {
  // Создаем организацию по умолчанию
  const organization = await prisma.organization.upsert({
    where: { id: 1 },
    create: { name: "Default Organization" },
    update: {},
  });

  const service = await prisma.service.upsert({
    where: { id: 1 },
    create: { 
      name: "Консультация", 
      nameRu: "Консультация",
      nameEn: "Consultation", 
      nameHe: "ייעוץ",
      description: "Персональная консультация",
      descriptionRu: "Персональная консультация",
      descriptionEn: "Personal consultation",
      descriptionHe: "ייעוץ אישי",
      durationMin: 30,
      organizationId: organization.id
    },
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
