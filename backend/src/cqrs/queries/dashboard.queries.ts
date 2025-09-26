import { IQuery } from './query.interface';

export class GetDashboardDataQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly type: string = 'GetDashboardDataQuery',
    public readonly payload: {
      userId: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class GetGlobalMetricsQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly type: string = 'GetGlobalMetricsQuery',
    public readonly payload: {},
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}
