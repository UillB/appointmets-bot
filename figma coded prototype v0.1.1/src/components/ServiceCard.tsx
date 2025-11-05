import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Clock, DollarSign, Calendar, MoreVertical, TrendingUp } from "lucide-react";
import { Progress } from "./ui/progress";

interface ServiceCardProps {
  id: number;
  name: string;
  category: string;
  price: number;
  duration: number;
  occupancy: number;
  slotsBooked: number;
  totalSlots: number;
  bookings: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageSlots?: () => void;
}

export function ServiceCard({
  name,
  category,
  price,
  duration,
  occupancy,
  slotsBooked,
  totalSlots,
  bookings,
  onEdit,
  onDelete,
  onManageSlots,
}: ServiceCardProps) {
  const getOccupancyColor = (occupancy: number) => {
    if (occupancy === 0) return "text-gray-500";
    if (occupancy < 30) return "text-amber-600";
    if (occupancy < 70) return "text-blue-600";
    return "text-emerald-600";
  };

  const getOccupancyBgColor = (occupancy: number) => {
    if (occupancy === 0) return "bg-gray-500";
    if (occupancy < 30) return "bg-amber-500";
    if (occupancy < 70) return "bg-blue-500";
    return "bg-emerald-500";
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className="p-3 lg:p-5 hover:shadow-md transition-all group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100 truncate">{name}</h3>
            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 flex-shrink-0">
              {category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4 mt-2 lg:mt-3">
            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="font-medium">${price}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>{formatDuration(duration)}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">{bookings} bookings</span>
              <span className="lg:hidden">{bookings}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <DropdownMenuItem onClick={onEdit} className="text-gray-900 dark:text-gray-100">Edit Service</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-900 dark:text-gray-100">View Analytics</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={onDelete}>
              Delete Service
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Occupancy
            </span>
            <span className={`text-sm font-medium ${getOccupancyColor(occupancy)}`}>
              {occupancy}%
            </span>
          </div>
          <Progress 
            value={occupancy} 
            className="h-2"
            indicatorClassName={getOccupancyBgColor(occupancy)}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <span>{slotsBooked} of {totalSlots} slots booked</span>
        </div>
      </div>
    </Card>
  );
}
