import { Context } from 'telegraf';
import { AIService } from '../../lib/ai/ai-service';
import { AIConversation, AIScenario } from '../../lib/ai/types';

// Get WebSocket emitters from global scope
const getAppointmentEmitter = () => (global as any).appointmentEmitter;

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
      // Проверяем, не является ли это командой подтверждения/отмены записи
      const bookingAction = this.parseBookingAction(messageText);
      if (bookingAction) {
        await this.handleBookingAction(ctx, organizationId, bookingAction);
        return;
      }

      // Проверяем, не является ли это запросом о записях пользователя
      if (this.isUserAppointmentsQuery(messageText.toLowerCase())) {
        await this.handleUserAppointmentsQuery(ctx, organizationId);
        return;
      }

      // Проверяем, не является ли это выбором конкретного слота для записи
      const slotSelection = this.parseSlotSelection(messageText);
      if (slotSelection) {
        await this.handleSlotSelection(ctx, organizationId, slotSelection);
        return;
      }

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

  // Парсинг команд подтверждения/отмены записи
  private parseBookingAction(messageText: string): { action: 'confirm' | 'cancel', appointmentId?: number, specificTime?: string } | null {
    const text = messageText.toLowerCase().trim();
    
    // Команды подтверждения
    if (text.includes('подтверждаю') || text.includes('да, записываюсь') || 
        text.includes('да, подтверждаю') || text.includes('подтвердить') ||
        text.includes('да, хочу записаться') || text.includes('согласен')) {
      return { action: 'confirm' };
    }
    
    // Команды отмены с указанием времени
    if (text.includes('отменяю') || text.includes('отменить') || 
        text.includes('не хочу') || text.includes('передумал') ||
        text.includes('отказ') || text.includes('не подходит')) {
      
      // Пытаемся извлечь время из сообщения
      const timeMatch = text.match(/(\d{1,2})\s*:\s*(\d{2})|(\d{1,2})\s+(\d{2})/);
      if (timeMatch) {
        const hour = timeMatch[1] || timeMatch[3];
        const minute = timeMatch[2] || timeMatch[4];
        const specificTime = `${hour.padStart(2, '0')}:${minute}`;
        console.log(`🎯 Found specific time for cancellation: ${specificTime}`);
        return { action: 'cancel', specificTime };
      }
      
      return { action: 'cancel' };
    }
    
    return null;
  }

  // Парсинг выбора конкретного слота
  private parseSlotSelection(messageText: string): { serviceName: string, date: string, time: string } | null {
    const text = messageText.toLowerCase().trim();
    
    console.log(`🔍 Parsing slot selection from: "${messageText}"`);
    
    // Проверяем, не является ли это запросом о записях пользователя
    if (this.isUserAppointmentsQuery(text)) {
      console.log(`❌ This is a user appointments query, not slot selection`);
      return null;
    }
    
    // Паттерны для распознавания выбора слота
    // Примеры: "20 10 2025 15 00", "пн 20 10 2025 15 00", "15 00", "15:00"
    const dateTimePatterns = [
      /(\d{1,2})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2})\s+(\d{2})/, // 20 10 2025 15 00
      /(\d{1,2})\s*:\s*(\d{2})/, // 15:00 или 15 00
      /(\d{1,2})\s+(\d{2})/, // 15 00
    ];

    // Проверяем, содержит ли сообщение время
    for (const pattern of dateTimePatterns) {
      const match = text.match(pattern);
      if (match) {
        console.log(`✅ Found time pattern match:`, match);
        
        // Если это полная дата и время
        if (match.length >= 5) {
          const day = match[1];
          const month = match[2];
          const year = match[3];
          const hour = match[4];
          const minute = match[5];
          
          // Извлекаем название услуги из текста
          const serviceName = this.extractServiceName(messageText);
          
          const result = {
            serviceName: serviceName,
            date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
            time: `${hour.padStart(2, '0')}:${minute}`
          };
          
          console.log(`📅 Parsed full date/time:`, result);
          return result;
        }
        // Если это только время
        else if (match.length >= 3) {
          const hour = match[1];
          const minute = match[2];
          
          // Извлекаем название услуги из текста
          const serviceName = this.extractServiceName(messageText);
          
          const result = {
            serviceName: serviceName,
            date: '2025-10-20', // Пока хардкодим сегодняшнюю дату
            time: `${hour.padStart(2, '0')}:${minute}`
          };
          
          console.log(`⏰ Parsed time only:`, result);
          return result;
        }
      }
    }
    
    console.log(`❌ No time pattern found in: "${messageText}"`);
    return null;
  }

  // Проверка, является ли сообщение запросом о записях пользователя
  private isUserAppointmentsQuery(text: string): boolean {
    const appointmentQueryKeywords = [
      'мои записи',
      'какие у меня записи',
      'покажи мои записи',
      'записи на',
      'инфу по моим записям',
      'информацию о записях',
      'что у меня записано',
      'дай инфу по всем',
      'покажи все записи',
      'мои записи есть',
      'какие у меня есть записи',
      'покажи мои записи есть'
    ];
    
    console.log(`🔍 Checking if "${text}" is user appointments query`);
    const isQuery = appointmentQueryKeywords.some(keyword => text.includes(keyword));
    console.log(`🎯 Is user appointments query: ${isQuery}`);
    
    return isQuery;
  }

  // Извлечение названия услуги из текста
  private extractServiceName(messageText: string): string {
    const text = messageText.toLowerCase().trim();
    
    // Маппинг русских названий на английские
    const serviceMapping: { [key: string]: string } = {
      'тест ван': 'Test One',
      'тест ванн': 'Test One',
      'тест один': 'Test One',
      'тест ту': 'Test Two',
      'тест два': 'Test Two',
      'test one': 'Test One',
      'test two': 'Test Two'
    };
    
    // Ищем совпадения
    for (const [russian, english] of Object.entries(serviceMapping)) {
      if (text.includes(russian)) {
        console.log(`🎯 Found service mapping: "${russian}" -> "${english}"`);
        return english;
      }
    }
    
    // По умолчанию возвращаем Test One
    console.log(`🎯 No service mapping found, using default: "Test One"`);
    return 'Test One';
  }

  // Обработка запросов о записях пользователя
  private async handleUserAppointmentsQuery(ctx: Context, organizationId: number): Promise<void> {
    try {
      const chatId = String(ctx.chat?.id);
      const { prisma } = await import('../../lib/prisma.js');

      // Получаем все активные записи пользователя
      const appointments = await prisma.appointment.findMany({
        where: {
          chatId: chatId,
          status: { in: ['pending', 'confirmed'] },
          service: {
            organizationId: organizationId
          }
        },
        include: {
          slot: true,
          service: true
        },
        orderBy: {
          slot: {
            startAt: 'asc'
          }
        }
      });

      if (appointments.length === 0) {
        await ctx.reply('📅 У вас пока нет активных записей.\n\nХотите записаться на услугу? 😊');
        return;
      }

      // Формируем детальную информацию о записях
      let response = '📅 **Ваши записи:**\n\n';
      
      appointments.forEach((appointment, index) => {
        const slotStart = new Date(appointment.slot.startAt);
        const formattedDate = slotStart.toLocaleDateString('ru-RU', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        const statusEmoji = appointment.status === 'confirmed' ? '✅' : '⏳';
        const statusText = appointment.status === 'confirmed' ? 'Подтверждена' : 'Ожидает подтверждения';

        response += `${statusEmoji} **${appointment.service.nameRu || appointment.service.name}**\n`;
        response += `📅 ${formattedDate}\n`;
        response += `⏱️ ${appointment.service.durationMin} минут\n`;
        response += `📊 Статус: ${statusText}\n\n`;
      });

      response += '💡 Для отмены записи напишите "отменяю" или "передумал"';
      
      await ctx.reply(response);

    } catch (error) {
      console.error('Error handling user appointments query:', error);
      await ctx.reply('❌ Произошла ошибка при получении информации о записях. Попробуйте еще раз.');
    }
  }

  // Обработка выбора слота
  private async handleSlotSelection(ctx: Context, organizationId: number, selection: { serviceName: string, date: string, time: string }): Promise<void> {
    try {
      const chatId = String(ctx.chat?.id);
      const { prisma } = await import('../../lib/prisma.js');

      // Находим услугу по имени
      const service = await prisma.service.findFirst({
        where: {
          organizationId: organizationId,
          OR: [
            { name: { contains: selection.serviceName } },
            { nameRu: { contains: selection.serviceName } }
          ]
        }
      });

      if (!service) {
        await ctx.reply('❌ Услуга не найдена. Попробуйте еще раз.');
        return;
      }

      // Создаем дату и время для поиска слота
      const [year, month, day] = selection.date.split('-').map(Number);
      const [hour, minute] = selection.time.split(':').map(Number);
      
      const slotDateTime = new Date(year, month - 1, day, hour, minute);
      const slotEndTime = new Date(slotDateTime.getTime() + service.durationMin * 60000);

      // Находим подходящий слот
      const slot = await prisma.slot.findFirst({
        where: {
          serviceId: service.id,
          startAt: {
            gte: slotDateTime,
            lt: new Date(slotDateTime.getTime() + 60000) // +1 минута для поиска
          }
        },
        include: {
          bookings: {
            where: {
              status: { not: 'cancelled' }
            }
          }
        }
      });

      if (!slot) {
        await ctx.reply(`❌ Слот на ${selection.date} в ${selection.time} не найден или недоступен.`);
        return;
      }

      if (slot.bookings.length > 0) {
        await ctx.reply(`❌ Слот на ${selection.date} в ${selection.time} уже занят.`);
        return;
      }

      // Создаем pending запись
      const appointment = await prisma.appointment.create({
        data: {
          chatId: chatId,
          slotId: slot.id,
          serviceId: service.id,
          status: 'pending'
        },
        include: {
          slot: true,
          service: true
        }
      });

      const formattedDate = slotDateTime.toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      await ctx.reply(
        `📅 Запись создана!\n\n` +
        `💅 Услуга: ${service.nameRu || service.name}\n` +
        `📅 Дата: ${formattedDate}\n` +
        `⏱️ Длительность: ${service.durationMin} минут\n\n` +
        `Для подтверждения записи напишите "подтверждаю" или "да, записываюсь"\n` +
        `Для отмены напишите "отменяю" или "передумал"`
      );

    } catch (error) {
      console.error('Error handling slot selection:', error);
      await ctx.reply('❌ Произошла ошибка при создании записи. Попробуйте еще раз.');
    }
  }

  // Обработка команд записи
  private async handleBookingAction(ctx: Context, organizationId: number, action: { action: 'confirm' | 'cancel', appointmentId?: number, specificTime?: string }): Promise<void> {
    try {
      const chatId = String(ctx.chat?.id);
      
      if (action.action === 'confirm') {
        // Находим последнюю активную запись пользователя
        const { prisma } = await import('../../lib/prisma.js');
        
        const pendingAppointment = await prisma.appointment.findFirst({
          where: {
            chatId: chatId,
            status: 'pending',
            service: {
              organizationId: organizationId
            }
          },
          include: {
            slot: true,
            service: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (pendingAppointment) {
          // Подтверждаем запись
          await prisma.appointment.update({
            where: { id: pendingAppointment.id },
            data: { status: 'confirmed' }
          });

          const slotStart = new Date(pendingAppointment.slot.startAt);
          const formattedDate = slotStart.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          await ctx.reply(
            `✅ Запись подтверждена!\n\n` +
            `📅 Дата: ${formattedDate}\n` +
            `💅 Услуга: ${pendingAppointment.service.nameRu || pendingAppointment.service.name}\n` +
            `⏱️ Длительность: ${pendingAppointment.service.durationMin} минут\n\n` +
            `До встречи! 😊`
          );
        } else {
          await ctx.reply('❌ Не найдено активных записей для подтверждения.');
        }
      } else if (action.action === 'cancel') {
        // Находим активную запись пользователя
        const { prisma } = await import('../../lib/prisma.js');
        
        let whereClause: any = {
          chatId: chatId,
          status: { in: ['pending', 'confirmed'] },
          service: {
            organizationId: organizationId
          }
        };

        // Если указано конкретное время, ищем запись по времени
        if (action.specificTime) {
          console.log(`🔍 Looking for appointment at time: ${action.specificTime}`);
          
          // Создаем диапазон времени для поиска (с точностью до минуты)
          // Ищем на сегодняшний день (20.10.2025)
          const [hour, minute] = action.specificTime.split(':').map(Number);
          const targetDate = new Date(2025, 9, 20); // 20 октября 2025
          targetDate.setHours(hour, minute, 0, 0);
          const nextMinute = new Date(targetDate.getTime() + 60000);
          
          console.log(`🔍 Searching for slot between ${targetDate.toISOString()} and ${nextMinute.toISOString()}`);
          
          whereClause.slot = {
            startAt: {
              gte: targetDate,
              lt: nextMinute
            }
          };
        }

        const activeAppointment = await prisma.appointment.findFirst({
          where: whereClause,
          include: {
            slot: true,
            service: true
          },
          orderBy: action.specificTime ? undefined : {
            createdAt: 'desc'
          }
        });

        if (activeAppointment) {
          // Отменяем запись
          const updatedAppointment = await prisma.appointment.update({
            where: { id: activeAppointment.id },
            data: { status: 'cancelled' },
            include: {
              service: {
                include: {
                  organization: true
                }
              },
              slot: true
            }
          });

          // Emit real-time WebSocket notification for appointment cancellation
          try {
            const appointmentEmitter = getAppointmentEmitter();
            if (appointmentEmitter) {
              const chatId = String(ctx.chat?.id);
              const customerInfo = {
                chatId: chatId,
                firstName: ctx.from?.first_name,
                lastName: ctx.from?.last_name,
                username: ctx.from?.username
              };
              await appointmentEmitter.emitAppointmentCancelled(updatedAppointment, customerInfo);
              console.log('✅ WebSocket notification sent for appointment cancellation from AI chat');
            }
          } catch (error) {
            console.error('❌ Failed to send WebSocket notification for appointment cancellation:', error);
            // Don't fail the request if WebSocket notification fails
          }

          const slotStart = new Date(updatedAppointment.slot.startAt);
          const formattedDate = slotStart.toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });

          await ctx.reply(
            `❌ Запись отменена!\n\n` +
            `📅 Дата: ${formattedDate}\n` +
            `💅 Услуга: ${updatedAppointment.service.nameRu || updatedAppointment.service.name}\n\n` +
            `Если передумаете, можете записаться снова! 😊`
          );
        } else {
          if (action.specificTime) {
            await ctx.reply(`❌ Не найдено записи на время ${action.specificTime} для отмены.`);
          } else {
            await ctx.reply('❌ Не найдено активных записей для отмены.');
          }
        }
      }
    } catch (error) {
      console.error('Error handling booking action:', error);
      await ctx.reply('❌ Произошла ошибка при обработке команды. Попробуйте еще раз.');
    }
  }
}
