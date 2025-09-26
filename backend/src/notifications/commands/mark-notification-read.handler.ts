import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkNotificationReadCommand } from './mark-notification-read.command';
import { NotificationRepository } from '../notification.repository';

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler
  implements ICommandHandler<MarkNotificationReadCommand>
{
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(command: MarkNotificationReadCommand) {
    const { notificationId, userId } = command;
    return this.notificationRepository.markAsRead(notificationId, userId);
  }
}
