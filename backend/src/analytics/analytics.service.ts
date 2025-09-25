import { Injectable } from '@nestjs/common';
import { EventStoreService } from './event-store.service';
import { EventType } from './event-store.schema';

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userRetentionRate: number;
  averageSessionDuration: number;
}

export interface ReportMetrics {
  totalReports: number;
  reportsToday: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  averageReportsPerUser: number;
  topSearchQueries: Array<{ query: string; count: number }>;
  reportCompletionRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  averageRevenuePerUser: number;
  topRevenueSources: Array<{ source: string; amount: number }>;
}

export interface NotificationMetrics {
  totalNotifications: number;
  notificationsToday: number;
  deliveryRate: number;
  openRate: number;
  notificationsByType: Array<{ type: string; count: number }>;
}

export interface AnalyticsSummary {
  userMetrics: UserMetrics;
  reportMetrics: ReportMetrics;
  revenueMetrics: RevenueMetrics;
  notificationMetrics: NotificationMetrics;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly eventStore: EventStoreService) {}

  async getAnalyticsSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AnalyticsSummary> {
    const now = new Date();
    const periodStart =
      startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const periodEnd = endDate || now;

    const [userMetrics, reportMetrics, revenueMetrics, notificationMetrics] =
      await Promise.all([
        this.getUserMetrics(periodStart, periodEnd),
        this.getReportMetrics(periodStart, periodEnd),
        this.getRevenueMetrics(periodStart, periodEnd),
        this.getNotificationMetrics(periodStart, periodEnd),
      ]);

    return {
      userMetrics,
      reportMetrics,
      revenueMetrics,
      notificationMetrics,
      period: {
        startDate: periodStart,
        endDate: periodEnd,
      },
    };
  }

  async getUserMetrics(startDate: Date, endDate: Date): Promise<UserMetrics> {
    const events = await this.eventStore.getEventsInTimeRange(
      startDate,
      endDate,
      [EventType.USER_REGISTERED, EventType.USER_LOGGED_IN],
    );

    const userRegistrations = events.filter(
      (e) => e.eventType === EventType.USER_REGISTERED,
    );
    const userLogins = events.filter(
      (e) => e.eventType === EventType.USER_LOGGED_IN,
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      totalUsers: userRegistrations.length,
      activeUsers: new Set(userLogins.map((e) => e.eventData.userId)).size,
      newUsersToday: userRegistrations.filter((e) => e.timestamp >= today)
        .length,
      newUsersThisWeek: userRegistrations.filter((e) => e.timestamp >= weekAgo)
        .length,
      newUsersThisMonth: userRegistrations.filter(
        (e) => e.timestamp >= monthAgo,
      ).length,
      userRetentionRate: this.calculateRetentionRate(userLogins),
      averageSessionDuration: this.calculateAverageSessionDuration(userLogins),
    };
  }

  async getReportMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<ReportMetrics> {
    const events = await this.eventStore.getEventsInTimeRange(
      startDate,
      endDate,
      [EventType.REPORT_GENERATED, EventType.REPORT_VIEWED],
    );

    const reportGenerations = events.filter(
      (e) => e.eventType === EventType.REPORT_GENERATED,
    );
    const reportViews = events.filter(
      (e) => e.eventType === EventType.REPORT_VIEWED,
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const uniqueUsers = new Set(
      reportGenerations.map((e) => e.eventData.userId),
    );

    return {
      totalReports: reportGenerations.length,
      reportsToday: reportGenerations.filter((e) => e.timestamp >= today)
        .length,
      reportsThisWeek: reportGenerations.filter((e) => e.timestamp >= weekAgo)
        .length,
      reportsThisMonth: reportGenerations.filter((e) => e.timestamp >= monthAgo)
        .length,
      averageReportsPerUser:
        uniqueUsers.size > 0 ? reportGenerations.length / uniqueUsers.size : 0,
      topSearchQueries: this.getTopSearchQueries(reportGenerations),
      reportCompletionRate: this.calculateReportCompletionRate(
        reportGenerations,
        reportViews,
      ),
    };
  }

  async getRevenueMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueMetrics> {
    const events = await this.eventStore.getEventsInTimeRange(
      startDate,
      endDate,
      [EventType.USER_COINS_SPENT, EventType.USER_COINS_EARNED],
    );

    const coinSpends = events.filter(
      (e) => e.eventType === EventType.USER_COINS_SPENT,
    );
    const coinEarnings = events.filter(
      (e) => e.eventType === EventType.USER_COINS_EARNED,
    );

    // Assuming 1 coin = $0.10 for revenue calculation
    const coinValue = 0.1;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalSpent = coinSpends.reduce(
      (sum, e) => sum + e.eventData.amount,
      0,
    );
    const totalEarned = coinEarnings.reduce(
      (sum, e) => sum + e.eventData.amount,
      0,
    );

    const uniqueUsers = new Set(
      [...coinSpends, ...coinEarnings].map((e) => e.eventData.userId),
    );

    return {
      totalRevenue: totalSpent * coinValue,
      revenueToday:
        coinSpends
          .filter((e) => e.timestamp >= today)
          .reduce((sum, e) => sum + e.eventData.amount, 0) * coinValue,
      revenueThisWeek:
        coinSpends
          .filter((e) => e.timestamp >= weekAgo)
          .reduce((sum, e) => sum + e.eventData.amount, 0) * coinValue,
      revenueThisMonth:
        coinSpends
          .filter((e) => e.timestamp >= monthAgo)
          .reduce((sum, e) => sum + e.eventData.amount, 0) * coinValue,
      averageRevenuePerUser:
        uniqueUsers.size > 0 ? (totalSpent * coinValue) / uniqueUsers.size : 0,
      topRevenueSources: this.getTopRevenueSources(coinSpends),
    };
  }

  async getNotificationMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<NotificationMetrics> {
    const events = await this.eventStore.getEventsInTimeRange(
      startDate,
      endDate,
      [EventType.NOTIFICATION_SENT],
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const notificationsByType = events.reduce(
      (acc, event) => {
        const type = event.eventData.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalNotifications: events.length,
      notificationsToday: events.filter((e) => e.timestamp >= today).length,
      deliveryRate: 0.95, // Mock - would need delivery tracking
      openRate: 0.6, // Mock - would need open tracking
      notificationsByType: Object.entries(notificationsByType).map(
        ([type, count]) => ({
          type,
          count,
        }),
      ),
    };
  }

  private calculateRetentionRate(userLogins: any[]): number {
    // Simplified retention calculation
    const uniqueUsers = new Set(userLogins.map((e) => e.eventData.userId));
    const totalLogins = userLogins.length;
    return uniqueUsers.size > 0 ? totalLogins / uniqueUsers.size : 0;
  }

  private calculateAverageSessionDuration(userLogins: any[]): number {
    // Mock calculation - would need session start/end tracking
    return 15 * 60; // 15 minutes in seconds
  }

  private getTopSearchQueries(
    reportGenerations: any[],
  ): Array<{ query: string; count: number }> {
    const queryCount = reportGenerations.reduce(
      (acc, event) => {
        const query = event.eventData.searchQuery || 'unknown';
        acc[query] = (acc[query] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(queryCount)
      .map(([query, count]) => ({ query, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateReportCompletionRate(
    generations: any[],
    views: any[],
  ): number {
    if (generations.length === 0) return 0;
    const viewedReportIds = new Set(views.map((v) => v.eventData.reportId));
    const completedCount = generations.filter((g) =>
      viewedReportIds.has(g.eventData.reportId),
    ).length;
    return completedCount / generations.length;
  }

  private getTopRevenueSources(
    coinSpends: any[],
  ): Array<{ source: string; amount: number }> {
    const sourceRevenue = coinSpends.reduce(
      (acc, event) => {
        const source = event.eventData.purpose || 'unknown';
        acc[source] = (acc[source] || 0) + event.eventData.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(sourceRevenue)
      .map(([source, amount]) => ({ source, amount: amount as number }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    reportsGeneratedLastHour: number;
    revenueLastHour: number;
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [userEvents, reportEvents, revenueEvents] = await Promise.all([
      this.eventStore.getEventsInTimeRange(oneHourAgo, new Date(), [
        EventType.USER_LOGGED_IN,
      ]),
      this.eventStore.getEventsInTimeRange(oneHourAgo, new Date(), [
        EventType.REPORT_GENERATED,
      ]),
      this.eventStore.getEventsInTimeRange(oneHourAgo, new Date(), [
        EventType.USER_COINS_SPENT,
      ]),
    ]);

    return {
      activeUsers: new Set(userEvents.map((e) => e.eventData.userId)).size,
      reportsGeneratedLastHour: reportEvents.length,
      revenueLastHour:
        revenueEvents.reduce((sum, e) => sum + e.eventData.amount, 0) * 0.1,
    };
  }
}
