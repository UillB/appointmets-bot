import { Context, Markup, Telegraf } from "telegraf";
import { ENV } from "../../lib/env";
import { prisma } from "../../lib/prisma";
import jwt from 'jsonwebtoken';

// Import adminLinkTokens from bot-management route
// Note: This is a workaround - in production consider using Redis or database
let adminLinkTokens: Map<string, { userId: number; organizationId: number; expiresAt: number }> | null = null;

// Function to get adminLinkTokens (will be set by bot-manager)
export function setAdminLinkTokensMap(tokensMap: Map<string, { userId: number; organizationId: number; expiresAt: number }>) {
  adminLinkTokens = tokensMap;
}

export const handleStart = (organizationId?: number) => async (ctx: Context) => {
  // deep link: /start link_<token> → привязка админа
  // Получаем payload из команды /start <payload>
  let payload: string | undefined;
  
  // Логируем весь контекст для отладки
  console.log(`🔗 [Org ${organizationId || 'unknown'}] ========== START COMMAND RECEIVED ==========`);
  console.log(`🔗 [Org ${organizationId || 'unknown'}] Update ID: ${ctx.update.update_id}`);
  console.log(`🔗 [Org ${organizationId || 'unknown'}] Update Type: ${ctx.updateType}`);
  
  // Проверяем все возможные способы получения параметра
  const startParam = (ctx as any).startParam;
  const startPayload = (ctx as any).startPayload;
  const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : null;
  const match = (ctx as any).match;
  
  console.log(`🔗 [Org ${organizationId || 'unknown'}] startParam:`, startParam || 'undefined');
  console.log(`🔗 [Org ${organizationId || 'unknown'}] startPayload:`, startPayload || 'undefined');
  console.log(`🔗 [Org ${organizationId || 'unknown'}] message.text:`, messageText || 'undefined');
  console.log(`🔗 [Org ${organizationId || 'unknown'}] match:`, match ? JSON.stringify(match) : 'undefined');
  
  // Если есть message, логируем его полностью
  if (ctx.message && 'text' in ctx.message) {
    console.log(`🔗 [Org ${organizationId || 'unknown'}] Full message text: "${ctx.message.text}"`);
    if ((ctx.message as any).entities) {
      console.log(`🔗 [Org ${organizationId || 'unknown'}] Message entities:`, JSON.stringify((ctx.message as any).entities));
    }
  }
  
  // Способ 1: через startParam (Telegraf 4.x) - это правильный способ для deep links
  // В Telegraf при открытии ссылки https://t.me/bot?start=param параметр доступен через startParam
  if (startParam) {
    payload = startParam as string;
    console.log(`🔗 [Org ${organizationId || 'unknown'}] ✅ Got payload from startParam:`, payload.substring(0, 50) + '...');
  }
  // Способ 2: через startPayload (старый способ, может работать в некоторых версиях)
  else if (startPayload) {
    payload = startPayload as string;
    console.log(`🔗 [Org ${organizationId || 'unknown'}] ✅ Got payload from startPayload:`, payload.substring(0, 50) + '...');
  }
  // Способ 3: через match (если используется regex, например hears)
  else if (match && Array.isArray(match) && match[1]) {
    payload = match[1] as string;
    console.log(`🔗 [Org ${organizationId || 'unknown'}] ✅ Got payload from match:`, payload.substring(0, 50) + '...');
  }
  // Способ 4: через message.text (самый надежный способ - всегда работает)
  // Когда пользователь открывает ссылку, Telegram отправляет команду /start <payload>
  else if (messageText) {
    console.log(`🔗 [Org ${organizationId || 'unknown'}] Processing messageText: "${messageText}"`);
    // Проверяем формат /start <payload>
    if (messageText.startsWith('/start ')) {
      payload = messageText.substring(7).trim(); // Убираем '/start '
      console.log(`🔗 [Org ${organizationId || 'unknown'}] ✅ Got payload from message.text:`, payload.substring(0, 50) + '...');
    } else if (messageText === '/start') {
      console.log(`🔗 [Org ${organizationId || 'unknown'}] ⚠️ Received /start without payload`);
    } else {
      console.log(`🔗 [Org ${organizationId || 'unknown'}] ⚠️ Message text doesn't match /start pattern`);
    }
  }
  // Способ 5: напрямую из update объекта (последняя попытка)
  else if (ctx.update && 'message' in ctx.update && ctx.update.message && 'text' in ctx.update.message) {
    const text = ctx.update.message.text;
    if (text && text.startsWith('/start ')) {
      payload = text.substring(7).trim();
      console.log(`🔗 [Org ${organizationId || 'unknown'}] ✅ Got payload from update.message.text:`, payload.substring(0, 50) + '...');
    }
  }
  
  if (!payload) {
    console.log(`🔗 [Org ${organizationId || 'unknown'}] ⚠️ No payload found in any location!`);
  }
  
  console.log(`🔗 [Org ${organizationId || 'unknown'}] Final payload:`, payload || 'undefined');
  
  // Обрабатываем payload - теперь это короткий токен (8-12 символов)
  // Старый формат с JWT токенами тоже поддерживается для обратной совместимости
  let linkToken: string | undefined;
  let shortToken: string | undefined;
  
  if (payload) {
    // Проверяем длину токена
    if (payload.length <= 20) {
      // Короткий токен (новый формат)
      shortToken = payload;
      console.log(`🔗 [Org ${organizationId || 'unknown'}] Short token detected (${payload.length} chars): ${payload}`);
    } else if (payload.startsWith('link_')) {
      // Старый формат с префиксом link_
      linkToken = payload.replace('link_', '');
      console.log(`🔗 [Org ${organizationId || 'unknown'}] Payload has 'link_' prefix, extracted token`);
    } else if (payload.includes('.') && payload.startsWith('eyJ')) {
      // Старый формат JWT токен
      linkToken = payload;
      console.log(`🔗 [Org ${organizationId || 'unknown'}] Payload is JWT token without prefix, using as-is`);
    } else {
      console.log(`🔗 [Org ${organizationId || 'unknown'}] ⚠️ Unknown payload format: length=${payload.length}`);
    }
  }
  
  // Обрабатываем короткий токен (новый формат)
  if (shortToken && adminLinkTokens) {
    const telegramId = ctx.from?.id;
    
    console.log(`🔗 [Org ${organizationId || 'unknown'}] Processing admin link with short token: ${shortToken}, TelegramId: ${telegramId}`);
    
    if (!telegramId) {
      console.error(`❌ [Org ${organizationId || 'unknown'}] Admin link failed: Telegram ID is required`);
      await ctx.reply(ctx.tt("errors.telegramIdRequired") || "Telegram ID is required");
      return;
    }

    try {
      // Получаем данные токена из памяти
      const tokenData = adminLinkTokens.get(shortToken);
      
      if (!tokenData) {
        console.error(`❌ [Org ${organizationId || 'unknown'}] Short token not found: ${shortToken}`);
        await ctx.reply(ctx.tt("errors.invalidLinkToken") || "❌ Неверная ссылка. Пожалуйста, используйте правильную ссылку.");
        return;
      }

      // Проверяем срок действия токена
      if (tokenData.expiresAt < Date.now()) {
        console.error(`❌ [Org ${organizationId || 'unknown'}] Short token expired: ${shortToken}`);
        adminLinkTokens.delete(shortToken); // Удаляем истекший токен
        await ctx.reply(ctx.tt("errors.linkTokenExpired") || "❌ Ссылка истекла. Пожалуйста, сгенерируйте новую ссылку.");
        return;
      }

      const { userId, organizationId: tokenOrgId } = tokenData;
      console.log(`🔗 [Org ${organizationId || 'unknown'}] Token data found. UserId: ${userId}, OrgId: ${tokenOrgId}`);

      // Проверяем что пользователь существует и принадлежит правильной организации
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true, role: true }
      });

      if (!user) {
        await ctx.reply(ctx.tt("errors.invalidLinkToken") || "❌ User not found");
        return;
      }

      // Проверяем что organizationId из токена совпадает с organizationId пользователя
      if (user.organizationId !== tokenOrgId) {
        await ctx.reply(ctx.tt("errors.invalidLinkToken") || "❌ Invalid organization");
        return;
      }

      // Если organizationId передан в контексте бота, проверяем что он совпадает
      if (organizationId && organizationId !== tokenOrgId) {
        await ctx.reply(ctx.tt("errors.invalidLinkToken") || "❌ Invalid organization for this bot");
        return;
      }

      // Update user's telegramId
      await prisma.user.update({
        where: { id: userId },
        data: { telegramId: String(telegramId) }
      });

      // Удаляем использованный токен
      adminLinkTokens.delete(shortToken);

      console.log(`✅ [Org ${organizationId || tokenOrgId}] Admin link successful! User ${userId} linked to Telegram ${telegramId}`);

      await ctx.reply(
        ctx.tt("admin.linkSuccess") || "✅ Ваш Telegram аккаунт успешно привязан! Теперь вы можете использовать бота для управления записями.",
        Markup.inlineKeyboard([
          [Markup.button.callback("📅 " + (ctx.tt("menu.book") || "Записаться"), "main_book")],
          [Markup.button.callback("⚙️ " + (ctx.tt("menu.adminPanel") || "Админ панель"), "main_admin")]
        ])
      );
      
      // Emit WebSocket event for admin link
      try {
        const botEmitter = (global as any).botEmitter;
        if (botEmitter) {
          await botEmitter.emitAdminLinked(userId, tokenOrgId, telegramId);
        }
      } catch (wsError) {
        console.error('Failed to emit admin linked event:', wsError);
      }
      
      return;
    } catch (error: any) {
      console.error(`❌ [Org ${organizationId || 'unknown'}] Admin link error:`, error);
      await ctx.reply(ctx.tt("errors.linkFailed") || "❌ Ошибка при привязке аккаунта. Попробуйте позже.");
      return;
    }
  }
  
  // deep link: /start book_{serviceId} → сразу открыть календарь
  if (payload && /^book_(\d+)$/.test(payload)) {
    const serviceId = Number(payload.match(/^book_(\d+)$/)![1]);
    
    // Проверяем, что услуга принадлежит правильной организации
    if (organizationId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { organizationId: true }
      });
      
      if (!service || service.organizationId !== organizationId) {
        await ctx.reply(ctx.tt("errors.serviceNotFound"));
        return;
      }
    }
    
    const url = `${ENV.PUBLIC_BASE_URL}/webapp/calendar?serviceId=${serviceId}&cutoffMin=${ENV.BOOKING_CUTOFF_MIN}&lang=${ctx.lang}`;
    await ctx.reply(
      ctx.tt("book.openCalendar"),
      Markup.keyboard([[Markup.button.webApp("📆", url)]])
        .resize()
        .oneTime()
    );
    return;
  }

  // Обычное приветствие с главным меню
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("📅 " + ctx.tt("menu.book"), "main_book")],
    [Markup.button.callback("👀 " + ctx.tt("menu.viewSlots"), "main_slots")],
    [Markup.button.callback("📋 " + ctx.tt("menu.myAppointments"), "main_my")],
    [Markup.button.callback("⚙️ " + ctx.tt("menu.adminPanel"), "main_admin")],
    [Markup.button.callback("🌐 " + ctx.tt("menu.language"), "lang_menu")]
  ]);
  
  await ctx.reply(ctx.tt("start.welcome"), keyboard);
};

// /lang - показать кнопки выбора языка
export const handleLang = (organizationId?: number) => async (ctx: Context) => {
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  const arg = String(text || "").split(/\s+/)[1]?.toLowerCase();
  
  // Если передан аргумент, устанавливаем язык напрямую (для обратной совместимости)
  if (arg && ["ru", "en", "he", "de", "fr", "es", "pt", "ja", "zh", "ar"].includes(arg)) {
    // Сохраняем язык в сессии
    if (!ctx.session) ctx.session = {};
    (ctx.session as any).lang = arg;
    
    (ctx as any).lang = arg; // для текущего апдейта
    await ctx.reply(ctx.tt("lang.set", { lang: arg }));
    return;
  }
  
  // Показываем кнопки выбора языка
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
    [Markup.button.callback("🇺🇸 English", "lang_en")],
    [Markup.button.callback("🇮🇱 עברית", "lang_he")],
    [Markup.button.callback("🇩🇪 Deutsch", "lang_de")],
    [Markup.button.callback("🇫🇷 Français", "lang_fr")],
    [Markup.button.callback("🇪🇸 Español", "lang_es")],
    [Markup.button.callback("🇵🇹 Português", "lang_pt")],
    [Markup.button.callback("🇯🇵 日本語", "lang_ja")],
    [Markup.button.callback("🇨🇳 中文", "lang_zh")],
    [Markup.button.callback("🇸🇦 العربية", "lang_ar")]
  ]);
  
  await ctx.reply(ctx.tt("lang.choose"), keyboard);
};

// /help - показать справку
export const handleHelp = (organizationId?: number) => async (ctx: Context) => {
  const helpText = ctx.tt("help.text");
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("📅 " + ctx.tt("menu.book"), "main_book")],
    [Markup.button.callback("👀 " + ctx.tt("menu.viewSlots"), "main_slots")],
    [Markup.button.callback("📋 " + ctx.tt("menu.myAppointments"), "main_my")],
    [Markup.button.callback("🌐 " + ctx.tt("menu.language"), "lang_menu")]
  ]);
  
  await ctx.reply(helpText, keyboard);
};

// Регистрация callback обработчиков для главного меню и языка
export function registerLangCallbacks(bot: Telegraf, organizationId?: number) {
  // Главное меню - записаться
  bot.action("main_book", async (ctx) => {
    await ctx.answerCbQuery();
    // Импортируем обработчик записи
    const { handleBookingFlow } = await import("./bookingInline");
    await handleBookingFlow(organizationId)(ctx);
  });

  // Главное меню - посмотреть слоты
  bot.action("main_slots", async (ctx) => {
    await ctx.answerCbQuery();
    // Импортируем обработчик слотов
    const { handleSlots } = await import("./slots");
    await handleSlots(organizationId)(ctx);
  });

  // Главное меню - мои записи
  bot.action("main_my", async (ctx) => {
    await ctx.answerCbQuery();
    // Импортируем обработчик моих записей
    const { handleMy } = await import("./my");
    await handleMy(organizationId)(ctx);
  });
  // Показать меню выбора языка
  bot.action("lang_menu", async (ctx) => {
    await ctx.answerCbQuery();
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
      [Markup.button.callback("🇺🇸 English", "lang_en")],
      [Markup.button.callback("🇮🇱 עברית", "lang_he")],
      [Markup.button.callback("🇩🇪 Deutsch", "lang_de")],
      [Markup.button.callback("🇫🇷 Français", "lang_fr")],
      [Markup.button.callback("🇪🇸 Español", "lang_es")],
      [Markup.button.callback("🇵🇹 Português", "lang_pt")],
      [Markup.button.callback("🇯🇵 日本語", "lang_ja")],
      [Markup.button.callback("🇨🇳 中文", "lang_zh")],
      [Markup.button.callback("🇸🇦 العربية", "lang_ar")]
    ]);
    
    await ctx.editMessageText(ctx.tt("lang.choose"), keyboard);
  });

  // Выбор конкретного языка
  bot.action(/^lang_(ru|en|he|de|fr|es|pt|ja|zh|ar)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const lang = ctx.match[1] as "ru" | "en" | "he" | "de" | "fr" | "es" | "pt" | "ja" | "zh" | "ar";
    
    // Сохраняем язык в сессии
    if (!ctx.session) ctx.session = {};
    (ctx.session as any).lang = lang;
    
    // Устанавливаем язык для текущего контекста
    (ctx as any).lang = lang;
    
    // Отвечаем на выбранном языке
    const message = ctx.tt("lang.set", { lang });
    await ctx.editMessageText(message);
  });

  // Главное меню - админ панель
  bot.action("main_admin", async (ctx) => {
    await ctx.answerCbQuery();
    
    // Проверяем права: ищем пользователя по telegramId и organizationId
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      await ctx.reply(ctx.tt("admin.accessDenied"));
      return;
    }

    // Если organizationId не передан, ищем пользователя по telegramId (для совместимости)
    let user;
    if (organizationId) {
      user = await prisma.user.findFirst({
        where: {
          telegramId: String(telegramId),
          organizationId: organizationId
        }
      });
    } else {
      user = await prisma.user.findFirst({
        where: { telegramId: String(telegramId) }
      });
    }

    // Проверяем что пользователь существует, имеет telegramId и админскую роль
    if (!user || !user.telegramId || (user.role !== 'SUPER_ADMIN' && user.role !== 'OWNER' && user.role !== 'MANAGER')) {
      await ctx.reply(ctx.tt("admin.accessDenied"));
      return;
    }

    // Если organizationId передан, проверяем что пользователь принадлежит этой организации
    if (organizationId && user.organizationId !== organizationId) {
      await ctx.reply(ctx.tt("admin.accessDenied"));
      return;
    }

    const url = `${ENV.PUBLIC_BASE_URL}/webapp/admin?lang=${(ctx as any).lang || 'ru'}`;
    await ctx.reply(
      ctx.tt("admin.openPanel"),
      Markup.inlineKeyboard([[Markup.button.webApp("🔧 " + ctx.tt("admin.openPanel"), url)]])
    );
  });
}
