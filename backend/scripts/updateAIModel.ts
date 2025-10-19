import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAIModel() {
  try {
    console.log('🔄 ОБНОВЛЕНИЕ МОДЕЛИ AI НА GPT-3.5-TURBO');
    console.log('=' .repeat(50));

    // Находим организацию с ID 2 (Test Beauty Clinic)
    const organization = await prisma.organization.findUnique({
      where: { id: 2 }
    });

    if (!organization) {
      console.log('❌ Организация с ID 2 не найдена');
      return;
    }

    console.log('✅ Найдена организация:', organization.name);

    // Обновляем AI конфигурацию
    const updatedConfig = await prisma.organizationAIConfig.upsert({
      where: { organizationId: 2 },
      update: {
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
        enabled: true
      },
      create: {
        organizationId: 2,
        provider: 'openai',
        apiKey: 'sk-test-key-for-org-2',
        model: 'gpt-3.5-turbo',
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

    console.log('✅ AI конфигурация обновлена:');
    console.log('   - Модель: gpt-3.5-turbo');
    console.log('   - Max Tokens: 1000');
    console.log('   - Temperature: 0.7');
    console.log('   - Enabled: true');

    console.log('\n🎉 МОДЕЛЬ ОБНОВЛЕНА!');
    console.log('Теперь AI ассистент использует GPT-3.5-turbo');

  } catch (error) {
    console.error('❌ Ошибка при обновлении модели:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем обновление
updateAIModel();
