import { AIService } from '../src/lib/ai/ai-service';
import { AIConversation } from '../src/lib/ai/types';

async function testAIIntegration() {
  console.log('🧪 Тестирование AI интеграции...\n');

  const aiService = new AIService();

  try {
    // Тест 1: Проверка валидности API ключа (без реального ключа)
    console.log('🧪 Тест 1: Проверка валидности API ключа...');
    
    const validationResult = await aiService.validateApiKey('openai', 'sk-test-key');
    console.log(`   Результат валидации: ${validationResult.valid ? '✅ Валидный' : '❌ Невалидный'}`);
    if (!validationResult.valid) {
      console.log(`   Ошибка: ${validationResult.error}`);
    }

    // Тест 2: Получение доступных моделей
    console.log('\n🧪 Тест 2: Получение доступных моделей...');
    
    const models = await aiService.getAvailableModels('openai');
    console.log(`   Доступные модели: ${models.length > 0 ? models.join(', ') : 'Нет доступных моделей'}`);

    // Тест 3: Создание тестовой конфигурации
    console.log('\n🧪 Тест 3: Создание тестовой конфигурации...');
    
    const testConfig = {
      organizationId: 1,
      provider: 'openai' as const,
      apiKey: 'sk-test-key',
      model: 'gpt-4o-mini',
      maxTokens: 500,
      temperature: 0.7,
      systemPrompt: 'Ты - помощник для организации. Будь вежливым и полезным.',
      enabled: false // Отключаем для теста
    };

    try {
      await aiService.saveOrganizationAIConfig(testConfig);
      console.log('   ✅ Конфигурация сохранена успешно');
    } catch (error) {
      console.log(`   ❌ Ошибка сохранения конфигурации: ${error}`);
    }

    // Тест 4: Получение конфигурации
    console.log('\n🧪 Тест 4: Получение конфигурации...');
    
    const savedConfig = await aiService.getOrganizationAIConfig(1);
    if (savedConfig) {
      console.log('   ✅ Конфигурация получена успешно');
      console.log(`   Провайдер: ${savedConfig.provider}`);
      console.log(`   Модель: ${savedConfig.model}`);
      console.log(`   Включена: ${savedConfig.enabled ? 'Да' : 'Нет'}`);
    } else {
      console.log('   ❌ Конфигурация не найдена');
    }

    // Тест 5: Проверка статистики использования
    console.log('\n🧪 Тест 5: Проверка статистики использования...');
    
    const usageStats = await aiService.getUsageStats(1, 30);
    if (usageStats) {
      console.log('   ✅ Статистика получена успешно');
      console.log(`   Всего запросов: ${usageStats.totalRequests}`);
      console.log(`   Всего токенов: ${usageStats.totalTokens}`);
    } else {
      console.log('   ❌ Статистика не найдена');
    }

    console.log('\n🎯 Тестирование AI интеграции завершено!');
    console.log('💡 Для полного тестирования нужен реальный OpenAI API ключ');

  } catch (error) {
    console.error('❌ Ошибка при тестировании AI интеграции:', error);
  }
}

// Запускаем тест
testAIIntegration();
