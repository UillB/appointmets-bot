import { Context, Markup, Telegraf } from "telegraf";
import { prisma } from "../../lib/prisma";
import { getLocalizedServiceName } from "../../lib/localization";

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
      return ctx.reply(ctx.tt("my.noAppointments"));
    }

    // Отправляем каждую запись отдельным сообщением с кнопкой "Отменить"
    for (const a of appts) {
      await ctx.reply(
        `🗓 ${getLocalizedServiceName(a.service, ctx.lang)}\n${ctx.tt("my.time")}: ${fmt(a.slot.startAt)}`,
        Markup.inlineKeyboard([
          [Markup.button.callback(ctx.tt("my.cancel"), `cancel_${a.id}`)],
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
      return ctx.reply(ctx.tt("my.appointmentNotFound"));
    }

    // Мягкая отмена (статус), можно и удалить
    await prisma.appointment.update({
      where: { id },
      data: { status: "cancelled" },
    });

    // Уведомления админу/в группу об отмене
    const who = `${ctx.from?.first_name || ""} ${ctx.from?.last_name || ""}`.trim();
    const uname = ctx.from?.username ? `@${ctx.from.username}` : "—";
    const when = fmt(appt.slot.startAt);
    const serviceName = getLocalizedServiceName(appt.service, ctx.lang);
    
    const cancelMsg =
      `${ctx.tt("admin.cancelHeader")}\n` +
      `${ctx.tt("admin.user")}: ${who} (${uname})\n` +
      `${ctx.tt("admin.service")}: ${serviceName}\n` +
      `${ctx.tt("admin.time")}: ${when}`;

    try {
      if (process.env.ADMIN_CHAT_ID) {
        await ctx.telegram.sendMessage(process.env.ADMIN_CHAT_ID, cancelMsg);
      }
      if (process.env.ADMIN_GROUP_ID) {
        await ctx.telegram.sendMessage(process.env.ADMIN_GROUP_ID, cancelMsg.replace("❌", "👥"));
      }
    } catch (e) { 
      console.error("Admin cancel notify failed:", e); 
    }

    await ctx.editMessageText(
      `${ctx.tt("my.cancelled")}\n${serviceName}\n${when}`
    );
  });
}
