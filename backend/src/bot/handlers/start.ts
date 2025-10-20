import { Context, Markup, Telegraf } from "telegraf";
import { ENV } from "../../lib/env";
import { prisma } from "../../lib/prisma";

export const handleStart = (organizationId?: number) => async (ctx: Context) => {
  // deep link: /start book_{serviceId} → сразу открыть календарь
  const payload = (ctx as any).startPayload as string | undefined;
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
  if (arg && ["ru", "en", "he"].includes(arg)) {
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
    [Markup.button.callback("🇮🇱 עברית", "lang_he")]
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
      [Markup.button.callback("🇮🇱 עברית", "lang_he")]
    ]);
    
    await ctx.editMessageText(ctx.tt("lang.choose"), keyboard);
  });

  // Выбор конкретного языка
  bot.action(/^lang_(ru|en|he)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const lang = ctx.match[1] as "ru" | "en" | "he";
    
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
    // Проверяем права: ищем пользователя по telegramId
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      await ctx.reply(ctx.tt("admin.accessDenied"));
      return;
    }

    const user = await prisma.user.findFirst({ where: { telegramId: String(telegramId) } });
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'OWNER')) {
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
