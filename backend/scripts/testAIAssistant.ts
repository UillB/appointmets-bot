import { PrismaClient } from '@prisma/client';
import { AIService } from '../src/lib/ai/ai-service';

const prisma = new PrismaClient();
const aiService = new AIService();

async function testAIAssistant() {
  try {
    console.log('🧪 ТЕСТИРОВАНИЕ AI АССИСТЕНТА В ТЕСТОВОМ РЕЖИМЕ');
    console.log('=' .repeat(60));

    // 1. Проверяем конфигурацию
    console.log('\n📋 ШАГ 1: Проверка конфигурации');
    console.log('-'.repeat(50));
    
    const config = await aiService.getOrganizationAIConfig(2);
    if (!config) {
      console.log('❌ AI конфигурация не найдена');
      return;
    }

    console.log('✅ AI конфигурация найдена:');
    console.log(`   - Provider: ${config.provider}`);
    console.log(`   - Model: ${config.model}`);
    console.log(`   - Enabled: ${config.enabled}`);

    // 2. Тестируем AI с разными сообщениями
    console.log('\n📋 ШАГ 2: Тестирование AI');
    console.log('-'.repeat(50));
    
    const testMessages = [
      'Привет! Как тебя зовут?',
      'Какие услуги у вас есть?',
      'Сколько стоит маникюр?',
      'Во сколько вы работаете?',
      'Можно ли с вами связаться?'
    ];

    for (const message of testMessages) {
      console.log(`\n🧪 Тест: "${message}"`);
      
      try {
        const conversation = {
          messages: [
            {
              role: 'user' as const,
              content: message
            }
          ],
          context: {
            organizationId: 2,
            organization: {
              name: 'Test Beauty Clinic',
              description: 'Современная клиника красоты',
              phone: '+7 (495) 123-45-67',
              email: 'info@beauty-clinic.ru'
            }
          }
        };

        const response = await aiService.sendMessage(2, conversation, 'general');
        
        console.log(`   ✅ Ответ: "${response.content}"`);
        console.log(`   📊 Токены: ${response.usage?.totalTokens || 0}`);
        
      } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`);
      }
    }

    // 3. Проверяем статистику
    console.log('\n📋 ШАГ 3: Проверка статистики');
    console.log('-'.repeat(50));
    
    const stats = await aiService.getAIUsageStats(2);
    console.log('✅ Статистика использования:');
    console.log(`   - Всего запросов: ${stats.totalRequests}`);
    console.log(`   - Всего токенов: ${stats.totalTokens}`);
    console.log(`   - Среднее токенов на запрос: ${stats.averageTokensPerRequest}`);

    console.log('\n🎉 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!');
    console.log('AI ассистент работает в тестовом режиме');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тест
testAIAssistant();
