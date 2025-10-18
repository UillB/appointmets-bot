import { Context, Markup } from "telegraf";
import { prisma } from "../../lib/prisma";


export const handleBook = () => async (ctx: Context) => {
const services = await prisma.service.findMany({ take: 5 });
if (!services.length) return ctx.reply("Пока нет доступных услуг. Повторите позже.");
return ctx.reply("Выберите услугу:", Markup.keyboard(services.map(s => s.name)).oneTime().resize());
};