import ru from "./lang/ru.json";
import en from "./lang/en.json";
import he from "./lang/he.json";

export type Lang = "ru" | "en" | "he";
const dict: Record<Lang, any> = { ru, en, he };

export function detectLang(code?: string): Lang {
  if (!code) return "ru";
  const c = code.toLowerCase();
  if (c.startsWith("he")) return "he";
  if (c.startsWith("en")) return "en";
  if (c.startsWith("ru")) return "ru";
  return "en";
}

export function t(lang: Lang, key: string, params: Record<string, any> = {}) {
  const val = key.split(".").reduce((o: any, k: string) => (o ? o[k] : undefined), dict[lang]) ?? key;
  return String(val).replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? `{${k}}`));
}
