import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const verifyToken = (req: any, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /analytics - Get comprehensive analytics data
router.get('/', verifyToken, async (req: any, res: Response) => {
  try {
    const { role, organizationId } = req.user;
    const { startDate, endDate } = req.query;

    // Parse date range
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Build where clause based on user role
    let whereClause: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    };

    if (role !== 'SUPER_ADMIN') {
      whereClause.service = {
        organizationId: organizationId
      };
    }

    // Get total appointments
    const totalAppointments = await prisma.appointment.count({
      where: whereClause
    });

    // Get total revenue
    const appointmentsWithServices = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            price: true,
            currency: true
          }
        }
      }
    });

    const totalRevenue = appointmentsWithServices.reduce((sum, appointment) => {
      return sum + (appointment.service.price || 0);
    }, 0);

    // Get top services
    const topServices = await prisma.service.findMany({
      where: role !== 'SUPER_ADMIN' ? { organizationId } : {},
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                createdAt: {
                  gte: start,
                  lte: end
                }
              }
            }
          }
        },
        appointments: {
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          },
          select: {
            service: {
              select: {
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        appointments: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const topServicesWithRevenue = topServices.map(service => ({
      serviceId: service.id,
      serviceName: service.name,
      bookings: service._count.appointments,
      revenue: service.appointments.reduce((sum, apt) => sum + (apt.service.price || 0), 0)
    }));

    // Get daily bookings - using Prisma ORM instead of raw SQL for SQLite compatibility
    const dailyBookingsData = await prisma.appointment.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        service: {
          select: {
            price: true,
            organizationId: true
          }
        }
      }
    });

    // Group by date manually
    const dailyMap = new Map<string, { bookings: number; revenue: number }>();
    dailyBookingsData.forEach(apt => {
      const date = apt.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { bookings: 0, revenue: 0 };
      dailyMap.set(date, {
        bookings: existing.bookings + 1,
        revenue: existing.revenue + (apt.service.price || 0)
      });
    });

    const dailyBookings = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, bookings: data.bookings, revenue: data.revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get monthly trends - using Prisma ORM instead of raw SQL
    const monthlyMap = new Map<string, { bookings: number; revenue: number }>();
    dailyBookingsData.forEach(apt => {
      const month = apt.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { bookings: 0, revenue: 0 };
      monthlyMap.set(month, {
        bookings: existing.bookings + 1,
        revenue: existing.revenue + (apt.service.price || 0)
      });
    });

    const monthlyTrends = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, bookings: data.bookings, revenue: data.revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate average booking time (simplified)
    const averageBookingTime = 30; // This would need more complex calculation

    // Customer insights
    const uniqueCustomers = await prisma.appointment.findMany({
      where: whereClause,
      select: {
        chatId: true,
        createdAt: true
      }
    });

    const customerMap = new Map();
    uniqueCustomers.forEach(apt => {
      if (!customerMap.has(apt.chatId)) {
        customerMap.set(apt.chatId, []);
      }
      customerMap.get(apt.chatId).push(apt.createdAt);
    });

    const newCustomers = Array.from(customerMap.values()).filter(bookings => 
      bookings.length === 1
    ).length;

    const returningCustomers = Array.from(customerMap.values()).filter(bookings => 
      bookings.length > 1
    ).length;

    const averageBookingFrequency = uniqueCustomers.length / customerMap.size;

    const analyticsData = {
      totalAppointments,
      totalRevenue,
      averageBookingTime,
      topServices: topServicesWithRevenue,
      dailyBookings: dailyBookings as any[],
      monthlyTrends: monthlyTrends as any[],
      customerInsights: {
        newCustomers,
        returningCustomers,
        averageBookingFrequency: Math.round(averageBookingFrequency * 10) / 10
      }
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/export - Export analytics data
router.get('/export', verifyToken, async (req: any, res: Response) => {
  try {
    const { role, organizationId } = req.user;
    const { startDate, endDate, format = 'csv' } = req.query;

    // Parse date range
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get appointments data
    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        ...(role !== 'SUPER_ADMIN' ? {
          service: {
            organizationId: organizationId
          }
        } : {})
      },
      include: {
        service: {
          select: {
            name: true,
            price: true,
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Date,Service,Organization,Price,Status\n';
      const csvData = appointments.map(apt => 
        `${apt.createdAt.toISOString().split('T')[0]},${apt.service.name},${apt.service.organization.name},${apt.service.price || 0},${apt.status}`
      ).join('\n');
      
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      res.json(appointments);
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/performance - Get system performance metrics
router.get('/performance', verifyToken, async (req: any, res: Response) => {
  try {
    const { role, organizationId } = req.user;

    // Get system metrics
    const totalOrganizations = await prisma.organization.count();
    const totalServices = await prisma.service.count({
      where: role !== 'SUPER_ADMIN' ? { organizationId } : {}
    });
    const totalSlots = await prisma.slot.count({
      where: role !== 'SUPER_ADMIN' ? {
        service: {
          organizationId: organizationId
        }
      } : {}
    });
    const totalAppointments = await prisma.appointment.count({
      where: role !== 'SUPER_ADMIN' ? {
        service: {
          organizationId: organizationId
        }
      } : {}
    });

    // Get recent activity
    const recentAppointments = await prisma.appointment.findMany({
      where: role !== 'SUPER_ADMIN' ? {
        service: {
          organizationId: organizationId
        }
      } : {},
      include: {
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const performanceData = {
      systemMetrics: {
        totalOrganizations,
        totalServices,
        totalSlots,
        totalAppointments
      },
      recentActivity: recentAppointments,
      timestamp: new Date().toISOString()
    };

    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
