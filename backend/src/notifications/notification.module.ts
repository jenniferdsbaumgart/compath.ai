import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { Notification, NotificationSchema } from './notification.schema';
import { SendNotificationHandler } from './commands/send-notification.handler';
import { GetUserNotificationsHandler } from './queries/get-user-notifications.handler';
import { MarkNotificationReadHandler } from './commands/mark-notification-read.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema }
    ])
  ],
  providers: [
    NotificationGateway,
    NotificationService,
    NotificationRepository,
    SendNotificationHandler,
    GetUserNotificationsHandler,
    MarkNotificationReadHandler,
  ],
  exports: [NotificationService, NotificationRepository],
})
export class NotificationModule {}
