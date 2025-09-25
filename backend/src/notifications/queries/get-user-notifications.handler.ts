import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserNotificationsQuery } from './get-user-notifications.query';
import { NotificationRepository } from '../notification.repository';

@QueryHandler(GetUserNotificationsQuery)
export class GetUserNotificationsHandler
  implements IQueryHandler<GetUserNotificationsQuery>
{
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(query: GetUserNotificationsQuery) {
    const { userId, limit, offset, unreadOnly } = query;

    if (unreadOnly) {
      return this.notificationRepository.findUnreadByUserId(userId);
    }

    return this.notificationRepository.findByUserId(userId, limit, offset);
  }
}
