# src/server.ts

```ts
import { ENV } from "./lib/env";
import { createApi } from "./api";
import { createBot } from "./bot";

async function main() {
  const app = createApi();

  // 1) Сначала поднимем HTTP — чтобы /health работал в любом случае
  app.listen(ENV.PORT, "0.0.0.0", () => {
    console.log(`API on http://127.0.0.1:${ENV.PORT}`);
  });

  // 2) Потом пытаемся запустить бота, но без падения процесса
  try {
    const bot = createBot();

    if (ENV.BOT_MODE === "polling") {
      await bot.launch();
      console.log("Bot launched in polling mode");
    } else {
      const path = "/bot/webhook";
      app.use(bot.webhookCallback(path));
      if (!ENV.PUBLIC_BASE_URL) {
        console.warn("PUBLIC_BASE_URL is empty — webhook won't be set.");
      } else {
        await bot.telegram.setWebhook(`${ENV.PUBLIC_BASE_URL}${path}`);
        console.log(`Bot webhook set to ${ENV.PUBLIC_BASE_URL}${path}`);
      }
    }
  } catch (e) {
    console.error("Bot init failed — API keeps running.", e);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

```
