import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { verifyToken } from '../../lib/auth';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    organizationId: number;
    role: string;
  };
}

// Middleware to verify JWT token
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = await verifyToken(token);
    req.user = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Get user notifications
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;
    const { page = 1, limit = 50, unreadOnly = false } = req.query;

    const where: any = {
      userId,
      organizationId,
      isArchived: false
    };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const totalCount = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: { ...where, isRead: false }
    });

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Failed to get notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.post('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found or already read' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;

    await prisma.notification.updateMany({
      where: {
        userId,
        organizationId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    const notification = await prisma.notification.deleteMany({
      where: {
        id,
        userId
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Clear all notifications
router.delete('/clear-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;

    await prisma.notification.deleteMany({
      where: {
        userId,
        organizationId
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear all notifications:', error);
    res.status(500).json({ error: 'Failed to clear all notifications' });
  }
});

// Get notification statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, organizationId } = req.user!;

    const [total, unread, byType, recent] = await Promise.all([
      prisma.notification.count({
        where: { userId, organizationId, isArchived: false }
      }),
      prisma.notification.count({
        where: { userId, organizationId, isRead: false, isArchived: false }
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId, organizationId, isArchived: false },
        _count: { type: true }
      }),
      prisma.notification.findMany({
        where: { userId, organizationId, isArchived: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          title: true,
          createdAt: true,
          isRead: true
        }
      })
    ]);

    res.json({
      total,
      unread,
      byType,
      recent
    });
  } catch (error) {
    console.error('Failed to get notification stats:', error);
    res.status(500).json({ error: 'Failed to get notification statistics' });
  }
});

// Archive notification
router.post('/:id/archive', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId
      },
      data: {
        isArchived: true,
        archivedAt: new Date()
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to archive notification:', error);
    res.status(500).json({ error: 'Failed to archive notification' });
  }
});

export default router;
