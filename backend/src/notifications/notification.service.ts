import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotificationGateway } from './notification.gateway';
import { SendNotificationCommand } from './commands/send-notification.command';
import { GetUserNotificationsQuery } from './queries/get-user-notifications.query';
import { MarkNotificationReadCommand } from './commands/mark-notification-read.command';
import { NotificationType, NotificationPriority } from './notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async sendNotification(command: SendNotificationCommand) {
    const notification = await this.commandBus.execute(command);

    // Enviar via WebSocket se usuário estiver conectado
    await this.notificationGateway.sendNotificationToUser(
      command.userId,
      notification,
    );

    return notification;
  }

  async getUserNotifications(query: GetUserNotificationsQuery) {
    return this.queryBus.execute(query);
  }

  async markNotificationRead(command: MarkNotificationReadCommand) {
    return this.commandBus.execute(command);
  }

  // Método utilitário para enviar notificações rápidas
  async sendQuickNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    data?: any,
  ) {
    const command = new SendNotificationCommand(
      userId,
      type,
      title,
      message,
      priority,
      data,
    );

    return this.sendNotification(command);
  }

  // Notificações específicas do negócio
  async notifyReportGenerated(
    userId: string,
    reportId: string,
    reportTitle: string,
  ) {
    return this.sendQuickNotification(
      userId,
      NotificationType.REPORT_GENERATED,
      'Relatório Gerado',
      `Seu relatório "${reportTitle}" foi gerado com sucesso!`,
      NotificationPriority.HIGH,
      { reportId, reportTitle },
    );
  }

  async notifyCoinsEarned(userId: string, amount: number, reason: string) {
    return this.sendQuickNotification(
      userId,
      NotificationType.COINS_EARNED,
      'Moedas Ganhas!',
      `Você ganhou ${amount} moedas por ${reason}!`,
      NotificationPriority.MEDIUM,
      { amount, reason },
    );
  }

  async notifyCoinsSpent(userId: string, amount: number, reason: string) {
    return this.sendQuickNotification(
      userId,
      NotificationType.COINS_SPENT,
      'Moedas Gastas',
      `${amount} moedas foram gastas em ${reason}.`,
      NotificationPriority.LOW,
      { amount, reason },
    );
  }

  async notifySystemMaintenance(startTime: Date, endTime: Date) {
    return this.notificationGateway.broadcastNotification({
      type: NotificationType.SYSTEM_MAINTENANCE,
      title: 'Manutenção do Sistema',
      message: `O sistema estará em manutenção das ${startTime.toLocaleString()} às ${endTime.toLocaleString()}.`,
      priority: NotificationPriority.URGENT,
      data: { startTime, endTime },
    });
  }

  async notifyNewFeature(featureName: string, description: string) {
    return this.notificationGateway.broadcastNotification({
      type: NotificationType.NEW_FEATURE,
      title: 'Nova Funcionalidade!',
      message: `${featureName}: ${description}`,
      priority: NotificationPriority.HIGH,
      data: { featureName, description },
    });
  }
}
