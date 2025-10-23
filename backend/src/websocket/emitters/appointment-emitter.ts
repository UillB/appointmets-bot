import { WebSocketManager } from '../server';
import { EventType, WebSocketEvent } from '../events';
import { prisma } from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export class AppointmentEmitter {
  constructor(private wsManager: WebSocketManager) {}

  async emitAppointmentCreated(appointment: any) {
    const event: WebSocketEvent = {
      id: `appointment_${appointment.id}_${Date.now()}`,
      type: EventType.APPOINTMENT_CREATED,
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

  async emitAppointmentCancelled(appointment: any) {
    const event: WebSocketEvent = {
      id: `appointment_${appointment.id}_${Date.now()}`,
      type: EventType.APPOINTMENT_CANCELLED,
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
      // Create notification for relevant users in the organization
      const users = await prisma.user.findMany({
        where: { organizationId: event.organizationId },
        select: { id: true, role: true }
      });

      for (const user of users) {
        await prisma.notification.create({
          data: {
            userId: user.id,
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
    switch (event.type) {
      case EventType.APPOINTMENT_CREATED:
        return `New appointment created for ${data.serviceName} at ${new Date(data.slotTime).toLocaleString()}`;
      case EventType.APPOINTMENT_UPDATED:
        return `Appointment for ${data.serviceName} has been updated`;
      case EventType.APPOINTMENT_CANCELLED:
        return `Appointment for ${data.serviceName} has been cancelled`;
      case EventType.APPOINTMENT_CONFIRMED:
        return `Appointment for ${data.serviceName} has been confirmed`;
      default:
        return 'Appointment status updated';
    }
  }
}
