import { Context, MiddlewareFn } from "telegraf";
import { detectLang, t, Lang } from "../../i18n";

declare module "telegraf" {
  interface Context {
    lang: Lang;
    tt: (key: string, params?: Record<string, any>) => string;
  }
}

export const i18nMw: MiddlewareFn<Context> = async (ctx, next) => {
  // Сначала проверяем, есть ли сохраненный язык в сессии
  const savedLang = (ctx.session as any)?.lang;
  
  if (savedLang && ["ru", "en", "he", "de", "fr", "es", "pt"].includes(savedLang)) {
    // Используем сохраненный язык
    ctx.lang = savedLang as Lang;
  } else {
    // Определяем язык по language_code пользователя
    const code = ctx.from?.language_code;
    ctx.lang = detectLang(code);
  }
  
  ctx.tt = (key, params) => t(ctx.lang, key, params ?? {});
  return next();
};
