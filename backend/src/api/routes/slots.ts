import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware для проверки аутентификации
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    name: string;
    role: string;
    organizationId: number;
  };
  headers: any;
  query: any;
  body: any;
  params: any;
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Validation schemas
const slotGenerationSchema = z.object({
  serviceId: z.number().int().positive('Service ID must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  includeWeekends: z.boolean().default(false),
  lunchBreakStart: z.string().optional(),
  lunchBreakEnd: z.string().optional(),
  slotDuration: z.number().int().min(15).max(480, 'Slot duration must be between 15 and 480 minutes')
});

// GET /api/slots - Получение слотов
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { organizationId, serviceId, date, page = 1, limit = 25 } = req.query;
    
    // Проверяем права доступа
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.organizationId !== parseInt(organizationId as string)) {
      return res.status(403).json({ error: 'Access denied to this organization' });
    }

    const where: any = {};
    
    if (organizationId) {
      where.service = {
        organizationId: parseInt(organizationId as string)
      };
    }
    
    if (serviceId) {
      where.serviceId = parseInt(serviceId as string);
    }
    
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.startAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const slots = await prisma.slot.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            organizationId: true
          }
        }
      },
      orderBy: {
        startAt: 'asc'
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const total = await prisma.slot.count({ where });

    res.json({
      slots,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/slots/status - Получение слотов с их статусом
router.get('/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { organizationId, serviceId, date, page = 1, limit = 100 } = req.query;

    // Получаем все слоты для организации
    const slots = await prisma.slot.findMany({
      where: {
        service: {
          organizationId: parseInt(organizationId as string)
        },
        ...(serviceId && { serviceId: parseInt(serviceId as string) }),
        ...(date && {
          startAt: {
            gte: new Date(date as string + 'T00:00:00'),
            lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
          }
        })
      },
      include: {
        service: true,
        bookings: true
      },
      orderBy: {
        startAt: 'asc'
      },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    // Получаем все активные записи для проверки конфликтов
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        service: {
          organizationId: parseInt(organizationId as string)
        },
        status: { not: 'cancelled' }
      },
      include: {
        slot: true,
        service: true
      }
    });

    // Добавляем статус к каждому слоту
    const slotsWithStatus = slots.map(slot => {
      const slotStart = new Date(slot.startAt);
      const slotEnd = new Date(slot.endAt);
      
      // Проверяем, занят ли слот
      const isBooked = slot.bookings.length >= slot.capacity;
      
      // Проверяем, есть ли конфликты с другими записями
      const hasConflict = activeAppointments.some(appointment => {
        if (appointment.slotId === slot.id) return false; // Это тот же слот
        
        const appointmentStart = new Date(appointment.slot.startAt);
        const appointmentEnd = new Date(appointment.slot.endAt);
        
        // Проверяем пересечение времени
        return (slotStart < appointmentEnd && slotEnd > appointmentStart);
      });

      let status = 'available';
      if (isBooked) {
        status = 'booked';
      } else if (hasConflict) {
        status = 'conflict';
      }

      return {
        ...slot,
        status,
        isBooked,
        hasConflict
      };
    });

    const total = await prisma.slot.count({
      where: {
        service: {
          organizationId: parseInt(organizationId as string)
        },
        ...(serviceId && { serviceId: parseInt(serviceId as string) }),
        ...(date && {
          startAt: {
            gte: new Date(date as string + 'T00:00:00'),
            lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
          }
        })
      }
    });

    res.json({
      slots: slotsWithStatus,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching slots with status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/slots/generate - Генерация слотов
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Raw request body:', req.body);
    const validatedData = slotGenerationSchema.parse(req.body);
    console.log('Validated data:', validatedData);
    const { serviceId, startDate, endDate, startTime, endTime, includeWeekends, lunchBreakStart, lunchBreakEnd, slotDuration } = validatedData;

    // Проверяем, что услуга принадлежит организации пользователя
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId: req.user!.role === 'SUPER_ADMIN' ? undefined : req.user!.organizationId
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found or access denied' });
    }

    // Правильно парсим даты
    console.log('Received dates:', { startDate, endDate });
    
    // Проверяем формат дат
    let start: Date;
    let end: Date;
    
    try {
      // Если дата уже в формате ISO или содержит время
      if (startDate.includes('T') || startDate.includes(' ')) {
        start = new Date(startDate);
      } else {
        start = new Date(startDate + 'T00:00:00');
      }
      
      if (endDate.includes('T') || endDate.includes(' ')) {
        end = new Date(endDate);
      } else {
        end = new Date(endDate + 'T23:59:59');
      }
      
      // Проверяем, что даты валидны
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }
      
    } catch (error) {
      console.error('Date parsing error:', error);
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    const generatedSlots = [];

    console.log(`Generating slots from ${start.toISOString()} to ${end.toISOString()}`);
    console.log('Service details:', { serviceId, serviceName: service.name, serviceDuration: service.durationMin });
    console.log('Slot generation params:', { startTime, endTime, slotDuration, includeWeekends, lunchBreakStart, lunchBreakEnd });

    // Генерируем слоты для каждого дня
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Пропускаем выходные если не включены
      if (!includeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        continue;
      }

      // Парсим время начала и окончания
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const dayStart = new Date(date);
      dayStart.setHours(startHour, startMinute, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      // Парсим обеденный перерыв если указан
      let lunchStart = null;
      let lunchEnd = null;
      
      if (lunchBreakStart && lunchBreakEnd) {
        const [lunchStartHour, lunchStartMinute] = lunchBreakStart.split(':').map(Number);
        const [lunchEndHour, lunchEndMinute] = lunchBreakEnd.split(':').map(Number);
        
        lunchStart = new Date(date);
        lunchStart.setHours(lunchStartHour, lunchStartMinute, 0, 0);
        
        lunchEnd = new Date(date);
        lunchEnd.setHours(lunchEndHour, lunchEndMinute, 0, 0);
      }

      console.log(`Processing day: ${date.toDateString()}, from ${dayStart.toTimeString()} to ${dayEnd.toTimeString()}`);
      
      // Генерируем слоты в течение дня с интервалом равным длительности слота
      for (let currentTime = new Date(dayStart); currentTime < dayEnd; currentTime.setMinutes(currentTime.getMinutes() + slotDuration)) {
        // Пропускаем обеденный перерыв
        if (lunchStart && lunchEnd && currentTime >= lunchStart && currentTime < lunchEnd) {
          currentTime = new Date(lunchEnd);
          continue;
        }

        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Проверяем, что слот не выходит за границы рабочего дня
        if (slotEnd > dayEnd) {
          break;
        }

        // Проверяем, что слот не пересекается с обеденным перерывом
        if (lunchStart && lunchEnd && currentTime < lunchEnd && slotEnd > lunchStart) {
          currentTime = new Date(lunchEnd);
          continue;
        }

        // Проверяем, не существует ли уже такой слот для этой услуги
        const existingSlot = await prisma.slot.findFirst({
          where: {
            serviceId,
            startAt: currentTime
          }
        });

        // Создаем слот только если он не существует для этой услуги
        if (!existingSlot) {
          console.log(`Creating slot: ${currentTime.toTimeString()} - ${slotEnd.toTimeString()}`);
          const slot = await prisma.slot.create({
            data: {
              serviceId,
              startAt: new Date(currentTime),
              endAt: new Date(slotEnd),
              capacity: 1
            }
          });
          generatedSlots.push(slot);
        } else {
          console.log(`Skipping slot: ${currentTime.toTimeString()} - ${slotEnd.toTimeString()} (already exists for this service)`);
        }
      }
    }

    res.json({
      message: 'Slots generated successfully',
      generatedCount: generatedSlots.length,
      slots: generatedSlots
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues
      });
    }

    console.error('Error generating slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/slots/:id - Удаление слота
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const slotId = parseInt(req.params.id);

    // Проверяем, что слот принадлежит организации пользователя
    const slot = await prisma.slot.findFirst({
      where: {
        id: slotId,
        service: {
          organizationId: req.user!.role === 'SUPER_ADMIN' ? undefined : req.user!.organizationId
        }
      }
    });

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found or access denied' });
    }

    await prisma.slot.delete({
      where: { id: slotId }
    });

    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/slots - Удаление всех слотов организации
router.delete('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { organizationId } = req.query;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Проверяем права доступа
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.organizationId !== parseInt(organizationId as string)) {
      return res.status(403).json({ error: 'Access denied to this organization' });
    }

    // Сначала проверяем, есть ли записи
    const appointmentsCount = await prisma.appointment.count({
      where: {
        service: {
          organizationId: parseInt(organizationId as string)
        },
        status: { not: 'cancelled' } // Не считаем отмененные записи
      }
    });

    const slotsCount = await prisma.slot.count({
      where: {
        service: {
          organizationId: parseInt(organizationId as string)
        }
      }
    });

    if (appointmentsCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete slots with active appointments',
        message: `Нельзя удалить слоты, так как есть ${appointmentsCount} активных записей. Сначала отмените или удалите все записи.`,
        appointmentsCount,
        slotsCount
      });
    }

    // Если записей нет, удаляем слоты
    const deletedSlots = await prisma.slot.deleteMany({
      where: {
        service: {
          organizationId: parseInt(organizationId as string)
        }
      }
    });

    res.json({
      message: 'All slots deleted successfully',
      deletedSlots: deletedSlots.count
    });
  } catch (error) {
    console.error('Error deleting all slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;