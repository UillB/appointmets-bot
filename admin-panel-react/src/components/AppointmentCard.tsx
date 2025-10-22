import React from "react";
import { Clock, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";

interface AppointmentCardProps {
  clientName: string;
  clientId: string;
  time: string;
  status: "confirmed" | "cancelled" | "pending";
}

export function AppointmentCard({ clientName, clientId, time, status }: AppointmentCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700 border-0";
      case "cancelled":
        return "bg-red-100 text-red-700 border-0";
      case "pending":
        return "bg-amber-100 text-amber-700 border-0";
      default:
        return "bg-gray-100 text-gray-700 border-0";
    }
  };

  const getStatusText = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Clock className="w-5 h-5 text-blue-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{clientName}</p>
        <p className="text-sm text-gray-500">Client ID: {clientId}</p>
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge className={`text-xs px-2.5 py-1 ${getStatusColor()}`}>
          {getStatusText()}
        </Badge>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </div>
  );
}