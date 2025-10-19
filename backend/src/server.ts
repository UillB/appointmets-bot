import { ENV } from "./lib/env";
import { createApi } from "./api";
import { createBot } from "./bot";
import { botManager } from "./bot/bot-manager";

async function main() {
  const app = createApi();

  // 1) Сначала поднимем HTTP — чтобы /health работал в любом случае
  app.listen(ENV.PORT, "0.0.0.0", () => {
    console.log(`API on http://127.0.0.1:${ENV.PORT}`);
  });

  // 2) Инициализируем менеджер ботов
  try {
    await botManager.initialize();
    console.log("🤖 Bot Manager initialized successfully");
  } catch (e) {
    console.error("❌ Bot Manager initialization failed:", e);
  }

  // 3) Потом пытаемся запустить основной бота (если есть токен в env), но без падения процесса
  // ОТКЛЮЧЕНО: используем только BotManager для управления ботами
  if (false && ENV.BOT_MODE !== "disabled" && ENV.TELEGRAM_BOT_TOKEN) {
    try {
      const bot = createBot();

      if (ENV.BOT_MODE === "polling") {
        await bot.launch();
        console.log("Main bot launched in polling mode");
      } else {
        const path = "/bot/webhook";
        app.use(bot.webhookCallback(path));
        if (!ENV.PUBLIC_BASE_URL) {
          console.warn("PUBLIC_BASE_URL is empty — webhook won't be set.");
        } else {
          await bot.telegram.setWebhook(`${ENV.PUBLIC_BASE_URL}${path}`);
          console.log(`Main bot webhook set to ${ENV.PUBLIC_BASE_URL}${path}`);
        }
      }
    } catch (e) {
      console.error("Main bot init failed — API keeps running.", e);
      // Don't exit the process, just log the error
    }
  } else {
    console.log("Main bot mode is disabled — using Bot Manager only");
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
