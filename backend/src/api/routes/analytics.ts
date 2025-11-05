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
    const { startDate, endDate, timePeriod } = req.query;

    // Parse date range based on timePeriod or provided dates
    let start: Date;
    let end: Date = new Date();
    
    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else if (timePeriod === 'week') {
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timePeriod === 'month') {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (timePeriod === 'year') {
      start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    } else {
      // Default to last 30 days
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate previous period for growth rate
    const periodDuration = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodDuration);
    const previousEnd = start;

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

    // Get all appointments with full data
    const appointmentsWithServices = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            price: true,
            currency: true,
            durationMin: true,
            organizationId: true
          }
        },
        slot: {
          select: {
            startAt: true,
            endAt: true
          }
        }
      }
    });

    // Get total appointments
    const totalAppointments = appointmentsWithServices.length;

    // Get total revenue
    const totalRevenue = appointmentsWithServices.reduce((sum, appointment) => {
      return sum + (appointment.service.price || 0);
    }, 0);

    // Get status distribution
    const statusCounts = {
      confirmed: appointmentsWithServices.filter(a => a.status === 'confirmed').length,
      pending: appointmentsWithServices.filter(a => a.status === 'pending').length,
      cancelled: appointmentsWithServices.filter(a => a.status === 'cancelled').length,
      rejected: appointmentsWithServices.filter(a => a.status === 'cancelled' && a.rejectionReason).length
    };

    const totalWithStatus = statusCounts.confirmed + statusCounts.pending + statusCounts.cancelled;
    const statusDistribution = totalWithStatus > 0 ? [
      {
        name: 'Confirmed',
        value: Math.round((statusCounts.confirmed / totalWithStatus) * 100),
        count: statusCounts.confirmed
      },
      {
        name: 'Pending',
        value: Math.round((statusCounts.pending / totalWithStatus) * 100),
        count: statusCounts.pending
      },
      {
        name: 'Cancelled',
        value: Math.round((statusCounts.cancelled / totalWithStatus) * 100),
        count: statusCounts.cancelled
      }
    ] : [];

    // Get peak hours (group by hour from slot.startAt)
    const peakHoursMap = new Map<number, number>();
    appointmentsWithServices.forEach(apt => {
      if (apt.slot?.startAt) {
        const hour = new Date(apt.slot.startAt).getHours();
        peakHoursMap.set(hour, (peakHoursMap.get(hour) || 0) + 1);
      }
    });

    const peakHours = Array.from(peakHoursMap.entries())
      .map(([hour, bookings]) => ({
        hour: hour,
        hourLabel: hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`,
        bookings: bookings
      }))
      .sort((a, b) => a.hour - b.hour);

    // Calculate average duration from service.durationMin
    const averageDuration = appointmentsWithServices.length > 0
      ? Math.round(
          appointmentsWithServices.reduce((sum, apt) => sum + (apt.service.durationMin || 0), 0) /
          appointmentsWithServices.length
        )
      : 0;

    // Get active clients (unique chatIds in period)
    const activeClients = new Set(appointmentsWithServices.map(a => a.chatId)).size;

    // Get growth rate (compare with previous period)
    const previousWhereClause: any = {
      createdAt: {
        gte: previousStart,
        lte: previousEnd
      }
    };

    if (role !== 'SUPER_ADMIN') {
      previousWhereClause.service = {
        organizationId: organizationId
      };
    }

    const previousAppointmentsCount = await prisma.appointment.count({
      where: previousWhereClause
    });

    const growthRate = previousAppointmentsCount > 0
      ? Math.round(((totalAppointments - previousAppointmentsCount) / previousAppointmentsCount) * 100)
      : totalAppointments > 0 ? 100 : 0;

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

    // Format daily bookings for display
    // Group by date from appointmentsWithServices (already loaded)
    const dailyMap = new Map<string, { bookings: number; revenue: number }>();
    appointmentsWithServices.forEach(apt => {
      const date = apt.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { bookings: 0, revenue: 0 };
      dailyMap.set(date, {
        bookings: existing.bookings + 1,
        revenue: existing.revenue + (apt.service.price || 0)
      });
    });

    // Format for week/month/year display
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyBookings = Array.from(dailyMap.entries())
      .map(([date, data]) => {
        const dateObj = new Date(date);
        const dayName = dayNames[dateObj.getDay()];
        return {
          date,
          day: dayName,
          dayShort: dayName,
          appointments: data.bookings,
          bookings: data.bookings,
          revenue: data.revenue
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get monthly trends - using Prisma ORM instead of raw SQL
    const monthlyMap = new Map<string, { bookings: number; revenue: number }>();
    appointmentsWithServices.forEach(apt => {
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

    // Customer insights
    const customerMap = new Map();
    appointmentsWithServices.forEach(apt => {
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

    const averageBookingFrequency = appointmentsWithServices.length / (customerMap.size || 1);

    // Find best day and peak time for insights
    const dayBookings = new Map<string, number>();
    appointmentsWithServices.forEach(apt => {
      const dayName = dayNames[new Date(apt.createdAt).getDay()];
      dayBookings.set(dayName, (dayBookings.get(dayName) || 0) + 1);
    });

    const bestDay = Array.from(dayBookings.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const bestPeakHour = peakHours.sort((a, b) => b.bookings - a.bookings)[0];

    const analyticsData = {
      totalAppointments,
      totalRevenue,
      averageBookingTime: averageDuration,
      averageDuration,
      growthRate,
      activeClients,
      statusDistribution,
      peakHours,
      topServices: topServicesWithRevenue,
      dailyBookings: dailyBookings as any[],
      monthlyTrends: monthlyTrends as any[],
      customerInsights: {
        newCustomers,
        returningCustomers,
        averageBookingFrequency: Math.round(averageBookingFrequency * 10) / 10,
        totalClients: customerMap.size
      },
      insights: {
        bestDay: bestDay ? { day: bestDay[0], bookings: bestDay[1] } : null,
        peakTime: bestPeakHour ? { hour: bestPeakHour.hourLabel, bookings: bestPeakHour.bookings } : null,
        topService: topServicesWithRevenue[0] || null
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
