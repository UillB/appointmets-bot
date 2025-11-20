import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Bell,
  Calendar,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  Download,
  Wifi,
  WifiOff,
  Settings,
  User,
  Building2,
  Wrench,
} from "lucide-react";

// Type for translation function
type TFunction = (key: string, params?: Record<string, string>) => string;

// Create toast notifications with translations
export const createToastNotifications = (t: TFunction) => ({
  // ============ APPOINTMENTS ============
  appointments: {
    created: () =>
      toast.success(t('notifications.appointments.created'), {
        description: t('notifications.appointments.createdDescription'),
        icon: <Calendar className="w-5 h-5" />,
      }),

    updated: (clientName?: string) =>
      toast.success(t('notifications.appointments.updated'), {
        description: clientName
          ? t('notifications.appointments.updatedForClient', { clientName })
          : t('notifications.appointments.updatedDescription'),
        icon: <Edit className="w-5 h-5" />,
      }),

    deleted: () =>
      toast.success(t('notifications.appointments.deleted'), {
        description: t('notifications.appointments.deletedDescription'),
        icon: <Trash2 className="w-5 h-5" />,
      }),

    confirmed: (clientName?: string) =>
      toast.success(t('notifications.appointments.confirmed'), {
        description: clientName
          ? t('notifications.appointments.confirmedForClient', { clientName })
          : t('notifications.appointments.confirmedDescription'),
        icon: <CheckCircle2 className="w-5 h-5" />,
      }),

    cancelled: (clientName?: string) =>
      toast.error(t('notifications.appointments.cancelled'), {
        description: clientName
          ? t('notifications.appointments.cancelledForClient', { clientName })
          : t('notifications.appointments.cancelledDescription'),
        icon: <XCircle className="w-5 h-5" />,
      }),

    rejected: (clientName?: string, reason?: string) => {
      const params: Record<string, string> = {};
      if (clientName) params.clientName = clientName;
      if (reason) params.reason = reason;
      
      const description = clientName && reason
        ? t('notifications.appointments.rejectedForClientWithReason', params)
        : clientName
        ? t('notifications.appointments.rejectedForClient', params)
        : reason
        ? t('notifications.appointments.rejectedWithReason', params)
        : t('notifications.appointments.rejectedDescription');
      
      return toast.error(t('notifications.appointments.rejected'), {
        description,
        icon: <XCircle className="w-5 h-5" />,
      });
    },

    pending: () =>
      toast.info(t('notifications.appointments.pending'), {
        description: t('notifications.appointments.pendingDescription'),
        icon: <Info className="w-5 h-5" />,
      }),
  },

  // ============ SERVICES ============
  services: {
    created: (serviceName?: string) =>
      toast.success(t('notifications.services.created'), {
        description: serviceName
          ? t('notifications.services.createdWithName', { serviceName })
          : t('notifications.services.createdDescription'),
        icon: <Wrench className="w-5 h-5" />,
      }),

    updated: (serviceName?: string) =>
      toast.success(t('notifications.services.updated'), {
        description: serviceName
          ? t('notifications.services.updatedWithName', { serviceName })
          : t('notifications.services.updatedDescription'),
        icon: <Edit className="w-5 h-5" />,
      }),

    deleted: (serviceName?: string) =>
      toast.success(t('notifications.services.deleted'), {
        description: serviceName
          ? t('notifications.services.deletedWithName', { serviceName })
          : t('notifications.services.deletedDescription'),
        icon: <Trash2 className="w-5 h-5" />,
      }),

    slotsGenerated: (serviceName?: string) =>
      toast.success(t('notifications.services.slotsGenerated'), {
        description: serviceName
          ? t('notifications.services.slotsGeneratedWithName', { serviceName })
          : t('notifications.services.slotsGeneratedDescription'),
        icon: <Calendar className="w-5 h-5" />,
      }),
  },

  // ============ ORGANIZATIONS ============
  organizations: {
    created: (orgName?: string) =>
      toast.success(t('notifications.organizations.created'), {
        description: orgName
          ? t('notifications.organizations.createdWithName', { orgName })
          : t('notifications.organizations.createdDescription'),
        icon: <Building2 className="w-5 h-5" />,
      }),

    updated: (orgName?: string) =>
      toast.success(t('notifications.organizations.updated'), {
        description: orgName
          ? t('notifications.organizations.updatedWithName', { orgName })
          : t('notifications.organizations.updatedDescription'),
        icon: <Edit className="w-5 h-5" />,
      }),

    deleted: (orgName?: string) =>
      toast.success(t('notifications.organizations.deleted'), {
        description: orgName
          ? t('notifications.organizations.deletedWithName', { orgName })
          : t('notifications.organizations.deletedDescription'),
        icon: <Trash2 className="w-5 h-5" />,
      }),
  },

  // ============ WEBSOCKET REALTIME EVENTS ============
  realtime: {
    newAppointment: (clientName?: string) =>
      toast(t('notifications.realtime.newAppointment'), {
        description: clientName
          ? t('notifications.realtime.newAppointmentForClient', { clientName })
          : t('notifications.realtime.newAppointmentDescription'),
        icon: <Bell className="w-5 h-5 text-blue-600" />,
        duration: 5000,
      }),

    appointmentConfirmed: (clientName?: string) =>
      toast(t('notifications.realtime.appointmentConfirmed'), {
        description: clientName
          ? t('notifications.realtime.appointmentConfirmedForClient', { clientName })
          : t('notifications.realtime.appointmentConfirmedDescription'),
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        duration: 4000,
      }),

    appointmentCancelled: (clientName?: string) =>
      toast(t('notifications.realtime.appointmentCancelled'), {
        description: clientName
          ? t('notifications.realtime.appointmentCancelledForClient', { clientName })
          : t('notifications.realtime.appointmentCancelledDescription'),
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        duration: 4000,
      }),

    appointmentRejected: (clientName?: string, reason?: string) => {
      const params: Record<string, string> = {};
      if (clientName) params.clientName = clientName;
      if (reason) params.reason = reason;
      
      // Use appropriate translation key based on available parameters
      // Note: We need to add rejectedForClientWithReason key to realtime section if it doesn't exist
      const description = clientName && reason
        ? t('notifications.realtime.appointmentRejectedForClient', params) + `: ${reason}`
        : clientName
        ? t('notifications.realtime.appointmentRejectedForClient', params)
        : reason
        ? t('notifications.realtime.appointmentRejectedWithReason', params)
        : t('notifications.realtime.appointmentRejectedDescription');
      
      return toast(t('notifications.realtime.appointmentRejected'), {
        description,
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        duration: 4000,
      });
    },

    appointmentRescheduled: (clientName?: string) =>
      toast.info(t('notifications.realtime.appointmentRescheduled'), {
        description: clientName
          ? t('notifications.realtime.appointmentRescheduledForClient', { clientName })
          : t('notifications.realtime.appointmentRescheduledDescription'),
        icon: <Calendar className="w-5 h-5" />,
      }),
  },

  // ============ SYSTEM EVENTS ============
  system: {
    refreshed: (page?: string) =>
      toast.success(t('notifications.system.refreshed'), {
        description: page
          ? t('notifications.system.refreshedForPage', { page })
          : t('notifications.system.refreshedDescription'),
        icon: <RefreshCw className="w-5 h-5" />,
      }),

    exported: (type?: string) =>
      toast.success(t('notifications.system.exported'), {
        description: type
          ? t('notifications.system.exportedForType', { type })
          : t('notifications.system.exportedDescription'),
        icon: <Download className="w-5 h-5" />,
      }),

    saved: () =>
      toast.success(t('notifications.system.saved'), {
        description: t('notifications.system.savedDescription'),
        icon: <CheckCircle2 className="w-5 h-5" />,
      }),

    autoSaved: () =>
      toast.success(t('notifications.system.autoSaved'), {
        description: t('notifications.system.autoSavedDescription'),
        icon: <CheckCircle2 className="w-5 h-5" />,
        duration: 2000,
      }),

    connectionLost: () =>
      toast.error(t('notifications.system.connectionLost'), {
        description: t('notifications.system.connectionLostDescription'),
        icon: <WifiOff className="w-5 h-5" />,
        duration: 8000,
      }),

    connectionRestored: () =>
      toast.success(t('notifications.system.connectionRestored'), {
        description: t('notifications.system.connectionRestoredDescription'),
        icon: <Wifi className="w-5 h-5" />,
      }),
  },

  // ============ ERRORS & WARNINGS ============
  errors: {
    general: (message?: string) =>
      toast.error(t('notifications.errors.general'), {
        description: message || t('notifications.errors.generalDescription'),
        icon: <XCircle className="w-5 h-5" />,
      }),

    network: () =>
      toast.error(t('notifications.errors.network'), {
        description: t('notifications.errors.networkDescription'),
        icon: <WifiOff className="w-5 h-5" />,
      }),

    validation: (message?: string) =>
      toast.error(t('notifications.errors.validation'), {
        description: message || t('notifications.errors.validationDescription'),
        icon: <AlertTriangle className="w-5 h-5" />,
      }),

    unauthorized: () =>
      toast.error(t('notifications.errors.unauthorized'), {
        description: t('notifications.errors.unauthorizedDescription'),
        icon: <User className="w-5 h-5" />,
      }),

    notFound: (item?: string) =>
      toast.error(t('notifications.errors.notFound'), {
        description: item
          ? t('notifications.errors.notFoundForItem', { item })
          : t('notifications.errors.notFoundDescription'),
        icon: <AlertTriangle className="w-5 h-5" />,
      }),
  },

  warnings: {
    unsavedChanges: () =>
      toast.warning(t('notifications.warnings.unsavedChanges'), {
        description: t('notifications.warnings.unsavedChangesDescription'),
        icon: <AlertTriangle className="w-5 h-5" />,
      }),

    limitReached: (limit?: string) =>
      toast.warning(t('notifications.warnings.limitReached'), {
        description: limit || t('notifications.warnings.limitReachedDescription'),
        icon: <AlertTriangle className="w-5 h-5" />,
      }),

    deprecated: (feature?: string) =>
      toast.warning(t('notifications.warnings.deprecated'), {
        description: feature
          ? t('notifications.warnings.deprecatedForFeature', { feature })
          : t('notifications.warnings.deprecatedDescription'),
        icon: <Info className="w-5 h-5" />,
      }),
  },

  // ============ INFO ============
  info: {
    general: (message: string, description?: string) =>
      toast.info(message, {
        description,
        icon: <Info className="w-5 h-5" />,
      }),

    loading: (message?: string) =>
      toast.info(message || t('notifications.info.loading'), {
        icon: <RefreshCw className="w-5 h-5" />,
        duration: 2000,
      }),
  },

  // ============ SETTINGS ============
  settings: {
    saved: () =>
      toast.success(t('notifications.settings.saved'), {
        description: t('notifications.settings.savedDescription'),
        icon: <Settings className="w-5 h-5" />,
      }),

    reset: () =>
      toast.info(t('notifications.settings.reset'), {
        description: t('notifications.settings.resetDescription'),
        icon: <RefreshCw className="w-5 h-5" />,
      }),
  },

  // ============ BOT MANAGEMENT ============
  bot: {
    activated: () =>
      toast.success(t('notifications.bot.activated'), {
        description: t('notifications.bot.activatedDescription'),
        icon: <CheckCircle2 className="w-5 h-5" />,
      }),

    deactivated: () =>
      toast.info(t('notifications.bot.deactivated'), {
        description: t('notifications.bot.deactivatedDescription'),
        icon: <XCircle className="w-5 h-5" />,
      }),

    settingsUpdated: () =>
      toast.success(t('notifications.bot.settingsUpdated'), {
        description: t('notifications.bot.settingsUpdatedDescription'),
        icon: <Settings className="w-5 h-5" />,
      }),

    tokenValidated: () =>
      toast.success(t('notifications.bot.tokenValidated'), {
        description: t('notifications.bot.tokenValidatedDescription'),
        icon: <CheckCircle2 className="w-5 h-5" />,
      }),

    adminLinked: () =>
      toast.success(t('notifications.bot.adminLinked'), {
        description: t('notifications.bot.adminLinkedDescription'),
        icon: <User className="w-5 h-5" />,
      }),

    adminUnlinked: () =>
      toast.info(t('notifications.bot.adminUnlinked'), {
        description: t('notifications.bot.adminUnlinkedDescription'),
        icon: <User className="w-5 h-5" />,
      }),
  },
});

// Default English fallback (for backward compatibility)
// Note: This is a minimal fallback. Components should use createToastNotifications(t) instead.
const defaultT: TFunction = (key: string, params?: Record<string, string>) => {
  // Return a readable key name as fallback
  const keys = key.split('.');
  const lastKey = keys[keys.length - 1];
  // Convert camelCase to Title Case
  const readable = lastKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  return params ? readable : readable;
};

// Export default instance with English fallback (deprecated - use createToastNotifications instead)
export const toastNotifications = createToastNotifications(defaultT);
