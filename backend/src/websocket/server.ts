import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { EventEmitter } from 'events';
import { verifyToken } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { WebSocketEvent } from './events';

export class WebSocketManager extends EventEmitter {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
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
      
      // Store user session
      this.userSessions.set(info.req.url, {
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        role: decoded.role
      });
      
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

      // Store client connection
      const clientId = `${session.userId}_${session.organizationId}_${Date.now()}`;
      this.clients.set(clientId, ws);

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
        const ws = this.clients.get(clientId);
        if (ws) {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
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
    const clientsToNotify = Array.from(this.clients.entries()).filter(([clientId, ws]) => {
      const sessionKey = Array.from(this.userSessions.entries())
        .find(([key, session]) => session.userId === parseInt(clientId.split('_')[0]))?.[0];
      
      if (!sessionKey) return false;
      
      const session = this.userSessions.get(sessionKey);
      return session && session.organizationId === organizationId;
    });

    console.log(`Broadcasting event ${event.type} to ${clientsToNotify.length} clients in organization ${organizationId}`);

    clientsToNotify.forEach(([clientId, ws]) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event));
      }
    });
  }

  // Broadcast event to specific user
  public broadcastToUser(userId: number, event: WebSocketEvent) {
    const clientsToNotify = Array.from(this.clients.entries()).filter(([clientId, ws]) => {
      return clientId.startsWith(`${userId}_`);
    });

    console.log(`Broadcasting event ${event.type} to ${clientsToNotify.length} clients for user ${userId}`);

    clientsToNotify.forEach(([clientId, ws]) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event));
      }
    });
  }

  // Broadcast event to all connected clients
  public broadcastToAll(event: WebSocketEvent) {
    console.log(`Broadcasting event ${event.type} to all ${this.clients.size} clients`);

    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event));
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
    this.clients.forEach((ws) => {
      ws.close();
    });
    this.wss.close();
  }
}
