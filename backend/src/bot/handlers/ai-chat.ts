import { Context } from 'telegraf';
import { AIService } from '../../lib/ai/ai-service';
import { AIConversation, AIScenario } from '../../lib/ai/types';

export class AIChatHandler {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  // Обработчик команды /ai
  async handleAICommand(ctx: Context, organizationId: number): Promise<void> {
    try {
      await ctx.reply(
        '🤖 AI Ассистент активирован!\n\n' +
        'Теперь вы можете задавать любые вопросы. Я помогу вам с:\n' +
        '• Информацией об услугах\n' +
        '• Помощью с записью\n' +
        '• Ответами на общие вопросы\n' +
        '• Поддержкой\n\n' +
        'Просто напишите ваш вопрос!'
      );
    } catch (error) {
      console.error('Error in AI command handler:', error);
      await ctx.reply('❌ Произошла ошибка при активации AI ассистента.');
    }
  }

  // Обработчик AI сообщений
  async handleAIMessage(ctx: Context, organizationId: number, messageText: string): Promise<void> {
    try {
      // Определяем сценарий на основе контекста сообщения
      const scenario = this.determineScenario(messageText, ctx);
      
      // Создаем разговор
      const conversation: AIConversation = {
        messages: [
          {
            role: 'user',
            content: messageText
          }
        ]
      };

      // Отправляем сообщение в AI (логирование происходит внутри sendMessage)
      const response = await this.aiService.sendMessage(
        organizationId,
        conversation,
        scenario
      );

      // Отправляем ответ пользователю
      await ctx.reply(response.content);

    } catch (error) {
      console.error('Error in AI message handler:', error);
      
      // Fallback ответы в зависимости от типа ошибки
      if (error instanceof Error) {
        if (error.message.includes('not configured') || error.message.includes('not enabled')) {
          await ctx.reply(
            '🤖 AI ассистент временно недоступен.\n\n' +
            'Для записи на услуги используйте команду /start'
          );
        } else {
          await ctx.reply(
            '❌ Произошла ошибка при обработке вашего сообщения.\n\n' +
            'Попробуйте еще раз или используйте команду /start для записи.'
          );
        }
      } else {
        await ctx.reply('❌ Произошла неожиданная ошибка. Попробуйте позже.');
      }
    }
  }

  // Определение сценария на основе сообщения
  private determineScenario(messageText: string, ctx: Context): AIScenario | undefined {
    const text = messageText.toLowerCase();

    // Приветствие
    if (this.isGreeting(text)) {
      return 'greeting';
    }

    // Помощь с записью
    if (this.isBookingRelated(text)) {
      return 'booking_help';
    }

    // Информация об услугах
    if (this.isServiceInfoRequest(text)) {
      return 'service_info';
    }

    // Поддержка
    if (this.isSupportRequest(text)) {
      return 'support';
    }

    // Общие вопросы (по умолчанию)
    return 'general';
  }

  // Проверка на приветствие
  private isGreeting(text: string): boolean {
    const greetings = [
      'привет', 'здравствуйте', 'добро пожаловать', 'hi', 'hello',
      'добрый день', 'добрый вечер', 'доброе утро', 'как дела'
    ];
    return greetings.some(greeting => text.includes(greeting));
  }

  // Проверка на запросы связанные с записью
  private isBookingRelated(text: string): boolean {
    const bookingKeywords = [
      'записаться', 'запись', 'забронировать', 'бронь', 'время',
      'свободно', 'доступно', 'расписание', 'календарь', 'appointment',
      'когда можно', 'есть ли время', 'свободные слоты', 'доступные слоты',
      'записаться на', 'хочу записаться', 'можно записаться', 'есть места',
      'свободные места', 'доступные места', 'когда работаете', 'во сколько'
    ];
    return bookingKeywords.some(keyword => text.includes(keyword));
  }

  // Проверка на запросы информации об услугах
  private isServiceInfoRequest(text: string): boolean {
    const serviceKeywords = [
      'услуга', 'услуги', 'что делаете', 'что предлагаете',
      'маникюр', 'педикюр', 'стрижка', 'массаж', 'цена', 'стоимость',
      'сколько стоит', 'описание', 'что входит', 'что включает',
      'длительность', 'сколько длится', 'какие услуги', 'что у вас есть',
      'прайс', 'прайс-лист', 'цены', 'стоимость услуг'
    ];
    return serviceKeywords.some(keyword => text.includes(keyword));
  }

  // Проверка на запросы поддержки
  private isSupportRequest(text: string): boolean {
    const supportKeywords = [
      'проблема', 'ошибка', 'не работает', 'помощь', 'поддержка',
      'контакты', 'телефон', 'адрес', 'как связаться', 'жалоба',
      'отменить', 'отмена', 'перенести', 'перенос', 'изменить',
      'не могу', 'не получается', 'что делать', 'как быть',
      'статус записи', 'моя запись', 'проверить запись',
      'позвонить', 'связаться', 'поговорить с кем-то', 'с кем можно поговорить',
      'менеджер', 'администратор', 'директор', 'руководитель',
      'номер телефона', 'email', 'почта', 'связаться напрямую'
    ];
    return supportKeywords.some(keyword => text.includes(keyword));
  }

  // Проверка, активирован ли AI для организации
  async isAIActivated(organizationId: number): Promise<boolean> {
    try {
      const config = await this.aiService.getOrganizationAIConfig(organizationId);
      return config?.enabled || false;
    } catch (error) {
      console.error('Error checking AI activation:', error);
      return false;
    }
  }

  // Получение статистики использования AI
  async getUsageStats(organizationId: number, days: number = 7): Promise<any> {
    try {
      return await this.aiService.getUsageStats(organizationId, days);
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return null;
    }
  }
}
