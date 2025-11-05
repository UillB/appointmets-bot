import React from "react";
import { Calendar, CheckCircle2, Clock, XCircle, Bot, Shield } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface AppointmentsSummaryCardProps {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  rejectedAppointments: number;
  botActive?: boolean;
  adminLinked?: boolean;
}

export function AppointmentsSummaryCard({ 
  totalAppointments, 
  confirmedAppointments,
  pendingAppointments,
  rejectedAppointments,
  botActive = false,
  adminLinked = false
}: AppointmentsSummaryCardProps) {
  const confirmationRate = totalAppointments > 0 
    ? Math.round((confirmedAppointments / totalAppointments) * 100) 
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-indigo-200 dark:border-indigo-800">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Total Appointments */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Appointments</p>
            <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">{totalAppointments}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time records</p>
          </div>
        </div>

        {/* Center: Divider (hidden on mobile) */}
        <div className="hidden lg:block w-px h-20 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>

        {/* Right: Confirmed, Pending & Rejected Stats */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Confirmed */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Confirmed</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{confirmedAppointments}</p>
              </div>
            </div>

            {/* Pending */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Pending</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingAppointments}</p>
              </div>
            </div>

            {/* Rejected */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Rejected</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedAppointments}</p>
              </div>
            </div>
          </div>

          {/* Bot & Admin Status - Like in Figma */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Bot Status:</span>
              <Badge 
                variant={botActive ? "default" : "secondary"}
                className={botActive ? "bg-emerald-600 dark:bg-emerald-500 text-white" : "bg-gray-400 dark:bg-gray-600 text-white"}
              >
                {botActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Admin:</span>
              <Badge 
                variant={adminLinked ? "default" : "secondary"}
                className={adminLinked ? "bg-indigo-600 dark:bg-indigo-500 text-white" : "bg-amber-500 dark:bg-amber-600 text-white"}
              >
                {adminLinked ? "Linked" : "Not Linked"}
              </Badge>
            </div>

            <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Confirmation Rate:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{confirmationRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

