import React from "react";
import { Clock, ChevronRight, User, Calendar, Sparkles, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { useLanguage } from "../../i18n";

interface AppointmentCardProps {
  clientName?: string;
  clientId?: string;
  time?: string;
  status?: "confirmed" | "cancelled" | "pending";
  appointment?: any; // Full appointment object for metadata
}

export function AppointmentCard({ clientName, clientId, time, status, appointment }: AppointmentCardProps) {
  const { t, language } = useLanguage();
  const localeMap: Record<string, string> = {
    en: "en-US",
    ru: "ru-RU",
    he: "he-IL",
  };
  const locale = localeMap[language] || "en-US";
  const getStatusColor = () => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-0";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border-0";
      case "pending":
        return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-0";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "confirmed":
        return t('cards.appointment.status.confirmed');
      case "cancelled":
        return t('cards.appointment.status.cancelled');
      case "pending":
        return t('cards.appointment.status.pending');
      default:
        return t('cards.appointment.status.unknown');
    }
  };

  // Extract data from appointment object if available
  const customerInfo = appointment?.customerInfo || {};
  const serviceName = appointment?.service?.name || appointment?.serviceName;
  const slotStart = appointment?.slot?.startAt;
  const slotEnd = appointment?.slot?.endAt;
  const chatIdValue = customerInfo.chatId || clientId || t('cards.appointment.unknown');
  const displayName = customerInfo.firstName 
    ? `${customerInfo.firstName} ${customerInfo.lastName || ''}`.trim()
    : clientName || t('cards.appointment.chatIdDisplay', { chatId: chatIdValue });
  const displayTime = time || (slotStart ? new Date(slotStart).toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : t('cards.appointment.notAvailable'));

  return (
    <div className="p-4 border rounded-lg hover:shadow-md dark:hover:shadow-lg transition-all cursor-pointer group bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
          <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {displayName}
              </h4>
              
              {/* Customer Metadata */}
              {(customerInfo.firstName || customerInfo.username || customerInfo.chatId) && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {customerInfo.firstName && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t('cards.appointment.labels.name')}</span>
                        <span className="text-gray-900 dark:text-gray-100">{customerInfo.firstName} {customerInfo.lastName || ''}</span>
                      </div>
                    )}
                    {customerInfo.username && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t('cards.appointment.labels.username')}</span>
                        <span className="text-gray-900 dark:text-gray-100">@{customerInfo.username}</span>
                      </div>
                    )}
                    {(customerInfo.chatId || clientId) && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t('cards.appointment.labels.chatId')}</span>
                        <span className="text-gray-900 dark:text-gray-100">{customerInfo.chatId || clientId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Service & Time Info */}
              <div className="mt-2 space-y-1.5 text-xs">
                {serviceName && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-medium">{t('cards.appointment.labels.service')}</span>
                    <span className="text-gray-900 dark:text-gray-100">{serviceName}</span>
                  </div>
                )}
                {slotStart && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{t('cards.appointment.labels.date')}</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(slotStart).toLocaleDateString(locale, { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {(slotStart && slotEnd) && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{t('cards.appointment.labels.time')}</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(slotStart).toLocaleTimeString(locale, { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })} - {new Date(slotEnd).toLocaleTimeString(locale, { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {!slotStart && time && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{t('cards.appointment.labels.time')}</span>
                    <span className="text-gray-900 dark:text-gray-100">{displayTime}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {status && (
                <Badge className={`text-xs px-2.5 py-1 ${getStatusColor()}`}>
                  {getStatusText()}
                </Badge>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}