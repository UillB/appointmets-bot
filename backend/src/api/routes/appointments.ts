import { Router } from "express";
import { prisma } from "../../lib/prisma";
const r = Router();


r.get("/", async (req, res) => {
  const { status, serviceId, date, page = 1, limit = 25 } = req.query;
  
  // Build where clause for filtering
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (serviceId) {
    where.serviceId = Number(serviceId);
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
  }
  
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
        service: true, 
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


r.post("/", async (req, res) => {
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

// Находим все существующие записи этой услуги, которые могут конфликтовать
const existingAppointments = await prisma.appointment.findMany({
  where: {
    serviceId: Number(serviceId),
    status: { not: 'cancelled' } // не учитываем отмененные записи
  },
  include: {
    slot: true
  }
});

// Проверяем конфликты с существующими записями
for (const appointment of existingAppointments) {
  const existingSlotStart = new Date(appointment.slot.startAt);
  const existingServiceEndTime = new Date(existingSlotStart.getTime() + service.durationMin * 60 * 1000);
  
  // Проверяем пересечение времени:
  // Наш слот начинается до окончания существующей услуги И
  // Наша услуга заканчивается после начала существующего слота
  if (slotStart < existingServiceEndTime && serviceEndTime > existingSlotStart) {
    return res.status(409).json({ 
      error: "time conflict", 
      message: `This time slot conflicts with an existing appointment. Service duration is ${service.durationMin} minutes. Existing appointment: ${existingSlotStart.toISOString()} - ${existingServiceEndTime.toISOString()}` 
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
r.get("/:id", async (req, res) => {
const { id } = req.params;
const appointment = await prisma.appointment.findUnique({
  where: { id: Number(id) },
  include: { service: true, slot: true }
});

if (!appointment) {
  return res.status(404).json({ error: "appointment not found" });
}

res.json(appointment);
});

// Обновить статус записи
r.put("/:id", async (req, res) => {
const { id } = req.params;
const { status } = req.body;

const appointment = await prisma.appointment.update({
  where: { id: Number(id) },
  data: { status },
  include: { service: true, slot: true }
});

res.json(appointment);
});

// Удалить запись
r.delete("/:id", async (req, res) => {
const { id } = req.params;

await prisma.appointment.delete({
  where: { id: Number(id) }
});

res.status(204).send();
});


export default r;