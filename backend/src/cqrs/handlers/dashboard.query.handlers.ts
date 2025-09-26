import { Injectable } from '@nestjs/common';
import { DashboardReadService } from '../../services/dashboard-read.service';
import {
  GetDashboardDataQuery,
  GetGlobalMetricsQuery,
} from '../queries/dashboard.queries';
import { IQueryHandler } from '../queries/query.interface';

@Injectable()
export class GetDashboardDataQueryHandler implements IQueryHandler<GetDashboardDataQuery> {
  constructor(private dashboardReadService: DashboardReadService) {}

  async execute(query: GetDashboardDataQuery): Promise<any> {
    const { payload } = query;
    const { userId } = payload;

    const dashboard = await this.dashboardReadService.getOrCreateDashboardReadModel(userId);

    return {
      coins: dashboard.coins,
      searchCount: dashboard.searchCount,
      activeCourses: dashboard.activeCourses,
      totalUsers: dashboard.totalUsers,
      totalCourses: dashboard.totalCourses,
      totalSearches: dashboard.totalSearches,
      userActivity: {
        invitedFriends: dashboard.invitedFriendsCount,
      },
    };
  }
}

@Injectable()
export class GetGlobalMetricsQueryHandler implements IQueryHandler<GetGlobalMetricsQuery> {
  constructor(private dashboardReadService: DashboardReadService) {}

  async execute(query: GetGlobalMetricsQuery): Promise<any> {
    return this.dashboardReadService.getGlobalMetrics();
  }
}
