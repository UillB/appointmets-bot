import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

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
  organizationId: z.number().int().positive().optional()
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

    res.json({
      services,
      isSuperAdmin: role === 'SUPER_ADMIN'
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /services/:id - Get specific service
router.get('/:id', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;

    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
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

    // Check if service has slots or appointments
    if (existingService._count.slots > 0 || existingService._count.appointments > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete service with existing slots or appointments. Please remove all slots and appointments first.' 
      });
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

export default router;