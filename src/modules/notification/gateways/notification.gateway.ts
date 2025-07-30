import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// notification.gateway.ts
@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribeNotifications')
  handleSubscribe(client: Socket, userId: string) {
    client.join(`user-${userId}`);
  }

  sendRealTimeNotification(userId: string, notification: Notification) {
    this.server.to(`user-${userId}`).emit('new-notification', notification);
  }
}
