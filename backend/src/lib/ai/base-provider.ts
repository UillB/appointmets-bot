import { AIProvider, AIConversation, AIResponse } from './types';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract models: string[];

  abstract sendMessage(conversation: AIConversation, model?: string): Promise<AIResponse>;
  abstract validateConfig(config: any): boolean;

  // Общие методы для всех провайдеров
  protected formatMessages(conversation: AIConversation): any[] {
    const messages = [...conversation.messages];
    
    // Добавляем системный промпт с контекстом организации
    if (conversation.context) {
      const systemPrompt = this.buildSystemPrompt(conversation.context);
      messages.unshift({
        role: 'system',
        content: systemPrompt
      });
    }
    
    return messages;
  }

  protected buildSystemPrompt(context: any): string {
    // Используем базовый системный промпт из конфигурации или дефолтный
    const basePrompt = context.baseSystemPrompt || 
      `Ты - AI ассистент для организации "${context.organizationName}". ` +
      `Твоя задача - помогать клиентам с записью на услуги и отвечать на вопросы.`;
    
    let prompt = basePrompt;
    
    // Добавляем пользовательские инструкции если есть
    if (context.systemPrompt && context.systemPrompt.trim()) {
      prompt += `\n\n🎯 ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ВЛАДЕЛЬЦА:\n${context.systemPrompt}`;
    }
    
    // Добавляем описание организации если есть
    if (context.description) {
      prompt += `\n\nО нашей организации: ${context.description}`;
    }
    
    // Добавляем контактную информацию
    if (context.address) {
      prompt += `\n\n📍 Наш адрес: ${context.address}`;
    }
    
    if (context.workingHours) {
      prompt += `\n\n🕐 Часы работы: ${context.workingHours}`;
    }
    
    if (context.phone) {
      prompt += `\n\n📞 Телефон для связи: ${context.phone}`;
    }
    
    if (context.email) {
      prompt += `\n\n📧 Email для связи: ${context.email}`;
    }
    
    // Добавляем информацию об услугах с деталями о слотах и ценах
    if (context.services && context.services.length > 0) {
      prompt += `\n\n💅 Доступные услуги и расписание:\n`;
      context.services.forEach((service: any) => {
        prompt += `\n📋 ${service.name}`;
        prompt += `\n   ⏱️ Длительность: ${service.duration} минут`;
        
        if (service.priceFormatted) {
          prompt += `\n   💰 Стоимость: ${service.priceFormatted}`;
        }
        
        if (service.description) {
          prompt += `\n   📝 Описание: ${service.description}`;
        }
        
        prompt += `\n   📅 Доступность: ${service.availableSlots} из ${service.totalSlots} слотов свободно`;
        
        // Показываем ближайшие доступные слоты
        const availableSlots = service.slots.filter((slot: any) => slot.isAvailable).slice(0, 5);
        if (availableSlots.length > 0) {
          prompt += `\n   🕐 Ближайшие свободные слоты:`;
          availableSlots.forEach((slot: any) => {
            const date = new Date(slot.startAt).toLocaleDateString('ru-RU');
            const time = new Date(slot.startAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            const dayName = new Date(slot.startAt).toLocaleDateString('ru-RU', { weekday: 'short' });
            prompt += `\n     • ${dayName} ${date} в ${time}`;
          });
        } else {
          prompt += `\n   ⚠️ Нет свободных слотов в ближайшее время`;
        }
        
        // Показываем занятые слоты для справки
        const bookedSlots = service.slots.filter((slot: any) => !slot.isAvailable).slice(0, 10);
        if (bookedSlots.length > 0) {
          prompt += `\n   🚫 Занятые слоты (для справки):`;
          bookedSlots.forEach((slot: any) => {
            const date = new Date(slot.startAt).toLocaleDateString('ru-RU');
            const time = new Date(slot.startAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            const dayName = new Date(slot.startAt).toLocaleDateString('ru-RU', { weekday: 'short' });
            prompt += `\n     • ${dayName} ${date} в ${time} (занят)`;
          });
        }
        
        // Показываем слоты по дням
        if (service.slotsByDay && Object.keys(service.slotsByDay).length > 0) {
          prompt += `\n   📊 Расписание по дням:`;
          Object.entries(service.slotsByDay).slice(0, 7).forEach(([date, slots]: [string, any]) => {
            const availableCount = slots.filter((slot: any) => slot.isAvailable).length;
            const totalCount = slots.length;
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'long' });
            const status = availableCount > 0 ? '✅' : '❌';
            prompt += `\n     ${status} ${dayName} (${date}): ${availableCount}/${totalCount} свободно`;
          });
        }
      });
    }
    
    // Добавляем инструкции по работе с контекстом
    if (context.contextInstructions) {
      prompt += `\n\n📋 Инструкции по работе с контекстом:\n${context.contextInstructions}`;
    }
    
    // Добавляем статистику записей
    if (context.appointmentStats) {
      const stats = context.appointmentStats;
      prompt += `\n\n📊 Текущая статистика записей:`;
      prompt += `\n   - Записей на сегодня: ${stats.todayCount}`;
      prompt += `\n   - Записей на завтра: ${stats.tomorrowCount}`;
      prompt += `\n   - Записей на неделю: ${stats.weekCount}`;
      prompt += `\n   - Всего предстоящих: ${stats.totalUpcoming}`;
      
      if (stats.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0) {
        prompt += `\n   - Статусы записей:`;
        Object.entries(stats.statusBreakdown).forEach(([status, count]) => {
          const statusText = this.getStatusText(status);
          prompt += `\n     * ${statusText}: ${count}`;
        });
      }
    }
    
    // Добавляем текущее время
    if (context.currentDateTime) {
      const now = new Date(context.currentDateTime);
      const currentTime = now.toLocaleString('ru-RU');
      prompt += `\n\n🕐 Текущее время: ${currentTime}`;
    }
    
    // Добавляем инструкции по поведению из конфигурации
    if (context.behaviorInstructions) {
      prompt += `\n\n🎯 Инструкции для общения с клиентами:\n${context.behaviorInstructions}`;
    } else {
      // Дефолтные инструкции если не настроены в UI
      prompt += `\n\n🎯 Инструкции для общения с клиентами:\n`;
      prompt += `- Будь вежливым, профессиональным и полезным\n`;
      prompt += `- Всегда используй актуальную информацию о свободных слотах\n`;
      prompt += `- Если клиент спрашивает о записи, покажи ближайшие доступные слоты\n`;
      prompt += `- Если нет свободных слотов, предложи альтернативные даты или услуги\n`;
      prompt += `- Объясняй статусы записей (подтверждена, ожидает подтверждения, отменена)\n`;
      prompt += `- Если клиент хочет записаться, направь его к боту командой /start\n`;
      prompt += `- Отвечай кратко, но информативно\n`;
      prompt += `- Если клиент просит поговорить с кем-то или нужна помощь, предложи связаться по телефону или email\n`;
      prompt += `- Всегда предоставляй контактную информацию когда клиент просит "позвонить", "связаться", "поговорить с кем-то"\n`;
      prompt += `- Если не знаешь ответа, предложи связаться по телефону или email\n`;
      prompt += `- Всегда учитывай часы работы организации при предложении времени\n`;
      prompt += `- При вопросах о ценах всегда указывай актуальную стоимость услуг`;
    }
    
    return prompt;
  }

  // Получить читаемый текст статуса
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'confirmed': 'Подтверждена',
      'pending': 'Ожидает подтверждения',
      'cancelled': 'Отменена',
      'completed': 'Завершена',
      'no_show': 'Клиент не пришел'
    };
    return statusMap[status] || status;
  }

  protected calculateTokens(text: string): number {
    // Простая оценка токенов (примерно 4 символа = 1 токен)
    return Math.ceil(text.length / 4);
  }

  protected createResponse(
    content: string, 
    model: string, 
    provider: string, 
    inputTokens?: number, 
    outputTokens?: number
  ): AIResponse {
    const response: AIResponse = {
      content,
      model,
      provider
    };

    if (inputTokens !== undefined && outputTokens !== undefined) {
      response.usage = {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens
      };
    }

    return response;
  }
}
