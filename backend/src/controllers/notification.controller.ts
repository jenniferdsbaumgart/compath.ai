import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { SendNotificationCommand } from '../notifications/commands/send-notification.command';
import { GetUserNotificationsQuery } from '../notifications/queries/get-user-notifications.query';
import { MarkNotificationReadCommand } from '../notifications/commands/mark-notification-read.command';
import {
  NotificationType,
  NotificationPriority,
} from '../notifications/notification.schema';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getUserNotifications(
    @GetUser() user: any,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @Query('unreadOnly') unreadOnly = 'false',
  ) {
    const query = new GetUserNotificationsQuery(
      user._id,
      parseInt(limit),
      parseInt(offset),
      unreadOnly === 'true',
    );

    return this.queryBus.execute(query);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') notificationId: string, @GetUser() user: any) {
    const command = new MarkNotificationReadCommand(notificationId, user._id);
    return this.commandBus.execute(command);
  }

  @Post('test')
  async sendTestNotification(@GetUser() user: any) {
    const command = new SendNotificationCommand(
      user._id,
      NotificationType.SYSTEM_MAINTENANCE,
      'Teste de Notificação',
      'Esta é uma notificação de teste do sistema de notificações real-time.',
      NotificationPriority.LOW,
      { test: true },
    );

    return this.commandBus.execute(command);
  }
}
