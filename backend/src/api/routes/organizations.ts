import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { botManager } from '../../bot/bot-manager';

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
  description: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  workingHours: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional()
});

const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  workingHours: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
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

// GET /organizations - Get all organizations for the current user
router.get('/', verifyToken, async (req: any, res: Response) => {
  try {
    const { role, userId } = req.user;

    if (role === 'SUPER_ADMIN') {
      // Super admin can see all organizations
      const organizations = await prisma.organization.findMany({
        include: {
          userOrganizations: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              services: true,
              userOrganizations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.json({
        organizations: organizations.map(org => ({
          ...org,
          userRole: null, // Super admin doesn't have a role in organizations
          users: org.userOrganizations.map(uo => ({
            ...uo.user,
            role: uo.role
          }))
        })),
        isSuperAdmin: true
      });
    } else {
      // Regular users see all organizations they belong to via UserOrganization
      const userOrganizations = await prisma.userOrganization.findMany({
        where: { userId },
        include: {
          organization: {
            include: {
              _count: {
                select: {
                  services: true,
                  userOrganizations: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const organizations = userOrganizations.map(uo => ({
        ...uo.organization,
        userRole: uo.role // Role of the current user in this organization
      }));

      return res.json({
        organizations,
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
    const { role, userId } = req.user;
    const organizationId = parseInt(id);

    // Check if user has access to this organization
    if (role !== 'SUPER_ADMIN') {
      const userOrg = await prisma.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId
          }
        }
      });

      if (!userOrg) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        userOrganizations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
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
            userOrganizations: true
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get current user's role in this organization
    let userRole = null;
    if (role !== 'SUPER_ADMIN') {
      const userOrg = await prisma.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId
          }
        }
      });
      userRole = userOrg?.role || null;
    }

    res.json({
      ...organization,
      userRole,
      users: organization.userOrganizations.map(uo => ({
        ...uo.user,
        role: uo.role
      }))
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /organizations - Create new organization (any authenticated user)
// TODO: Add check for max organizations per user limit (if needed in future)
router.post('/', verifyToken, async (req: any, res: Response) => {
  try {
    const validatedData = createOrganizationSchema.parse(req.body);
    const { name, description, address, workingHours, phone, email, avatar } = validatedData;
    const { userId } = req.user;

    // Check if organization with this name already exists
    const existingOrg = await prisma.organization.findFirst({
      where: { name }
    });

    if (existingOrg) {
      return res.status(400).json({ error: 'Organization with this name already exists' });
    }

    // Create organization and link user as OWNER in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name,
          ...(description && { description }),
          ...(address && { address }),
          ...(workingHours && { workingHours }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(avatar && { avatar })
        }
      });

      // Link user to organization as OWNER
      await tx.userOrganization.create({
        data: {
          userId,
          organizationId: organization.id,
          role: 'OWNER'
        }
      });

      // Return organization with counts
      return await tx.organization.findUnique({
        where: { id: organization.id },
        include: {
          _count: {
            select: {
              services: true,
              userOrganizations: true
            }
          }
        }
      });
    });

    // Create notification for the user who created the organization
    try {
      await prisma.notification.create({
        data: {
          userId: userId,
          organizationId: result.id,
          type: 'organization.created',
          title: 'Organization Created',
          message: `Organization "${result.name}" has been created successfully`,
          data: {
            organizationId: result.id,
            organizationName: result.name
          }
        }
      });
      console.log('✅ Notification created for organization creation');
    } catch (error) {
      console.error('⚠️  Failed to create notification for organization creation:', error);
      // Don't fail the request if notification creation fails
    }

    res.status(201).json({
      message: 'Organization created successfully',
      organization: result
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
    const { role, userId } = req.user;
    const organizationId = parseInt(id);
    const validatedData = updateOrganizationSchema.parse(req.body);

    // Check if user has access to this organization
    if (role !== 'SUPER_ADMIN') {
      const userOrg = await prisma.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId
          }
        }
      });

      if (!userOrg) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Only OWNER and ADMIN can update organization (or check if user has permission)
      if (userOrg.role !== 'OWNER' && userOrg.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only organization owners and admins can update organization' });
      }
    }

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!existingOrg) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if name is being changed and if it already exists
    if (validatedData.name && validatedData.name !== existingOrg.name) {
      const nameExists = await prisma.organization.findFirst({
        where: {
          name: validatedData.name,
          id: { not: organizationId }
        }
      });

      if (nameExists) {
        return res.status(400).json({ error: 'Organization with this name already exists' });
      }
    }

    // If botToken is being removed, stop the bot
    if (existingOrg.botToken && (validatedData.botToken === null || validatedData.botToken === undefined)) {
      try {
        console.log(`🛑 Stopping bot for organization ${organizationId} (${existingOrg.name}) - bot token being removed...`);
        await botManager.removeBotByOrganizationId(organizationId);
        console.log(`✅ Bot stopped for organization ${organizationId}`);
      } catch (error) {
        console.error(`⚠️  Error stopping bot for organization ${organizationId}:`, error);
        // Continue with update even if bot stop fails
      }
    }

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: validatedData,
      include: {
        userOrganizations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            services: true,
            userOrganizations: true
          }
        }
      }
    });

    res.json({
      message: 'Organization updated successfully',
      organization: {
        ...organization,
        users: organization.userOrganizations.map(uo => ({
          ...uo.user,
          role: uo.role
        }))
      }
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
    if (existingOrg._count.userOrganizations > 0 || existingOrg._count.services > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete organization with users or services. Please remove all users and services first.' 
      });
    }

    // Stop bot if organization has one
    if (existingOrg.botToken) {
      try {
        console.log(`🛑 Stopping bot for organization ${existingOrg.id} (${existingOrg.name}) before deletion...`);
        await botManager.removeBotByOrganizationId(parseInt(id));
        console.log(`✅ Bot stopped for organization ${existingOrg.id}`);
      } catch (error) {
        console.error(`⚠️  Error stopping bot for organization ${existingOrg.id}:`, error);
        // Continue with deletion even if bot stop fails
      }
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
    const { role, userId } = req.user;
    const organizationId = parseInt(id);

    // Check if user has access to this organization
    if (role !== 'SUPER_ADMIN') {
      const userOrg = await prisma.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId
          }
        }
      });

      if (!userOrg) {
        return res.status(403).json({ error: 'Access denied' });
      }
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
