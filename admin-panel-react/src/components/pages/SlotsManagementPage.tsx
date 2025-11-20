import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
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
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Info,
} from "lucide-react";
import { PageHeader } from "../PageHeader";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import { useLanguage } from "../../i18n";

interface Slot {
  id: number;
  serviceId: number;
  startAt: string;
  endAt: string;
  capacity: number;
  status?: 'available' | 'booked' | 'conflict';
  isBooked?: boolean;
  hasConflict?: boolean;
  service: {
    id: number;
    name: string;
    durationMin: number;
    organizationId: number;
  };
}

interface Service {
  id: number;
  name: string;
  durationMin: number;
}

export function SlotsManagementPage({ 
  serviceId, 
  onBack 
}: { 
  serviceId?: number;
  onBack?: () => void;
}) {
  const { t } = useLanguage();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(serviceId || null);
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadServices();
    if (selectedService) {
      loadSlots();
    }
  }, [selectedService]);

  const loadServices = async () => {
    try {
      const response = await apiClient.getServices();
      setServices(response.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error(t('toasts.failedToLoadServices'));
    }
  };

  const loadSlots = async () => {
    if (!selectedService) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getSlots({
        serviceId: selectedService,
        date: selectedDate,
        limit: 100
      });
      setSlots(response.slots || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
      toast.error(t('toasts.failedToLoadSlots'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'booked':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'conflict':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
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
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('slotsManagement.back')}
          </Button>
        )}
        <PageHeader
          title={t('slotsManagement.title')}
          subtitle={t('slotsManagement.subtitle')}
          icon={Calendar}
        />
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <div className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">{t('slotsManagement.infoBanner.title')}</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
              {t('slotsManagement.infoBanner.description')}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="service-select">{t('slotsManagement.filters.service')}</Label>
              <Select 
                value={selectedService?.toString() || ""} 
                onValueChange={(value) => setSelectedService(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('slotsManagement.filters.selectService')} />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} ({service.durationMin} {t('slots.minutes')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-filter">{t('slotsManagement.filters.date')}</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder={t('slotsManagement.filters.filterByDate')}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={loadSlots} 
                disabled={!selectedService || isLoading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Slots List */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('slotsManagement.table.title')}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('slotsManagement.table.slotsFound', { count: slots.length.toString() })}
            </div>
          </div>

          {!selectedService ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('slotsManagement.emptyStates.selectService')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('slotsManagement.emptyStates.chooseServiceToView')}</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('slotsManagement.emptyStates.noSlotsFound')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedDate 
                  ? t('slotsManagement.emptyStates.noSlotsForDate') 
                  : t('slotsManagement.emptyStates.noSlotsYet')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('slotsManagement.tableHeaders.date')}</TableHead>
                    <TableHead>{t('slotsManagement.tableHeaders.time')}</TableHead>
                    <TableHead>{t('slotsManagement.tableHeaders.duration')}</TableHead>
                    <TableHead>{t('slotsManagement.tableHeaders.status')}</TableHead>
                    <TableHead>{t('slotsManagement.tableHeaders.capacity')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
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
                        {slot.service.durationMin} {t('slots.minutes')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(slot.isBooked ? 'booked' : 'available')}
                          <span className="text-sm">
                            {slot.isBooked ? t('slots.status.booked') : t('slots.status.available')}
                          </span>
                        </div>
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