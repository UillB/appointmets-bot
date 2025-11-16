import React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Clock, DollarSign, Calendar, MoreVertical, TrendingUp } from "lucide-react";
import { Progress } from "../ui/progress";

interface ServiceCardProps {
  id: number;
  name: string;
  nameRu?: string;
  nameEn?: string;
  nameHe?: string;
  description?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  descriptionHe?: string;
  durationMin: number;
  price?: number;
  currency?: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    slots: number;
    appointments: number;
    slotsInCurrentMonth?: number;
    appointmentsInCurrentMonth?: number;
  };
  occupancy?: number; // Occupancy for current month (0-100)
  onEdit?: () => void;
  onDelete?: () => void;
  onManageAppointments?: () => void;
}

export function ServiceCard({
  id,
  name,
  nameRu,
  nameEn,
  nameHe,
  description,
  descriptionRu,
  descriptionEn,
  descriptionHe,
  durationMin,
  price,
  currency = 'USD',
  organizationId,
  createdAt,
  updatedAt,
  _count,
  occupancy: occupancyFromApi,
  onEdit,
  onDelete,
  onManageAppointments,
}: ServiceCardProps) {
  // Use occupancy from API if available, otherwise calculate from current month data
  const slotsInCurrentMonth = _count?.slotsInCurrentMonth ?? 0;
  const appointmentsInCurrentMonth = _count?.appointmentsInCurrentMonth ?? 0;
  const occupancy = occupancyFromApi !== undefined 
    ? occupancyFromApi 
    : (slotsInCurrentMonth > 0 
        ? Math.min(100, Math.round((appointmentsInCurrentMonth / slotsInCurrentMonth) * 100)) 
        : 0);
  
  // Total slots and appointments for display
  const totalSlots = _count?.slots || 0;
  const totalAppointments = _count?.appointments || 0;

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy === 0) return "text-gray-500 dark:text-gray-400";
    if (occupancy < 30) return "text-amber-600 dark:text-amber-400";
    if (occupancy < 70) return "text-blue-600 dark:text-blue-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const getOccupancyBgColor = (occupancy: number) => {
    if (occupancy === 0) return "bg-gray-500 dark:bg-gray-400";
    if (occupancy < 30) return "bg-amber-500 dark:bg-amber-400";
    if (occupancy < 70) return "bg-blue-500 dark:bg-blue-400";
    return "bg-emerald-500 dark:bg-emerald-400";
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Currency symbols mapping
  const getCurrencySymbol = (code?: string): string => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CNY: "¥",
      RUB: "₽",
      INR: "₹",
      BRL: "R$",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      SEK: "kr",
      NOK: "kr",
      DKK: "kr",
      PLN: "zł",
      MXN: "$",
      ZAR: "R",
      SGD: "S$",
      HKD: "HK$",
      NZD: "NZ$",
      KRW: "₩",
      TRY: "₺",
      ILS: "₪",
      AED: "د.إ",
      SAR: "﷼",
      THB: "฿",
      IDR: "Rp",
      PHP: "₱",
      MYR: "RM",
    };
    return symbols[code || 'USD'] || "$";
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return "Free";
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${price}`;
  };

  return (
    <Card className="p-5 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{name}</h3>
            <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Service
            </Badge>
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{description}</p>
          )}
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">{formatPrice(price, currency)}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(durationMin)}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{totalAppointments} bookings</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <DropdownMenuItem onClick={onEdit} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">Edit Service</DropdownMenuItem>
            <DropdownMenuItem onClick={onManageAppointments} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">Manage Appointments</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={onDelete}>
              Delete Service
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 cursor-help">
                    <TrendingUp className="w-4 h-4" />
                    Occupancy (Current Month)
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {slotsInCurrentMonth > 0 
                      ? `${appointmentsInCurrentMonth} of ${slotsInCurrentMonth} slots booked this month`
                      : 'No slots available this month'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className={`text-sm font-medium ${getOccupancyColor(occupancy)}`}>
              {occupancy}%
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Progress 
                    value={occupancy} 
                    className="h-2 bg-gray-200 dark:bg-gray-800"
                    indicatorClassName={getOccupancyBgColor(occupancy)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {occupancy}% occupancy for current month
                  {slotsInCurrentMonth > 0 && (
                    <span className="block mt-1 text-gray-400">
                      {appointmentsInCurrentMonth} / {slotsInCurrentMonth} slots
                    </span>
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {slotsInCurrentMonth > 0 
                ? `${appointmentsInCurrentMonth} of ${slotsInCurrentMonth} slots booked this month`
                : `${totalAppointments} of ${totalSlots} total slots booked`}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onManageAppointments}
            className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border-gray-200 dark:border-gray-700"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Manage Appointments
          </Button>
        </div>
      </div>
    </Card>
  );
}
