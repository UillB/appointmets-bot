import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOrganization() {
  console.log('🏢 Создание тестовой организации для AI тестирования...\n');

  try {
    // Создаем тестовую организацию
    const organization = await prisma.organization.create({
      data: {
        name: 'AI Test Organization',
        avatar: 'https://via.placeholder.com/150x150/667eea/ffffff?text=AI'
      }
    });

    console.log(`✅ Организация создана: ${organization.name} (ID: ${organization.id})`);

    // Создаем тестового пользователя
    const user = await prisma.user.create({
      data: {
        email: 'ai-test@example.com',
        password: 'hashed-password', // В реальном приложении должно быть захешировано
        name: 'AI Test User',
        role: 'OWNER',
        organizationId: organization.id
      }
    });

    console.log(`✅ Пользователь создан: ${user.name} (${user.email})`);

    // Создаем тестовую услугу
    const service = await prisma.service.create({
      data: {
        name: 'AI Consultation',
        nameRu: 'AI Консультация',
        nameEn: 'AI Consultation',
        nameHe: 'ייעוץ AI',
        description: 'AI-powered consultation service',
        descriptionRu: 'Консультация с использованием ИИ',
        descriptionEn: 'AI-powered consultation service',
        descriptionHe: 'שירות ייעוץ מבוסס AI',
        durationMin: 30,
        organizationId: organization.id
      }
    });

    console.log(`✅ Услуга создана: ${service.nameRu || service.name}`);

    console.log('\n🎯 Тестовая организация готова для AI тестирования!');
    console.log(`📋 ID организации: ${organization.id}`);
    console.log(`👤 ID пользователя: ${user.id}`);
    console.log(`🔧 ID услуги: ${service.id}`);

  } catch (error) {
    console.error('❌ Ошибка при создании тестовой организации:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем создание
createTestOrganization();
