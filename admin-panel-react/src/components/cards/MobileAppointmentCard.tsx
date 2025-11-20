import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  CalendarDays,
  Clock,
  User,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "../ui/card";
import { useLanguage } from "../../i18n";

interface MobileAppointmentCardProps {
  id: number;
  service: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  client: string;
  status: "confirmed" | "cancelled" | "pending";
}

export function MobileAppointmentCard({
  service,
  date,
  timeStart,
  timeEnd,
  client,
  status,
}: MobileAppointmentCardProps) {
  const { t } = useLanguage();
  const getStatusBadge = (status: "confirmed" | "cancelled" | "pending") => {
    const styles = {
      confirmed: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-0",
      cancelled: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-0",
      pending: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-0",
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
        {t(`cards.appointment.status.${status}`)}
      </Badge>
    );
  };

  return (
    <Card className="p-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md dark:hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{service}</h3>
            {getStatusBadge(status)}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">{t('cards.mobileAppointment.viewDetails')}</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">{t('cards.mobileAppointment.edit')}</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">{t('cards.mobileAppointment.confirm')}</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
              {t('cards.mobileAppointment.cancel')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{date}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeStart} - {timeEnd}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <User className="w-3.5 h-3.5" />
          <span>{t('cards.mobileAppointment.clientLabel', { client })}</span>
        </div>
      </div>
    </Card>
  );
}
