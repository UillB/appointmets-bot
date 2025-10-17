import "telegraf";

import type { Lang } from "../i18n";

export type BotSession = {
  lang?: Lang;
  [key: string]: unknown;
};

declare module "telegraf" {
  interface Context {
    session?: BotSession;
  }
}

