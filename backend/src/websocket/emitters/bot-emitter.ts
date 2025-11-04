import { WebSocketManager } from '../server';
import { EventType, WebSocketEvent } from '../events';
import { prisma } from '../../lib/prisma';

export class BotEmitter {
  constructor(private wsManager: WebSocketManager) {}

  async emitBotMessageReceived(organizationId: number, messageData: any) {
    const event: WebSocketEvent = {
      id: `bot_message_${Date.now()}`,
      type: EventType.BOT_MESSAGE_RECEIVED,
      timestamp: new Date(),
      organizationId,
      data: {
        chatId: messageData.chatId,
        messageText: messageData.text,
        userId: messageData.userId,
        userName: messageData.userName
      },
      metadata: {
        source: 'telegram',
        userAgent: 'Telegram Bot'
      }
    };

    await this.broadcastEvent(event);
    await this.logEvent(event);
  }

  async emitBotCommandExecuted(organizationId: number, commandData: any) {
    const event: WebSocketEvent = {
      id: `bot_command_${Date.now()}`,
      type: EventType.BOT_COMMAND_EXECUTED,
      timestamp: new Date(),
      organizationId,
      data: {
        command: commandData.command,
        chatId: commandData.chatId,
        userId: commandData.userId,
        userName: commandData.userName,
        result: commandData.result
      },
      metadata: {
        source: 'telegram',
        userAgent: 'Telegram Bot'
      }
    };

    await this.broadcastEvent(event);
    await this.logEvent(event);
  }

  async emitBotBookingStarted(organizationId: number, bookingData: any) {
    const event: WebSocketEvent = {
      id: `bot_booking_start_${Date.now()}`,
      type: EventType.BOT_BOOKING_STARTED,
      timestamp: new Date(),
      organizationId,
      data: {
        chatId: bookingData.chatId,
        userId: bookingData.userId,
        userName: bookingData.userName,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName
      },
      metadata: {
        source: 'telegram',
        userAgent: 'Telegram Bot'
      }
    };

    await this.broadcastEvent(event);
    await this.logEvent(event);
  }

  async emitBotBookingCompleted(organizationId: number, bookingData: any) {
    const event: WebSocketEvent = {
      id: `bot_booking_complete_${Date.now()}`,
      type: EventType.BOT_BOOKING_COMPLETED,
      timestamp: new Date(),
      organizationId,
      data: {
        chatId: bookingData.chatId,
        userId: bookingData.userId,
        userName: bookingData.userName,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName,
        appointmentId: bookingData.appointmentId,
        slotTime: bookingData.slotTime
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

  async emitAdminLinked(userId: number, organizationId: number, telegramId: number) {
    const event: WebSocketEvent = {
      id: `admin_linked_${userId}_${Date.now()}`,
      type: EventType.ADMIN_LINKED,
      timestamp: new Date(),
      organizationId,
      userId,
      data: {
        userId,
        telegramId,
        organizationId
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

  async emitAdminUnlinked(userId: number, organizationId: number, telegramId: number) {
    const event: WebSocketEvent = {
      id: `admin_unlinked_${userId}_${Date.now()}`,
      type: EventType.ADMIN_UNLINKED,
      timestamp: new Date(),
      organizationId,
      userId,
      data: {
        userId,
        telegramId,
        organizationId
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
      case EventType.BOT_MESSAGE_RECEIVED:
        return 'Bot Message Received';
      case EventType.BOT_COMMAND_EXECUTED:
        return 'Bot Command Executed';
      case EventType.BOT_BOOKING_STARTED:
        return 'Booking Started';
      case EventType.BOT_BOOKING_COMPLETED:
        return 'Booking Completed';
      case EventType.ADMIN_LINKED:
        return 'Admin Account Linked';
      case EventType.ADMIN_UNLINKED:
        return 'Admin Account Unlinked';
      default:
        return 'Bot Activity';
    }
  }

  private getNotificationMessage(event: WebSocketEvent): string {
    const data = event.data;
    switch (event.type) {
      case EventType.BOT_MESSAGE_RECEIVED:
        return `Message received from ${data.userName}: ${data.messageText?.substring(0, 50)}...`;
      case EventType.BOT_COMMAND_EXECUTED:
        return `Command /${data.command} executed by ${data.userName}`;
      case EventType.BOT_BOOKING_STARTED:
        return `${data.userName} started booking ${data.serviceName}`;
      case EventType.BOT_BOOKING_COMPLETED:
        return `${data.userName} completed booking for ${data.serviceName}`;
      case EventType.ADMIN_LINKED:
        return `Admin account linked successfully (Telegram ID: ${data.telegramId})`;
      case EventType.ADMIN_UNLINKED:
        return `Admin account unlinked (Telegram ID: ${data.telegramId})`;
      default:
        return 'Bot activity detected';
    }
  }
}
