import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkUserToOrgByTelegram() {
  try {
    console.log('🔗 Поиск и связывание пользователя some@test.com с организацией по Telegram ID...\n');

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: 'some@test.com' },
      include: {
        userOrganizations: {
          include: { organization: true }
        }
      }
    });

    if (!user) {
      console.log('❌ Пользователь some@test.com не найден');
      return;
    }

    console.log(`✅ Пользователь найден: ${user.name} (${user.email})`);
    console.log(`   Telegram ID: ${user.telegramId || 'не установлен'}`);

    if (!user.telegramId) {
      console.log('⚠️  У пользователя нет Telegram ID, невозможно определить организацию по боту');
      return;
    }

    // Находим все организации с ботами
    const orgsWithBots = await prisma.organization.findMany({
      where: {
        botToken: { not: null }
      },
      include: {
        userOrganizations: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                telegramId: true
              }
            }
          }
        }
      }
    });

    console.log(`\n📋 Найдено организаций с ботами: ${orgsWithBots.length}`);

    // Ищем организацию, где есть пользователь с таким же telegramId
    let targetOrg = null;
    for (const org of orgsWithBots) {
      const userWithSameTelegram = org.userOrganizations.find(
        uo => uo.user.telegramId === user.telegramId
      );
      
      if (userWithSameTelegram) {
        targetOrg = org;
        console.log(`\n✅ Найдена организация с пользователем с таким же Telegram ID:`);
        console.log(`   Организация: ${org.name} (ID: ${org.id})`);
        console.log(`   Бот: ${org.botUsername || 'не указан'}`);
        console.log(`   Существующий пользователь: ${userWithSameTelegram.user.email} (${userWithSameTelegram.user.name})`);
        break;
      }
    }

    // Если не нашли по telegramId, проверяем, есть ли у пользователя уже связь с какой-то из этих организаций
    if (!targetOrg) {
      for (const org of orgsWithBots) {
        const existingLink = user.userOrganizations.find(
          uo => uo.organizationId === org.id
        );
        if (existingLink) {
          targetOrg = org;
          console.log(`\n✅ Пользователь уже связан с организацией:`);
          console.log(`   Организация: ${org.name} (ID: ${org.id})`);
          console.log(`   Бот: ${org.botUsername || 'не указан'}`);
          break;
        }
      }
    }

    // Если не нашли, предлагаем связать с первой организацией с ботом
    if (!targetOrg && orgsWithBots.length > 0) {
      // Спрашиваем пользователя или берем первую
      targetOrg = orgsWithBots[0];
      console.log(`\n⚠️  Не удалось определить организацию автоматически.`);
      console.log(`   Предлагаем связать с первой организацией с ботом:`);
      console.log(`   Организация: ${targetOrg.name} (ID: ${targetOrg.id})`);
      console.log(`   Бот: ${targetOrg.botUsername || 'не указан'}`);
    }

    if (targetOrg) {
      // Проверяем, есть ли уже связь
      const existingLink = await prisma.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: targetOrg.id
          }
        }
      });

      if (existingLink) {
        console.log(`\n✅ Связь уже существует: пользователь → организация (Role: ${existingLink.role})`);
      } else {
        // Создаем связь
        const userOrg = await prisma.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: targetOrg.id,
            role: 'OWNER'
          }
        });
        console.log(`\n✅ Связь создана: пользователь ${user.email} → организация ${targetOrg.name} (Role: ${userOrg.role})`);
      }

      // Показываем статистику организации
      const servicesCount = await prisma.service.count({
        where: { organizationId: targetOrg.id }
      });
      const appointmentsCount = await prisma.appointment.count({
        where: {
          service: {
            organizationId: targetOrg.id
          }
        }
      });

      console.log(`\n📊 Статистика организации ${targetOrg.name}:`);
      console.log(`   Услуги: ${servicesCount}`);
      console.log(`   Записи: ${appointmentsCount}`);
      console.log(`   Бот: ${targetOrg.botUsername || 'не указан'}`);
    } else {
      console.log(`\n❌ Не найдено организаций с ботами для связывания`);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

linkUserToOrgByTelegram();

