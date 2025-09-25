import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly notificationService: NotificationService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // Validar token e obter userId
      const userId = await this.validateToken(token);
      if (userId) {
        this.connectedUsers.set(userId, client.id);
        console.log(`User ${userId} connected to notifications`);
      } else {
        client.disconnect();
      }
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected from notifications`);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    this.connectedUsers.set(data.userId, client.id);
    client.emit('joined', { message: 'Connected to notification service' });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket
  ) {
    // Implementation will be added
    client.emit('notification_read', { notificationId: data.notificationId });
  }

  // Método para enviar notificação para usuário específico
  async sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // Método para broadcast para todos os usuários conectados
  async broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }

  private async validateToken(token: string): Promise<string | null> {
    // TODO: Implementar validação JWT completa
    // Por enquanto, retornar mock para desenvolvimento
    return 'user-id-mock';
  }
}
