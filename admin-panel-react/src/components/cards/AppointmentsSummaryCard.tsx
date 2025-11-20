import React from "react";
import { Calendar, CheckCircle2, Clock, XCircle, Bot, Shield } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useLanguage } from "../../i18n";

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
  const { t } = useLanguage();
  const confirmationRate = totalAppointments > 0 
    ? Math.round((confirmedAppointments / totalAppointments) * 100) 
    : 0;

  const rejectionRate = totalAppointments > 0 
    ? Math.round((rejectedAppointments / totalAppointments) * 100) 
    : 0;

  return (
    <Card className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-indigo-200 dark:border-indigo-800">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1px_1fr] gap-5 items-start">
        {/* Left: Total Appointments */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('cards.appointmentsSummary.totalAppointments')}</p>
            <p className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-none">{totalAppointments}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('cards.appointmentsSummary.allTimeRecords')}</p>
          </div>
        </div>

        {/* Center: Divider */}
        <div className="hidden lg:block w-px h-full bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>

        {/* Right: Stats Grid */}
        <div className="space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Confirmed */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">{t('cards.appointmentsSummary.confirmed')}</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">{confirmedAppointments}</p>
              </div>
            </div>

            {/* Pending */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">{t('cards.appointmentsSummary.pending')}</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 leading-none">{pendingAppointments}</p>
              </div>
            </div>

            {/* Rejected */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">{t('cards.appointmentsSummary.rejected')}</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 leading-none">{rejectedAppointments}</p>
              </div>
            </div>
          </div>

          {/* System Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Bot Status Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${botActive ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
                    <Bot className={`w-4 h-4 ${botActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{t('cards.appointmentsSummary.botStatus')}</span>
                </div>
                <Badge 
                  variant={botActive ? "default" : "secondary"}
                  className={`px-3 py-1 flex-shrink-0 ${botActive ? "bg-emerald-600 dark:bg-emerald-500 text-white" : "bg-gray-400 dark:bg-gray-600 text-white"}`}
                >
                  {botActive ? t('cards.appointmentsSummary.active') : t('cards.appointmentsSummary.inactive')}
                </Badge>
              </div>
            </div>

            {/* Admin Status Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${adminLinked ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                    <Shield className={`w-4 h-4 ${adminLinked ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{t('cards.appointmentsSummary.adminStatus')}</span>
                </div>
                <Badge 
                  variant={adminLinked ? "default" : "secondary"}
                  className={`px-3 py-1 flex-shrink-0 ${adminLinked ? "bg-indigo-600 dark:bg-indigo-500 text-white" : "bg-amber-500 dark:bg-amber-600 text-white"}`}
                >
                  {adminLinked ? t('cards.appointmentsSummary.linked') : t('cards.appointmentsSummary.notLinked')}
                </Badge>
              </div>
            </div>

            {/* Confirmation Rate Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{t('cards.appointmentsSummary.confirmation')}</span>
                </div>
                <div className="flex items-baseline gap-1 flex-shrink-0">
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{confirmationRate}%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('cards.appointmentsSummary.rejectionRate', { rate: rejectionRate.toString() })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

