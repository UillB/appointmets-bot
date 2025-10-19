import { PrismaClient } from '@prisma/client';
import { AIService } from '../src/lib/ai/ai-service';

const prisma = new PrismaClient();
const aiService = new AIService();

async function testSpecificQuestions() {
  try {
    console.log('🧪 ТЕСТИРОВАНИЕ КОНКРЕТНЫХ ВОПРОСОВ ИЗ СКРИНШОТА');
    console.log('=' .repeat(60));

    const testQuestions = [
      'привет',
      'Как называется организация',
      'На когда есть слоты'
    ];

    for (const question of testQuestions) {
      console.log(`\n🧪 Тест: "${question}"`);
      
      try {
        const conversation = {
          messages: [
            {
              role: 'user' as const,
              content: question
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

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тест
testSpecificQuestions();
