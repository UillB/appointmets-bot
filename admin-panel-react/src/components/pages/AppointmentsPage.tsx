import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
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

export function AppointmentsPage() {
  const { events } = useWebSocket();
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
      toast.error('Failed to load appointments data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

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
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Appointments",
      value: appointments?.length || 0,
      subtitle: "All time bookings",
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Confirmed",
      value: appointments?.filter(apt => apt.status === 'confirmed').length || 0,
      subtitle: "Successfully confirmed",
    },
    {
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Pending",
      value: appointments?.filter(apt => apt.status === 'pending').length || 0,
      subtitle: "Awaiting confirmation",
    },
    {
      icon: XCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      title: "Cancelled & Rejected",
      value: appointments?.filter(apt => apt.status === 'cancelled').length || 0,
      subtitle: "Cancelled and rejected bookings",
    },
  ];


  const getStatusBadge = (status: "confirmed" | "cancelled" | "pending") => {
    const styles = {
      confirmed: "bg-emerald-100 text-emerald-700 border-0",
      cancelled: "bg-red-100 text-red-700 border-0",
      pending: "bg-amber-100 text-amber-700 border-0",
    };

    const icons = {
      confirmed: CheckCircle2,
      cancelled: XCircle,
      pending: Clock,
    };

    const Icon = icons[status];

    return (
      <Badge className={`${styles[status]} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
    toast.success("Appointments refreshed");
  };

  return (
    <div className="space-y-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title */}
          <PageTitle
            icon={<CalendarDays className="w-6 h-6 text-white" />}
            title="Appointments"
            description="Manage appointments and bookings"
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="hidden sm:flex border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="sm"
                  className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[calc(100vh-300px)] bg-white dark:bg-gray-900">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          )}

          {/* Main Content Card */}
          <Card className="p-4 lg:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            {/* Tabs - Scrollable on mobile */}
            <ScrollArea className="w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 lg:mb-6">
                <TabsList className="bg-gray-100 dark:bg-gray-800 inline-flex">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    All ({getTabCount("all")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="confirmed" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    Confirmed ({getTabCount("confirmed")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    Pending ({getTabCount("pending")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cancelled" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    Cancelled ({getTabCount("cancelled")})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected" 
                    className="data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white whitespace-nowrap text-gray-700 dark:text-gray-300"
                  >
                    Rejected ({getTabCount("rejected")})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </ScrollArea>

            {/* Filters */}
            <div className="space-y-4 mb-4 lg:mb-6">
              {/* Mobile: Search + Filter Button */}
              <div className="flex gap-2 lg:hidden">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search..."
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
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">Filters</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Service</label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="All Services" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Services</SelectItem>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.name} className="text-gray-900 dark:text-gray-100">
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                !date && "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PP") : "Pick a date"}
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
                          Clear Filters
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
                    placeholder="Search by Chat ID or service..."
                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Service" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Services</SelectItem>
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
                        {date ? format(date, "PP") : "Date"}
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
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop: Table View */}
            <div className="hidden lg:block border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="text-gray-900 dark:text-gray-100">Service</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Date & Time</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Client / Chat ID</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Duration</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                    <TableHead className="text-gray-900 dark:text-gray-100">Created</TableHead>
                    <TableHead className="text-right text-gray-900 dark:text-gray-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
                          <Button
                            variant="link"
                            onClick={() => setDialogOpen(true)}
                            className="text-indigo-600 dark:text-indigo-400"
                          >
                            Create your first appointment
                          </Button>
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
                            <span className="font-medium">{apt.service?.name || 'Unknown Service'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          <div>
                            <p className="font-medium">{apt.slot?.startAt ? formatDateToLocal(apt.slot.startAt) : 'No date'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {apt.slot?.startAt && apt.slot?.endAt ? 
                                `${formatTimeToLocal(apt.slot.startAt)} - ${formatTimeToLocal(apt.slot.endAt)}` : 
                                'No time info'
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
                              <span className="text-sm font-medium">{apt.customerName || 'Unknown'}</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">ID: {apt.chatId || 'N/A'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          <div className="text-sm">
                            <span className="font-medium">{apt.service?.durationMin || 'N/A'} min</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          <div className="text-sm">
                            <p>{apt.createdAt ? formatDateToLocal(apt.createdAt) : 'N/A'}</p>
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
                              <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">View Details</DropdownMenuItem>
                              <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">Confirm</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                                Cancel
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
                    <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
                    <Button
                      variant="link"
                      onClick={() => setSheetOpen(true)}
                      className="text-indigo-600 dark:text-indigo-400"
                    >
                      Create your first appointment
                    </Button>
                  </div>
                </div>
              ) : (
                filteredAppointments.map((apt) => {
                  const MobileCardComponent = () => (
                    <MobileAppointmentCard 
                      id={apt.id}
                      service={apt.service?.name || 'Unknown Service'}
                      date={apt.slot?.startAt ? formatDateToLocal(apt.slot.startAt) : 'No date'}
                      timeStart={apt.slot?.startAt ? formatTimeToLocal(apt.slot.startAt) : 'No time'}
                      timeEnd={apt.slot?.endAt ? formatTimeToLocal(apt.slot.endAt) : 'No time'}
                      client={`Chat ID: ${apt.chatId || 'Unknown'}`}
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
                  Showing {filteredAppointments.length} of {appointments?.length || 0} appointments
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled className="border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled className="border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <AppointmentFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}