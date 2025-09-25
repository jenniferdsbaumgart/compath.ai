import { IQuery } from './query.interface';

export class GetUserByIdQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly type: string = 'GetUserByIdQuery',
    public readonly payload: {
      userId: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class GetUserCoinsQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly type: string = 'GetUserCoinsQuery',
    public readonly payload: {
      userId: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class GetUserProfileQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly type: string = 'GetUserProfileQuery',
    public readonly payload: {
      userId: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}
