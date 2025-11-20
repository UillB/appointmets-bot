import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  RefreshCw,
  Download,
  User,
} from "lucide-react";
import { StatCard } from "../cards/StatCard";
import { AppointmentDialog } from "../dialogs/AppointmentDialog";
import { AppointmentFormSheet } from "../AppointmentFormSheet";
import { MobileAppointmentCard } from "../cards/MobileAppointmentCard";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { ScrollArea } from "../ui/scroll-area";
import { format } from "date-fns";
import { PageHeader } from "../PageHeader";
import { PageTitle } from "../PageTitle";
import { toast } from "sonner";
import { apiClient, Appointment } from "../../services/api";
import { useWebSocket } from "../../hooks/useWebSocket";
import { toastNotifications } from "../toast-notifications";
import { formatDateToLocal, formatTimeToLocal } from "../../utils/dateUtils";
import { useLanguage } from "../../i18n";

export function AppointmentsPage() {
  const { t } = useLanguage();
  const { events } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);

  // Handle navigation state for filters (from ServicesPage)
  // Use ref to track if we've already processed the state to prevent re-triggering
  const stateProcessedRef = React.useRef(false);
  
  useEffect(() => {
    // Only process state if it exists and hasn't been processed yet
    if (location.state && !stateProcessedRef.current && services.length > 0) {
      const { serviceId, date: dateFromState } = location.state as { serviceId?: number; date?: Date };
      
      if (serviceId) {
        // Find service name by ID
        const service = services.find(s => s.id === serviceId);
        if (service) {
          setSelectedService(service.name);
        }
      }
      
      // Only set date if explicitly provided, don't set today's date automatically
      if (dateFromState) {
        setDate(new Date(dateFromState));
      }
      
      // Mark as processed and clear state to prevent re-triggering
      stateProcessedRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, services]);

  // Reset the ref when location changes (new navigation)
  useEffect(() => {
    stateProcessedRef.current = false;
  }, [location.pathname]);

  // Load data function - wrapped in useCallback to avoid dependency issues
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [appointmentsData, servicesData] = await Promise.all([
        apiClient.getAppointments(),
        apiClient.getServices()
      ]);
      
      setAppointments(appointmentsData.appointments);
      setServices(servicesData.services);
    } catch (error) {
      console.error('Failed to load appointments data:', error);
      toast.error(t('toasts.failedToLoadAppointments'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle navigation state for opening dialog
  useEffect(() => {
    if (location.state?.openDialog) {
      setDialogOpen(true);
      // Clear state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Handle real-time WebSocket events for appointments
  const processedEventsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (events.length === 0) return;

    // Process all new events, not just the latest one
    let hasNewEvents = false;
    
    events.forEach(event => {
      // Skip if already processed
      if (processedEventsRef.current.has(event.id)) return;
      
      hasNewEvents = true;
      processedEventsRef.current.add(event.id);
      
      if (event.type === 'appointment.created' || event.type === 'appointment_created') {
        // Show toast notification
        toastNotifications.appointments.created();
      } else if (event.type === 'appointment.updated' || event.type === 'appointment_updated') {
        toastNotifications.appointments.updated(event.data?.customerName);
      } else if (event.type === 'appointment.cancelled' || event.type === 'appointment_cancelled') {
        toastNotifications.appointments.cancelled(event.data?.customerName);
      } else if (event.type === 'appointment.confirmed' || event.type === 'appointment_confirmed') {
        toastNotifications.appointments.confirmed(event.data?.customerName);
      }
    });

    // Reload appointments if we processed any new appointment events
    if (hasNewEvents) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        loadData();
      });
    }
  }, [events, loadData]);

  const stats = [
    {
      icon: CalendarDays,
      iconBg: "bg-blue-50 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: t('appointments.stats.totalAppointments'),
      value: appointments?.length || 0,
      subtitle: t('appointments.stats.allTimeBookings'),
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: t('appointments.confirmed'),
      value: appointments?.filter(apt => apt.status === 'confirmed').length || 0,
      subtitle: t('appointments.stats.successfullyConfirmed'),
    },
    {
      icon: Clock,
      iconBg: "bg-amber-50 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: t('appointments.pending'),
      value: appointments?.filter(apt => apt.status === 'pending').length || 0,
      subtitle: t('appointments.stats.awaitingConfirmation'),
    },
    {
      icon: XCircle,
      iconBg: "bg-red-50 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-400",
      title: t('appointments.stats.cancelledRejected'),
      value: appointments?.filter(apt => apt.status === 'cancelled').length || 0,
      subtitle: t('appointments.stats.cancelledRejectedBookings'),
    },
  ];


  const getStatusBadge = (status: "confirmed" | "cancelled" | "pending") => {
    const styles = {
      confirmed: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-0",
      cancelled: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-0",
      pending: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-0",
    };

    const icons = {
      confirmed: CheckCircle2,
      cancelled: XCircle,
      pending: Clock,
    };

    const Icon = icons[status];

    const statusLabels: Record<"confirmed" | "cancelled" | "pending", string> = {
      confirmed: t('appointments.confirmed'),
      cancelled: t('appointments.cancelled'),
      pending: t('appointments.pending'),
    };

    return (
      <Badge className={`${styles[status]} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {statusLabels[status]}
      </Badge>
    );
  };

  const filteredAppointments = appointments?.filter((apt) => {
    // Handle rejected filter (cancelled with rejectionReason)
    if (activeTab === "rejected") {
      if (apt.status !== "cancelled" || !(apt as any).rejectionReason) return false;
    } else if (activeTab === "cancelled") {
      // For cancelled tab, show only cancelled WITHOUT rejectionReason
      if (apt.status !== "cancelled" || (apt as any).rejectionReason) return false;
    } else if (activeTab !== "all" && apt.status !== activeTab) {
      return false;
    }
    
    if (searchQuery && 
        !(apt.chatId?.includes(searchQuery) || 
          apt.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (selectedService !== "all" && apt.service?.name !== selectedService) return false;
    
    // Date filter logic
    if (date && apt.slot?.startAt) {
      const appointmentDate = new Date(apt.slot.startAt);
      const selectedDate = new Date(date);
      
      // Compare only the date part (ignore time)
      const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      if (appointmentDateOnly.getTime() !== selectedDateOnly.getTime()) {
        return false;
      }
    }
    
    return true;
  }) || [];

  const getTabCount = (tab: string) => {
    if (!appointments) return 0;
    if (tab === "all") return appointments.length;
    if (tab === "rejected") {
      return appointments.filter((apt) => apt.status === "cancelled" && (apt as any).rejectionReason).length;
    }
    if (tab === "cancelled") {
      return appointments.filter((apt) => apt.status === "cancelled" && !(apt as any).rejectionReason).length;
    }
    return appointments.filter((apt) => apt.status === tab).length;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDate(undefined);
    setSelectedService("all");
  };

  const hasActiveFilters = searchQuery || date || selectedService !== "all";

  const handleRefresh = () => {
    loadData();
    toast.success(t('toasts.appointmentsRefreshed'));
  };

  // Show loading state before rendering content - ensure all data is loaded
  // Wait until both appointments and services arrays are initialized (even if empty)
  if (isLoading || appointments === undefined || services === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)] bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6" style={{ animation: 'none', transition: 'none' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title */}
          <PageTitle
            icon={<CalendarDays className="w-6 h-6 text-white" />}
            title={t('appointments.title')}
            description={t('appointments.description')}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="hidden sm:flex border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('common.refresh')}
                </Button>
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="sm"
                  className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('appointments.newAppointment')}
                </Button>
                <Button
                  onClick={() => setSheetOpen(true)}
                  size="sm"
                  className="sm:hidden bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </>
            }
          />
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat, index) => {
              const StatCardComponent = () => (
                <StatCard 
                  icon={stat.icon} 
                  iconBg={stat.iconBg} 
                  iconColor={stat.iconColor} 
                  title={stat.title} 
                  value={stat.value} 
                  subtitle={stat.subtitle} 
                />
              );
              return <StatCardComponent key={`stat-${index}`} />;
            })}
          </div>

          {/* Main Content Card */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-4">
              {/* Tabs - Scrollable on mobile */}
              <ScrollArea className="w-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList className="bg-gray-100 dark:bg-gray-800 inline-flex">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    {t('appointments.all')} ({getTabCount("all")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="confirmed" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    {t('appointments.confirmed')} ({getTabCount("confirmed")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    {t('appointments.pending')} ({getTabCount("pending")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cancelled" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    {t('appointments.cancelled')} ({getTabCount("cancelled")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    {t('appointments.rejected')} ({getTabCount("rejected")})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </ScrollArea>

            {/* Filters */}
            <div className="space-y-4 mb-4">
              {/* Mobile: Search + Filter Button */}
              <div className="flex gap-2 lg:hidden">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder={t('appointments.searchPlaceholder')}
                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <SlidersHorizontal className="w-4 h-4" />
                      {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <div className="space-y-4 pt-6">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('appointments.filters')}</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('appointments.service')}</label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder={t('appointments.allServices')} />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{t('appointments.allServices')}</SelectItem>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.name} className="text-gray-900 dark:text-gray-100">
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('appointments.date')}</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                !date && "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PP") : t('appointments.pickDate')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {t('appointments.clearFilters')}
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop: Full Filters Row */}
              <div className="hidden lg:flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder={t('appointments.searchPlaceholderDesktop')}
                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder={t('appointments.service')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{t('appointments.allServices')}</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.name} className="text-gray-900 dark:text-gray-100">
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-[180px] justify-start text-left border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          !date && "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PP") : t('appointments.date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {t('appointments.clear')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop: Table View */}
            <div className="hidden lg:block border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden" style={{ animation: 'none', transition: 'none' }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="text-gray-900 dark:text-gray-100">{t('appointments.tableHeaders.service')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">{t('appointments.tableHeaders.dateTime')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">{t('appointments.tableHeaders.clientChatId')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">{t('appointments.tableHeaders.duration')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">{t('appointments.tableHeaders.status')}</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">{t('appointments.tableHeaders.created')}</TableHead>
                    <TableHead className="text-right text-gray-900 dark:text-gray-100">{t('appointments.tableHeaders.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                          {date ? (
                            <>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {t('appointments.emptyStates.noAppointmentsForDate', { date: format(date, "PP") })}
                              </p>
                              <p className="text-sm text-gray-400 dark:text-gray-500">
                                {t('appointments.emptyStates.tryDifferentDate')}
                              </p>
                              <Button
                                variant="outline"
                                onClick={() => setDate(undefined)}
                                className="mt-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                              >
                                {t('appointments.clearDateFilter')}
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-500 dark:text-gray-400">{t('appointments.emptyStates.noAppointmentsFound')}</p>
                              <Button
                                variant="link"
                                onClick={() => setDialogOpen(true)}
                                className="text-indigo-600 dark:text-indigo-400"
                              >
                                {t('appointments.emptyStates.createFirstAppointment')}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                              <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="font-medium">{apt.service?.name || t('appointments.unknownService')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          <div>
                            <p className="font-medium">{apt.slot?.startAt ? formatDateToLocal(apt.slot.startAt) : t('appointments.noDate')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {apt.slot?.startAt && apt.slot?.endAt ? 
                                `${formatTimeToLocal(apt.slot.startAt)} - ${formatTimeToLocal(apt.slot.endAt)}` : 
                                t('appointments.noTimeInfo')
                              }
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <span className="text-sm font-medium">{apt.customerName || t('appointments.unknown')}</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t('appointments.id')}: {apt.chatId || t('appointments.notAvailable')}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          <div className="text-sm">
                            <span className="font-medium">{apt.service?.durationMin || t('appointments.notAvailable')} {t('appointments.minutes')}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          <div className="text-sm">
                            <p>{apt.createdAt ? formatDateToLocal(apt.createdAt) : t('appointments.notAvailable')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{apt.createdAt ? formatTimeToLocal(apt.createdAt) : ''}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                              <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">{t('appointments.actions.viewDetails')}</DropdownMenuItem>
                              <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">{t('appointments.actions.edit')}</DropdownMenuItem>
                              <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">{t('appointments.actions.confirm')}</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                                {t('appointments.actions.cancel')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: Card View */}
            <div className="lg:hidden space-y-2">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    {date ? (
                      <>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          {t('appointments.emptyStates.noAppointmentsForDate', { date: format(date, "PP") })}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 px-4">
                          {t('appointments.emptyStates.tryDifferentDate')}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setDate(undefined)}
                          className="mt-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                        >
                          {t('appointments.clearDateFilter')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 dark:text-gray-400">{t('appointments.emptyStates.noAppointmentsFound')}</p>
                        <Button
                          variant="link"
                          onClick={() => setSheetOpen(true)}
                          className="text-indigo-600 dark:text-indigo-400"
                        >
                          {t('appointments.emptyStates.createFirstAppointment')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                filteredAppointments.map((apt) => {
                  const MobileCardComponent = () => (
                    <MobileAppointmentCard 
                      id={apt.id}
                      service={apt.service?.name || t('appointments.unknownService')}
                      date={apt.slot?.startAt ? formatDateToLocal(apt.slot.startAt) : t('appointments.noDate')}
                      timeStart={apt.slot?.startAt ? formatTimeToLocal(apt.slot.startAt) : t('appointments.noTime')}
                      timeEnd={apt.slot?.endAt ? formatTimeToLocal(apt.slot.endAt) : t('appointments.noTime')}
                      client={`${t('appointments.chatId')}: ${apt.chatId || t('appointments.unknown')}`}
                      status={apt.status}
                    />
                  );
                  return <MobileCardComponent key={apt.id} />;
                })
              )}
            </div>

            {/* Pagination */}
            {filteredAppointments.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 lg:mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('appointments.showing', { count: filteredAppointments.length.toString(), total: (appointments?.length || 0).toString() })}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled className="border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    {t('appointments.pagination.previous')}
                  </Button>
                  <Button variant="outline" size="sm" disabled className="border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    {t('appointments.pagination.next')}
                  </Button>
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AppointmentDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onAppointmentSaved={() => {
          // Small delay to ensure backend has processed the creation
          setTimeout(() => {
            loadData();
          }, 300);
        }}
      />
      <AppointmentFormSheet 
        open={sheetOpen} 
        onOpenChange={setSheetOpen}
        onAppointmentSaved={() => {
          // Small delay to ensure backend has processed the creation
          setTimeout(() => {
            loadData();
          }, 300);
        }}
      />
    </div>
  );
}