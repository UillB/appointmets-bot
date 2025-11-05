import { toast } from "sonner@2.0.3";
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

// Toast notification system with WebSocket support
// Positioned at top-right with rich colors and icons

export const toastNotifications = {
  // ============ APPOINTMENTS ============
  appointments: {
    created: () =>
      toast.success("Appointment created", {
        description: "New appointment has been successfully created",
        icon: <Calendar className="w-5 h-5" />,
      }),

    updated: (clientName?: string) =>
      toast.success("Appointment updated", {
        description: clientName
          ? `Appointment for ${clientName} has been updated`
          : "Appointment details have been updated",
        icon: <Edit className="w-5 h-5" />,
      }),

    deleted: () =>
      toast.success("Appointment deleted", {
        description: "Appointment has been removed from the system",
        icon: <Trash2 className="w-5 h-5" />,
      }),

    confirmed: (clientName?: string) =>
      toast.success("Appointment confirmed", {
        description: clientName
          ? `${clientName}'s appointment has been confirmed`
          : "Appointment has been confirmed",
        icon: <CheckCircle2 className="w-5 h-5" />,
      }),

    cancelled: (clientName?: string) =>
      toast.error("Appointment cancelled", {
        description: clientName
          ? `${clientName}'s appointment has been cancelled`
          : "Appointment has been cancelled",
        icon: <XCircle className="w-5 h-5" />,
      }),

    pending: () =>
      toast.info("Appointment pending", {
        description: "Waiting for confirmation",
        icon: <Info className="w-5 h-5" />,
      }),
  },

  // ============ SERVICES ============
  services: {
    created: (serviceName?: string) =>
      toast.success("Service created", {
        description: serviceName
          ? `${serviceName} has been created with auto-generated slots`
          : "Service created with slots for 1 year",
        icon: <Wrench className="w-5 h-5" />,
      }),

    updated: (serviceName?: string) =>
      toast.success("Service updated", {
        description: serviceName
          ? `${serviceName} has been updated`
          : "Service details have been updated",
        icon: <Edit className="w-5 h-5" />,
      }),

    deleted: (serviceName?: string) =>
      toast.success("Service deleted", {
        description: serviceName
          ? `${serviceName} has been removed`
          : "Service has been removed from the system",
        icon: <Trash2 className="w-5 h-5" />,
      }),

    slotsGenerated: (serviceName?: string) =>
      toast.success("Slots generated", {
        description: serviceName
          ? `Time slots for ${serviceName} generated for 1 year`
          : "Time slots automatically generated for 1 year",
        icon: <Calendar className="w-5 h-5" />,
      }),
  },

  // ============ ORGANIZATIONS ============
  organizations: {
    created: (orgName?: string) =>
      toast.success("Organization created", {
        description: orgName
          ? `${orgName} has been added`
          : "New organization has been created",
        icon: <Building2 className="w-5 h-5" />,
      }),

    updated: (orgName?: string) =>
      toast.success("Organization updated", {
        description: orgName
          ? `${orgName} has been updated`
          : "Organization details have been updated",
        icon: <Edit className="w-5 h-5" />,
      }),

    deleted: (orgName?: string) =>
      toast.success("Organization deleted", {
        description: orgName
          ? `${orgName} has been removed`
          : "Organization has been removed from the system",
        icon: <Trash2 className="w-5 h-5" />,
      }),
  },

  // ============ WEBSOCKET REALTIME EVENTS ============
  realtime: {
    newAppointment: (clientName?: string) =>
      toast("New appointment received", {
        description: clientName
          ? `${clientName} just booked an appointment`
          : "A new appointment has been received",
        icon: <Bell className="w-5 h-5 text-blue-600" />,
        duration: 5000,
      }),

    appointmentConfirmed: (clientName?: string) =>
      toast("Appointment confirmed", {
        description: clientName
          ? `${clientName} confirmed their appointment`
          : "Client confirmed their appointment",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        duration: 4000,
      }),

    appointmentCancelled: (clientName?: string) =>
      toast("Appointment cancelled", {
        description: clientName
          ? `${clientName} cancelled their appointment`
          : "Client cancelled their appointment",
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        duration: 4000,
      }),

    appointmentRescheduled: (clientName?: string) =>
      toast.info("Appointment rescheduled", {
        description: clientName
          ? `${clientName} rescheduled their appointment`
          : "Client rescheduled their appointment",
        icon: <Calendar className="w-5 h-5" />,
      }),
  },

  // ============ SYSTEM EVENTS ============
  system: {
    refreshed: (page?: string) =>
      toast.success("Data refreshed", {
        description: page ? `${page} data has been updated` : "Latest data loaded",
        icon: <RefreshCw className="w-5 h-5" />,
      }),

    exported: (type?: string) =>
      toast.success("Export started", {
        description: type
          ? `${type} export is being prepared`
          : "Your file will be ready shortly",
        icon: <Download className="w-5 h-5" />,
      }),

    saved: () =>
      toast.success("Changes saved", {
        description: "Your changes have been saved successfully",
        icon: <CheckCircle2 className="w-5 h-5" />,
      }),

    autoSaved: () =>
      toast.success("Auto-saved", {
        description: "Changes saved automatically",
        icon: <CheckCircle2 className="w-5 h-5" />,
        duration: 2000,
      }),

    connectionLost: () =>
      toast.error("Connection lost", {
        description: "Trying to reconnect...",
        icon: <WifiOff className="w-5 h-5" />,
        duration: 8000,
      }),

    connectionRestored: () =>
      toast.success("Connection restored", {
        description: "You're back online",
        icon: <Wifi className="w-5 h-5" />,
      }),
  },

  // ============ ERRORS & WARNINGS ============
  errors: {
    general: (message?: string) =>
      toast.error("Error", {
        description: message || "Something went wrong. Please try again.",
        icon: <XCircle className="w-5 h-5" />,
      }),

    network: () =>
      toast.error("Network error", {
        description: "Unable to connect. Check your internet connection.",
        icon: <WifiOff className="w-5 h-5" />,
      }),

    validation: (message?: string) =>
      toast.error("Validation error", {
        description: message || "Please check the form and try again.",
        icon: <AlertTriangle className="w-5 h-5" />,
      }),

    unauthorized: () =>
      toast.error("Unauthorized", {
        description: "Please log in to continue.",
        icon: <User className="w-5 h-5" />,
      }),

    notFound: (item?: string) =>
      toast.error("Not found", {
        description: item ? `${item} not found` : "The requested item was not found.",
        icon: <AlertTriangle className="w-5 h-5" />,
      }),
  },

  warnings: {
    unsavedChanges: () =>
      toast.warning("Unsaved changes", {
        description: "You have unsaved changes. Save before leaving.",
        icon: <AlertTriangle className="w-5 h-5" />,
      }),

    limitReached: (limit?: string) =>
      toast.warning("Limit reached", {
        description: limit || "You've reached your limit for this action.",
        icon: <AlertTriangle className="w-5 h-5" />,
      }),

    deprecated: (feature?: string) =>
      toast.warning("Feature deprecated", {
        description: feature
          ? `${feature} will be removed soon`
          : "This feature is deprecated",
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
      toast.info(message || "Loading...", {
        icon: <RefreshCw className="w-5 h-5" />,
        duration: 2000,
      }),
  },

  // ============ SETTINGS ============
  settings: {
    saved: () =>
      toast.success("Settings saved", {
        description: "Your preferences have been updated",
        icon: <Settings className="w-5 h-5" />,
      }),

    reset: () =>
      toast.info("Settings reset", {
        description: "All settings have been restored to defaults",
        icon: <RefreshCw className="w-5 h-5" />,
      }),
  },
};

// Example usage:
// import { toastNotifications } from './components/toast-notifications';
//
// toastNotifications.appointments.created();
// toastNotifications.services.created("Haircut");
// toastNotifications.realtime.newAppointment("John Doe");
// toastNotifications.system.refreshed("Dashboard");
// toastNotifications.errors.network();
