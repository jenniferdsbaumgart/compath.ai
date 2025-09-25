import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { EventStoreService } from './event-store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly eventStoreService: EventStoreService,
  ) {}

  @Get('summary')
  async getAnalyticsSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getAnalyticsSummary(start, end);
  }

  @Get('users')
  async getUserMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getUserMetrics(
      start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end || new Date(),
    );
  }

  @Get('reports')
  async getReportMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getReportMetrics(
      start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end || new Date(),
    );
  }

  @Get('revenue')
  async getRevenueMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getRevenueMetrics(
      start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end || new Date(),
    );
  }

  @Get('notifications')
  async getNotificationMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getNotificationMetrics(
      start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end || new Date(),
    );
  }

  @Get('realtime')
  async getRealTimeMetrics() {
    return this.analyticsService.getRealTimeMetrics();
  }

  @Get('events/:userId')
  async getUserEvents(
    @Param('userId') userId: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.eventStoreService.getEventsByUser(
      userId,
      parseInt(limit.toString()),
      parseInt(offset.toString()),
    );
  }

  @Get('events')
  async getEvents(
    @Query('type') type?: string,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    if (type) {
      return this.eventStoreService.getEventsByType(
        type as any,
        parseInt(limit.toString()),
        parseInt(offset.toString()),
      );
    }

    // Return recent events if no type specified
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.eventStoreService.getEventsInTimeRange(
      thirtyDaysAgo,
      new Date(),
    );
  }

  @Get('dashboard')
  async getDashboardAnalytics() {
    const [summary, realtime] = await Promise.all([
      this.analyticsService.getAnalyticsSummary(),
      this.analyticsService.getRealTimeMetrics(),
    ]);

    return {
      summary,
      realtime,
      charts: {
        userGrowth: await this.getUserGrowthChart(),
        revenueTrend: await this.getRevenueTrendChart(),
        reportGeneration: await this.getReportGenerationChart(),
      },
    };
  }

  private async getUserGrowthChart() {
    // Generate chart data for user growth over last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    const chartData = [];
    for (const day of days) {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const users = await this.analyticsService.getUserMetrics(day, nextDay);
      chartData.push({
        date: day.toISOString().split('T')[0],
        newUsers: users.newUsersToday,
        totalUsers: users.totalUsers,
      });
    }

    return chartData;
  }

  private async getRevenueTrendChart() {
    // Generate chart data for revenue trend over last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    const chartData = [];
    for (const day of days) {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const revenue = await this.analyticsService.getRevenueMetrics(day, nextDay);
      chartData.push({
        date: day.toISOString().split('T')[0],
        revenue: revenue.revenueToday,
      });
    }

    return chartData;
  }

  private async getReportGenerationChart() {
    // Generate chart data for report generation over last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    const chartData = [];
    for (const day of days) {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const reports = await this.analyticsService.getReportMetrics(day, nextDay);
      chartData.push({
        date: day.toISOString().split('T')[0],
        reports: reports.reportsToday,
      });
    }

    return chartData;
  }
}
