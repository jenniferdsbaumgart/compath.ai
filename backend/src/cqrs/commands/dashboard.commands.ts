import { ICommand } from './command.interface';

export class UpdateDashboardReadModelCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'UpdateDashboardReadModelCommand',
    public readonly payload: {
      userId: string;
      updates: {
        coins?: number;
        searchCount?: number;
        invitedFriendsCount?: number;
        activeCourses?: Array<{
          id: string;
          title: string;
          description: string;
          coinCost: number;
          duration: string;
          category: string;
        }>;
      };
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class UpdateGlobalMetricsCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly type: string = 'UpdateGlobalMetricsCommand',
    public readonly payload: {
      totalUsers?: number;
      totalCourses?: number;
      totalSearches?: number;
    },
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}
