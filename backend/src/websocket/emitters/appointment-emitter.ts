import { WebSocketManager } from '../server';
import { EventType, WebSocketEvent } from '../events';
import { prisma } from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export class AppointmentEmitter {
  constructor(private wsManager: WebSocketManager) {}

  async emitAppointmentCreated(appointment: any, customerInfo?: { chatId?: string; firstName?: string; lastName?: string; username?: string }) {
    const slotStart = new Date(appointment.slot.startAt);
    const slotEnd = new Date(appointment.slot.endAt);
    const serviceDuration = appointment.service.durationMin || 0;
    const calculatedEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);
    
    const customerName = customerInfo 
      ? `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim() || customerInfo.username || customerInfo.chatId || 'Unknown'
      : appointment.customerName || appointment.chatId || 'Unknown';

    const event: WebSocketEvent = {
      id: `appointment_${appointment.id}_${Date.now()}`,
      type: EventType.APPOINTMENT_CREATED,
      timestamp: new Date(),
      organizationId: appointment.service.organizationId,
      userId: appointment.userId,
      data: {
        appointmentId: appointment.id,
        serviceName: appointment.service.name,
        serviceId: appointment.service.id,
        slotStart: appointment.slot.startAt,
        slotEnd: appointment.slot.endAt,
        slotTime: appointment.slot.startAt,
        customerName: customerName,
        customerChatId: customerInfo?.chatId || appointment.chatId,
        customerUsername: customerInfo?.username,
        customerFirstName: customerInfo?.firstName,
        customerLastName: customerInfo?.lastName,
        status: appointment.status
      },
      metadata: {
        source: 'telegram',
        userAgent: 'Telegram Bot'
      }
    };

    await this.broadcastEvent(event);
    await this.createNotification(event);
    await this.logEvent(event);
  }

  async emitAppointmentUpdated(appointment: any, changes: any) {
    const event: WebSocketEvent = {
      id: `appointment_${appointment.id}_${Date.now()}`,
      type: EventType.APPOINTMENT_UPDATED,
      timestamp: new Date(),
      organizationId: appointment.service.organizationId,
      userId: appointment.userId,
      data: {
        appointmentId: appointment.id,
        serviceName: appointment.service.name,
        slotTime: appointment.slot.startAt,
        customerName: appointment.customerName,
        status: appointment.status,
        changes
      },
      metadata: {
        source: 'admin_panel',
        userAgent: 'Admin Panel'
      }
    };

    await this.broadcastEvent(event);
    await this.createNotification(event);
    await this.logEvent(event);
  }

  async emitAppointmentCancelled(appointment: any, customerInfo?: { chatId?: string; firstName?: string; lastName?: string; username?: string }) {
    const slotStart = new Date(appointment.slot.startAt);
    const slotEnd = new Date(appointment.slot.endAt);
    const serviceDuration = appointment.service.durationMin || 0;
    const calculatedEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);
    
    const customerName = customerInfo 
      ? `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim() || customerInfo.username || customerInfo.chatId || 'Unknown'
      : appointment.customerName || appointment.chatId || 'Unknown';

    const event: WebSocketEvent = {
      id: `appointment_${appointment.id}_${Date.now()}`,
      type: EventType.APPOINTMENT_CANCELLED,
      timestamp: new Date(),
      organizationId: appointment.service.organizationId,
      userId: appointment.userId,
      data: {
        appointmentId: appointment.id,
        serviceName: appointment.service.name,
        serviceId: appointment.service.id,
        slotStart: appointment.slot.startAt,
        slotEnd: appointment.slot.endAt,
        slotTime: appointment.slot.startAt,
        customerName: customerName,
        customerChatId: customerInfo?.chatId || appointment.chatId,
        customerUsername: customerInfo?.username,
        customerFirstName: customerInfo?.firstName,
        customerLastName: customerInfo?.lastName,
        status: appointment.status
      },
      metadata: {
        source: 'telegram',
        userAgent: 'Telegram Bot'
      }
    };

    await this.broadcastEvent(event);
    await this.createNotification(event);
    await this.logEvent(event);
  }

  async emitAppointmentConfirmed(appointment: any) {
    const event: WebSocketEvent = {
      id: `appointment_${appointment.id}_${Date.now()}`,
      type: EventType.APPOINTMENT_CONFIRMED,
      timestamp: new Date(),
      organizationId: appointment.service.organizationId,
      userId: appointment.userId,
      data: {
        appointmentId: appointment.id,
        serviceName: appointment.service.name,
        slotTime: appointment.slot.startAt,
        customerName: appointment.customerName,
        status: appointment.status
      },
      metadata: {
        source: 'admin_panel',
        userAgent: 'Admin Panel'
      }
    };

    await this.broadcastEvent(event);
    await this.createNotification(event);
    await this.logEvent(event);
  }

  private async broadcastEvent(event: WebSocketEvent) {
    // Broadcast to all connected clients in the organization
    this.wsManager.broadcastToOrganization(event.organizationId, event);
  }

  private async createNotification(event: WebSocketEvent) {
    try {
      // Create notification for relevant users in the organization via UserOrganization
      const userOrganizations = await prisma.userOrganization.findMany({
        where: { organizationId: event.organizationId },
        include: {
          user: {
            select: { id: true, role: true }
          }
        }
      });

      for (const userOrg of userOrganizations) {
        await prisma.notification.create({
          data: {
            userId: userOrg.user.id,
            organizationId: event.organizationId,
            type: event.type,
            title: this.getNotificationTitle(event.type),
            message: this.getNotificationMessage(event),
            data: event.data
          }
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  private async logEvent(event: WebSocketEvent) {
    try {
      await prisma.eventLog.create({
        data: {
          organizationId: event.organizationId,
          type: event.type,
          source: event.metadata?.source || 'system',
          userId: event.userId,
          data: event.data,
          metadata: event.metadata
        }
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  private getNotificationTitle(eventType: EventType): string {
    switch (eventType) {
      case EventType.APPOINTMENT_CREATED:
        return 'New Appointment';
      case EventType.APPOINTMENT_UPDATED:
        return 'Appointment Updated';
      case EventType.APPOINTMENT_CANCELLED:
        return 'Appointment Cancelled';
      case EventType.APPOINTMENT_CONFIRMED:
        return 'Appointment Confirmed';
      default:
        return 'Appointment Update';
    }
  }

  private getNotificationMessage(event: WebSocketEvent): string {
    const data = event.data;
    const slotStart = new Date(data.slotStart || data.slotTime);
    // Use slotEnd if available, otherwise calculate from service duration
    let slotEnd: Date;
    if (data.slotEnd) {
      slotEnd = new Date(data.slotEnd);
    } else {
      // Fallback: use slotStart + 1 hour if no duration info
      slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
    }
    
    // Format date and time
    const dateStr = slotStart.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStartStr = slotStart.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const timeEndStr = slotEnd.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Customer info
    const customerInfo = [];
    if (data.customerName && data.customerName !== 'Unknown') {
      customerInfo.push(data.customerName);
    }
    if (data.customerUsername) {
      customerInfo.push(`@${data.customerUsername}`);
    }
    if (data.customerChatId && !customerInfo.length) {
      customerInfo.push(`ID: ${data.customerChatId}`);
    }
    const customerStr = customerInfo.length > 0 ? customerInfo.join(' ') : 'Unknown customer';
    
    switch (event.type) {
      case EventType.APPOINTMENT_CREATED:
        return `📅 Новая запись\n\n` +
               `🏥 Сервис: ${data.serviceName}\n` +
               `📆 Дата: ${dateStr}\n` +
               `⏰ Время: ${timeStartStr} - ${timeEndStr}\n` +
               `👤 Клиент: ${customerStr}`;
      case EventType.APPOINTMENT_UPDATED:
        return `📝 Запись обновлена\n\n` +
               `🏥 Сервис: ${data.serviceName}\n` +
               `📆 Дата: ${dateStr}\n` +
               `⏰ Время: ${timeStartStr} - ${timeEndStr}\n` +
               `👤 Клиент: ${customerStr}`;
      case EventType.APPOINTMENT_CANCELLED:
        return `❌ Запись отменена\n\n` +
               `🏥 Сервис: ${data.serviceName}\n` +
               `📆 Дата: ${dateStr}\n` +
               `⏰ Время: ${timeStartStr} - ${timeEndStr}\n` +
               `👤 Клиент: ${customerStr}`;
      case EventType.APPOINTMENT_CONFIRMED:
        return `✅ Запись подтверждена\n\n` +
               `🏥 Сервис: ${data.serviceName}\n` +
               `📆 Дата: ${dateStr}\n` +
               `⏰ Время: ${timeStartStr} - ${timeEndStr}\n` +
               `👤 Клиент: ${customerStr}`;
      default:
        return 'Appointment status updated';
    }
  }
}
