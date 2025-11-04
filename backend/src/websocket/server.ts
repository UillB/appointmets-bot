import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { EventEmitter } from 'events';
import { verifyToken } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { WebSocketEvent } from './events';

interface ClientSession {
  ws: WebSocket;
  userId: number;
  organizationId: number;
  role: string;
}

export class WebSocketManager extends EventEmitter {
  private wss: WebSocketServer;
  private clients: Map<string, ClientSession> = new Map();
  private userSessions: Map<string, { userId: number, organizationId: number, role: string }> = new Map();

  constructor(server: Server) {
    super();
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.setupEventHandlers();
  }

  private async verifyClient(info: any): Promise<boolean> {
    try {
      const token = this.extractToken(info.req.url);
      const decoded = await verifyToken(token);
      
      if (!decoded.organizationId) {
        console.error('WebSocket authentication failed: No organizationId in token', {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        });
        return false;
      }
      
      // Store user session
      this.userSessions.set(info.req.url, {
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        role: decoded.role
      });
      
      console.log(`WebSocket client verified: User ${decoded.userId}, Org ${decoded.organizationId}, Role ${decoded.role}`);
      
      return true;
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      return false;
    }
  }

  private extractToken(url: string): string {
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.searchParams.get('token') || '';
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const sessionKey = req.url || '';
      const session = this.userSessions.get(sessionKey);
      
      if (!session) {
        ws.close(1008, 'Invalid session');
        return;
      }

      // Store client connection with session info
      const clientId = `${session.userId}_${session.organizationId}_${Date.now()}`;
      this.clients.set(clientId, {
        ws,
        userId: session.userId,
        organizationId: session.organizationId,
        role: session.role
      });

      console.log(`WebSocket client connected: ${clientId} (User: ${session.userId}, Org: ${session.organizationId})`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to real-time updates',
        timestamp: new Date()
      }));

      // Handle client messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message, session);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
        this.userSessions.delete(sessionKey);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
        this.userSessions.delete(sessionKey);
      });
    });
  }

  private handleClientMessage(clientId: string, message: any, session: { userId: number, organizationId: number, role: string }) {
    switch (message.type) {
      case 'ping':
        const clientSession = this.clients.get(clientId);
        if (clientSession && clientSession.ws.readyState === WebSocket.OPEN) {
          clientSession.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
        }
        break;
      case 'subscribe':
        // Handle subscription to specific event types
        console.log(`Client ${clientId} subscribed to:`, message.events);
        break;
      default:
        console.log(`Unknown message type from client ${clientId}:`, message.type);
    }
  }

  // Broadcast event to all clients in an organization
  public broadcastToOrganization(organizationId: number, event: WebSocketEvent) {
    const clientsToNotify = Array.from(this.clients.entries()).filter(([clientId, clientSession]) => {
      // Direct check using stored organizationId
      return clientSession.organizationId === organizationId;
    });

    console.log(`Broadcasting event ${event.type} to ${clientsToNotify.length} clients in organization ${organizationId}`);
    
    // Debug: log all connected clients
    if (clientsToNotify.length === 0) {
      const allClients = Array.from(this.clients.entries()).map(([id, session]) => ({
        id,
        userId: session.userId,
        orgId: session.organizationId
      }));
      console.log(`Debug: All connected clients:`, allClients);
      console.log(`Debug: Looking for organizationId: ${organizationId}`);
    }

    // Send event in the format expected by frontend
    const message = {
      type: 'event',
      data: event,
      timestamp: new Date()
    };

    clientsToNotify.forEach(([clientId, clientSession]) => {
      if (clientSession.ws.readyState === WebSocket.OPEN) {
        try {
          clientSession.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Failed to send event to client ${clientId}:`, error);
        }
      }
    });
  }

  // Broadcast event to specific user
  public broadcastToUser(userId: number, event: WebSocketEvent) {
    const clientsToNotify = Array.from(this.clients.entries()).filter(([clientId, clientSession]) => {
      return clientSession.userId === userId;
    });

    console.log(`Broadcasting event ${event.type} to ${clientsToNotify.length} clients for user ${userId}`);

    // Send event in the format expected by frontend
    const message = {
      type: 'event',
      data: event,
      timestamp: new Date()
    };

    clientsToNotify.forEach(([clientId, clientSession]) => {
      if (clientSession.ws.readyState === WebSocket.OPEN) {
        try {
          clientSession.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Failed to send event to client ${clientId}:`, error);
        }
      }
    });
  }

  // Broadcast event to all connected clients
  public broadcastToAll(event: WebSocketEvent) {
    console.log(`Broadcasting event ${event.type} to all ${this.clients.size} clients`);

    // Send event in the format expected by frontend
    const message = {
      type: 'event',
      data: event,
      timestamp: new Date()
    };

    this.clients.forEach((clientSession, clientId) => {
      if (clientSession.ws.readyState === WebSocket.OPEN) {
        try {
          clientSession.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Failed to send event to client ${clientId}:`, error);
        }
      }
    });
  }

  // Get connection statistics
  public getStats() {
    return {
      totalConnections: this.clients.size,
      activeSessions: this.userSessions.size,
      connectionsByOrganization: this.getConnectionsByOrganization()
    };
  }

  private getConnectionsByOrganization() {
    const orgStats: { [key: number]: number } = {};
    
    this.userSessions.forEach((session) => {
      orgStats[session.organizationId] = (orgStats[session.organizationId] || 0) + 1;
    });

    return orgStats;
  }

  // Close all connections
  public close() {
    this.clients.forEach((clientSession) => {
      clientSession.ws.close();
    });
    this.wss.close();
  }
}
