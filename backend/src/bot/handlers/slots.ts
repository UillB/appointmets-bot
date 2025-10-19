import { Context, Markup, Telegraf } from "telegraf";
import { prisma } from "../../lib/prisma";
import { getLocalizedServiceName } from "../../lib/localization";
import { ENV } from "../../lib/env";

// Форматирование времени
const fmtTime = (d: Date) => new Date(d).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
const fmtDate = (d: Date) => new Date(d).toLocaleDateString("ru-RU");

// /slots — показать доступность слотов
export function handleSlots(organizationId?: number) {
  return async (ctx: Context) => {
    const services = await prisma.service.findMany({ 
      where: organizationId ? { organizationId } : undefined,
      take: 10 
    });
    if (!services.length) return ctx.reply(ctx.tt("slots.noServices"));
    
    const buttons = services.map(s => [Markup.button.callback(getLocalizedServiceName(s, ctx.lang), `slots_service_${s.id}`)]);
    await ctx.reply(ctx.tt("slots.chooseService"), Markup.inlineKeyboard(buttons));
  };
}

// Регистрация callback обработчиков для просмотра слотов
export function registerSlotsCallbacks(bot: Telegraf, organizationId?: number) {
  // Выбор услуги для просмотра слотов
  bot.action(/^slots_service_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const serviceId = Number(ctx.match[1]);
    
    // Показываем кнопки для выбора периода
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(ctx.tt("slots.today"), `slots_day_${serviceId}_today`)],
      [Markup.button.callback(ctx.tt("slots.tomorrow"), `slots_day_${serviceId}_tomorrow`)],
      [Markup.button.callback(ctx.tt("slots.week"), `slots_week_${serviceId}`)],
      [Markup.button.callback("◀️", `slots_back_${serviceId}`)]
    ]);
    
    await ctx.editMessageText(ctx.tt("slots.choosePeriod"), keyboard);
  });

  // Просмотр слотов на конкретный день
  bot.action(/^slots_day_(\d+)_(today|tomorrow)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const serviceId = Number(ctx.match[1]);
    const period = ctx.match[2];
    
    const now = new Date();
    const targetDate = new Date(now);
    if (period === "tomorrow") {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    const dayStart = new Date(targetDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setUTCHours(23, 59, 59, 999);
    
    const slots = await prisma.slot.findMany({
      where: { 
        serviceId,
        startAt: { gte: dayStart, lte: dayEnd }
      },
      include: { bookings: true },
      orderBy: { startAt: "asc" }
    });
    
    if (!slots.length) {
      await ctx.editMessageText(ctx.tt("slots.noSlotsDay", { date: fmtDate(targetDate) }));
      return;
    }
    
    // Формируем сообщение со слотами
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const serviceName = getLocalizedServiceName(service!, ctx.lang);
    
    let message = `📅 ${serviceName}\n${fmtDate(targetDate)}\n\n`;
    
    // Группируем слоты по часам для лучшего отображения
    const slotsByHour = slots.reduce((acc, slot) => {
      const hour = new Date(slot.startAt).getHours();
      if (!acc[hour]) acc[hour] = [];
      acc[hour].push(slot);
      return acc;
    }, {} as Record<number, typeof slots>);
    
    for (const hour of Object.keys(slotsByHour).sort((a, b) => Number(a) - Number(b))) {
      const hourSlots = slotsByHour[Number(hour)];
      message += `🕐 ${hour}:00\n`;
      
      for (const slot of hourSlots) {
        const isAvailable = slot.bookings.length < slot.capacity;
        const status = isAvailable ? "✅" : "❌";
        const time = fmtTime(slot.startAt);
        message += `  ${status} ${time} ${isAvailable ? ctx.tt("slots.available") : ctx.tt("slots.occupied")}\n`;
      }
      message += "\n";
    }
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("◀️", `slots_service_${serviceId}`)],
      [Markup.button.callback(ctx.tt("slots.bookNow"), `service_${serviceId}`)]
    ]);
    
    await ctx.editMessageText(message, keyboard);
  });

  // Просмотр слотов на неделю
  bot.action(/^slots_week_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const serviceId = Number(ctx.match[1]);
    
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Понедельник
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Воскресенье
    weekEnd.setUTCHours(23, 59, 59, 999);
    
    const slots = await prisma.slot.findMany({
      where: { 
        serviceId,
        startAt: { gte: weekStart, lte: weekEnd }
      },
      include: { bookings: true },
      orderBy: { startAt: "asc" }
    });
    
    if (!slots.length) {
      await ctx.editMessageText(ctx.tt("slots.noSlotsWeek"));
      return;
    }
    
    // Группируем слоты по дням
    const slotsByDay = slots.reduce((acc, slot) => {
      const day = new Date(slot.startAt).toDateString();
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    }, {} as Record<string, typeof slots>);
    
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const serviceName = getLocalizedServiceName(service!, ctx.lang);
    
    let message = `📅 ${serviceName}\n${ctx.tt("slots.weekView")}\n\n`;
    
    for (const day of Object.keys(slotsByDay).sort()) {
      const daySlots = slotsByDay[day];
      const availableCount = daySlots.filter(s => s.bookings.length < s.capacity).length;
      const totalCount = daySlots.length;
      
      const date = new Date(day);
      const dayName = date.toLocaleDateString("ru-RU", { weekday: "short", day: "2-digit", month: "2-digit" });
      
      message += `${dayName}: ${availableCount}/${totalCount} ${ctx.tt("slots.available")}\n`;
    }
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("◀️", `slots_service_${serviceId}`)],
      [Markup.button.callback(ctx.tt("slots.bookNow"), `service_${serviceId}`)]
    ]);
    
    await ctx.editMessageText(message, keyboard);
  });

  // Возврат к выбору услуги
  bot.action(/^slots_back_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const serviceId = Number(ctx.match[1]);
    
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const serviceName = getLocalizedServiceName(service!, ctx.lang);
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(ctx.tt("slots.today"), `slots_day_${serviceId}_today`)],
      [Markup.button.callback(ctx.tt("slots.tomorrow"), `slots_day_${serviceId}_tomorrow`)],
      [Markup.button.callback(ctx.tt("slots.week"), `slots_week_${serviceId}`)],
      [Markup.button.callback("◀️", `slots_back_${serviceId}`)]
    ]);
    
    await ctx.editMessageText(ctx.tt("slots.choosePeriod"), keyboard);
  });
}

