import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAIWithKey() {
  try {
    console.log('🚀 БЫСТРАЯ НАСТРОЙКА AI АССИСТЕНТА');
    console.log('=' .repeat(50));

    // Проверяем, что API ключ передан
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('❌ ОШИБКА: Не найден OPENAI_API_KEY в переменных окружения');
      console.log('📝 Как запустить с API ключом:');
      console.log('   OPENAI_API_KEY=sk-your-key-here npx tsx scripts/setupAIWithKey.ts');
      console.log('   или');
      console.log('   export OPENAI_API_KEY=sk-your-key-here');
      console.log('   npx tsx scripts/setupAIWithKey.ts');
      return;
    }

    console.log('✅ OpenAI API ключ найден:', apiKey.substring(0, 10) + '...');

    // 1. Находим или создаем тестовую организацию
    console.log('\n📋 ШАГ 1: Подготовка организации');
    console.log('-'.repeat(30));
    
    let testOrg = await prisma.organization.findFirst({
      where: { name: 'Complete AI Test Organization' }
    });

    if (!testOrg) {
      console.log('❌ Тестовая организация не найдена. Запустите сначала testCompleteAIAssistant.ts');
      return;
    }

    console.log('✅ Найдена тестовая организация:', testOrg.name);

    // 2. Настраиваем AI конфигурацию
    console.log('\n📋 ШАГ 2: Настройка AI конфигурации');
    console.log('-'.repeat(30));
    
    const aiConfig = await prisma.organizationAIConfig.upsert({
      where: { organizationId: testOrg.id },
      update: {
        provider: 'openai',
        apiKey: apiKey,
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.7,
        systemPrompt: 'Ты - профессиональный AI ассистент клиники красоты. Используй актуальную информацию о слотах, записях, услугах и ценах. Всегда предоставляй контактную информацию когда клиент просит связаться с кем-то.',
        customPrompts: JSON.stringify({
          greeting: 'Привет! Добро пожаловать в нашу клинику красоты! Я помогу вам с записью на услуги, расскажу о ценах и расписании. Если нужна помощь, всегда можете связаться с нами напрямую.',
          bookingHelp: 'Помогу вам выбрать подходящую услугу и время для записи. У нас есть маникюр, педикюр, массаж рук и комплексные услуги. Покажу ближайшие свободные слоты.',
          serviceInfo: 'Расскажу подробно о наших услугах, их продолжительности, стоимости и особенностях. У нас есть как отдельные услуги, так и комплексные предложения.',
          support: 'Для решения вашего вопроса рекомендую связаться с нами напрямую. Наш телефон и email всегда доступны для консультаций. Можете позвонить или написать нам.',
          general: 'Отвечу на любые ваши вопросы о наших услугах, ценах, расписании или записи. Если нужна консультация, всегда можете связаться с нами напрямую.'
        }),
        enabled: true
      },
      create: {
        organizationId: testOrg.id,
        provider: 'openai',
        apiKey: apiKey,
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.7,
        systemPrompt: 'Ты - профессиональный AI ассистент клиники красоты. Используй актуальную информацию о слотах, записях, услугах и ценах. Всегда предоставляй контактную информацию когда клиент просит связаться с кем-то.',
        customPrompts: JSON.stringify({
          greeting: 'Привет! Добро пожаловать в нашу клинику красоты! Я помогу вам с записью на услуги, расскажу о ценах и расписании. Если нужна помощь, всегда можете связаться с нами напрямую.',
          bookingHelp: 'Помогу вам выбрать подходящую услугу и время для записи. У нас есть маникюр, педикюр, массаж рук и комплексные услуги. Покажу ближайшие свободные слоты.',
          serviceInfo: 'Расскажу подробно о наших услугах, их продолжительности, стоимости и особенностях. У нас есть как отдельные услуги, так и комплексные предложения.',
          support: 'Для решения вашего вопроса рекомендую связаться с нами напрямую. Наш телефон и email всегда доступны для консультаций. Можете позвонить или написать нам.',
          general: 'Отвечу на любые ваши вопросы о наших услугах, ценах, расписании или записи. Если нужна консультация, всегда можете связаться с нами напрямую.'
        }),
        enabled: true
      }
    });

    console.log('✅ AI конфигурация настроена с вашим API ключом');
    console.log('   - Provider: OpenAI');
    console.log('   - Model: gpt-4o-mini');
    console.log('   - Max Tokens: 2000');
    console.log('   - Temperature: 0.7');
    console.log('   - Enabled: true');

    // 3. Проверяем, что у организации есть данные
    console.log('\n📋 ШАГ 3: Проверка данных организации');
    console.log('-'.repeat(30));
    
    const orgData = {
      name: testOrg.name,
      description: testOrg.description,
      phone: testOrg.phone,
      email: testOrg.email,
      address: testOrg.address,
      workingHours: testOrg.workingHours
    };

    console.log('✅ Данные организации:');
    Object.entries(orgData).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`   ${status} ${key}: ${value || 'НЕ ЗАПОЛНЕНО'}`);
    });

    // 4. Проверяем услуги
    const services = await prisma.service.findMany({
      where: { organizationId: testOrg.id }
    });

    console.log(`\n✅ Услуги (${services.length}):`);
    services.forEach(service => {
      const price = service.price ? `${service.price} ${service.currency || 'RUB'}` : 'Без цены';
      console.log(`   - ${service.nameRu || service.name}: ${price} (${service.durationMin} мин)`);
    });

    // 5. Проверяем слоты
    const slots = await prisma.slot.findMany({
      where: { 
        service: { organizationId: testOrg.id },
        startAt: { gte: new Date() }
      }
    });

    console.log(`\n✅ Слоты (${slots.length}):`);
    console.log(`   - Всего будущих слотов: ${slots.length}`);

    // 6. Финальный отчет
    console.log('\n🎉 НАСТРОЙКА ЗАВЕРШЕНА!');
    console.log('=' .repeat(50));
    console.log('✅ AI ассистент настроен и готов к работе!');
    console.log('\n📋 Что настроено:');
    console.log('   - OpenAI API ключ подключен');
    console.log('   - AI конфигурация создана');
    console.log('   - Кастомные промпты настроены');
    console.log('   - AI включен для организации');
    
    console.log('\n🚀 Следующие шаги:');
    console.log('   1. Откройте админ-панель: http://localhost:4201');
    console.log('   2. Перейдите в AI Assistant');
    console.log('   3. Проверьте настройки');
    console.log('   4. Протестируйте в Telegram боте');
    
    console.log('\n📱 Тестирование в боте:');
    console.log('   - Отправьте команду /ai');
    console.log('   - Задайте вопрос: "Привет! Какие услуги у вас есть?"');
    console.log('   - AI должен ответить с информацией об организации');

  } catch (error) {
    console.error('❌ Ошибка при настройке AI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем настройку
setupAIWithKey();
