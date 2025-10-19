import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickSetupAI() {
  try {
    console.log('🚀 БЫСТРАЯ НАСТРОЙКА AI АССИСТЕНТА');
    console.log('=' .repeat(50));

    // Проверяем, что API ключ передан
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('❌ ОШИБКА: Не найден OPENAI_API_KEY в переменных окружения');
      console.log('📝 Как запустить с API ключом:');
      console.log('   OPENAI_API_KEY=sk-your-key-here npx tsx scripts/quickSetupAI.ts');
      return;
    }

    console.log('✅ OpenAI API ключ найден:', apiKey.substring(0, 10) + '...');

    // 1. Находим или создаем простую тестовую организацию
    console.log('\n📋 ШАГ 1: Подготовка организации');
    console.log('-'.repeat(30));
    
    let testOrg = await prisma.organization.findFirst({
      where: { name: 'Quick AI Test Organization' }
    });

    if (!testOrg) {
      testOrg = await prisma.organization.create({
        data: {
          name: 'Quick AI Test Organization',
          description: 'Тестовая организация для AI ассистента',
          address: 'ул. Тестовая, 123, Москва',
          workingHours: 'Пн-Пт: 9:00-18:00, Сб-Вс: 10:00-16:00',
          phone: '+7 (495) 123-45-67',
          email: 'info@test-ai.ru'
        }
      });
      console.log('✅ Создана новая организация:', testOrg.name);
    } else {
      console.log('✅ Найдена организация:', testOrg.name);
    }

    // 2. Создаем простые услуги
    console.log('\n📋 ШАГ 2: Создание услуг');
    console.log('-'.repeat(30));
    
    let services = await prisma.service.findMany({
      where: { organizationId: testOrg.id }
    });

    if (services.length === 0) {
      services = await Promise.all([
        prisma.service.create({
          data: {
            name: 'Маникюр',
            nameRu: 'Маникюр',
            description: 'Классический маникюр',
            descriptionRu: 'Классический маникюр с покрытием гель-лаком',
            durationMin: 60,
            price: 2000,
            currency: 'RUB',
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
            price: 2500,
            currency: 'RUB',
            organizationId: testOrg.id
          }
        })
      ]);
      console.log('✅ Созданы услуги:', services.map(s => s.nameRu).join(', '));
    } else {
      console.log('✅ Найдены услуги:', services.map(s => s.nameRu || s.name).join(', '));
    }

    // 3. Настраиваем AI конфигурацию
    console.log('\n📋 ШАГ 3: Настройка AI');
    console.log('-'.repeat(30));
    
    const aiConfig = await prisma.organizationAIConfig.upsert({
      where: { organizationId: testOrg.id },
      update: {
        provider: 'openai',
        apiKey: apiKey,
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.7,
        systemPrompt: 'Ты - профессиональный AI ассистент клиники красоты. Используй актуальную информацию о услугах и ценах. Всегда предоставляй контактную информацию когда клиент просит связаться с кем-то.',
        customPrompts: JSON.stringify({
          greeting: 'Привет! Добро пожаловать в нашу клинику красоты! Я помогу вам с записью на услуги, расскажу о ценах и расписании.',
          bookingHelp: 'Помогу вам выбрать подходящую услугу и время для записи. У нас есть маникюр и педикюр.',
          serviceInfo: 'Расскажу подробно о наших услугах, их продолжительности и стоимости.',
          support: 'Для решения вашего вопроса рекомендую связаться с нами напрямую. Наш телефон и email всегда доступны.',
          general: 'Отвечу на любые ваши вопросы о наших услугах, ценах или записи.'
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
        systemPrompt: 'Ты - профессиональный AI ассистент клиники красоты. Используй актуальную информацию о услугах и ценах. Всегда предоставляй контактную информацию когда клиент просит связаться с кем-то.',
        customPrompts: JSON.stringify({
          greeting: 'Привет! Добро пожаловать в нашу клинику красоты! Я помогу вам с записью на услуги, расскажу о ценах и расписании.',
          bookingHelp: 'Помогу вам выбрать подходящую услугу и время для записи. У нас есть маникюр и педикюр.',
          serviceInfo: 'Расскажу подробно о наших услугах, их продолжительности и стоимости.',
          support: 'Для решения вашего вопроса рекомендую связаться с нами напрямую. Наш телефон и email всегда доступны.',
          general: 'Отвечу на любые ваши вопросы о наших услугах, ценах или записи.'
        }),
        enabled: true
      }
    });

    console.log('✅ AI конфигурация настроена');
    console.log('   - Provider: OpenAI');
    console.log('   - Model: gpt-4o-mini');
    console.log('   - API Key: настроен');
    console.log('   - Enabled: true');

    // 4. Финальный отчет
    console.log('\n🎉 НАСТРОЙКА ЗАВЕРШЕНА!');
    console.log('=' .repeat(50));
    console.log('✅ AI ассистент готов к работе!');
    console.log('\n📋 Что настроено:');
    console.log('   - Организация: ' + testOrg.name);
    console.log('   - Услуги: ' + services.length + ' шт.');
    console.log('   - OpenAI API ключ подключен');
    console.log('   - AI конфигурация создана');
    console.log('   - AI включен');
    
    console.log('\n🚀 Следующие шаги:');
    console.log('   1. Откройте админ-панель: http://localhost:4200');
    console.log('   2. Перейдите в AI Assistant');
    console.log('   3. Проверьте настройки');
    console.log('   4. Протестируйте в Telegram боте');
    
    console.log('\n📱 Тестирование в боте:');
    console.log('   - Отправьте команду /ai');
    console.log('   - Задайте вопрос: "Привет! Какие услуги у вас есть?"');
    console.log('   - AI должен ответить с информацией об организации');

    console.log('\n🔑 Ваш API ключ настроен и готов к использованию!');

  } catch (error) {
    console.error('❌ Ошибка при настройке AI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем настройку
quickSetupAI();
