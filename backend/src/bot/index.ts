import { Telegraf, session } from "telegraf";
import { ENV } from "../lib/env";
import { i18nMw } from "./mw/i18n";

import { handleStart, handleLang, handleHelp, registerLangCallbacks } from "./handlers/start";
import { handleBookingFlow, registerBookingCallbacks } from "./handlers/bookingInline";
import { handleMy, registerMyCallbacks } from "./handlers/my";
import { handleSlots, registerSlotsCallbacks } from "./handlers/slots";
import { registerWebappDataHandler } from "./handlers/webappData";

export function createBot() {
  const bot = new Telegraf(ENV.TELEGRAM_BOT_TOKEN);

  // Логгер (полезно оставлять)
  bot.use(async (ctx, next) => {
    console.log("UPDATE:", ctx.updateType, ctx.message ? Object.keys(ctx.message) : []);
    return next();
  });

  bot.use(session());
  bot.use(i18nMw);

  // команды
  bot.start(handleStart());
  bot.command("help", handleHelp());
  bot.command("lang", handleLang());
  bot.command("book", handleBookingFlow());
  bot.command("slots", handleSlots());
  bot.command("my", handleMy());

  // inline и webapp
  registerMyCallbacks(bot);
  registerLangCallbacks(bot);
  registerSlotsCallbacks(bot);
  registerWebappDataHandler(bot);

  // узнаём username бота → для диплинка из групп
  bot.telegram.getMe().then((me) => {
    registerBookingCallbacks(bot, me.username!);
  });

  return bot;
}
