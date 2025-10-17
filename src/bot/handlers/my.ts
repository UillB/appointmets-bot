import { Context, Markup, Telegraf } from "telegraf";
import { prisma } from "../../lib/prisma";

function fmt(dt: Date) {
  return new Date(dt).toLocaleString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** /my — показать ближайшие записи пользователя */
export function handleMy() {
  return async (ctx: Context) => {
    const chatId = String(ctx.chat?.id);
    const now = new Date();

    const appts = await prisma.appointment.findMany({
      where: { chatId, status: "confirmed" },
      include: { service: true, slot: true },
      orderBy: { slot: { startAt: "asc" } },
      take: 10,
    });

    if (!appts.length) {
      return ctx.reply("У вас нет активных записей.");
    }

    // Отправляем каждую запись отдельным сообщением с кнопкой “Отменить”
    for (const a of appts) {
      await ctx.reply(
        `🗓 ${a.service.name}\nВремя: ${fmt(a.slot.startAt)}`,
        Markup.inlineKeyboard([
          [Markup.button.callback("Отменить", `cancel_${a.id}`)],
        ])
      );
    }
  };
}

/** Регистрация колбэков отмены */
export function registerMyCallbacks(bot: Telegraf) {
  bot.action(/^cancel_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();

    const id = Number(ctx.match[1]);
    const chatId = String(ctx.chat?.id);

    // Проверяем, что запись принадлежит текущему пользователю
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { slot: true, service: true },
    });

    if (!appt || appt.chatId !== chatId) {
      return ctx.reply("Эта запись не найдена или вам не принадлежит.");
    }

    // Мягкая отмена (статус), можно и удалить
    await prisma.appointment.update({
      where: { id },
      data: { status: "cancelled" },
    });

    // Освобождать слот не нужно (у нас уникальность по slotId уже исключает двойную запись; удаление записи освободит)
    // Если хочешь именно удалять:
    // await prisma.appointment.delete({ where: { id } });

    await ctx.editMessageText(
      `❎ Запись отменена:\n${appt.service.name}\n${fmt(appt.slot.startAt)}`
    );
  });
}
