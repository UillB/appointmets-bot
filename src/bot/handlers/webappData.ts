import { Markup, Telegraf } from "telegraf";
import { prisma } from "../../lib/prisma";
import { ENV } from "../../lib/env";

const fmtTime = (d: Date) => new Date(d).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
const fmtDate = (d: Date) => new Date(d).toLocaleDateString("ru-RU");

export function registerWebappDataHandler(bot: Telegraf) {
  bot.on("message", async (ctx, next) => {
    const m: any = ctx.message;
    if (m?.web_app_data?.data) {
      try {
        const raw: string = m.web_app_data.data;
        const { date, serviceId } = JSON.parse(raw || "{}");

        await ctx.reply(ctx.tt("progress.dateReceived"), Markup.removeKeyboard());
        if (!date) return ctx.reply(ctx.tt("errors.webappDate"));
        if (!serviceId) return ctx.reply(ctx.tt("errors.webappService"));

        const dayStart = new Date(`${date}T00:00:00.000Z`);
        const dayEnd   = new Date(`${date}T23:59:59.999Z`);

        const slots = await prisma.slot.findMany({
          where: { serviceId: Number(serviceId), startAt: { gte: dayStart, lte: dayEnd } },
          orderBy: { startAt: "asc" }, take: 40,
        });

        const cutoffTs = Date.now() + ENV.BOOKING_CUTOFF_MIN * 60 * 1000;
        const filtered = slots.filter(s => new Date(s.startAt).getTime() >= cutoffTs);

        if (!filtered.length) {
          return ctx.reply(ctx.tt("book.noSlotsDay", { date: fmtDate(dayStart) }));
        }

        const kb = Markup.inlineKeyboard(
          filtered.map(s => [Markup.button.callback(fmtTime(s.startAt), `slot_${s.id}`)])
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
