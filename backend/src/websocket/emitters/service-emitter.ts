import { WebSocketManager } from '../server';
import { EventType, WebSocketEvent } from '../events';
import { prisma } from '../../lib/prisma';

export class ServiceEmitter {
  constructor(private wsManager: WebSocketManager) {}

  async emitServiceCreated(service: any) {
    const event: WebSocketEvent = {
      id: `service_${service.id}_${Date.now()}`,
      type: EventType.SERVICE_CREATED,
      timestamp: new Date(),
      organizationId: service.organizationId,
      data: {
        serviceId: service.id,
        serviceName: service.name,
        duration: service.durationMin,
        price: service.price,
        currency: service.currency
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

  async emitServiceUpdated(service: any, changes: any) {
    const event: WebSocketEvent = {
      id: `service_${service.id}_${Date.now()}`,
      type: EventType.SERVICE_UPDATED,
      timestamp: new Date(),
      organizationId: service.organizationId,
      data: {
        serviceId: service.id,
        serviceName: service.name,
        duration: service.durationMin,
        price: service.price,
        currency: service.currency,
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

  async emitServiceDeleted(service: any) {
    const event: WebSocketEvent = {
      id: `service_${service.id}_${Date.now()}`,
      type: EventType.SERVICE_DELETED,
      timestamp: new Date(),
      organizationId: service.organizationId,
      data: {
        serviceId: service.id,
        serviceName: service.name,
        duration: service.durationMin,
        price: service.price,
        currency: service.currency
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
    this.wsManager.broadcastToOrganization(event.organizationId, event);
  }

  private async createNotification(event: WebSocketEvent) {
    try {
      // Get users via UserOrganization
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
      case EventType.SERVICE_CREATED:
        return 'New Service Added';
      case EventType.SERVICE_UPDATED:
        return 'Service Updated';
      case EventType.SERVICE_DELETED:
        return 'Service Deleted';
      default:
        return 'Service Update';
    }
  }

  private getNotificationMessage(event: WebSocketEvent): string {
    const data = event.data;
    switch (event.type) {
      case EventType.SERVICE_CREATED:
        return `New service "${data.serviceName}" has been added`;
      case EventType.SERVICE_UPDATED:
        return `Service "${data.serviceName}" has been updated`;
      case EventType.SERVICE_DELETED:
        return `Service "${data.serviceName}" has been deleted`;
      default:
        return 'Service has been modified';
    }
  }
}
