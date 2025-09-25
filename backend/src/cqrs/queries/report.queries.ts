import { IQuery } from './query.interface';

export class GetReportByIdQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly type: string = 'GetReportByIdQuery',
    public readonly payload: {
      reportId: string;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class GetUserReportsQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly type: string = 'GetUserReportsQuery',
    public readonly payload: {
      userId: string;
      limit?: number;
      offset?: number;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}
