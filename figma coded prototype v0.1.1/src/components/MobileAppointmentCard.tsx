import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  CalendarDays,
  Clock,
  User,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "./ui/card";

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
      <Badge className={`${styles[status]} flex items-center gap-1 w-fit text-xs px-2 py-0.5`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">{service}</h3>
            {getStatusBadge(status)}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Confirm</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1.5 pl-10">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{date}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeStart} - {timeEnd}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <User className="w-3.5 h-3.5" />
          <span>ID: {client}</span>
        </div>
      </div>
    </Card>
  );
}
