import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableTestMode() {
  try {
    console.log('🧪 ВКЛЮЧЕНИЕ ТЕСТОВОГО РЕЖИМА AI АССИСТЕНТА');
    console.log('=' .repeat(50));

    // Обновляем конфигурацию для тестового режима
    const updatedConfig = await prisma.organizationAIConfig.upsert({
      where: { organizationId: 2 },
      update: {
        provider: 'custom',
        apiKey: 'test-mode-key',
        model: 'test-model',
        maxTokens: 1000,
        temperature: 0.7,
        systemPrompt: 'Ты AI ассистент салона красоты. Помогай клиентам с записью и отвечай на вопросы.',
        enabled: true,
        customPrompts: JSON.stringify({
          greeting: 'Привет! Я AI ассистент салона красоты. Чем могу помочь?',
          bookingHelp: 'Помогу вам выбрать услугу и время записи.',
          serviceInfo: 'Расскажу подробно о наших услугах и ценах.'
        })
      },
      create: {
        organizationId: 2,
        provider: 'custom',
        apiKey: 'test-mode-key',
        model: 'test-model',
        maxTokens: 1000,
        temperature: 0.7,
        systemPrompt: 'Ты AI ассистент салона красоты. Помогай клиентам с записью и отвечай на вопросы.',
        enabled: true,
        customPrompts: JSON.stringify({
          greeting: 'Привет! Я AI ассистент салона красоты. Чем могу помочь?',
          bookingHelp: 'Помогу вам выбрать услугу и время записи.',
          serviceInfo: 'Расскажу подробно о наших услугах и ценах.'
        })
      }
    });

    console.log('✅ Тестовый режим включен:');
    console.log('   - Provider: custom (тестовый)');
    console.log('   - Model: test-model');
    console.log('   - AI будет отвечать предустановленными ответами');
    console.log('   - Enabled: true');

    console.log('\n🎉 ТЕСТОВЫЙ РЕЖИМ АКТИВИРОВАН!');
    console.log('Теперь AI ассистент будет работать в тестовом режиме');
    console.log('без обращения к реальному OpenAI API');

  } catch (error) {
    console.error('❌ Ошибка при включении тестового режима:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем включение тестового режима
enableTestMode();
