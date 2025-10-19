import { Telegraf, session } from "telegraf";
import { PrismaClient } from '@prisma/client';
import { i18nMw } from "./mw/i18n";
import { handleStart, handleLang, handleHelp, registerLangCallbacks } from "./handlers/start";
import { handleBookingFlow, registerBookingCallbacks } from "./handlers/bookingInline";
import { handleMy, registerMyCallbacks } from "./handlers/my";
import { handleSlots, registerSlotsCallbacks } from "./handlers/slots";
import { registerWebappDataHandler } from "./handlers/webappData";

const prisma = new PrismaClient();

class BotManager {
  private bots: Map<string, Telegraf> = new Map();
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

      // Настраиваем бота
      this.setupBot(bot, organizationId);

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

  private setupBot(bot: Telegraf, organizationId: number) {
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

    // Callbacks
    registerMyCallbacks(bot, organizationId);
    registerLangCallbacks(bot, organizationId);
    registerSlotsCallbacks(bot, organizationId);
    registerWebappDataHandler(bot, organizationId);

    // Получаем username бота для диплинков
    bot.telegram.getMe().then((me) => {
      registerBookingCallbacks(bot, me.username!, organizationId);
    });
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
}

// Создаем единственный экземпляр менеджера
export const botManager = new BotManager();
