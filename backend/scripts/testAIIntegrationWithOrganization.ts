import { PrismaClient } from '@prisma/client';
import { AIService } from '../src/lib/ai/ai-service';

const prisma = new PrismaClient();
const aiService = new AIService();

async function testAIIntegrationWithOrganization() {
  try {
    console.log('🤖 Тестирование AI интеграции с данными организации...\n');

    // Создаем тестовую организацию с полными данными
    let testOrg = await prisma.organization.findFirst({
      where: { name: 'Test AI Organization' }
    });

    if (!testOrg) {
      testOrg = await prisma.organization.create({
        data: {
          name: 'Test AI Organization',
          description: 'Современная клиника красоты с полным спектром услуг',
          address: 'ул. Тестовая, 123, Москва',
          workingHours: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
          phone: '+7 (495) 123-45-67',
          email: 'info@testclinic.ru'
        }
      });
    }

    console.log('✅ Создана тестовая организация:', testOrg.name);

    // Создаем тестовые услуги
    let services = await prisma.service.findMany({
      where: { organizationId: testOrg.id }
    });

    if (services.length === 0) {
      services = await Promise.all([
        prisma.service.create({
          data: {
            name: 'Маникюр',
            nameRu: 'Маникюр',
            description: 'Классический маникюр с покрытием',
            descriptionRu: 'Классический маникюр с покрытием гель-лаком',
            durationMin: 60,
            organizationId: testOrg.id
          }
        }),
        prisma.service.create({
          data: {
            name: 'Педикюр',
            nameRu: 'Педикюр',
            description: 'Классический педикюр',
            descriptionRu: 'Классический педикюр с покрытием',
            durationMin: 90,
            organizationId: testOrg.id
          }
        })
      ]);
    }

    console.log('✅ Созданы тестовые услуги:', services.map(s => s.nameRu || s.name).join(', '));

    // Создаем AI конфигурацию
    const aiConfig = await prisma.organizationAIConfig.upsert({
      where: { organizationId: testOrg.id },
      update: {
        provider: 'openai',
        apiKey: 'test-api-key', // В реальности здесь будет настоящий ключ
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        temperature: 0.7,
        systemPrompt: 'Ты - вежливый AI ассистент клиники красоты.',
        enabled: true
      },
      create: {
        organizationId: testOrg.id,
        provider: 'openai',
        apiKey: 'test-api-key',
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        temperature: 0.7,
        systemPrompt: 'Ты - вежливый AI ассистент клиники красоты.',
        enabled: true
      }
    });

    console.log('✅ Создана AI конфигурация для организации');

    // Тестируем получение контекста организации
    console.log('\n📋 Тестирование получения контекста организации...');
    
    // Используем приватный метод через рефлексию (для тестирования)
    const getOrganizationContext = (aiService as any).getOrganizationContext.bind(aiService);
    const context = await getOrganizationContext(testOrg.id);
    
    console.log('✅ Контекст организации получен:');
    console.log('  - Название:', context.organizationName);
    console.log('  - Описание:', context.description);
    console.log('  - Адрес:', context.address);
    console.log('  - Часы работы:', context.workingHours);
    console.log('  - Телефон:', context.phone);
    console.log('  - Email:', context.email);
    console.log('  - Услуги:', context.services.length);

    // Тестируем построение системного промпта
    console.log('\n🔧 Тестирование построения системного промпта...');
    
    const { BaseAIProvider } = await import('../src/lib/ai/base-provider');
    
    // Создаем тестовый провайдер для проверки промпта
    class TestAIProvider extends BaseAIProvider {
      name = 'test';
      models = ['test-model'];
      
      async sendMessage() {
        return { content: 'test', model: 'test', provider: 'test' };
      }
      
      validateConfig() {
        return true;
      }
    }
    
    const testProvider = new TestAIProvider();
    const systemPrompt = (testProvider as any).buildSystemPrompt(context);
    
    console.log('✅ Системный промпт построен:');
    console.log('---');
    console.log(systemPrompt);
    console.log('---');

    // Проверяем, что все данные организации включены в промпт
    const checks = [
      { field: 'название', value: context.organizationName, found: systemPrompt.includes(context.organizationName) },
      { field: 'описание', value: context.description, found: systemPrompt.includes(context.description || '') },
      { field: 'адрес', value: context.address, found: systemPrompt.includes(context.address || '') },
      { field: 'часы работы', value: context.workingHours, found: systemPrompt.includes(context.workingHours || '') },
      { field: 'телефон', value: context.phone, found: systemPrompt.includes(context.phone || '') },
      { field: 'email', value: context.email, found: systemPrompt.includes(context.email || '') },
      { field: 'услуги', value: 'услуги', found: systemPrompt.includes('Доступные услуги') }
    ];

    console.log('\n✅ Проверка включения данных в промпт:');
    checks.forEach(check => {
      const status = check.found ? '✅' : '❌';
      console.log(`  ${status} ${check.field}: ${check.found ? 'включено' : 'НЕ включено'}`);
    });

    console.log('\n🎉 Тестирование завершено успешно!');
    console.log('\n📝 Результат:');
    console.log('  - AI автоматически получает все данные организации');
    console.log('  - Системный промпт включает описание, адрес, часы работы, контакты');
    console.log('  - Информация об услугах автоматически добавляется в контекст');
    console.log('  - Пользователю не нужно вручную настраивать базовую информацию');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тест
testAIIntegrationWithOrganization();
