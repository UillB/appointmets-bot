# src/bot/handlers/start.ts

```ts
import { Context, Markup } from "telegraf";
import { ENV } from "../../lib/env";

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
  if (!arg || !["ru", "en", "he"].includes(arg)) {
    return ctx.reply(ctx.tt("lang.usage"));
  }
  (ctx as any).lang = arg; // для текущего апдейта
  await ctx.reply(ctx.tt("lang.set", { lang: arg }));
};

```
