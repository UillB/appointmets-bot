import { botManager } from '../src/bot/bot-manager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBotToManager() {
  try {
    console.log('🤖 Adding bot to manager...');
    
    // Инициализируем менеджер
    await botManager.initialize();
    
    // Получаем организацию с ботом
    const organization = await prisma.organization.findFirst({
      where: {
        botToken: { not: null }
      }
    });

    if (!organization || !organization.botToken) {
      console.log('❌ No organization with bot found');
      return;
    }

    console.log(`📋 Found organization: ${organization.name} (ID: ${organization.id})`);
    console.log(`🤖 Bot token: ${organization.botToken.slice(0, 10)}...`);
    
    // Добавляем бота в менеджер
    await botManager.addBot(organization.botToken, organization.id);
    
    console.log('✅ Bot added to manager successfully');
    
    // Проверяем статус
    console.log(`🤖 Active bots: ${botManager.getBotCount()}`);
    
  } catch (error) {
    console.error('❌ Error adding bot to manager:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBotToManager();
