import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from './send-notification.command';
import { NotificationRepository } from '../notification.repository';
import { NotificationType, NotificationPriority } from '../notification.schema';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(command: SendNotificationCommand) {
    const { userId, type, title, message, priority, data } = command;

    return this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      priority,
      data,
      read: false,
    });
  }
}
