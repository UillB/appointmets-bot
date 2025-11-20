import React, { useState, useEffect } from "react";
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
  Clock,
  Calendar,
  TrendingUp,
  Search,
  RefreshCw,
  CalendarDays,
  CalendarClock,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { StatCard } from "../cards/StatCard";
import { PageHeader } from "../PageHeader";
import { toast } from "sonner";
import { apiClient, Slot } from "../../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import { useLanguage } from "../../i18n";

export function SlotsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [slotsData, servicesData] = await Promise.all([
        apiClient.getSlots(),
        apiClient.getServices()
      ]);
      
      setSlots(slotsData.slots || []);
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Failed to load slots data:', error);
      toast.error(t('toasts.failedToLoadSlots'));
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      icon: CalendarClock,
      iconBg: "bg-blue-50 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: t('slots.stats.totalSlots'),
      value: slots.length.toString(),
      change: "+12%",
      changeType: "positive" as const
    },
    {
      icon: CheckCircle,
      iconBg: "bg-green-50 dark:bg-green-900/50",
      iconColor: "text-green-600 dark:text-green-400",
      title: t('slots.stats.available'),
      value: slots.filter(slot => !slot.isBooked).length.toString(),
      change: "+8%",
      changeType: "positive" as const
    },
    {
      icon: XCircle,
      iconBg: "bg-red-50 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-400",
      title: t('slots.stats.booked'),
      value: slots.filter(slot => slot.isBooked).length.toString(),
      change: "+15%",
      changeType: "positive" as const
    },
    {
      icon: TrendingUp,
      iconBg: "bg-purple-50 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      title: t('slots.stats.utilization'),
      value: slots.length > 0 ? `${Math.round((slots.filter(slot => slot.isBooked).length / slots.length) * 100)}%` : "0%",
      change: "+5%",
      changeType: "positive" as const
    }
  ];

  // Filter slots based on search and filters
  const filteredSlots = slots.filter(slot => {
    const matchesSearch = searchQuery === "" || 
      slot.service?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesService = serviceFilter === "all" || 
      slot.serviceId.toString() === serviceFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "available" && !slot.isBooked) ||
      (statusFilter === "booked" && slot.isBooked);
    
    const matchesDate = dateFilter === "" || 
      slot.startAt.startsWith(dateFilter);
    
    return matchesSearch && matchesService && matchesStatus && matchesDate;
  });

  const getStatusBadge = (slot: Slot) => {
    if (slot.isBooked) {
      return <Badge variant="destructive">{t('slots.status.booked')}</Badge>;
    }
    if (slot.hasConflict) {
      return <Badge variant="secondary">{t('slots.status.conflict')}</Badge>;
    }
    return <Badge variant="default">{t('slots.status.available')}</Badge>;
  };

  const getDateDisplay = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return t('slots.dates.today');
    if (isTomorrow(date)) return t('slots.dates.tomorrow');
    if (isYesterday(date)) return t('slots.dates.yesterday');
    return format(date, "MMM dd, yyyy");
  };

  const getTimeDisplay = (dateString: string) => {
    return format(parseISO(dateString), "HH:mm");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('slots.title')}
        description={t('slots.description')}
        icon={CalendarClock}
      />

      {/* Info Banner */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
        <div className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900">{t('slots.infoBanner.title')}</h3>
            <p className="text-blue-700 text-sm mt-1">
              {t('slots.infoBanner.description')}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
                </div>

      {/* Filters and Search */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                      <Input
                        placeholder={t('slots.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                            />
                          </div>
                    </div>

                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('slots.filters.allServices')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('slots.filters.allServices')}</SelectItem>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('slots.filters.allStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                <SelectItem value="all">{t('slots.filters.allStatus')}</SelectItem>
                        <SelectItem value="available">{t('slots.status.available')}</SelectItem>
                        <SelectItem value="booked">{t('slots.status.booked')}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
              placeholder={t('slots.filters.filterByDate')}
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-48"
            />

                              <Button
                                variant="outline"
              onClick={loadData}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
                              </Button>
                            </div>
                          </div>
                        </Card>

      {/* Slots Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('slots.table.title')}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('slots.table.showing', { count: filteredSlots.length.toString(), total: slots.length.toString() })}
            </div>
                    </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('slots.emptyStates.noSlotsFound')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {slots.length === 0 
                  ? t('slots.emptyStates.createServiceToGenerate') 
                  : t('slots.emptyStates.tryAdjustingFilters')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('slots.tableHeaders.service')}</TableHead>
                            <TableHead>{t('slots.tableHeaders.date')}</TableHead>
                            <TableHead>{t('slots.tableHeaders.time')}</TableHead>
                            <TableHead>{t('slots.tableHeaders.duration')}</TableHead>
                    <TableHead>{t('slots.tableHeaders.status')}</TableHead>
                            <TableHead>{t('slots.tableHeaders.capacity')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSlots.map((slot) => (
                            <TableRow key={slot.id}>
                      <TableCell className="font-medium">
                        {slot.service?.name || t('slots.unknownService')}
                      </TableCell>
                              <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          {getDateDisplay(slot.startAt)}
                        </div>
                              </TableCell>
                              <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          {getTimeDisplay(slot.startAt)} - {getTimeDisplay(slot.endAt)}
                                </div>
                              </TableCell>
                      <TableCell>
                        {slot.service?.durationMin || 30} {t('slots.minutes')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(slot)}
                      </TableCell>
                      <TableCell>
                        {slot.capacity}
                      </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
          )}
        </div>
      </Card>
    </div>
  );
}