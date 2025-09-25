export class GetUserNotificationsQuery {
  constructor(
    public readonly userId: string,
    public readonly limit: number = 50,
    public readonly offset: number = 0,
    public readonly unreadOnly: boolean = false,
  ) {}
}
