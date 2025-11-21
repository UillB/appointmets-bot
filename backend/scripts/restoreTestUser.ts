import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function restoreTestUser() {
  try {
    console.log('🔄 Восстановление тестового пользователя some@test.com...\n');

    // Проверяем, существует ли уже пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: 'some@test.com' }
    });

    if (existingUser) {
      console.log('⚠️  Пользователь уже существует, проверяем связи...');
      
      // Проверяем, есть ли у пользователя организации
      const userOrgs = await prisma.userOrganization.findMany({
        where: { userId: existingUser.id },
        include: { organization: true }
      });

      if (userOrgs.length > 0) {
        console.log(`✅ Пользователь уже связан с ${userOrgs.length} организациями:`);
        userOrgs.forEach(uo => {
          console.log(`   - ${uo.organization.name} (ID: ${uo.organization.id}, Role: ${uo.role})`);
        });
        return;
      }
    }

    // Создаем или обновляем пользователя
    const hashedPassword = await bcrypt.hash('Test1234', 12);
    
    let user;
    if (existingUser) {
      // Обновляем пароль, если пользователь существует
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      console.log(`✅ Пользователь обновлен: ${user.name} (${user.email})`);
    } else {
      // Создаем нового пользователя
      user = await prisma.user.create({
        data: {
          email: 'some@test.com',
          password: hashedPassword,
          name: 'Test User',
          role: 'OWNER'
        }
      });
      console.log(`✅ Пользователь создан: ${user.name} (${user.email})`);
    }

    // Создаем организацию (можно указать бот токен, если он был)
    // Замените на реальный бот токен, если он был
    const botToken = process.env.TEST_BOT_TOKEN || null;
    const botUsername = process.env.TEST_BOT_USERNAME || null;

    // Проверяем, есть ли уже организация для этого пользователя
    let organization;
    const existingUserOrgs = await prisma.userOrganization.findMany({
      where: { userId: user.id },
      include: { organization: true }
    });

    if (existingUserOrgs.length > 0) {
      organization = existingUserOrgs[0].organization;
      console.log(`✅ Используем существующую организацию: ${organization.name} (ID: ${organization.id})`);
      
      // Обновляем бот токен, если он указан
      if (botToken) {
        organization = await prisma.organization.update({
          where: { id: organization.id },
          data: {
            botToken: botToken,
            botUsername: botUsername
          }
        });
        console.log(`✅ Бот токен обновлен: ${botToken.substring(0, 10)}...`);
      }
    } else {
      organization = await prisma.organization.create({
        data: {
          name: 'Test Organization',
          description: 'Test organization for some@test.com',
          botToken: botToken,
          botUsername: botUsername,
          subscriptionPlan: 'FREE',
          subscriptionStatus: 'ACTIVE'
        }
      });
      console.log(`✅ Организация создана: ${organization.name} (ID: ${organization.id})`);
      if (botToken) {
        console.log(`   Бот токен установлен: ${botToken.substring(0, 10)}...`);
      }
    }

    console.log(`✅ Организация создана: ${organization.name} (ID: ${organization.id})`);
    if (botToken) {
      console.log(`   Бот токен установлен: ${botToken.substring(0, 10)}...`);
    }

    // Связываем пользователя с организацией через UserOrganization (если связи еще нет)
    let userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id
        }
      }
    });

    if (!userOrg) {
      userOrg = await prisma.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'OWNER'
        }
      });
      console.log(`✅ Связь создана: пользователь ${user.email} → организация ${organization.name} (Role: ${userOrg.role})`);
    } else {
      console.log(`✅ Связь уже существует: пользователь ${user.email} → организация ${organization.name} (Role: ${userOrg.role})`);
    }

    // Если был линкед админ (telegramId), можно добавить его
    if (process.env.TEST_TELEGRAM_ID) {
      await prisma.user.update({
        where: { id: user.id },
        data: { telegramId: process.env.TEST_TELEGRAM_ID }
      });
      console.log(`✅ Telegram ID установлен: ${process.env.TEST_TELEGRAM_ID}`);
    }

    console.log('\n🎉 Тестовый пользователь восстановлен!');
    console.log('\n📋 Данные для входа:');
    console.log(`   Email: some@test.com`);
    console.log(`   Password: Test1234`);
    console.log(`   Organization ID: ${organization.id}`);
    console.log(`   Organization Name: ${organization.name}`);

  } catch (error) {
    console.error('❌ Ошибка при восстановлении пользователя:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restoreTestUser();

