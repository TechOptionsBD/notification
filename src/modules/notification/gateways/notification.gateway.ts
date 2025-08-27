import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// notification.gateway.ts

/**
 * WebSocket gateway for real-time notification delivery.
 * Handles client subscriptions and emits notifications to specific users.
 */
@WebSocketGateway()
export class NotificationGateway {
  /**
   * Socket.IO server instance for emitting events.
   */
  @WebSocketServer()
  server: Server;

  /**
   * Handles client subscription to notification events for a specific user.
   * Joins the client to a room based on userId.
   * @param client Socket client instance
   * @param userId User ID to subscribe to
   */
  @SubscribeMessage('subscribeNotifications')
  handleSubscribe(client: Socket, userId: string) {
    // Add client to a room for the user
    client.join(`user-${userId}`);
  }

  /**
   * Emits a real-time notification to a specific user.
   * @param userId User ID to send notification to
   * @param notification Notification payload
   */
  sendRealTimeNotification(userId: string, notification: Notification) {
    // Emit notification to the user's room
    this.server.to(`user-${userId}`).emit('new-notification', notification);
  }
}
