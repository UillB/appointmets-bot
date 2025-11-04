import { Telegraf, session } from "telegraf";
import { PrismaClient } from '@prisma/client';
import { i18nMw } from "./mw/i18n";
import { handleStart, handleLang, handleHelp, registerLangCallbacks } from "./handlers/start";
import { handleBookingFlow, registerBookingCallbacks } from "./handlers/bookingInline";
import { handleMy, registerMyCallbacks } from "./handlers/my";
import { handleSlots, registerSlotsCallbacks } from "./handlers/slots";
import { registerWebappDataHandler } from "./handlers/webappData";
import { AIChatHandler } from "./handlers/ai-chat";

const prisma = new PrismaClient();

class BotManager {
  private bots: Map<string, Telegraf> = new Map();
  private aiHandlers: Map<number, AIChatHandler> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🤖 Initializing Bot Manager...');
    
    // Загружаем всех активных ботов из базы данных
    const organizations = await prisma.organization.findMany({
      where: {
        botToken: { not: null }
      }
    });

    for (const org of organizations) {
      if (org.botToken) {
        await this.addBot(org.botToken, org.id);
      }
    }

    this.isInitialized = true;
    console.log(`🤖 Bot Manager initialized with ${this.bots.size} bots`);
  }

  async addBot(token: string, organizationId: number) {
    try {
      // Проверяем, не запущен ли уже бот с этим токеном
      if (this.bots.has(token)) {
        console.log(`🤖 Bot with token ${token.slice(0, 10)}... already running`);
        return;
      }

      console.log(`🤖 Starting bot for organization ${organizationId}...`);
      
      const bot = new Telegraf(token);

      // Логгер с улучшенной информацией
      bot.use(async (ctx, next) => {
        const chatId = ctx.chat?.id || 'unknown';
        const userId = ctx.from?.id || 'unknown';
        console.log(`🤖 [Org ${organizationId}] [Chat:${chatId}] [User:${userId}] ${ctx.updateType}`);
        return next();
      });

      // Создаем AI хендлер для организации
      const aiHandler = new AIChatHandler();
      this.aiHandlers.set(organizationId, aiHandler);

      // Настраиваем бота
      await this.setupBot(bot, organizationId);

      // Запускаем бота с обработкой ошибок
      await bot.launch({
        dropPendingUpdates: true, // Игнорируем старые обновления
        allowedUpdates: ['message', 'callback_query'] // Только нужные типы обновлений
      });
      
      this.bots.set(token, bot);
      console.log(`✅ Bot for organization ${organizationId} started successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to start bot for organization ${organizationId}:`, error);
      // Если ошибка 409 (Conflict), пробуем остановить и перезапустить
      if (error.message?.includes('409') || error.message?.includes('Conflict')) {
        console.log(`🔄 Attempting to resolve conflict for organization ${organizationId}...`);
        await this.removeBot(token);
        // Небольшая задержка перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.addBot(token, organizationId);
      }
    }
  }

  async removeBot(token: string) {
    const bot = this.bots.get(token);
    if (bot) {
      try {
        await bot.stop();
        this.bots.delete(token);
        
        // Удаляем AI хендлер для этой организации
        const org = await prisma.organization.findFirst({
          where: { botToken: token }
        });
        if (org) {
          this.aiHandlers.delete(org.id);
        }
        
        console.log(`🤖 Bot with token ${token.slice(0, 10)}... stopped`);
      } catch (error) {
        console.error('❌ Error stopping bot:', error);
      }
    } else {
      console.log(`🤖 Bot with token ${token.slice(0, 10)}... not found in active bots`);
    }
  }

  async removeBotByOrganizationId(organizationId: number) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    });
    
    if (org?.botToken) {
      await this.removeBot(org.botToken);
    }
  }

  private async setupBot(bot: Telegraf, organizationId: number) {
      // Middleware
      bot.use(session());
      bot.use(i18nMw);

    // Команды
    bot.start(handleStart(organizationId));
    bot.command("help", handleHelp(organizationId));
    bot.command("lang", handleLang(organizationId));
    bot.command("book", handleBookingFlow(organizationId));
    bot.command("slots", handleSlots(organizationId));
    bot.command("my", handleMy(organizationId));
    
    // AI команды
    bot.command("ai", async (ctx) => {
      const aiHandler = this.aiHandlers.get(organizationId);
      if (aiHandler) {
        await aiHandler.handleAICommand(ctx, organizationId);
      }
    });

    // AI обработчик сообщений (для не-командных сообщений)
    bot.on('text', async (ctx) => {
      const aiHandler = this.aiHandlers.get(organizationId);
      if (aiHandler && ctx.message && 'text' in ctx.message) {
        const messageText = ctx.message.text;
        
        // Проверяем, не является ли это командой
        if (messageText.startsWith('/')) {
          return; // Пропускаем команды
        }
        
        // Проверяем, активирован ли AI для этой организации
        const isAIActivated = await aiHandler.isAIActivated(organizationId);
        if (isAIActivated) {
          await aiHandler.handleAIMessage(ctx, organizationId, messageText);
        }
      }
    });

    // Получаем username бота для диплинков СНАЧАЛА (синхронно)
    // Это важно для правильной регистрации booking callbacks
    let botUsername: string | null = null;
    try {
      const me = await bot.telegram.getMe();
      botUsername = me.username || null;
    } catch (error) {
      console.error(`❌ Failed to get bot username for organization ${organizationId}:`, error);
    }

    // Callbacks - регистрируем в правильном порядке
    // WebApp data handler должен быть ЗА регистрацией booking callbacks
    registerMyCallbacks(bot, organizationId);
    registerLangCallbacks(bot, organizationId);
    registerSlotsCallbacks(bot, organizationId);
    
    // Booking callbacks регистрируем СНАЧАЛА
    if (botUsername) {
      registerBookingCallbacks(bot, botUsername, organizationId);
    } else {
      // Если не получили username, пробуем через промис (fallback)
      bot.telegram.getMe().then((me) => {
        registerBookingCallbacks(bot, me.username!, organizationId);
      }).catch(err => {
        console.error(`❌ Failed to register booking callbacks for org ${organizationId}:`, err);
      });
    }
    
    // WebApp data handler регистрируем ПОСЛЕДНИМ (он должен обрабатывать web_app_data)
    registerWebappDataHandler(bot, organizationId);
  }

  async stopAll() {
    console.log('🤖 Stopping all bots...');
    for (const [token, bot] of this.bots) {
      try {
        await bot.stop();
        console.log(`🤖 Bot ${token.slice(0, 10)}... stopped`);
      } catch (error) {
        console.error('❌ Error stopping bot:', error);
      }
    }
    this.bots.clear();
  }

  getBotCount(): number {
    return this.bots.size;
  }

  getActiveTokens(): string[] {
    return Array.from(this.bots.keys());
  }

  getBotByToken(token: string): Telegraf | null {
    return this.bots.get(token) || null;
  }

  async getBotsInfo() {
    const organizations = await prisma.organization.findMany({
      where: {
        botToken: { not: null }
      },
      select: {
        id: true,
        name: true,
        botToken: true,
        botUsername: true
      }
    });

    return organizations.map(org => ({
      organizationId: org.id,
      organizationName: org.name,
      botToken: org.botToken ? `${org.botToken.slice(0, 10)}...` : null,
      botUsername: org.botUsername,
      isActive: org.botToken ? this.bots.has(org.botToken) : false
    }));
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeBotsCount: this.bots.size,
      activeTokens: this.getActiveTokens().map(token => `${token.slice(0, 10)}...`)
    };
  }

  // Получить AI хендлер для организации
  getAIHandler(organizationId: number): AIChatHandler | null {
    return this.aiHandlers.get(organizationId) || null;
  }

  // Проверить, активирован ли AI для организации
  async isAIActivated(organizationId: number): Promise<boolean> {
    const aiHandler = this.aiHandlers.get(organizationId);
    if (aiHandler) {
      return await aiHandler.isAIActivated(organizationId);
    }
    return false;
  }

  // Получить статистику AI для организации
  async getAIUsageStats(organizationId: number, days: number = 7): Promise<any> {
    const aiHandler = this.aiHandlers.get(organizationId);
    if (aiHandler) {
      return await aiHandler.getUsageStats(organizationId, days);
    }
    return null;
  }
}

// Создаем единственный экземпляр менеджера
export const botManager = new BotManager();
