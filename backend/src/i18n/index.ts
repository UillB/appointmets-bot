import ru from "./lang/ru.json";
import en from "./lang/en.json";
import he from "./lang/he.json";
import de from "./lang/de.json";
import fr from "./lang/fr.json";
import es from "./lang/es.json";
import pt from "./lang/pt.json";

export type Lang = "ru" | "en" | "he" | "de" | "fr" | "es" | "pt";
const dict: Record<Lang, any> = { ru, en, he, de, fr, es, pt };

export function detectLang(code?: string): Lang {
  if (!code) return "ru";
  const c = code.toLowerCase();
  if (c.startsWith("he")) return "he";
  if (c.startsWith("de")) return "de";
  if (c.startsWith("fr")) return "fr";
  if (c.startsWith("es")) return "es";
  if (c.startsWith("pt")) return "pt";
  if (c.startsWith("en")) return "en";
  if (c.startsWith("ru")) return "ru";
  return "en";
}

export function t(lang: Lang, key: string, params: Record<string, any> = {}) {
  const val = key.split(".").reduce((o: any, k: string) => (o ? o[k] : undefined), dict[lang]) ?? key;
  return String(val).replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? `{${k}}`));
}
