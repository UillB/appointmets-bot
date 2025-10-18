import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🧩 Создание тестовых услуг...");

  // Получаем первую организацию
  const organization = await prisma.organization.findFirst();
  if (!organization) {
    console.log("❌ Нет организаций. Создайте организацию сначала.");
    return;
  }

  console.log(`📋 Используем организацию: ${organization.name} (ID: ${organization.id})`);

  // Создаем тестовые услуги
  const testServices = [
    {
      name: "Консультация психолога",
      nameRu: "Консультация психолога",
      nameEn: "Psychology Consultation",
      nameHe: "ייעוץ פסיכולוגי",
      description: "Индивидуальная консультация с психологом",
      descriptionRu: "Индивидуальная консультация с психологом",
      descriptionEn: "Individual consultation with a psychologist",
      descriptionHe: "ייעוץ אישי עם פסיכולוג",
      durationMin: 60,
      organizationId: organization.id
    },
    {
      name: "Семейная терапия",
      nameRu: "Семейная терапия",
      nameEn: "Family Therapy",
      nameHe: "טיפול משפחתי",
      description: "Семейная психотерапия",
      descriptionRu: "Семейная психотерапия",
      descriptionEn: "Family psychotherapy",
      descriptionHe: "פסיכותרפיה משפחתית",
      durationMin: 90,
      organizationId: organization.id
    },
    {
      name: "Групповая терапия",
      nameRu: "Групповая терапия",
      nameEn: "Group Therapy",
      nameHe: "טיפול קבוצתי",
      description: "Групповая психотерапия",
      descriptionRu: "Групповая психотерапия",
      descriptionEn: "Group psychotherapy",
      descriptionHe: "פסיכותרפיה קבוצתית",
      durationMin: 120,
      organizationId: organization.id
    }
  ];

  let created = 0;
  for (const serviceData of testServices) {
    try {
      const service = await prisma.service.create({
        data: serviceData
      });
      console.log(`✅ Создана услуга: ${service.name} (ID: ${service.id})`);
      created++;
    } catch (error) {
      console.log(`❌ Ошибка создания услуги ${serviceData.name}:`, error);
    }
  }

  console.log(`🎉 Готово! Создано услуг: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
