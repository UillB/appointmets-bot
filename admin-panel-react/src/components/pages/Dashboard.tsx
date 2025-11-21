import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  Wrench, 
  Building2, 
  Settings,
  CalendarDays,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Crown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { QuickActionCard } from "../cards/QuickActionCard";
import { StatCard } from "../cards/StatCard";
import { AppointmentCard } from "../cards/AppointmentCard";
import { AppointmentsSummaryCard } from "../cards/AppointmentsSummaryCard";
import { PageHeader } from "../PageHeader";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useSetupWizard } from "../../hooks/useSetupWizard";
import { createToastNotifications } from "../toast-notifications";
import { formatTimeToLocal, isSameDay } from "../../utils/dateUtils";
import { SetupBanner } from "../SetupBanner";
import { SetupSuccessModal } from "../SetupSuccessModal";
import { listenToSetupWizardModal, SetupWizardModalData } from "../../utils/setupWizardEvents";
import { useLanguage } from "../../i18n";
import { SubscriptionLimitsAlert } from "../SubscriptionLimitsAlert";

interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  pendingAppointments: number;
  totalServices: number;
  activeServices: number;
  totalRevenue: number;
  todayRevenue: number;
}

export function Dashboard() {
  const { t } = useLanguage();
  const toastNotifications = createToastNotifications(t);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events } = useWebSocket();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [organizationsCount, setOrganizationsCount] = useState(0);
  const [appointmentsStats, setAppointmentsStats] = useState({
    confirmed: 0,
    rejected: 0
  });
  const [botActive, setBotActive] = useState(false);
  const [adminLinked, setAdminLinked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const setupWizard = useSetupWizard();
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    step: 'service' | 'bot' | 'admin' | 'complete';
    message: string;
    primaryAction?: { label: string; onClick: () => void };
    secondaryAction?: { label: string; onClick: () => void };
  }>({
    open: false,
    step: 'service',
    message: '',
  });

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, appointmentsData, organizationsData, summaryStatsData, botStatusData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getAppointments({ limit: 100 }), // Load more appointments for calendar
        apiClient.getOrganizations(),
        apiClient.getAppointmentsSummaryStats().catch(() => ({ totalAppointments: 0, confirmedAppointments: 0, pendingAppointments: 0, rejectedAppointments: 0 })), // Use new endpoint
        user?.organizationId ? apiClient.getBotStatus(user.organizationId).catch(() => null) : Promise.resolve(null)
      ]);
      
      setStats(statsData);
      setRecentAppointments(appointmentsData.appointments);
      setOrganizationsCount(organizationsData.organizations.length);
      
      // Use summary stats from the new endpoint
      setAppointmentsStats({ 
        confirmed: summaryStatsData.confirmedAppointments, 
        rejected: summaryStatsData.rejectedAppointments 
      });
      
      // Update bot status
      if (botStatusData?.success && botStatusData.botStatus) {
        setBotActive(botStatusData.botStatus.botActive || botStatusData.botStatus.isActive || false);
        // Use adminLinked from botStatus or check user telegramId as fallback
        setAdminLinked(botStatusData.botStatus.adminLinked !== undefined ? botStatusData.botStatus.adminLinked : !!user?.telegramId);
      } else {
        setBotActive(false);
        setAdminLinked(false);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error(t('toasts.failedToLoadDashboard'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle real-time WebSocket events for appointments
  useEffect(() => {
    if (events.length === 0) return;

    const latestEvent = events[0];
    
    if (latestEvent.type === 'appointment.created' || latestEvent.type === 'appointment_created') {
      // Show toast notification
      toastNotifications.appointments.created();
      
      // Reload dashboard data to get updated stats and appointments
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } else if (latestEvent.type === 'appointment.updated' || latestEvent.type === 'appointment_updated') {
      toastNotifications.appointments.updated(latestEvent.data?.customerName);
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } else if (latestEvent.type === 'appointment.cancelled' || latestEvent.type === 'appointment_cancelled') {
      toastNotifications.appointments.cancelled(latestEvent.data?.customerName);
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    } else if (latestEvent.type === 'appointment.confirmed' || latestEvent.type === 'appointment_confirmed') {
      toastNotifications.appointments.confirmed(latestEvent.data?.customerName);
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    }
  }, [events]);

  // Refresh setup wizard state when data changes
  useEffect(() => {
    setupWizard.refresh();
  }, [stats?.totalServices, botActive, adminLinked]);

  // Listen for setup wizard modal events
  useEffect(() => {
    const unsubscribe = listenToSetupWizardModal((data: SetupWizardModalData) => {
      setSuccessModal({
        open: true,
        step: data.step,
        message: data.message,
        primaryAction: data.primaryAction,
        secondaryAction: data.secondaryAction,
      });
    });
    return unsubscribe;
  }, []);

  // Setup wizard action handlers
  const handleCreateService = () => {
    navigate('/services', { state: { openDialog: true } });
  };

  const handleConnectBot = () => {
    navigate('/bot-management', { state: { activeTab: 'instructions' } });
  };

  const handleLinkAdmin = () => {
    navigate('/bot-management', { state: { activeTab: 'link-admin' } });
  };

  // Initialize filtered appointments when recentAppointments change
  useEffect(() => {
    if (selectedDate && recentAppointments.length > 0) {
      const filtered = recentAppointments.filter((apt: any) => {
        if (apt.slot?.startAt) {
          return isSameDay(new Date(apt.slot.startAt), selectedDate);
        }
        return false;
      });
      setFilteredAppointments(filtered);
    }
  }, [recentAppointments, selectedDate]);


  // Calendar functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    
    // Filter appointments for selected date
    const filtered = recentAppointments.filter((apt: any) => {
      if (apt.slot?.startAt) {
        return isSameDay(new Date(apt.slot.startAt), newDate);
      }
      return false;
    });
    setFilteredAppointments(filtered);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const hasAppointments = (day: number) => {
    if (!recentAppointments || recentAppointments.length === 0) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return recentAppointments.some((apt: any) => {
      if (apt.slot?.startAt) {
        return isSameDay(new Date(apt.slot.startAt), date);
      }
      return false;
    });
  };

  const quickActions = [
    {
      icon: CalendarIcon,
      iconBg: "bg-blue-50 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: t('dashboard.quickActions.appointments.title'),
      description: t('dashboard.quickActions.appointments.description'),
      badge: { text: `${stats?.todayAppointments || 0} ${t('dashboard.quickActions.today')}`, variant: "indigo" },
      onClick: () => navigate("/appointments")
    },
    {
      icon: Wrench,
      iconBg: "bg-purple-50 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      title: t('dashboard.quickActions.services.title'),
      description: t('dashboard.quickActions.services.description'),
      badge: { text: `${stats?.totalServices || 0} ${t('dashboard.quickActions.available')}`, variant: "" },
      onClick: () => navigate("/services")
    },
    {
      icon: Building2,
      iconBg: "bg-indigo-50 dark:bg-indigo-900/50",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      title: t('dashboard.quickActions.organizations.title'),
      description: t('dashboard.quickActions.organizations.description'),
      badge: { text: `${organizationsCount} ${t('dashboard.quickActions.active')}`, variant: "blue" },
      onClick: () => navigate("/organizations")
    },
    {
      icon: Settings,
      iconBg: "bg-gray-50 dark:bg-gray-800",
      iconColor: "text-gray-600 dark:text-gray-400",
      title: t('dashboard.quickActions.settings.title'),
      description: t('dashboard.quickActions.settings.description'),
      badge: { text: t('dashboard.quickActions.account') },
      onClick: () => navigate("/settings")
    },
    {
      icon: Crown,
      iconBg: "bg-amber-50 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: t('dashboard.quickActions.subscription.title'),
      description: t('dashboard.quickActions.subscription.description'),
      badge: { text: t('dashboard.quickActions.subscription.manage') },
      onClick: () => navigate("/settings?tab=subscription")
    }
  ];

  const statsData = stats ? [
    {
      icon: CalendarDays,
      iconBg: "bg-blue-50 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: t('dashboard.stats.totalAppointments'),
      value: stats.totalAppointments,
      subtitle: t('dashboard.stats.allTime'),
      trend: stats.weekAppointments > 0 ? Math.round((stats.weekAppointments / Math.max(stats.totalAppointments, 1)) * 100) : 0
    },
    {
      icon: Clock,
      iconBg: "bg-indigo-50 dark:bg-indigo-900/50",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      title: t('dashboard.stats.todaysBookings'),
      value: stats.todayAppointments,
      subtitle: t('dashboard.stats.scheduledForToday'),
      trend: stats.todayAppointments > 0 ? Math.min(Math.round((stats.todayAppointments / Math.max(stats.weekAppointments, 1)) * 100), 100) : 0
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-amber-50 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: t('dashboard.stats.pendingApprovals'),
      value: stats.pendingAppointments,
      subtitle: t('dashboard.stats.awaitingConfirmation'),
      trend: stats.pendingAppointments > 0 ? Math.min(Math.round((stats.pendingAppointments / Math.max(stats.totalAppointments, 1)) * 100), 100) : 0
    },
    {
      icon: Sparkles,
      iconBg: "bg-purple-50 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      title: t('dashboard.stats.activeServices'),
      value: stats.totalServices,
      subtitle: t('dashboard.stats.availableForBooking'),
      trend: stats.totalServices > 0 ? Math.min(Math.round((stats.totalServices / 10) * 100), 100) : 0
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)] bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  // Check if setup is incomplete
  const setupIncomplete = !setupWizard.hasServices || !setupWizard.botActive || !setupWizard.adminLinked;

  return (
    <div className="space-y-6">
      {/* Setup Wizard Banners */}
      {setupIncomplete && (
        <div className="space-y-4">
          {!setupWizard.hasServices && (
            <SetupBanner
              type="services"
              message={t('dashboard.setupBanners.services.message')}
              actionLabel={t('dashboard.setupBanners.services.actionLabel')}
              onAction={handleCreateService}
            />
          )}
          {!setupWizard.botActive && (
            <SetupBanner
              type="bot"
              message={t('dashboard.setupBanners.bot.message')}
              actionLabel={t('dashboard.setupBanners.bot.actionLabel')}
              onAction={handleConnectBot}
            />
          )}
          {!setupWizard.adminLinked && (
            <SetupBanner
              type="admin"
              message={t('dashboard.setupBanners.admin.message')}
              actionLabel={t('dashboard.setupBanners.admin.actionLabel')}
              onAction={handleLinkAdmin}
            />
          )}
        </div>
      )}

      {/* Welcome Section */}
      <div>
        <h1 className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {t('dashboard.welcome', { name: user?.name || t('common.user') })} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Subscription Limits Alert */}
          <SubscriptionLimitsAlert />

          {/* Appointments Summary - Highlighted (FIRST, like in Figma) */}
          {stats && (
            <AppointmentsSummaryCard 
              totalAppointments={stats.totalAppointments}
              confirmedAppointments={appointmentsStats.confirmed}
              pendingAppointments={stats.pendingAppointments}
              rejectedAppointments={appointmentsStats.rejected}
              botActive={botActive}
              adminLinked={adminLinked}
            />
          )}

          {/* Quick Actions (AFTER Appointments Summary, like in Figma) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const QuickActionComponent = () => (
                <QuickActionCard 
                  icon={action.icon}
                  iconBg={action.iconBg}
                  iconColor={action.iconColor}
                  title={action.title}
                  description={action.description}
                  badge={action.badge}
                  onClick={action.onClick}
                />
              );
              return <QuickActionComponent key={action.title} />;
            })}
          </div>

          {/* Statistics & Overview */}
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900 dark:text-gray-100">{t('dashboard.statisticsOverview')}</h2>
            <Button 
              variant="link" 
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-0 h-auto"
              onClick={() => navigate('/analytics')}
            >
              {t('dashboard.viewAll')} →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {statsData.map((stat) => {
              const StatComponent = () => (
                <StatCard 
                  icon={stat.icon}
                  iconBg={stat.iconBg}
                  iconColor={stat.iconColor}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle}
                  trend={stat.trend}
                />
              );
              return <StatComponent key={stat.title} />;
            })}
          </div>

          {/* Calendar and Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-gray-900 dark:text-gray-100">{t('dashboard.calendar.title')}</h3>
              </div>

              <div className="space-y-4">
                {/* Month selector */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg text-gray-900 dark:text-gray-100">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 place-items-center">
                  {/* Day headers */}
                  {[
                    t('dashboard.calendar.days.sun'),
                    t('dashboard.calendar.days.mon'),
                    t('dashboard.calendar.days.tue'),
                    t('dashboard.calendar.days.wed'),
                    t('dashboard.calendar.days.thu'),
                    t('dashboard.calendar.days.fri'),
                    t('dashboard.calendar.days.sat')
                  ].map((day, idx) => (
                    <div key={idx} className="w-10 h-10 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                    <div key={`empty-${i}`} className="w-10 h-10"></div>
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                    const day = i + 1;
                    const hasAppts = hasAppointments(day);
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`
                          w-10 h-10 flex flex-col items-center justify-center text-sm rounded-md relative my-1
                          transition-all duration-200 hover:scale-105 cursor-pointer
                          ${isToday(day)
                            ? "bg-indigo-600 dark:bg-indigo-500 text-white font-semibold shadow-md"
                            : isSelected(day)
                            ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold border-2 border-indigo-300 dark:border-indigo-700"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                          }
                        `}
                      >
                        <span>{day}</span>
                        {hasAppts && (
                          <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                            isToday(day) ? "bg-white" : "bg-indigo-600 dark:bg-indigo-400"
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected date info */}
                {selectedDate && (
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                        {t('dashboard.calendar.selected')}: {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Selected Date Appointments */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-gray-900 dark:text-gray-100">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : t('dashboard.calendar.selectDate')}
                  </h3>
                </div>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white h-8 px-3 text-sm whitespace-nowrap"
                  onClick={() => navigate('/appointments', { state: { openDialog: true } })}
                >
                  {t('appointments.newAppointment')}
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment: any, idx) => {
                    const AppointmentComponent = () => (
                      <AppointmentCard 
                        appointment={appointment}
                        clientName={`${t('appointments.chatId')}: ${appointment.chatId || t('appointments.unknown')}`}
                        clientId={appointment.chatId || 'N/A'}
                        time={appointment.slot?.startAt ? formatTimeToLocal(appointment.slot.startAt) : 'N/A'}
                        status={appointment.status}
                      />
                    );
                    return <AppointmentComponent key={idx} />;
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>{t('dashboard.emptyStates.noAppointmentsForDate')}</p>
                    <p className="text-sm">{t('dashboard.emptyStates.clickDateToView')}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Setup Success Modal */}
      <SetupSuccessModal
        open={successModal.open}
        onOpenChange={(open) => setSuccessModal(prev => ({ ...prev, open }))}
        step={successModal.step}
        message={successModal.message}
        primaryAction={successModal.primaryAction}
        secondaryAction={successModal.secondaryAction}
      />
    </div>
  );
}
