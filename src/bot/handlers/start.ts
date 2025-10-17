import { Context, Markup, Telegraf } from "telegraf";
import { Lang } from "../../i18n";
import { ENV } from "../../lib/env";
import type { BotSession } from "../../types/telegraf";

const SUPPORTED_LANGS: Lang[] = ["ru", "en", "he"];
const LANG_FLAGS: Record<Lang, string> = {
  ru: "🇷🇺",
  en: "🇬🇧",
  he: "🇮🇱"
};

const ensureSession = (ctx: Context): BotSession => {
  if (!ctx.session) {
    ctx.session = {} as BotSession;
  }
  return ctx.session as BotSession;
};

const buildLanguageKeyboard = (ctx: Context, active: Lang) =>
  Markup.inlineKeyboard(
    SUPPORTED_LANGS.map((code) => [
      Markup.button.callback(
        `${code === active ? "✅ " : ""}${LANG_FLAGS[code]} ${ctx.tt(`lang.names.${code}`)}`,
        `lang:${code}`
      )
    ])
  );

const SUPPORTED_LANGS: Lang[] = ["ru", "en", "he"];
const LANG_FLAGS: Record<Lang, string> = {
  ru: "🇷🇺",
  en: "🇬🇧",
  he: "🇮🇱"
};

const ensureSession = (ctx: Context) => ctx.session ?? ((ctx as any).session = {});

const buildLanguageKeyboard = (ctx: Context, active: Lang) =>
  Markup.inlineKeyboard(
    SUPPORTED_LANGS.map((code) => [
      Markup.button.callback(
        `${code === active ? "✅ " : ""}${LANG_FLAGS[code]} ${ctx.tt(`lang.names.${code}`)}`,
        `lang:${code}`
      )
    ])
  );

export const handleStart = () => async (ctx: Context) => {
  await ctx.reply(ctx.tt("start.welcome"));

  // deep link: /start book_{serviceId} → сразу открыть календарь
  const payload = (ctx as any).startPayload as string | undefined;
  if (payload && /^book_(\d+)$/.test(payload)) {
    const serviceId = Number(payload.match(/^book_(\d+)$/)![1]);
    const url = `${ENV.PUBLIC_BASE_URL}/webapp/calendar?serviceId=${serviceId}&cutoffMin=${ENV.BOOKING_CUTOFF_MIN}`;
    await ctx.reply(
      ctx.tt("book.openCalendar"),
      Markup.keyboard([[Markup.button.webApp("📆", url)]])
        .resize()
        .oneTime()
    );
  }
};

// /lang ru|en|he
export const handleLang = () => async (ctx: Context) => {
  const text = ctx.message && "text" in ctx.message ? ctx.message.text : "";
  const arg = String(text || "").split(/\s+/)[1]?.toLowerCase();
  const currentLang = (ctx.session?.lang as Lang | undefined) ?? ctx.lang;

  if (arg && SUPPORTED_LANGS.includes(arg as Lang)) {
    const session = ensureSession(ctx);
    const lang = arg as Lang;
    session.lang = lang;
    ctx.lang = lang; // применяем сразу для ответа

    await ctx.reply(
      ctx.tt("lang.set", { lang: ctx.tt(`lang.names.${lang}`) })
    );
    return;
  }

  if (arg && !SUPPORTED_LANGS.includes(arg as Lang)) {
    await ctx.reply(
      `${ctx.tt("lang.usage")}\n${ctx.tt("lang.choose")}`,
      buildLanguageKeyboard(ctx, currentLang)
    );
    return;
  }

  await ctx.reply(
    `${ctx.tt("lang.current", { lang: ctx.tt(`lang.names.${currentLang}`) })}\n${ctx.tt("lang.choose")}`,
    buildLanguageKeyboard(ctx, currentLang)
  );
};

export const registerLangCallbacks = (bot: Telegraf) => {
  bot.action(/^lang:(ru|en|he)$/, async (ctx) => {
    const lang = ctx.match[1] as Lang;
    const session = ensureSession(ctx);
    session.lang = lang;
    ctx.lang = lang;

    await ctx.answerCbQuery(ctx.tt("lang.set", { lang: ctx.tt(`lang.names.${lang}`) }));

    const keyboard = buildLanguageKeyboard(ctx, lang);
    const message = ctx.tt("lang.current", { lang: ctx.tt(`lang.names.${lang}`) });

    try {
      await ctx.editMessageText(`${message}\n${ctx.tt("lang.choose")}`, keyboard);
    } catch {
      await ctx.reply(`${message}\n${ctx.tt("lang.choose")}`, keyboard);
    }
  });
};
