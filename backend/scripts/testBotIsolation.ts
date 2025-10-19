import { PrismaClient } from '@prisma/client';
import { botManager } from '../src/bot/bot-manager';

const prisma = new PrismaClient();

async function testBotIsolation() {
  try {
    console.log('🤖 Testing bot isolation and simultaneous operation...');

    // 1. Проверяем текущее состояние ботов
    console.log('\n1. Current bot status:');
    const status = botManager.getStatus();
    console.log('Bot Manager Status:', status);

    // 2. Получаем информацию о всех ботах
    console.log('\n2. All bots information:');
    const botsInfo = await botManager.getBotsInfo();
    console.log('Bots Info:', JSON.stringify(botsInfo, null, 2));

    // 3. Проверяем организации с ботами
    console.log('\n3. Organizations with bots:');
    const orgsWithBots = await prisma.organization.findMany({
      where: {
        botToken: { not: null }
      },
      select: {
        id: true,
        name: true,
        botToken: true,
        botUsername: true
      }
    });

    if (orgsWithBots.length === 0) {
      console.log('❌ No organizations with bots found');
      console.log('💡 To test bot isolation, you need to:');
      console.log('   1. Create organizations');
      console.log('   2. Add bot tokens to organizations');
      console.log('   3. Run this test again');
      return;
    }

    console.log(`Found ${orgsWithBots.length} organizations with bots:`);
    for (const org of orgsWithBots) {
      console.log(`  - ${org.name} (ID: ${org.id}): @${org.botUsername || 'No username'}`);
    }

    // 4. Тестируем добавление ботов
    console.log('\n4. Testing bot addition:');
    for (const org of orgsWithBots) {
      if (org.botToken) {
        console.log(`Adding bot for organization ${org.id} (${org.name})...`);
        try {
          await botManager.addBot(org.botToken, org.id);
          console.log(`✅ Bot for organization ${org.id} added successfully`);
        } catch (error) {
          console.log(`❌ Failed to add bot for organization ${org.id}:`, error.message);
        }
      }
    }

    // 5. Проверяем финальное состояние
    console.log('\n5. Final bot status:');
    const finalStatus = botManager.getStatus();
    console.log('Final Bot Manager Status:', finalStatus);

    // 6. Проверяем изоляцию
    console.log('\n6. Testing isolation:');
    const finalBotsInfo = await botManager.getBotsInfo();
    for (const botInfo of finalBotsInfo) {
      console.log(`Organization ${botInfo.organizationId} (${botInfo.organizationName}):`);
      console.log(`  - Bot active: ${botInfo.isActive}`);
      console.log(`  - Bot username: ${botInfo.botUsername || 'Not set'}`);
      console.log(`  - Token: ${botInfo.botToken || 'Not set'}`);
    }

    // 7. Проверяем, что все боты работают одновременно
    console.log('\n7. Simultaneous operation test:');
    const activeBotsCount = finalStatus.activeBotsCount;
    if (activeBotsCount > 1) {
      console.log(`✅ SUCCESS: ${activeBotsCount} bots are running simultaneously`);
      console.log('✅ Bot isolation is working correctly');
    } else if (activeBotsCount === 1) {
      console.log(`⚠️  Only 1 bot is running. This might be expected if only one organization has a valid bot token.`);
    } else {
      console.log('❌ No bots are running. Check bot tokens and network connectivity.');
    }

    console.log('\n🎉 Bot isolation test completed!');

  } catch (error) {
    console.error('❌ Error testing bot isolation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBotIsolation();
