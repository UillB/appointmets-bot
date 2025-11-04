import { Markup, Context, Telegraf } from "telegraf";
import { prisma } from "../../lib/prisma";
import { ENV } from "../../lib/env";
import { getLocalizedServiceName } from "../../lib/localization";

// Get WebSocket emitters from global scope
const getAppointmentEmitter = () => (global as any).appointmentEmitter;

// форматирование
const fmtTime = (d: Date) => new Date(d).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
const fmtFull = (d: Date) => new Date(d).toLocaleString("ru-RU", {
  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
});

// /book — показать услуги
export function handleBookingFlow(organizationId?: number) {
  return async (ctx: Context) => {
    const services = await prisma.service.findMany({ 
      where: organizationId ? { organizationId } : undefined,
      take: 10 
    });
    if (!services.length) return ctx.reply(ctx.tt("book.noSlotsDay", { date: "—" }));
    const buttons = services.map(s => [Markup.button.callback(getLocalizedServiceName(s, ctx.lang), `service_${s.id}`)]);
    await ctx.reply(ctx.tt("book.chooseService"), Markup.inlineKeyboard(buttons));
  };
}

// регистрация action'ов; botUsername нужен для диплинка из групп
export function registerBookingCallbacks(bot: Telegraf, botUsername: string, organizationId?: number) {
  // выбор услуги → в личке открываем WebApp, в группе даём диплинк
  bot.action(/^service_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const serviceId = Number(ctx.match[1]);
    const isPrivate = ctx.chat?.type === "private";

    if (!isPrivate) {
      const deepLink = `https://t.me/${botUsername}?start=book_${serviceId}`;
      await ctx.reply(
        ctx.tt("group.openPm"),
        Markup.inlineKeyboard([[Markup.button.url("➡️ Open bot", deepLink)]])
      );
      return;
    }

    const url = `${ENV.PUBLIC_BASE_URL}/webapp/calendar?serviceId=${serviceId}&cutoffMin=${ENV.BOOKING_CUTOFF_MIN}&lang=${ctx.lang}`;
    await ctx.reply(
      ctx.tt("book.openCalendar"),
      Markup.keyboard([[Markup.button.webApp("📆", url)]])
        .resize()
        .oneTime()
    );
  });

  // выбор слота → подтверждение (✅/❌)
  bot.action(/^slot_(\d+)$/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const slotId = Number(ctx.match[1]);
      const slot = await prisma.slot.findUnique({ where: { id: slotId }, include: { service: true } });
      if (!slot) return ctx.reply(ctx.tt("errors.slotNotFound"));

      const kb = Markup.inlineKeyboard([
        [Markup.button.callback("✅", `confirm_${slot.id}`)],
        [Markup.button.callback("❌", `cancel_${slot.id}`)]
      ]);
      await ctx.editMessageText(
        `${getLocalizedServiceName(slot.service, ctx.lang)}\n${fmtFull(slot.startAt)}`,
        kb
      );
    } catch {
      await ctx.reply(ctx.tt("errors.generic"));
    }
  });

  // подтверждение — идемпотентно, с уведомлениями
  bot.action(/^confirm_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery("OK");
    const slotId = Number(ctx.match[1]);
    const chatId = String(ctx.chat?.id);

    try { await ctx.editMessageText(ctx.tt("progress.confirming")); } catch {}

    try {
      const result = await prisma.$transaction(async (tx) => {
        const slot = await tx.slot.findUnique({ where: { id: slotId }, include: { service: true } });
        if (!slot) throw new Error("SLOT_NOT_FOUND");
        
        // Проверяем, не пересекается ли время с существующими записями
        const slotStart = new Date(slot.startAt);
        const slotEnd = new Date(slot.endAt);

        // Находим все существующие записи в организации, которые могут конфликтовать
        const existingAppointments = await tx.appointment.findMany({
          where: {
            service: {
              organizationId: slot.service.organizationId
            },
            status: { not: 'cancelled' } // не учитываем отмененные записи
          },
          include: {
            slot: true,
            service: true
          }
        });

        // Проверяем конфликты
        for (const appointment of existingAppointments) {
          const appointmentStart = new Date(appointment.slot.startAt);
          const appointmentEnd = new Date(appointment.slot.endAt);
          
          // Проверяем пересечение времени
          if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
            throw new Error("TIME_CONFLICT");
          }
        }
        
        const appt = await tx.appointment.create({
          data: { chatId, serviceId: slot.serviceId, slotId: slot.id, status: "confirmed" },
          include: {
            service: {
              include: {
                organization: true
              }
            },
            slot: true
          }
        });
        return { appt, slot };
      });

      const when = fmtFull(result.slot.startAt);
      await ctx.editMessageText(`${ctx.tt("confirm.ok")}\n\n` + ctx.tt("confirm.details", {
        service: getLocalizedServiceName(result.slot.service, ctx.lang), when
      }));

      // Emit real-time WebSocket notification for appointment creation
      try {
        const appointmentEmitter = getAppointmentEmitter();
        if (appointmentEmitter) {
          const customerInfo = {
            chatId: chatId,
            firstName: ctx.from?.first_name,
            lastName: ctx.from?.last_name,
            username: ctx.from?.username
          };
          await appointmentEmitter.emitAppointmentCreated(result.appt, customerInfo);
          console.log('✅ WebSocket notification sent for appointment creation from Telegram bot');
        }
      } catch (error) {
        console.error('❌ Failed to send WebSocket notification for appointment creation:', error);
        // Don't fail the request if WebSocket notification fails
      }

      // уведомления админу/в группу (если указаны)
      const who = `${ctx.from?.first_name || ""} ${ctx.from?.last_name || ""}`.trim();
      const uname = ctx.from?.username ? `@${ctx.from.username}` : "—";
      const baseMsg =
        `${ctx.tt("admin.notifyHeader")}\n` +
        `${ctx.tt("admin.user")}: ${who} (${uname})\n` +
        `${ctx.tt("admin.service")}: ${getLocalizedServiceName(result.slot.service, ctx.lang)}\n` +
        `${ctx.tt("admin.time")}: ${when}`;

      try {
        if (process.env.ADMIN_CHAT_ID) {
          await ctx.telegram.sendMessage(process.env.ADMIN_CHAT_ID, baseMsg);
        }
        if (process.env.ADMIN_GROUP_ID) {
          await ctx.telegram.sendMessage(process.env.ADMIN_GROUP_ID, baseMsg.replace("🔔", "👥"));
        }
      } catch (e) { console.error("Admin notify failed:", e); }
    } catch (e: any) {
      if (e?.code === "P2002" || e?.message === "SLOT_TAKEN") {
        try { await ctx.editMessageText(ctx.tt("errors.slotTaken")); } catch {}
        return;
      }
      if (e?.message === "SLOT_NOT_FOUND") {
        try { await ctx.editMessageText(ctx.tt("errors.slotNotFound")); } catch {}
        return;
      }
      if (e?.message === "TIME_CONFLICT") {
        try { await ctx.editMessageText("❌ Это время уже занято другой услугой. Пожалуйста, выберите другое время."); } catch {}
        return;
      }
      console.error(e);
      try { await ctx.reply(ctx.tt("errors.generic")); } catch {}
    }
  });

  // отмена перед подтверждением → просто убираем клавиатуру
  bot.action(/^cancel_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery("Canceled");
    try { await ctx.editMessageText("—"); } catch {}
  });
}
