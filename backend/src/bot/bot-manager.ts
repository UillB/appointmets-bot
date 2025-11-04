import { Telegraf, session } from "telegraf";
import { PrismaClient } from '@prisma/client';
import { i18nMw } from "./mw/i18n";
import { handleStart, handleLang, handleHelp, registerLangCallbacks, setAdminLinkTokensMap } from "./handlers/start";
import { adminLinkTokens } from "../api/routes/bot-management";
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
    if (this.isInitialized) {
      console.log('⚠️ Bot Manager already initialized, skipping');
      return;
    }
    
    console.log('🤖 Initializing Bot Manager...');
    
    // Загружаем всех активных ботов из базы данных
    const organizations = await prisma.organization.findMany({
      where: {
        botToken: { not: null }
      }
    });

    console.log(`📋 Found ${organizations.length} organizations with bot tokens`);

    for (const org of organizations) {
      if (org.botToken) {
        console.log(`📋 Processing organization ${org.id} (${org.name || 'unnamed'})`);
        await this.addBot(org.botToken, org.id);
      }
    }

    this.isInitialized = true;
    console.log(`✅ Bot Manager initialized with ${this.bots.size} bots`);
  }

  async addBot(token: string, organizationId: number): Promise<void> {
    try {
      console.log(`🔧 [Org ${organizationId}] addBot called, token: ${token.substring(0, 10)}...`);
      
      // Проверяем, не запущен ли уже бот с этим токеном
      if (this.bots.has(token)) {
        console.log(`⚠️ [Org ${organizationId}] Bot with token ${token.slice(0, 10)}... already running, skipping`);
        return;
      }

      console.log(`🚀 [Org ${organizationId}] Starting bot for organization ${organizationId}...`);
      
      const bot = new Telegraf(token);

      // Логгер с улучшенной информацией - логируем ВСЕ обновления
      bot.use(async (ctx, next) => {
        const chatId = ctx.chat?.id || 'unknown';
        const userId = ctx.from?.id || 'unknown';
        const updateType = ctx.updateType;
        
        // Логируем ВСЕ входящие обновления для диагностики
        console.log(`📥 [Org ${organizationId}] Received update: type=${updateType}, chatId=${chatId}, userId=${userId}, updateId=${ctx.update.update_id}`);
        
        // Детальное логирование для команд
        if (updateType === 'message' && ctx.message && 'text' in ctx.message) {
          const text = ctx.message.text || '';
          console.log(`🤖 [Org ${organizationId}] [Chat:${chatId}] [User:${userId}] Message: ${text.substring(0, 200)}`);
          
          // Если это команда /start, логируем весь update для отладки
          if (text.startsWith('/start')) {
            console.log(`🔗 [Org ${organizationId}] ========== /START COMMAND DETECTED ==========`);
            console.log(`🔗 [Org ${organizationId}] Full message text: "${text}"`);
            console.log(`🔗 [Org ${organizationId}] Update ID: ${ctx.update.update_id}`);
            console.log(`🔗 [Org ${organizationId}] Full update object:`, JSON.stringify(ctx.update, null, 2));
            
            // Проверяем все возможные способы получения payload
            const startPayload = (ctx as any).startPayload;
            const startParam = (ctx as any).startParam;
            console.log(`🔗 [Org ${organizationId}] ctx.startPayload:`, startPayload || 'undefined');
            console.log(`🔗 [Org ${organizationId}] ctx.startParam:`, startParam || 'undefined');
            
            // Если payload в тексте сообщения
            if (text.includes(' ')) {
              const parts = text.split(' ');
              console.log(`🔗 [Org ${organizationId}] Message parts (split by space):`, parts);
              if (parts.length > 1) {
                const payloadFromText = parts.slice(1).join(' ');
                console.log(`🔗 [Org ${organizationId}] Payload from text (after /start):`, payloadFromText);
                console.log(`🔗 [Org ${organizationId}] Payload length:`, payloadFromText.length);
                console.log(`🔗 [Org ${organizationId}] Payload starts with 'link_':`, payloadFromText.startsWith('link_'));
              }
            } else {
              console.log(`🔗 [Org ${organizationId}] ⚠️ /start command without parameters!`);
            }
          }
        } else if (updateType === 'callback_query') {
          const data = (ctx.callbackQuery && 'data' in ctx.callbackQuery) ? ctx.callbackQuery.data : 'N/A';
          console.log(`🤖 [Org ${organizationId}] [Chat:${chatId}] [User:${userId}] Callback: ${data}`);
        } else {
          // Логируем другие типы обновлений тоже
          console.log(`🤖 [Org ${organizationId}] [Chat:${chatId}] [User:${userId}] ${updateType}`);
        }
        
        return next();
      });

      // Создаем AI хендлер для организации
      const aiHandler = new AIChatHandler();
      this.aiHandlers.set(organizationId, aiHandler);

      // Настраиваем бота
      await this.setupBot(bot, organizationId);
      
      // Передаем adminLinkTokens в обработчик start
      setAdminLinkTokensMap(adminLinkTokens);

      // Сохраняем бота в мапу ДО запуска, чтобы избежать дубликатов
      this.bots.set(token, bot);
      
      // Проверяем валидность токена перед запуском
      try {
        console.log(`🔍 [Org ${organizationId}] Validating bot token...`);
        const me = await bot.telegram.getMe();
        console.log(`✅ [Org ${organizationId}] Bot token valid. Bot username: @${me.username}`);
      } catch (tokenError: any) {
        console.error(`❌ [Org ${organizationId}] Bot token validation failed:`, tokenError.message);
        this.bots.delete(token);
        return;
      }
      
      // Запускаем бота асинхронно, не блокируя основной поток
      // ВАЖНО: bot.launch() в polling режиме НЕ завершается - промис продолжает работать бесконечно
      // Это нормальное поведение - бот слушает обновления в фоне
      (async () => {
        try {
          console.log(`🚀 [Org ${organizationId}] Launching bot...`);
          console.log(`🚀 [Org ${organizationId}] Bot token (first 10): ${token.substring(0, 10)}...`);
          
          // Запускаем бота с обработкой ошибок
          // bot.launch() начинает polling и промис НЕ завершается - это нормально
          bot.launch({
            dropPendingUpdates: true, // Игнорируем старые обновления
            allowedUpdates: ['message', 'callback_query', 'inline_query'] // Добавляем inline_query для полноты
          }).catch((launchError: any) => {
            // Ошибки при запуске будут пойманы здесь
            console.error(`❌ [Org ${organizationId}] Bot launch error:`, launchError.message);
            console.error(`❌ [Org ${organizationId}] Launch error details:`, launchError);
            this.bots.delete(token);
          });
          
          // Даем боту немного времени для инициализации
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Проверяем что бот действительно запустился
          try {
            const botInfo = await bot.telegram.getMe();
            console.log(`✅ [Org ${organizationId}] Bot started successfully!`);
            console.log(`✅ [Org ${organizationId}] Bot info: @${botInfo.username} (${botInfo.first_name})`);
            console.log(`✅ [Org ${organizationId}] Bot is ready to receive messages`);
          } catch (infoError: any) {
            console.error(`❌ [Org ${organizationId}] Bot launch failed - cannot get bot info:`, infoError.message);
            this.bots.delete(token);
          }
        } catch (error: any) {
          console.error(`❌ [Org ${organizationId}] Failed to launch bot:`, error.message);
          console.error(`❌ [Org ${organizationId}] Error stack:`, error.stack);
          // Удаляем бота из мапы если запуск не удался
          this.bots.delete(token);
          // Не пробрасываем ошибку дальше - API должен продолжать работать
        }
      })();
      
      console.log(`✅ Bot for organization ${organizationId} queued for launch`);
      
    } catch (error: any) {
      console.error(`❌ Failed to start bot for organization ${organizationId}:`, error);
      // Если ошибка 409 (Conflict), пробуем остановить и перезапустить
      if (error?.message?.includes('409') || error?.message?.includes('Conflict')) {
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
    // Также обрабатываем /start с параметрами через hears (для надежности)
    bot.hears(/^\/start (.+)$/, handleStart(organizationId));
    bot.command("help", handleHelp(organizationId));
    bot.command("lang", handleLang(organizationId));
    bot.command("book", handleBookingFlow(organizationId));
    bot.command("slots", handleSlots(organizationId));
    bot.command("my", handleMy(organizationId));
    
    // Admin команда - только для админов
    bot.command("admin", async (ctx) => {
      const { isTelegramAdmin } = await import("./mw/isAdmin");
      const { ENV } = await import("../lib/env");
      
      const isAdmin = await isTelegramAdmin(ctx, organizationId);
      if (!isAdmin) {
        return; // isTelegramAdmin уже отправил сообщение об ошибке
      }

      const url = `${ENV.PUBLIC_BASE_URL}/webapp/admin?lang=${(ctx as any).lang || 'ru'}`;
      await ctx.reply(
        ctx.tt("admin.openPanel"),
        {
          reply_markup: {
            inline_keyboard: [[{ text: "🔧 " + ctx.tt("admin.openPanel"), web_app: { url } }]]
          }
        }
      );
    });
    
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
