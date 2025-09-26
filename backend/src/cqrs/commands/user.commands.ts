import { ICommand } from './command.interface';

export class CreateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'CreateUserCommand',
    public readonly payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'UpdateUserCommand',
    public readonly payload: {
      userId: string;
      updates: Partial<{
        name: string;
        email: string;
        phone: string;
        location: string;
        company: string;
        website: string;
        bio: string;
      }>;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class SpendCoinsCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'SpendCoinsCommand',
    public readonly payload: {
      userId: string;
      amount: number;
      purpose: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class EarnCoinsCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'EarnCoinsCommand',
    public readonly payload: {
      userId: string;
      amount: number;
      source: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class UpdateAvatarCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'UpdateAvatarCommand',
    public readonly payload: {
      userId: string;
      avatarPath: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}
