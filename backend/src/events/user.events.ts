export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserProfileUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly changes: Record<string, any>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserCoinsSpentEvent {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly purpose: string,
    public readonly remainingCoins: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class UserCoinsEarnedEvent {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly source: string,
    public readonly totalCoins: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
