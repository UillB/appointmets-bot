import { prisma } from '../prisma';
import { OpenAIProvider } from './openai-provider';
import { TestProvider } from './test-provider';
import { BaseAIProvider } from './base-provider';
import { 
  AIConversation, 
  AIResponse, 
  AIConfig, 
  OrganizationAIConfig,
  AIScenario 
} from './types';

export class AIService {
  private providers: Map<string, BaseAIProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  // Базовые промпты для основных функций бота
  private getDefaultSystemPrompts() {
    return {
      baseSystemPrompt: `You are an AI assistant for a service organization. Your main task is to help clients with service bookings and answer their questions.

MAIN FUNCTIONS:
1. 📋 Service Information - provide details about prices, duration, service descriptions
2. 🏢 Organization Information - answer questions about name, working hours, address, contacts
3. 📅 Availability Check - show available time slots by dates
4. ✅ Booking Confirmation - help clients book services
5. 📝 View Appointments - show client's existing appointments
6. ❌ Cancel Appointments - help cancel appointments when requested

BEHAVIOR RULES:
- Be polite, professional and helpful
- Answer briefly but informatively
- Always use current information about available slots
- If you don't know the answer, suggest contacting by phone
- IMPORTANT: Always respond in the same language the client is using (Russian, English, Hebrew, etc.)
- Use emojis for better perception
- Always confirm booking details before final confirmation
- Be patient with clients who ask many questions

CONTEXT USAGE:
- Always use current information about available slots
- When client asks about booking, show nearest available slots
- Consider organization working hours when suggesting slots
- Check time conflicts between slots of different services
- Provide accurate information about prices and service duration`,

      contextInstructions: `ORGANIZATION CONTEXT:
- Always use current information about available slots
- When client asks about booking, show nearest available slots
- Consider organization working hours when suggesting slots
- Check time conflicts between slots of different services
- Provide accurate information about prices and service duration`,

      behaviorInstructions: `BEHAVIOR RULES:
- Be polite, professional and helpful
- Answer briefly but informatively
- Use emojis for better perception
- If you don't know the answer, suggest contacting by phone
- Always confirm booking details before final confirmation
- Be patient with clients who ask many questions
- IMPORTANT: Always respond in the same language the client is using`,

      fallbackPrompt: `Thank you for your question! I can help you with service bookings or answer questions about our organization.

If I don't have a precise answer to your question, I recommend contacting us directly by phone or visiting us in person.

How else can I help you?`
    };
  }

  private initializeProviders() {
    // Регистрируем OpenAI провайдер
    this.providers.set('openai', new OpenAIProvider({} as AIConfig));
    // Регистрируем тестовый провайдер
    this.providers.set('custom', new TestProvider({} as AIConfig));
  }

  // Получить конфигурацию AI для организации
  async getOrganizationAIConfig(organizationId: number): Promise<OrganizationAIConfig | null> {
    try {
      const config = await (prisma as any).organizationAIConfig.findUnique({
        where: { organizationId }
      });

      if (!config) {
        return null;
      }

      return {
        organizationId: config.organizationId,
        provider: config.provider as 'openai' | 'claude' | 'custom',
        apiKey: config.apiKey,
        model: config.model,
        maxTokens: config.maxTokens || undefined,
        temperature: config.temperature || undefined,
        systemPrompt: config.systemPrompt || undefined,
        baseSystemPrompt: config.baseSystemPrompt || undefined,
        contextInstructions: config.contextInstructions || undefined,
        behaviorInstructions: config.behaviorInstructions || undefined,
        fallbackPrompt: config.fallbackPrompt || undefined,
        enabled: config.enabled,
        customPrompts: config.customPrompts ? JSON.parse(config.customPrompts) : undefined
      };
    } catch (error) {
      console.error('Error getting organization AI config:', error);
      return null;
    }
  }

  // Сохранить конфигурацию AI для организации
  async saveOrganizationAIConfig(config: OrganizationAIConfig): Promise<void> {
    try {
      // Получаем базовые промпты по умолчанию
      const defaultPrompts = this.getDefaultSystemPrompts();
      
      // Если пользователь не указал кастомные промпты, используем базовые
      const finalConfig = {
        ...config,
        baseSystemPrompt: (config as any).baseSystemPrompt || defaultPrompts.baseSystemPrompt,
        contextInstructions: (config as any).contextInstructions || defaultPrompts.contextInstructions,
        behaviorInstructions: (config as any).behaviorInstructions || defaultPrompts.behaviorInstructions,
        fallbackPrompt: (config as any).fallbackPrompt || defaultPrompts.fallbackPrompt
      };

      await (prisma as any).organizationAIConfig.upsert({
        where: { organizationId: config.organizationId },
        update: {
          provider: finalConfig.provider,
          apiKey: finalConfig.apiKey,
          model: finalConfig.model,
          maxTokens: finalConfig.maxTokens,
          temperature: finalConfig.temperature,
          systemPrompt: finalConfig.systemPrompt,
          baseSystemPrompt: finalConfig.baseSystemPrompt,
          contextInstructions: finalConfig.contextInstructions,
          behaviorInstructions: finalConfig.behaviorInstructions,
          fallbackPrompt: finalConfig.fallbackPrompt,
          enabled: finalConfig.enabled,
          customPrompts: finalConfig.customPrompts ? JSON.stringify(finalConfig.customPrompts) : null
        },
        create: {
          organizationId: finalConfig.organizationId,
          provider: finalConfig.provider,
          apiKey: finalConfig.apiKey,
          model: finalConfig.model,
          maxTokens: finalConfig.maxTokens,
          temperature: finalConfig.temperature,
          systemPrompt: finalConfig.systemPrompt,
          baseSystemPrompt: finalConfig.baseSystemPrompt,
          contextInstructions: finalConfig.contextInstructions,
          behaviorInstructions: finalConfig.behaviorInstructions,
          fallbackPrompt: finalConfig.fallbackPrompt,
          enabled: finalConfig.enabled,
          customPrompts: finalConfig.customPrompts ? JSON.stringify(finalConfig.customPrompts) : null
        }
      });
    } catch (error) {
      console.error('Error saving organization AI config:', error);
      throw error;
    }
  }

  // Отправить сообщение через AI
  async sendMessage(
    organizationId: number, 
    conversation: AIConversation, 
    scenario?: AIScenario
  ): Promise<AIResponse> {
    try {
      const config = await this.getOrganizationAIConfig(organizationId);
      
      if (!config || !config.enabled) {
        throw new Error('AI is not configured or enabled for this organization');
      }

      const provider = this.providers.get(config.provider);
      if (!provider) {
        throw new Error(`AI provider '${config.provider}' is not supported`);
      }

      // ВСЕГДА получаем свежие данные организации для контекста (без кэширования)
      const organizationData = await this.getOrganizationContext(organizationId);
      
      // Добавляем контекст организации к разговору
      conversation.context = organizationData;

      // Применяем сценарий-специфичный промпт если есть
      if (scenario && config.customPrompts) {
        const scenarioKey = scenario.replace('_', '') as keyof typeof config.customPrompts;
        if (config.customPrompts[scenarioKey]) {
          conversation.messages.unshift({
            role: 'system',
            content: config.customPrompts[scenarioKey]!
          });
        }
      }

      // Создаем провайдер с конфигурацией организации
      const configuredProvider = this.createConfiguredProvider(config);
      
      const response = await configuredProvider.sendMessage(conversation, config.model);
      
      // Логируем использование после успешного ответа
      await this.logUsage(
        organizationId,
        response.usage?.totalTokens || 0,
        scenario,
        response.model
      );
      
      return response;
    } catch (error) {
      console.error('Error sending AI message:', error);
      throw error;
    }
  }

  // Создать настроенный провайдер
  private createConfiguredProvider(config: OrganizationAIConfig): BaseAIProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'custom':
        return new TestProvider(config);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  // Проверить валидность API ключа
  async validateApiKey(provider: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const providerInstance = this.providers.get(provider);
      if (!providerInstance) {
        return { valid: false, error: `Provider '${provider}' not supported` };
      }

      // Создаем временный провайдер для проверки
      const tempConfig: AIConfig = {
        provider: provider as any,
        apiKey,
        model: 'gpt-4o-mini',
        enabled: true
      };

      const tempProvider = this.createConfiguredProvider(tempConfig as OrganizationAIConfig);
      
      if (provider === 'openai' && tempProvider instanceof OpenAIProvider) {
        return await tempProvider.checkApiKey();
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Получить доступные модели для провайдера
  async getAvailableModels(provider: string, apiKey?: string): Promise<string[]> {
    try {
      const providerInstance = this.providers.get(provider);
      if (!providerInstance) {
        return [];
      }

      if (provider === 'openai' && apiKey) {
        const tempConfig: AIConfig = {
          provider: 'openai',
          apiKey,
          model: 'gpt-4o-mini',
          enabled: true
        };
        const tempProvider = new OpenAIProvider(tempConfig);
        return await tempProvider.getAvailableModels();
      }

      return providerInstance.models;
    } catch (error) {
      console.error('Error getting available models:', error);
      const providerInstance = this.providers.get(provider);
      return providerInstance?.models || [];
    }
  }

  // Получить статистику использования AI для организации
  async getUsageStats(organizationId: number, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await (prisma as any).aIUsageLog.findMany({
        where: {
          organizationId,
          createdAt: {
            gte: startDate
          }
        },
        select: {
          tokensUsed: true,
          createdAt: true,
          scenario: true
        }
      });

      return {
        totalRequests: stats.length,
        totalTokens: stats.reduce((sum: number, stat: any) => sum + (stat.tokensUsed || 0), 0),
        averageTokensPerRequest: stats.length > 0 ? 
          stats.reduce((sum: number, stat: any) => sum + (stat.tokensUsed || 0), 0) / stats.length : 0,
        requestsByScenario: stats.reduce((acc: Record<string, number>, stat: any) => {
          const scenario = stat.scenario || 'unknown';
          acc[scenario] = (acc[scenario] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return null;
    }
  }

  // Логировать использование AI
  async logUsage(
    organizationId: number, 
    tokensUsed: number, 
    scenario?: AIScenario,
    model?: string
  ): Promise<void> {
    try {
      await (prisma as any).aIUsageLog.create({
        data: {
          organizationId,
          tokensUsed,
          scenario,
          model,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging AI usage:', error);
      // Не выбрасываем ошибку, так как это не критично
    }
  }

  // Получить контекст организации для AI
  private async getOrganizationContext(organizationId: number): Promise<any> {
    try {
      console.log(`🔄 Getting organization context for orgId: ${organizationId} at ${new Date().toISOString()}`);
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          services: {
            include: {
              slots: {
                include: {
                  bookings: {
                    select: {
                      id: true,
                      chatId: true,
                      status: true,
                      createdAt: true
                    }
                  }
                },
                where: {
                  startAt: {
                    gte: new Date() // Только будущие слоты
                  }
                },
                orderBy: {
                  startAt: 'asc'
                }
              }
            }
          }
        }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      // Получаем все активные записи в организации для проверки конфликтов (как в bookingInline.ts)
      const activeAppointments = await prisma.appointment.findMany({
        where: {
          service: {
            organizationId: organizationId
          },
          status: { not: 'cancelled' } // не учитываем отмененные записи
        },
        include: {
          slot: true,
          service: true
        }
      });

      // Обрабатываем слоты и записи с учетом пересечений
      const servicesWithSlots = organization.services.map(service => {
        const slots = service.slots.map(slot => {
          const isBooked = slot.bookings.length > 0;
          const appointment = slot.bookings[0]; // Предполагаем, что в слоте одна запись
          
          // Проверяем пересечения с активными записями (как в bookingInline.ts)
          const slotStart = new Date(slot.startAt);
          const slotEnd = new Date(slot.endAt);
          
          let hasTimeConflict = false;
          for (const activeAppointment of activeAppointments) {
            const appointmentStart = new Date(activeAppointment.slot.startAt);
            const appointmentEnd = new Date(activeAppointment.slot.endAt);
            
            // Проверяем пересечение времени
            if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
              hasTimeConflict = true;
              
              // Логируем для отладки
              console.log(`🚨 Time conflict detected:`, {
                slotId: slot.id,
                slotTime: `${slotStart.toISOString()} - ${slotEnd.toISOString()}`,
                appointmentId: activeAppointment.id,
                appointmentTime: `${appointmentStart.toISOString()} - ${appointmentEnd.toISOString()}`,
                serviceName: service.nameRu || service.name
              });
              break;
            }
          }
          
          // Слот недоступен если он занят ИЛИ есть конфликт времени
          const isAvailable = !isBooked && !hasTimeConflict;
          
          // Логируем состояние слота для отладки
          const slotDate = new Date(slot.startAt);
          if (slotDate.getDate() === 22 && slotDate.getMonth() === 9 && slotDate.getFullYear() === 2025) { // 22.10.2025
            console.log(`🔍 Slot analysis for 22.10.2025:`, {
              slotId: slot.id,
              startAt: slot.startAt,
              endAt: slot.endAt,
              isBooked: isBooked,
              hasTimeConflict: hasTimeConflict,
              isAvailable: isAvailable,
              bookingsCount: slot.bookings.length,
              serviceName: service.nameRu || service.name
            });
          }
          
          return {
            id: slot.id,
            startAt: slot.startAt,
            endAt: slot.endAt,
            isAvailable: isAvailable,
            isBooked: isBooked,
            hasTimeConflict: hasTimeConflict,
            appointment: appointment ? {
              status: appointment.status,
              createdAt: appointment.createdAt
            } : null,
            capacity: slot.capacity,
            availableSpots: isAvailable ? slot.capacity - slot.bookings.length : 0
          };
        });

        // Группируем слоты по дням
        const slotsByDay = this.groupSlotsByDay(slots);
        
        return {
          id: service.id,
          name: service.nameRu || service.name,
          description: service.descriptionRu || service.description,
          duration: service.durationMin,
          price: (service as any).price,
          currency: (service as any).currency || 'RUB',
          priceFormatted: (service as any).price ? this.formatPrice((service as any).price, (service as any).currency || 'RUB') : null,
          slots: slots,
          slotsByDay: slotsByDay,
          totalSlots: slots.length,
          availableSlots: slots.filter(slot => slot.isAvailable).length,
          bookedSlots: slots.filter(slot => slot.isBooked).length
        };
      });

      // Получаем статистику по записям
      const appointmentStats = await this.getAppointmentStats(organizationId);

      // Получаем AI конфигурацию для добавления промптов в контекст
      const aiConfig = await this.getOrganizationAIConfig(organizationId);

      return {
        organizationName: organization.name,
        description: (organization as any).description,
        address: (organization as any).address,
        workingHours: (organization as any).workingHours,
        phone: (organization as any).phone,
        email: (organization as any).email,
        services: servicesWithSlots,
        appointmentStats: appointmentStats,
        currentDateTime: new Date().toISOString(),
        // Добавляем промпты из AI конфигурации
        baseSystemPrompt: aiConfig?.baseSystemPrompt,
        systemPrompt: aiConfig?.systemPrompt, // Пользовательские инструкции
        contextInstructions: aiConfig?.contextInstructions,
        behaviorInstructions: aiConfig?.behaviorInstructions,
        fallbackPrompt: aiConfig?.fallbackPrompt
      };
    } catch (error) {
      console.error('Error getting organization context:', error);
      throw error;
    }
  }

  // Группировка слотов по дням
  private groupSlotsByDay(slots: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    slots.forEach(slot => {
      const date = slot.startAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    
    return grouped;
  }

  // Получить статистику по записям
  private async getAppointmentStats(organizationId: number): Promise<any> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Статистика по статусам
      const statusStats = await prisma.appointment.groupBy({
        by: ['status'],
        where: {
          service: {
            organizationId: organizationId
          },
          slot: {
            startAt: {
              gte: today
            }
          }
        },
        _count: {
          id: true
        }
      });

      // Записи на сегодня
      const todayAppointments = await prisma.appointment.count({
        where: {
          service: {
            organizationId: organizationId
          },
          slot: {
            startAt: {
              gte: today,
              lt: tomorrow
            }
          }
        }
      });

      // Записи на завтра
      const tomorrowAppointments = await prisma.appointment.count({
        where: {
          service: {
            organizationId: organizationId
          },
          slot: {
            startAt: {
              gte: tomorrow,
              lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }
      });

      // Записи на неделю
      const weekAppointments = await prisma.appointment.count({
        where: {
          service: {
            organizationId: organizationId
          },
          slot: {
            startAt: {
              gte: today,
              lt: nextWeek
            }
          }
        }
      });

      return {
        statusBreakdown: statusStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        todayCount: todayAppointments,
        tomorrowCount: tomorrowAppointments,
        weekCount: weekAppointments,
        totalUpcoming: statusStats.reduce((sum, stat) => sum + stat._count.id, 0)
      };
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      return {
        statusBreakdown: {},
        todayCount: 0,
        tomorrowCount: 0,
        weekCount: 0,
        totalUpcoming: 0
      };
    }
  }

  // Получить статистику использования AI
  async getAIUsageStats(organizationId: number, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const usageLogs = await (prisma as any).aIUsageLog.findMany({
        where: {
          organizationId: organizationId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const totalRequests = usageLogs.length;
      const totalTokens = usageLogs.reduce((sum: number, log: any) => sum + log.tokensUsed, 0);
      const averageTokensPerRequest = totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0;

      // Группируем по сценариям
      const requestsByScenario = usageLogs.reduce((acc: Record<string, number>, log: any) => {
        const scenario = log.scenario || 'unknown';
        acc[scenario] = (acc[scenario] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRequests,
        totalTokens,
        averageTokensPerRequest,
        requestsByScenario
      };
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return {
        totalRequests: 0,
        totalTokens: 0,
        averageTokensPerRequest: 0,
        requestsByScenario: {}
      };
    }
  }

  // Форматирование цены
  private formatPrice(price: number, currency: string): string {
    const currencySymbols: Record<string, string> = {
      'RUB': '₽',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };

    const symbol = currencySymbols[currency] || currency;
    
    if (currency === 'RUB') {
      return `${Math.round(price)} ${symbol}`;
    } else {
      return `${price.toFixed(2)} ${symbol}`;
    }
  }
}
