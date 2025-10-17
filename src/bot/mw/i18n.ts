import { Context, MiddlewareFn } from "telegraf";
import { detectLang, t, Lang } from "../../i18n";

declare module "telegraf" {
  interface Context {
    lang: Lang;
    tt: (key: string, params?: Record<string, any>) => string;
  }
}

export const i18nMw: MiddlewareFn<Context> = async (ctx, next) => {
  const session = ctx.session ?? ((ctx as any).session = {});
  const storedLang = session.lang;
  const detectedLang = detectLang(ctx.from?.language_code);
  const lang = storedLang ?? detectedLang;

  session.lang = lang;
  ctx.lang = lang;
  ctx.tt = (key, params) => t(ctx.lang, key, params ?? {});
  return next();
};
