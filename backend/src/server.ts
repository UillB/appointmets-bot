import { ENV } from "./lib/env";
import { createApi } from "./api";
import { createBot } from "./bot";
import { botManager } from "./bot/bot-manager";
import { createServer } from "http";
import { WebSocketManager } from "./websocket/server";
import { AppointmentEmitter, ServiceEmitter, BotEmitter } from "./websocket/emitters";

// Global WebSocket manager instance
let wsManager: WebSocketManager;
let appointmentEmitter: AppointmentEmitter;
let serviceEmitter: ServiceEmitter;
let botEmitter: BotEmitter;

async function main() {
  const app = createApi();
  const server = createServer(app);

  // Initialize WebSocket server
  wsManager = new WebSocketManager(server);
  appointmentEmitter = new AppointmentEmitter(wsManager);
  serviceEmitter = new ServiceEmitter(wsManager);
  botEmitter = new BotEmitter(wsManager);

  // Make emitters globally available
  (global as any).wsManager = wsManager;
  (global as any).appointmentEmitter = appointmentEmitter;
  (global as any).serviceEmitter = serviceEmitter;
  (global as any).botEmitter = botEmitter;

  // 1) Сначала поднимем HTTP — чтобы /health работал в любом случае
  await new Promise<void>((resolve) => {
    server.listen(ENV.PORT, "0.0.0.0", () => {
      console.log(`API on http://127.0.0.1:${ENV.PORT}`);
      console.log(`WebSocket server running on ws://127.0.0.1:${ENV.PORT}/ws`);
      resolve();
    });
  });

  // 2) Инициализируем менеджер ботов (асинхронно, не блокируем сервер)
  // Используем setTimeout чтобы гарантировать, что сервер запустится первым
  setImmediate(() => {
    botManager.initialize().then(() => {
      console.log("🤖 Bot Manager initialized successfully");
    }).catch((e) => {
      console.error("❌ Bot Manager initialization failed:", e);
      // Не падаем, продолжаем работать
    });
  });

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
