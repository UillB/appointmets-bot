import { Markup, Telegraf } from "telegraf";
import { prisma } from "../../lib/prisma";
import { ENV } from "../../lib/env";

const fmtTime = (d: Date) => new Date(d).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
const fmtDate = (d: Date) => new Date(d).toLocaleDateString("ru-RU");

export function registerWebappDataHandler(bot: Telegraf, organizationId?: number) {
  bot.on("message", async (ctx, next) => {
    const m: any = ctx.message;
    if (m?.web_app_data?.data) {
      try {
        const raw: string = m.web_app_data.data;
        const { date, serviceId } = JSON.parse(raw || "{}");

        await ctx.reply(ctx.tt("progress.dateReceived"), Markup.removeKeyboard());
        if (!date) return ctx.reply(ctx.tt("errors.webappDate"));
        if (!serviceId) return ctx.reply(ctx.tt("errors.webappService"));

        // Проверяем, что услуга принадлежит правильной организации
        if (organizationId) {
          const service = await prisma.service.findUnique({
            where: { id: Number(serviceId) },
            select: { organizationId: true }
          });
          
          if (!service || service.organizationId !== organizationId) {
            return ctx.reply(ctx.tt("errors.serviceNotFound"));
          }
        }

        const dayStart = new Date(`${date}T00:00:00.000Z`);
        const dayEnd   = new Date(`${date}T23:59:59.999Z`);

        const slots = await prisma.slot.findMany({
          where: { serviceId: Number(serviceId), startAt: { gte: dayStart, lte: dayEnd } },
          include: { bookings: true, service: true },
          orderBy: { startAt: "asc" }, take: 40,
        });

        // Получаем все активные записи в организации для проверки конфликтов
        const activeAppointments = await prisma.appointment.findMany({
          where: {
            service: {
              organizationId: slots[0]?.service?.organizationId
            },
            status: { not: 'cancelled' }
          },
          include: {
            slot: true,
            service: true
          }
        });

        const cutoffTs = Date.now() + ENV.BOOKING_CUTOFF_MIN * 60 * 1000;
        
        // Фильтруем слоты: убираем те, что в прошлом и те, что конфликтуют с другими записями
        const filtered = slots.filter(slot => {
          // Проверяем, что слот не в прошлом
          if (new Date(slot.startAt).getTime() < cutoffTs) {
            return false;
          }

          // Проверяем конфликты с другими записями
          const slotStart = new Date(slot.startAt);
          const slotEnd = new Date(slot.endAt);
          
          for (const appointment of activeAppointments) {
            const appointmentStart = new Date(appointment.slot.startAt);
            const appointmentEnd = new Date(appointment.slot.endAt);
            
            // Проверяем пересечение времени
            if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
              return false; // Слот конфликтует, не показываем его
            }
          }
          
          return true; // Слот доступен
        });

        if (!filtered.length) {
          return ctx.reply(ctx.tt("book.noSlotsDay", { date: fmtDate(dayStart) }));
        }

        const kb = Markup.inlineKeyboard(
          filtered.map(s => {
            const isAvailable = s.bookings.length < s.capacity;
            const status = isAvailable ? "✅" : "❌";
            const time = fmtTime(s.startAt);
            return [Markup.button.callback(`${status} ${time}`, `slot_${s.id}`)];
          })
        );

        await ctx.reply(ctx.tt("book.chooseTime", { date: fmtDate(dayStart) }), kb);
        return;
      } catch (e) {
        console.error("web_app_data parse error:", e);
        await ctx.reply(ctx.tt("errors.generic"), Markup.removeKeyboard());
        return;
      }
    }
    return next();
  });
}
