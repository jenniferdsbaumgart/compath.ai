import { NotificationType, NotificationPriority } from '../notification.schema';

export class SendNotificationCommand {
  constructor(
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly priority: NotificationPriority = NotificationPriority.MEDIUM,
    public readonly data?: any,
  ) {}
}
