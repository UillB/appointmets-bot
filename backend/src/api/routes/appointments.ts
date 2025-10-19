import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { botManager } from "../../bot/bot-manager";
import jwt from 'jsonwebtoken';

const r = Router();

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    name: string;
    role: string;
    organizationId: number;
    organization?: {
      id: number;
      name: string;
    };
  };
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware to verify JWT token
const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Функция для отправки уведомления об отмене записи
async function sendCancellationNotification(appointment: any, reason?: string) {
  try {
    const organization = appointment.service.organization;
    if (!organization.botToken) {
      console.log('No bot token for organization:', organization.name);
      return;
    }

    // Получаем бота для организации
    const bot = botManager.getBotByToken(organization.botToken);
    if (!bot) {
      console.log('Bot not found for organization:', organization.name);
      return;
    }

    const startTime = new Date(appointment.slot.startAt);
    const endTime = new Date(appointment.slot.endAt);
    
    const message = `🚫 Ваша запись отменена\n\n` +
      `📅 Дата: ${startTime.toLocaleDateString('ru-RU')}\n` +
      `⏰ Время: ${startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n` +
      `🏥 Услуга: ${appointment.service.name}\n` +
      `🏢 Организация: ${organization.name}\n` +
      (reason ? `📝 Причина: ${reason}\n` : '') +
      `\nЕсли у вас есть вопросы, обратитесь в организацию.`;

    await bot.telegram.sendMessage(appointment.chatId, message);
    console.log('Cancellation notification sent to chat:', appointment.chatId);
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    throw error;
  }
}

// Функция для отправки уведомления об удалении записи
async function sendDeletionNotification(appointment: any) {
  try {
    const organization = appointment.service.organization;
    if (!organization.botToken) {
      console.log('No bot token for organization:', organization.name);
      return;
    }

    // Получаем бота для организации
    const bot = botManager.getBotByToken(organization.botToken);
    if (!bot) {
      console.log('Bot not found for organization:', organization.name);
      return;
    }

    const startTime = new Date(appointment.slot.startAt);
    const endTime = new Date(appointment.slot.endAt);
    
    const message = `🗑️ Ваша запись удалена\n\n` +
      `📅 Дата: ${startTime.toLocaleDateString('ru-RU')}\n` +
      `⏰ Время: ${startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}\n` +
      `🏥 Услуга: ${appointment.service.name}\n` +
      `🏢 Организация: ${organization.name}\n` +
      `\nЕсли у вас есть вопросы, обратитесь в организацию.`;

    await bot.telegram.sendMessage(appointment.chatId, message);
    console.log('Deletion notification sent to chat:', appointment.chatId);
  } catch (error) {
    console.error('Error sending deletion notification:', error);
    throw error;
  }
}


r.get("/", verifyToken, async (req: any, res: any) => {
  const { status, serviceId, date, page = 1, limit = 25 } = req.query;
  const { role, organizationId } = req.user;
  
  console.log('🔥 Backend: Received query params:', req.query);
  console.log('🔥 Backend: User info - role:', role, 'organizationId:', organizationId);
  console.log('🔥 Backend: Parsed params - status:', status, 'serviceId:', serviceId, 'date:', date, 'page:', page, 'limit:', limit);
  
  // Build where clause for filtering
  const where: any = {};
  
  // CRITICAL: Filter by organizationId for data isolation
  if (role !== 'SUPER_ADMIN') {
    where.service = {
      organizationId: organizationId
    };
    console.log('🔥 Backend: Added organizationId filter for user:', organizationId);
  } else {
    console.log('🔥 Backend: Super admin - no organizationId filter applied');
  }
  
  if (status) {
    where.status = status;
    console.log('🔥 Backend: Added status filter:', status);
  }
  
  if (serviceId) {
    where.serviceId = Number(serviceId);
    console.log('🔥 Backend: Added serviceId filter:', serviceId);
  }
  
  if (date) {
    const filterDate = new Date(date as string);
    const startOfDay = new Date(filterDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filterDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    where.slot = {
      startAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    };
    console.log('🔥 Backend: Added date filter:', date, 'from', startOfDay, 'to', endOfDay);
  }
  
  console.log('🔥 Backend: Final where clause:', JSON.stringify(where, null, 2));
  
  // Calculate pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;
  
  try {
    // Get total count for pagination
    const total = await prisma.appointment.count({ where });
    
    // Get appointments with pagination
    const appointments = await prisma.appointment.findMany({
      where,
      include: { 
        service: {
          include: {
            organization: true
          }
        }, 
        slot: true 
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });
    
    res.json({
      appointments,
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


r.post("/", async (req: any, res: any) => {
const { chatId, serviceId, slotId } = req.body;

// Получаем слот с услугой
const slot = await prisma.slot.findUnique({ 
  where: { id: Number(slotId) }, 
  include: { 
    bookings: true,
    service: true 
  } 
});

if (!slot) return res.status(404).json({ error: "slot not found" });
if (slot.bookings.length >= slot.capacity) return res.status(409).json({ error: "slot full" });

// Проверяем, не пересекается ли время с существующими записями
const service = slot.service;
const slotStart = new Date(slot.startAt);
const slotEnd = new Date(slot.endAt);

// Вычисляем реальное время окончания услуги с учетом её длительности
const serviceEndTime = new Date(slotStart.getTime() + service.durationMin * 60 * 1000);

// Находим все существующие записи в организации, которые могут конфликтовать
const existingAppointments = await prisma.appointment.findMany({
  where: {
    service: {
      organizationId: service.organizationId
    },
    status: { not: 'cancelled' } // не учитываем отмененные записи
  },
  include: {
    slot: true,
    service: true
  }
});

// Проверяем конфликты с существующими записями
for (const appointment of existingAppointments) {
  const existingSlotStart = new Date(appointment.slot.startAt);
  const existingServiceEndTime = new Date(existingSlotStart.getTime() + appointment.service.durationMin * 60 * 1000);
  
  // Проверяем пересечение времени:
  // Наш слот начинается до окончания существующей услуги И
  // Наша услуга заканчивается после начала существующего слота
  if (slotStart < existingServiceEndTime && serviceEndTime > existingSlotStart) {
    return res.status(409).json({ 
      error: "time conflict", 
      message: `This time slot conflicts with an existing appointment. Your service duration is ${service.durationMin} minutes. Existing appointment: ${existingSlotStart.toISOString()} - ${existingServiceEndTime.toISOString()} (${appointment.service.durationMin} min service)` 
    });
  }
}

const appt = await prisma.appointment.create({ 
  data: { 
    chatId: String(chatId), 
    serviceId: Number(serviceId), 
    slotId: Number(slotId) 
  },
  include: {
    service: true,
    slot: true
  }
});

res.status(201).json(appt);
});

// Получить запись по ID
r.get("/:id", verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { 
        service: {
          include: {
            organization: true
          }
        }, 
        slot: true 
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: "appointment not found" });
    }

    // CRITICAL: Check if user has access to this appointment's organization
    if (role !== 'SUPER_ADMIN' && appointment.service.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied to this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Отменить запись
r.put("/:id/cancel", verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { role, organizationId } = req.user;

    // Находим запись
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { 
        service: { 
          include: { 
            organization: true 
          } 
        }, 
        slot: true 
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: "appointment not found" });
    }

    // CRITICAL: Check if user has access to this appointment's organization
    if (role !== 'SUPER_ADMIN' && appointment.service.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied to this appointment' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: "appointment already cancelled" });
    }

    // Обновляем статус записи
    const updatedAppointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { 
        status: 'cancelled'
      },
      include: { 
        service: { 
          include: { 
            organization: true 
          } 
        }, 
        slot: true 
      }
    });

    // Отправляем уведомление в Telegram
    try {
      await sendCancellationNotification(updatedAppointment, reason);
    } catch (notificationError) {
      console.error('Failed to send cancellation notification:', notificationError);
      // Не прерываем процесс, если уведомление не отправилось
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить запись
r.delete("/:id", verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;

    // Находим запись
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { 
        service: { 
          include: { 
            organization: true 
          } 
        }, 
        slot: true 
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: "appointment not found" });
    }

    // CRITICAL: Check if user has access to this appointment's organization
    if (role !== 'SUPER_ADMIN' && appointment.service.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied to this appointment' });
    }

    // Отправляем уведомление в Telegram перед удалением
    try {
      await sendDeletionNotification(appointment);
    } catch (notificationError) {
      console.error('Failed to send deletion notification:', notificationError);
      // Не прерываем процесс, если уведомление не отправилось
    }

    // Удаляем запись
    await prisma.appointment.delete({
      where: { id: Number(id) }
    });

    res.json({
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить статус записи
r.put("/:id", verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role, organizationId } = req.user;

    // Сначала проверяем, существует ли запись и есть ли доступ
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { 
        service: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: "appointment not found" });
    }

    // CRITICAL: Check if user has access to this appointment's organization
    if (role !== 'SUPER_ADMIN' && existingAppointment.service.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied to this appointment' });
    }

    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status },
      include: { 
        service: {
          include: {
            organization: true
          }
        }, 
        slot: true 
      }
    });

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default r;