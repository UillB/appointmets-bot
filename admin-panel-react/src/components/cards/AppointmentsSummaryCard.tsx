import React from "react";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

interface AppointmentsSummaryCardProps {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  rejectedAppointments: number;
}

export function AppointmentsSummaryCard({ 
  totalAppointments, 
  confirmedAppointments,
  pendingAppointments,
  rejectedAppointments
}: AppointmentsSummaryCardProps) {
  const confirmationRate = totalAppointments > 0 
    ? Math.round((confirmedAppointments / totalAppointments) * 100) 
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Total Appointments */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
            <p className="text-5xl font-bold text-gray-900">{totalAppointments}</p>
            <p className="text-xs text-gray-500 mt-1">All time records</p>
          </div>
        </div>

        {/* Center: Divider (hidden on mobile) */}
        <div className="hidden lg:block w-px h-20 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

        {/* Right: Confirmed, Pending & Rejected Stats */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Confirmed */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Confirmed</p>
                <p className="text-2xl font-bold text-emerald-600">{confirmedAppointments}</p>
              </div>
            </div>

            {/* Pending */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{pendingAppointments}</p>
              </div>
            </div>

            {/* Rejected */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedAppointments}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Confirmation Rate</span>
              <span className="font-semibold text-gray-900">{confirmationRate}%</span>
            </div>
            <div className="relative w-full">
              <Progress 
                value={confirmationRate} 
                className="h-2.5 bg-gray-200"
                indicatorClassName="bg-gradient-to-r from-emerald-500 to-emerald-600"
              />
            </div>
            <p className="text-xs text-gray-500">
              {confirmedAppointments} out of {totalAppointments} appointments confirmed
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

