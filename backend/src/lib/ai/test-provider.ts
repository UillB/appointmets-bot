import { BaseAIProvider } from './base-provider';
import { AIConversation, AIResponse, AIConfig } from './types';

export class TestProvider extends BaseAIProvider {
  name = 'custom';
  models = ['test-model'];

  private apiKey: string;
  private systemPrompt: string;

  constructor(config: AIConfig) {
    super();
    this.apiKey = config.apiKey;
    // Используем baseSystemPrompt из конфигурации или дефолтный
    this.systemPrompt = config.baseSystemPrompt || config.systemPrompt || 'Ты AI ассистент салона красоты. Помогай клиентам с записью и отвечай на вопросы.';
  }

  async sendMessage(conversation: AIConversation, model: string = 'test-model'): Promise<AIResponse> {
    // Получаем последнее сообщение пользователя
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const userMessage = lastMessage?.content?.toLowerCase() || '';

    // Определяем тип ответа на основе сообщения
    let response = this.getTestResponse(userMessage);

    // Добавляем контекст организации только если это уместно
    if (conversation.context && this.shouldAddContext(userMessage)) {
      response += this.addOrganizationContext(conversation.context);
    }

    return {
      content: response,
      usage: {
        promptTokens: 50,
        completionTokens: response.length / 4, // Примерная оценка токенов
        totalTokens: 50 + Math.floor(response.length / 4)
      },
      model: 'test-model',
      provider: 'custom'
    };
  }

  private shouldAddContext(userMessage: string): boolean {
    // Добавляем контекст только для вопросов об услугах, ценах или записи
    return userMessage.includes('услуг') || 
           userMessage.includes('цена') || 
           userMessage.includes('стоимость') || 
           userMessage.includes('сколько') ||
           userMessage.includes('запис') || 
           userMessage.includes('слот') ||
           userMessage.includes('что есть');
  }

  private getTestResponse(userMessage: string): string {
    // Проверяем специальные инструкции из системного промпта
    if (userMessage.includes('applepenpineapple')) {
      return 'pen or apple?';
    }
    
    // Извлекаем имя из системного промпта
    const nameMatch = this.systemPrompt.match(/зовут\s+([А-ЯЁA-Z]+)/i);
    const aiName = nameMatch ? nameMatch[1] : 'AI Ассистент';
    
    // Извлекаем возраст из системного промпта
    const ageMatch = this.systemPrompt.match(/(\d+)\s+лет/i);
    const aiAge = ageMatch ? ageMatch[1] : '';
    
    // Простые ответы на основе ключевых слов
    if (userMessage.includes('привет') || userMessage.includes('здравствуй')) {
      return `Привет! Я ${aiName}${aiAge ? `, мне ${aiAge} лет` : ''}. Чем могу помочь?`;
    }
    
    if (userMessage.includes('имя') || userMessage.includes('зовут')) {
      return `Меня зовут ${aiName}${aiAge ? `, мне ${aiAge} лет` : ''}! Я помогаю клиентам с записью и отвечаю на вопросы о наших услугах.`;
    }
    
    if (userMessage.includes('услуг') || userMessage.includes('что есть')) {
      return 'У нас есть следующие услуги:\n• Маникюр - 2000 ₽\n• Педикюр - 2500 ₽\n• Массаж рук - 1500 ₽\n• Комплексный уход - 4000 ₽';
    }
    
    if (userMessage.includes('цена') || userMessage.includes('стоимость') || userMessage.includes('сколько')) {
      return 'Цены на наши услуги:\n• Маникюр: 2000 ₽\n• Педикюр: 2500 ₽\n• Массаж рук: 1500 ₽\n• Комплексный уход: 4000 ₽';
    }
    
    if (userMessage.includes('запис') || userMessage.includes('слот') || userMessage.includes('время')) {
      return 'Для записи на услуги можете:\n• Позвонить нам: +7 (495) 123-45-67\n• Написать на email: info@beauty-clinic.ru\n• Использовать команду /start для выбора времени';
    }
    
    if (userMessage.includes('работа') || userMessage.includes('часы') || userMessage.includes('время работы')) {
      return 'Мы работаем:\n• Пн-Пт: 9:00-21:00\n• Сб-Вс: 10:00-18:00';
    }
    
    if (userMessage.includes('контакт') || userMessage.includes('связать') || userMessage.includes('поговорить')) {
      return 'Наши контакты:\n📞 Телефон: +7 (495) 123-45-67\n📧 Email: info@beauty-clinic.ru\n📍 Адрес: ул. Красоты, 123, Москва';
    }
    
    if (userMessage.includes('название') || userMessage.includes('называется') || userMessage.includes('организация')) {
      return 'Наша организация называется "Test Beauty Clinic" - современная клиника красоты с полным спектром услуг.';
    }
    
    // Общий ответ для неизвестных вопросов
    return 'Спасибо за ваш вопрос! Я помогу вам с записью на услуги или отвечу на вопросы о нашем салоне. Можете также связаться с нами напрямую по телефону +7 (495) 123-45-67.';
  }

  private addOrganizationContext(context: any): string {
    let contextInfo = '\n\n';
    
    if (context.organization) {
      contextInfo += `О нашей организации: ${context.organization.name}`;
      if (context.organization.description) {
        contextInfo += ` - ${context.organization.description}`;
      }
    }
    
    if (context.services && context.services.length > 0) {
      contextInfo += '\n\nДоступные услуги:';
      context.services.forEach((service: any) => {
        const price = service.price ? `${service.price} ${service.currency || 'RUB'}` : 'Цена по запросу';
        contextInfo += `\n• ${service.nameRu || service.name}: ${price}`;
      });
    }
    
    return contextInfo;
  }

  validateConfig(config: any): boolean {
    return !!(config.apiKey && typeof config.apiKey === 'string');
  }

  async getAvailableModels(): Promise<string[]> {
    return this.models;
  }

  async checkApiKey(): Promise<{ valid: boolean; error?: string }> {
    return { valid: true };
  }
}
