export enum EventType {
  // Appointment Events
  APPOINTMENT_CREATED = 'appointment.created',
  APPOINTMENT_UPDATED = 'appointment.updated',
  APPOINTMENT_CANCELLED = 'appointment.cancelled',
  APPOINTMENT_CONFIRMED = 'appointment.confirmed',
  
  // Service Events
  SERVICE_CREATED = 'service.created',
  SERVICE_UPDATED = 'service.updated',
  SERVICE_DELETED = 'service.deleted',
  
  // Slot Events
  SLOT_CREATED = 'slot.created',
  SLOT_UPDATED = 'slot.updated',
  SLOT_DELETED = 'slot.deleted',
  
  // Bot Events
  BOT_MESSAGE_RECEIVED = 'bot.message.received',
  BOT_COMMAND_EXECUTED = 'bot.command.executed',
  BOT_BOOKING_STARTED = 'bot.booking.started',
  BOT_BOOKING_COMPLETED = 'bot.booking.completed',
  ADMIN_LINKED = 'admin.linked',
  ADMIN_UNLINKED = 'admin.unlinked',
  
  // User Events
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_ACTIVITY = 'user.activity',
  
  // System Events
  SYSTEM_ERROR = 'system.error',
  SYSTEM_MAINTENANCE = 'system.maintenance'
}

export interface WebSocketEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  organizationId: number;
  userId?: number;
  data: any;
  metadata?: {
    source: 'telegram' | 'admin_panel' | 'api' | 'system';
    userAgent?: string;
    ip?: string;
  };
}

export const EVENT_SOURCES = {
  TELEGRAM: 'telegram',
  ADMIN_PANEL: 'admin_panel',
  API: 'api',
  SYSTEM: 'system'
} as const;

export const EVENT_CATEGORIES = {
  APPOINTMENT: 'appointment',
  SERVICE: 'service',
  SLOT: 'slot',
  BOT: 'bot',
  USER: 'user',
  SYSTEM: 'system'
} as const;
