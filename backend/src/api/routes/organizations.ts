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
const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  avatar: z.string().url().optional()
});

const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional()
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

// Middleware to check if user is super admin
const requireSuperAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

// GET /organizations - Get all organizations (super admin) or user's organization
router.get('/', verifyToken, async (req: any, res: Response) => {
  try {
    const { role, organizationId } = req.user;

    if (role === 'SUPER_ADMIN') {
      // Super admin can see all organizations
      const organizations = await prisma.organization.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              services: true,
              users: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.json({
        organizations,
        isSuperAdmin: true
      });
    } else {
      // Regular users can only see their organization
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              services: true,
              users: true
            }
          }
        }
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      return res.json({
        organizations: [organization],
        isSuperAdmin: false
      });
    }
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /organizations/:id - Get specific organization
router.get('/:id', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;

    // Check if user has access to this organization
    if (role !== 'SUPER_ADMIN' && parseInt(id) !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            nameRu: true,
            nameEn: true,
            nameHe: true,
            durationMin: true
          }
        },
        _count: {
          select: {
            services: true,
            users: true
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /organizations - Create new organization (super admin only)
router.post('/', verifyToken, requireSuperAdmin, async (req: any, res: Response) => {
  try {
    const validatedData = createOrganizationSchema.parse(req.body);
    const { name, avatar } = validatedData;

    // Check if organization with this name already exists
    const existingOrg = await prisma.organization.findFirst({
      where: { name }
    });

    if (existingOrg) {
      return res.status(400).json({ error: 'Organization with this name already exists' });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        ...(avatar && { avatar })
      },
      include: {
        _count: {
          select: {
            services: true,
            users: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Organization created successfully',
      organization
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /organizations/:id - Update organization
router.put('/:id', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;
    const validatedData = updateOrganizationSchema.parse(req.body);

    // Check if user has access to this organization
    if (role !== 'SUPER_ADMIN' && parseInt(id) !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingOrg) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if name is being changed and if it already exists
    if (validatedData.name && validatedData.name !== existingOrg.name) {
      const nameExists = await prisma.organization.findFirst({
        where: {
          name: validatedData.name,
          id: { not: parseInt(id) }
        }
      });

      if (nameExists) {
        return res.status(400).json({ error: 'Organization with this name already exists' });
      }
    }

    const organization = await prisma.organization.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        ...(validatedData.avatar && { avatar: validatedData.avatar })
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            services: true,
            users: true
          }
        }
      }
    });

    res.json({
      message: 'Organization updated successfully',
      organization
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /organizations/:id - Delete organization (super admin only)
router.delete('/:id', verifyToken, requireSuperAdmin, async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            users: true,
            services: true
          }
        }
      }
    });

    if (!existingOrg) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if organization has users or services
    if (existingOrg._count.users > 0 || existingOrg._count.services > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete organization with users or services. Please remove all users and services first.' 
      });
    }

    await prisma.organization.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /organizations/:id/avatar - Upload avatar (placeholder for now)
router.post('/:id/avatar', verifyToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role, organizationId } = req.user;

    // Check if user has access to this organization
    if (role !== 'SUPER_ADMIN' && parseInt(id) !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For now, just return a placeholder URL
    // In a real implementation, you would handle file upload here
    const avatarUrl = `https://via.placeholder.com/150x150/667eea/ffffff?text=${encodeURIComponent(req.body.name || 'Org')}`;

    const organization = await prisma.organization.update({
      where: { id: parseInt(id) },
      data: { avatar: avatarUrl } as any
    });

    res.json({
      message: 'Avatar updated successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
