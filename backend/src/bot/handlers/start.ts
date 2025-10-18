import { Context, Markup, Telegraf } from "telegraf";
import { ENV } from "../../lib/env";

export const handleStart = () => async (ctx: Context) => {
  // deep link: /start book_{serviceId} → сразу открыть календарь
  const payload = (ctx as any).startPayload as string | undefined;
  if (payload && /^book_(\d+)$/.test(payload)) {
    const serviceId = Number(payload.match(/^book_(\d+)$/)![1]);
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
    [Markup.button.callback("🌐 " + ctx.tt("menu.language"), "lang_menu")]
  ]);
  
  await ctx.reply(ctx.tt("start.welcome"), keyboard);
};

// /lang - показать кнопки выбора языка
export const handleLang = () => async (ctx: Context) => {
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
export const handleHelp = () => async (ctx: Context) => {
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
export function registerLangCallbacks(bot: Telegraf) {
  // Главное меню - записаться
  bot.action("main_book", async (ctx) => {
    await ctx.answerCbQuery();
    // Импортируем обработчик записи
    const { handleBookingFlow } = await import("./bookingInline");
    await handleBookingFlow()(ctx);
  });

  // Главное меню - посмотреть слоты
  bot.action("main_slots", async (ctx) => {
    await ctx.answerCbQuery();
    // Импортируем обработчик слотов
    const { handleSlots } = await import("./slots");
    await handleSlots()(ctx);
  });

  // Главное меню - мои записи
  bot.action("main_my", async (ctx) => {
    await ctx.answerCbQuery();
    // Импортируем обработчик моих записей
    const { handleMy } = await import("./my");
    await handleMy()(ctx);
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
}
