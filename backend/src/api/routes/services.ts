import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { performanceMonitor, monitorPerformance, QueryOptimizer } from '../../lib/performance';
import { DatabaseCache, CacheUtils } from '../../lib/cache';

// Get WebSocket emitters from global scope
const getAppointmentEmitter = () => (global as any).appointmentEmitter;
const getServiceEmitter = () => (global as any).serviceEmitter;
const getBotEmitter = () => (global as any).botEmitter;

const router = Router();
const prisma = new PrismaClient();

// Auto-generate slots for a service (1 year ahead)
async function generateSlotsForService(serviceId: number, durationMin: number, workingHours?: {
  startTime?: string;
  endTime?: string;
  lunchStart?: string;
  lunchEnd?: string;
  workingDays?: number[];
}) {
  console.log(`🔄 Auto-generating slots for service ${serviceId} (${durationMin} min duration)`);
  
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  // Parse working hours or use defaults
  const startTime = workingHours?.startTime || "09:00";
  const endTime = workingHours?.endTime || "18:00";
  const lunchStart = workingHours?.lunchStart;
  const lunchEnd = workingHours?.lunchEnd;
  const workingDays = workingHours?.workingDays || [1, 2, 3, 4, 5]; // Monday-Friday by default
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const CAPACITY = 1; // 1 person per slot
  
  let totalCreated = 0;
  
  // Generate slots for each day from today to one year from now
  for (let d = 0; d < 365; d++) {
    const day = new Date(today);
    day.setDate(day.getDate() + d);
    
    // Skip days that are not in working days (0=Sunday, 1=Monday, etc.)
    const dayOfWeek = day.getDay();
    if (!workingDays.includes(dayOfWeek)) {
      continue;
    }
    
    const year = day.getFullYear();
    const month = day.getMonth();
    const date = day.getDate();
    
    // Check if slots already exist for this day
    const dayStart = new Date(year, month, date, 0, 0, 0, 0);
    const dayEnd = new Date(year, month, date, 23, 59, 59, 999);
    
    const existingSlots = await prisma.slot.findMany({
      where: { 
        serviceId: serviceId, 
        startAt: { gte: dayStart, lte: dayEnd } 
      }
    });
    
    if (existingSlots.length > 0) {
      console.log(`  ⏭️  ${date}.${month + 1}.${year} - slots already exist (${existingSlots.length})`);
      continue;
    }
    
    // Parse lunch break times if provided
    let lunchStartTime = null;
    let lunchEndTime = null;
    if (lunchStart && lunchEnd) {
      const [lunchStartHour, lunchStartMinute] = lunchStart.split(':').map(Number);
      const [lunchEndHour, lunchEndMinute] = lunchEnd.split(':').map(Number);
      lunchStartTime = new Date(year, month, date, lunchStartHour, lunchStartMinute, 0, 0);
      lunchEndTime = new Date(year, month, date, lunchEndHour, lunchEndMinute, 0, 0);
    }
    
    // Create slots for this day
    const slots = [];
    const dayStartTime = new Date(year, month, date, startHour, startMinute, 0, 0);
    const dayEndTime = new Date(year, month, date, endHour, endMinute, 0, 0);
    
    // Generate slots every 30 minutes within working hours
    for (let currentTime = new Date(dayStartTime); currentTime < dayEndTime; currentTime.setMinutes(currentTime.getMinutes() + 30)) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(slotStart.getTime() + durationMin * 60 * 1000);
      
      // Skip past times
      if (slotEnd <= today) continue;
      
      // Skip if slot would go beyond working hours
      if (slotEnd > dayEndTime) continue;
      
      // Skip lunch break if it exists
      if (lunchStartTime && lunchEndTime) {
        if ((slotStart >= lunchStartTime && slotStart < lunchEndTime) ||
            (slotEnd > lunchStartTime && slotEnd <= lunchEndTime) ||
            (slotStart <= lunchStartTime && slotEnd >= lunchEndTime)) {
          continue;
        }
      }
      
      slots.push({
        serviceId: serviceId,
        startAt: slotStart,
        endAt: slotEnd,
        capacity: CAPACITY
      });
    }
    
    if (slots.length > 0) {
      try {
        await prisma.slot.createMany({
          data: slots
        });
        totalCreated += slots.length;
        console.log(`  ✅ ${date}.${month + 1}.${year} - created ${slots.length} slots`);
      } catch (error) {
        console.error(`  ❌ Failed to create slots for ${date}.${month + 1}.${year}:`, error);
      }
    }
  }
  
  console.log(`✅ Auto-generation complete: ${totalCreated} slots created for service ${serviceId}`);
  return totalCreated;
}

// Check slot expiration and generate new slots if needed
async function checkAndRenewSlots(serviceId: number) {
  console.log(`🔍 Checking slot expiration for service ${serviceId}`);
  
  // Get the service details
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { slots: { orderBy: { startAt: 'desc' }, take: 1 } }
  });
  
  if (!service) {
    throw new Error('Service not found');
  }
  
  // Check if we have any slots
  if (service.slots.length === 0) {
    console.log(`⚠️ No slots found for service ${serviceId}, generating new ones`);
    await generateSlotsForService(serviceId, service.durationMin);
    return { needsRenewal: true, message: 'No slots found, generated new ones' };
  }
  
  // Get the latest slot date
  const latestSlot = service.slots[0];
  const latestSlotDate = new Date(latestSlot.startAt);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((latestSlotDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log(`📅 Latest slot: ${latestSlotDate.toDateString()}, Days until expiry: ${daysUntilExpiry}`);
  
  // If slots expire in less than 30 days, suggest renewal
  if (daysUntilExpiry < 30) {
    return {
      needsRenewal: true,
      daysUntilExpiry,
      latestSlotDate: latestSlotDate.toISOString(),
      message: `Slots expire in ${daysUntilExpiry} days. Consider generating new slots.`
    };
  }
  
  return {
    needsRenewal: false,
    daysUntilExpiry,
    latestSlotDate: latestSlotDate.toISOString(),
    message: `Slots are valid for ${daysUntilExpiry} more days.`
  };
}

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

// Validation schemas
const createServiceSchema = z.object({
  name: z.string().min(2).max(100),
  nameRu: z.string().min(2).max(100).optional(),
  nameEn: z.string().min(2).max(100).optional(),
  nameHe: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  descriptionRu: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  descriptionHe: z.string().max(500).optional(),
  durationMin: z.number().int().min(5).max(480), // 5 minutes to 8 hours
  price: z.number().positive().optional(), // Опциональная стоимость
  currency: z.string().length(3).optional(), // Опциональная валюта (RUB, USD, EUR)
  organizationId: z.number().int().positive().optional(),
  // Working hours configuration
  workStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  workEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  lunchStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  lunchEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  workingDays: z.array(z.number().int().min(0).max(6)).optional()
});

const updateServiceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  nameRu: z.string().min(2).max(100).optional(),
  nameEn: z.string().min(2).max(100).optional(),
  nameHe: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  descriptionRu: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  descriptionHe: z.string().max(500).optional(),
  durationMin: z.number().int().min(5).max(480).optional(),
  price: z.number().positive().optional(), // Опциональная стоимость
  currency: z.string().length(3).optional() // Опциональная валюта
});

// Middleware to verify JWT token
const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /services - Get all services (super admin) or organization's services
router.get('/', verifyToken, async (req: any, res: Response) => {
  const endTimer = performanceMonitor.startTimer('get_services');
  
  try {
    const { role, organizationId } = req.user;
    const { organizationId: queryOrgId } = req.query;

    let whereClause: any = {};

    if (role === 'SUPER_ADMIN') {
      // Super admin can see all services or filter by organization
      if (queryOrgId) {
        whereClause.organizationId = parseInt(queryOrgId as string);
      }
    } else {
      // Regular users can only see services from their organization
      whereClause.organizationId = organizationId;
    }

    // Create cache key based on user role and filters
    const cacheKey = `services_${role}_${organizationId}_${queryOrgId || 'all'}`;
    
    const result = await DatabaseCache.getCachedQuery(
      cacheKey,
      async () => {
        const services = await prisma.service.findMany({
          where: whereClause,
          include: {
            organization: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: {
                slots: true,
                appointments: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return {
          services,
          total: services.length,
          page: 1,
          limit: services.length,
          isSuperAdmin: role === 'SUPER_ADMIN'
        };
      },
      30000 // 30 seconds cache
    );

    endTimer();
    res.json(result);
  } catch (error) {
    endTimer();
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /services/stats - Get services statistics
router.get('/stats', verifyToken, async (req: any, res: Response) => {
  try {
    const { role, organizationId } = req.user;

    let whereClause: any = {};

    if (role === 'SUPER_ADMIN') {
      const { organizationId: queryOrgId } = req.query;
      if (queryOrgId) {
        whereClause.organizationId = parseInt(queryOrgId as string);
      }
    } else {
      whereClause.organizationId = organizationId;
    }

    // Get service IDs for this organization
    const services = await prisma.service.findMany({
      where: whereClause,
      select: { id: true }
    });
    const serviceIds = services.map(s => s.id);

    // Basic counts
    const totalServices = serviceIds.length;

    // Get appointment counts
    const totalAppointments = await prisma.appointment.count({
      where: { serviceId: { in: serviceIds } }
    });

    const pendingAppointments = await prisma.appointment.count({
      where: { 
        serviceId: { in: serviceIds },
        status: 'pending' 
      }
    });

    // Get today's appointments
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const todayAppointments = await prisma.appointment.count({
      where: { 
        serviceId: { in: serviceIds },
        slot: {
          startAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }
    });

    // Get this week's appointments
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekAppointments = await prisma.appointment.count({
      where: { 
        serviceId: { in: serviceIds },
        slot: {
          startAt: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      }
    });

    // Get slots count
    const totalSlots = await prisma.slot.count({ 
      where: { serviceId: { in: serviceIds } } 
    });

    const averageOccupancy = totalSlots > 0 ? Math.round((totalAppointments / totalSlots) * 100) : 0;

    // Calculate revenue by getting appointments with their service prices
    const appointmentsWithRevenue = await prisma.appointment.findMany({
      where: { 
        serviceId: { in: serviceIds },
        status: { not: 'cancelled' }
      },
      include: {
        service: {
          select: { price: true }
        }
      }
    });

    const todayAppointmentsWithRevenue = await prisma.appointment.findMany({
      where: { 
        serviceId: { in: serviceIds },
        status: { not: 'cancelled' },
        slot: {
          startAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      },
      include: {
        service: {
          select: { price: true }
        }
      }
    });

    const totalRevenue = appointmentsWithRevenue.reduce((sum, apt) => sum + (apt.service.price || 0), 0);
    const todayRevenue = todayAppointmentsWithRevenue.reduce((sum, apt) => sum + (apt.service.price || 0), 0);

    const stats = {
      totalServices,
      totalAppointments,
      todayAppointments,
      weekAppointments,
      pendingAppointments,
      averageOccupancy,
      totalRevenue,
      todayRevenue
    };

    res.json(stats);
  } catch (error) {
    console.error('Get services stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /services/:id - Get specific service
router.get('/:id', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;

    // Validate ID parameter
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        slots: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
            capacity: true,
            _count: {
              select: {
                bookings: true
              }
            }
          },
          orderBy: {
            startAt: 'asc'
          }
        },
        _count: {
          select: {
            slots: true,
            appointments: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if user has access to this service
    if (role !== 'SUPER_ADMIN' && service.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /services - Create new service
router.post('/', verifyToken, async (req: any, res: Response) => {
  try {
    const { role, organizationId } = req.user;
    const validatedData = createServiceSchema.parse(req.body);

    // Determine organization ID
    let targetOrganizationId = organizationId;
    if (role === 'SUPER_ADMIN' && validatedData.organizationId) {
      targetOrganizationId = validatedData.organizationId;
    }

    if (!targetOrganizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: targetOrganizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if service with this name already exists in the organization
    const existingService = await prisma.service.findFirst({
      where: {
        name: validatedData.name,
        organizationId: targetOrganizationId
      }
    });

    if (existingService) {
      return res.status(400).json({ error: 'Service with this name already exists in this organization' });
    }

    const service = await prisma.service.create({
      data: {
        name: validatedData.name,
        nameRu: validatedData.nameRu,
        nameEn: validatedData.nameEn,
        nameHe: validatedData.nameHe,
        description: validatedData.description,
        descriptionRu: validatedData.descriptionRu,
        descriptionEn: validatedData.descriptionEn,
        descriptionHe: validatedData.descriptionHe,
        durationMin: validatedData.durationMin,
        price: validatedData.price,
        currency: validatedData.currency,
        organizationId: targetOrganizationId
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            slots: true,
            appointments: true
          }
        }
      }
    });

    // Auto-generate slots for 1 year when service is created
    try {
      const workingHours = {
        startTime: validatedData.workStart,
        endTime: validatedData.workEnd,
        lunchStart: validatedData.lunchStart,
        lunchEnd: validatedData.lunchEnd,
        workingDays: validatedData.workingDays
      };
      await generateSlotsForService(service.id, validatedData.durationMin, workingHours);
      console.log(`✅ Auto-generated slots for service ${service.name} (ID: ${service.id})`);
    } catch (slotError) {
      console.error(`❌ Failed to auto-generate slots for service ${service.id}:`, slotError);
      // Don't fail the service creation if slot generation fails
    }

    // Emit real-time notification for service creation
    try {
      const serviceEmitter = getServiceEmitter();
      if (serviceEmitter) {
        await serviceEmitter.emitServiceCreated(service);
        console.log('✅ WebSocket notification sent for service creation');
      }
    } catch (error) {
      console.error('❌ Failed to send WebSocket notification for service creation:', error);
      // Don't fail the request if WebSocket notification fails
    }

    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /services/:id - Update service
router.put('/:id', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;
    const validatedData = updateServiceSchema.parse(req.body);

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if user has access to this service
    if (role !== 'SUPER_ADMIN' && existingService.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if name is being changed and if it already exists in the organization
    if (validatedData.name && validatedData.name !== existingService.name) {
      const nameExists = await prisma.service.findFirst({
        where: {
          name: validatedData.name,
          organizationId: existingService.organizationId,
          id: { not: parseInt(id) }
        }
      });

      if (nameExists) {
        return res.status(400).json({ error: 'Service with this name already exists in this organization' });
      }
    }

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: validatedData,
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            slots: true,
            appointments: true
          }
        }
      }
    });

    // Emit real-time notification for service update
    try {
      const serviceEmitter = getServiceEmitter();
      if (serviceEmitter) {
        await serviceEmitter.emitServiceUpdated(service, validatedData);
        console.log('✅ WebSocket notification sent for service update');
      }
    } catch (error) {
      console.error('❌ Failed to send WebSocket notification for service update:', error);
      // Don't fail the request if WebSocket notification fails
    }

    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /services/:id/slots/status - Check slot expiration status
router.get('/:id/slots/status', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;
    const serviceId = parseInt(id);

    // Check if service exists and user has access
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId: role === 'SUPER_ADMIN' ? undefined : organizationId
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found or access denied' });
    }

    const status = await checkAndRenewSlots(serviceId);
    res.json(status);
  } catch (error) {
    console.error('Check slot status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /services/:id/slots/renew - Generate new slots for another year
router.post('/:id/slots/renew', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;
    const serviceId = parseInt(id);

    // Check if service exists and user has access
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organizationId: role === 'SUPER_ADMIN' ? undefined : organizationId
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found or access denied' });
    }

    // Generate new slots for another year
    const slotsCreated = await generateSlotsForService(serviceId, service.durationMin);
    
    res.json({
      message: 'Slots renewed successfully',
      slotsCreated,
      serviceId
    });
  } catch (error) {
    console.error('Renew slots error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /services/:id - Delete service
router.delete('/:id', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            slots: true,
            appointments: true
          }
        },
        appointments: {
          where: {
            createdAt: {
              gte: new Date() // Only future appointments
            }
          },
          include: {
            slot: {
              select: {
                startAt: true,
                endAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if user has access to this service
    if (role !== 'SUPER_ADMIN' && existingService.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check for future appointments and provide detailed information
    const futureAppointments = existingService.appointments.filter(apt => 
      new Date(apt.slot.startAt) > new Date()
    );

    if (futureAppointments.length > 0) {
      const nextAppointment = futureAppointments[0];
      const nextAppointmentDate = new Date(nextAppointment.slot.startAt);
      
      return res.status(400).json({ 
        error: 'Cannot delete service with future appointments',
        details: {
          totalAppointments: existingService._count.appointments,
          futureAppointments: futureAppointments.length,
          nextAppointmentDate: nextAppointmentDate.toISOString(),
          nextAppointmentTime: nextAppointmentDate.toLocaleString(),
          message: `This service has ${futureAppointments.length} future appointment(s). The next one is scheduled for ${nextAppointmentDate.toLocaleDateString()} at ${nextAppointmentDate.toLocaleTimeString()}. Deleting this service will automatically cancel all future appointments.`
        }
      });
    }

    // Check if service has slots
    if (existingService._count.slots > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete service with existing slots',
        details: {
          totalSlots: existingService._count.slots,
          message: 'This service has time slots that need to be removed first. Slots will be automatically deleted when you delete the service.'
        }
      });
    }

    // Emit real-time notification for service deletion before deleting
    try {
      const serviceEmitter = getServiceEmitter();
      if (serviceEmitter) {
        await serviceEmitter.emitServiceDeleted(existingService);
        console.log('✅ WebSocket notification sent for service deletion');
      }
    } catch (error) {
      console.error('❌ Failed to send WebSocket notification for service deletion:', error);
      // Don't fail the request if WebSocket notification fails
    }

    await prisma.service.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /services/:id/force - Force delete service with confirmation
router.delete('/:id/force', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;
    const { confirmDelete } = req.body;

    if (!confirmDelete) {
      return res.status(400).json({ 
        error: 'Confirmation required',
        message: 'You must confirm deletion by setting confirmDelete to true'
      });
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            slots: true,
            appointments: true
          }
        },
        appointments: {
          where: {
            createdAt: {
              gte: new Date() // Only future appointments
            }
          },
          include: {
            slot: {
              select: {
                startAt: true,
                endAt: true
              }
            }
          }
        }
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if user has access to this service
    if (role !== 'SUPER_ADMIN' && existingService.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const futureAppointments = existingService.appointments.filter(apt => 
      new Date(apt.slot.startAt) > new Date()
    );

    // Delete all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete appointments first (they reference slots)
      await tx.appointment.deleteMany({
        where: { serviceId: parseInt(id) }
      });

      // Delete slots
      await tx.slot.deleteMany({
        where: { serviceId: parseInt(id) }
      });

      // Delete the service
      await tx.service.delete({
        where: { id: parseInt(id) }
      });
    });

    // Emit real-time notification for service deletion
    try {
      const serviceEmitter = getServiceEmitter();
      if (serviceEmitter) {
        await serviceEmitter.emitServiceDeleted(existingService);
        console.log('✅ WebSocket notification sent for service deletion');
      }
    } catch (error) {
      console.error('❌ Failed to send WebSocket notification for service deletion:', error);
    }

    res.json({
      message: 'Service deleted successfully',
      deletedAppointments: futureAppointments.length,
      deletedSlots: existingService._count.slots,
      serviceId: parseInt(id)
    });
  } catch (error) {
    console.error('Force delete service error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;