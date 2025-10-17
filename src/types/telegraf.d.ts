import "telegraf";

import type { Lang } from "../i18n";

declare module "telegraf" {
  interface Context {
    session?: {
      lang?: Lang;
      [key: string]: unknown;
    };
  }
}

