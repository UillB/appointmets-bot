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
    } else if (timePeriod === 'all') {
      // For "all time", get the earliest appointment date (slot.startAt) or use a very old date
      // Also extend end date to show future bookings
      const whereForEarliest = role !== 'SUPER_ADMIN' ? {
        service: {
          organizationId: organizationId
        }
      } : {};
      
      // Get all appointments and find earliest slot.startAt
      const allAppointments = await prisma.appointment.findMany({
        where: whereForEarliest,
        include: {
          slot: {
            select: {
              startAt: true
            }
          }
        }
      });
      
      // Find earliest slot.startAt
      let earliestSlotDate: Date | null = null;
      allAppointments.forEach(apt => {
        if (apt.slot?.startAt) {
          const slotDate = new Date(apt.slot.startAt);
          if (!earliestSlotDate || slotDate < earliestSlotDate) {
            earliestSlotDate = slotDate;
          }
        }
      });
      
      start = earliestSlotDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Fallback to 1 year ago if no appointments
      
      // Extend end date to show future bookings (e.g., 1 year ahead)
      end = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (timePeriod === 'week') {
      // Show past 7 days + future 7 days (2 weeks total)
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (timePeriod === 'month') {
      // Show past 30 days + future 30 days (2 months total)
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (timePeriod === 'year') {
      // Show past year + future 6 months
      start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      end = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
    } else {
      // Default to last 30 days + future 30 days
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate previous period for growth rate
    const periodDuration = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodDuration);
    const previousEnd = start;

    // Build where clause based on user role
    // Filter by slot.startAt (appointment date) not createdAt (booking creation date)
    // This allows seeing future bookings
    let whereClause: any = {
      slot: {
        startAt: {
          gte: start,
          lte: end
        }
      }
    };

    if (role !== 'SUPER_ADMIN') {
      whereClause.service = {
        organizationId: organizationId
      };
    }

    // Build previous period where clause for growth rate comparison
    const previousWhereClause: any = {
      slot: {
        startAt: {
          gte: previousStart,
          lte: previousEnd
        }
      }
    };

    if (role !== 'SUPER_ADMIN') {
      previousWhereClause.service = {
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

    // Log for debugging - verify data is coming from database
    console.log(`📊 Analytics: Found ${appointmentsWithServices.length} appointments for period ${start.toISOString()} to ${end.toISOString()}`);
    if (appointmentsWithServices.length > 0) {
      console.log(`📊 Sample appointment dates:`, appointmentsWithServices.slice(0, 3).map(apt => ({
        id: apt.id,
        slotDate: apt.slot?.startAt,
        createdAt: apt.createdAt
      })));
    }

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

    // Fill in all hours (0-23) for a complete graph (even with 0 bookings)
    const peakHours = [];
    for (let hour = 0; hour < 24; hour++) {
      const bookings = peakHoursMap.get(hour) || 0;
      peakHours.push({
        hour: hour,
        hourLabel: hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`,
        bookings: bookings
      });
    }

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
    // previousWhereClause is already defined above, just use it
    const previousAppointmentsCount = await prisma.appointment.count({
      where: previousWhereClause
    });

    const growthRate = previousAppointmentsCount > 0
      ? Math.round(((totalAppointments - previousAppointmentsCount) / previousAppointmentsCount) * 100)
      : totalAppointments > 0 ? 100 : 0;

    // Get top services - use slot.startAt (appointment date) not createdAt
    const topServices = await prisma.service.findMany({
      where: role !== 'SUPER_ADMIN' ? { organizationId } : {},
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                slot: {
                  startAt: {
                    gte: start,
                    lte: end
                  }
                }
              }
            }
          }
        },
        appointments: {
          where: {
            slot: {
              startAt: {
                gte: start,
                lte: end
              }
            }
          },
          include: {
            slot: {
              select: {
                startAt: true
              }
            },
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
    // Group by slot.startAt date (appointment date), not createdAt (booking creation date)
    // This shows when appointments are scheduled, not when they were booked
    const dailyMap = new Map<string, { bookings: number; revenue: number }>();
    appointmentsWithServices.forEach(apt => {
      if (apt.slot?.startAt) {
        // Use slot.startAt (appointment date) instead of createdAt
        // Use local date, not UTC, to avoid timezone shifts
        const appointmentDate = new Date(apt.slot.startAt);
        // Get local date components to avoid timezone issues
        const year = appointmentDate.getFullYear();
        const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
        const day = String(appointmentDate.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        const existing = dailyMap.get(date) || { bookings: 0, revenue: 0 };
        dailyMap.set(date, {
          bookings: existing.bookings + 1,
          revenue: existing.revenue + (apt.service.price || 0)
        });
      }
    });

    // Fill in all days in the period for a complete graph (even with 0 bookings)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dailyBookings: Array<{ date: string; day: string; dayShort: string; dayLabel: string; appointments: number; bookings: number; revenue: number }> = [];
    
    // Generate all dates in the period
    const currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
    const periodEndDate = new Date(end);
    periodEndDate.setHours(23, 59, 59, 999); // Set to end of day
    
    // Determine label format and grouping based on period length
    const periodDays = Math.ceil((periodEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const useMonthFormat = periodDays > 14; // For month/year periods, show month-day format
    const useMonthlyGrouping = periodDays > 90; // For periods > 90 days, group by month instead of day
    
    if (useMonthlyGrouping) {
      // Group by month for "all time" or very long periods
      const monthlyGroupedMap = new Map<string, { bookings: number; revenue: number }>();
      
      // Aggregate daily data by month
      dailyMap.forEach((data, dateStr) => {
        // Parse date string (YYYY-MM-DD) to get month/year
        const [yearStr, monthStr] = dateStr.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed
        const monthKey = `${monthNames[month]} ${year}`;
        const existing = monthlyGroupedMap.get(monthKey) || { bookings: 0, revenue: 0 };
        monthlyGroupedMap.set(monthKey, {
          bookings: existing.bookings + data.bookings,
          revenue: existing.revenue + data.revenue
        });
      });
      
      // Generate all months in the period
      const monthStart = new Date(start);
      monthStart.setDate(1); // Start of month
      const monthEnd = new Date(end);
      monthEnd.setDate(1); // Start of month
      
      while (monthStart <= monthEnd) {
        const monthKey = `${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()}`;
        const data = monthlyGroupedMap.get(monthKey) || { bookings: 0, revenue: 0 };
        
        // Use local date components to avoid timezone issues
        const year = monthStart.getFullYear();
        const month = String(monthStart.getMonth() + 1).padStart(2, '0');
        const day = String(monthStart.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        dailyBookings.push({
          date: dateStr,
          day: monthKey,
          dayShort: monthNames[monthStart.getMonth()].substring(0, 3),
          dayLabel: monthKey,
          appointments: data.bookings,
          bookings: data.bookings,
          revenue: data.revenue
        });
        
        // Move to next month
        monthStart.setMonth(monthStart.getMonth() + 1);
      }
    } else {
      // Daily grouping for shorter periods
      while (currentDate <= periodEndDate) {
        // Use local date components to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const dayName = dayNames[currentDate.getDay()];
        const data = dailyMap.get(dateStr) || { bookings: 0, revenue: 0 };
        
        // Format label - show day of week + date for clarity
        const dayNum = currentDate.getDate();
        const monthName = monthNames[currentDate.getMonth()];
        const yearNum = currentDate.getFullYear();
        // Show format: "Tue, Jan 15" for short periods, "Tue, Jan 15, 2024" for longer periods
        const dayLabel = periodDays > 60 
          ? `${dayName}, ${monthName} ${dayNum}, ${yearNum}` 
          : `${dayName}, ${monthName} ${dayNum}`;
        const fullDate = periodDays > 60 
          ? `${dayName}, ${monthName} ${dayNum}, ${yearNum}` 
          : `${dayName}, ${monthName} ${dayNum}`;
        
        dailyBookings.push({
          date: dateStr,
          day: dayName,
          dayShort: dayName,
          dayLabel: dayLabel,
          fullDate: fullDate, // Day of week + full date for tooltip
          appointments: data.bookings,
          bookings: data.bookings,
          revenue: data.revenue
        });
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Sort by date
    dailyBookings.sort((a, b) => a.date.localeCompare(b.date));
    
    // Log for debugging - verify daily bookings data
    console.log(`📊 Daily bookings count: ${dailyBookings.length}`);
    const bookingsWithData = dailyBookings.filter(d => d.bookings > 0);
    console.log(`📊 Days with bookings: ${bookingsWithData.length}`);
    if (bookingsWithData.length > 0) {
      console.log(`📊 Sample daily bookings:`, bookingsWithData.slice(0, 5).map(d => ({
        date: d.date,
        dayLabel: d.dayLabel,
        bookings: d.bookings
      })));
    }

    // Get monthly trends - using slot.startAt (appointment date) instead of createdAt
    const monthlyMap = new Map<string, { bookings: number; revenue: number }>();
    appointmentsWithServices.forEach(apt => {
      if (apt.slot?.startAt) {
        const appointmentDate = new Date(apt.slot.startAt);
        const month = appointmentDate.toISOString().slice(0, 7); // YYYY-MM
        const existing = monthlyMap.get(month) || { bookings: 0, revenue: 0 };
        monthlyMap.set(month, {
          bookings: existing.bookings + 1,
          revenue: existing.revenue + (apt.service.price || 0)
        });
      }
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

    // Find best day (specific date, not just day of week) and peak time for insights
    // Use slot.startAt (appointment date) instead of createdAt
    const dateBookings = new Map<string, { count: number; date: Date }>();
    appointmentsWithServices.forEach(apt => {
      if (apt.slot?.startAt) {
        const aptDate = new Date(apt.slot.startAt);
        const dateKey = aptDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const existing = dateBookings.get(dateKey);
        if (existing) {
          existing.count += 1;
        } else {
          dateBookings.set(dateKey, { count: 1, date: aptDate });
        }
      }
    });

    // Find the date with most bookings
    const bestDateEntry = Array.from(dateBookings.entries())
      .sort((a, b) => b[1].count - a[1].count)[0];
    
    const bestDay = bestDateEntry ? {
      date: bestDateEntry[0],
      dateObj: bestDateEntry[1].date,
      dayName: dayNames[bestDateEntry[1].date.getDay()],
      bookings: bestDateEntry[1].count,
      formatted: `${monthNames[bestDateEntry[1].date.getMonth()]} ${bestDateEntry[1].date.getDate()}, ${bestDateEntry[1].date.getFullYear()}`
    } : null;

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
        bestDay: bestDay ? { 
          day: bestDay.dayName, 
          date: bestDay.date,
          formatted: bestDay.formatted,
          bookings: bestDay.bookings 
        } : null,
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
