import { Telegraf } from "telegraf";
import { ENV } from "../src/lib/env";

async function setBotCommands() {
  console.log("🤖 Настройка команд бота...");
  
  const bot = new Telegraf(ENV.TELEGRAM_BOT_TOKEN);
  
  const commands = [
    { command: "start", description: "🚀 Начать работу с ботом" },
    { command: "help", description: "❓ Показать справку по командам" },
    { command: "book", description: "📅 Записаться на приём" },
    { command: "slots", description: "👀 Посмотреть доступные слоты" },
    { command: "my", description: "📋 Мои записи" },
    { command: "lang", description: "🌐 Сменить язык" }
  ];
  
  try {
    await bot.telegram.setMyCommands(commands);
    console.log("✅ Команды бота успешно настроены!");
    console.log("\n📋 Установленные команды:");
    commands.forEach(cmd => {
      console.log(`  /${cmd.command} - ${cmd.description}`);
    });
  } catch (error) {
    console.error("❌ Ошибка при настройке команд:", error);
  }
  
  await bot.stop();
}

setBotCommands()
  .catch(console.error)
  .finally(() => process.exit(0));

