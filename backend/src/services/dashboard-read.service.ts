import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DashboardReadModel,
  DashboardReadModelDocument,
} from '../models/dashboard-read.model';
import { User, UserDocument } from '../models/user.schema';
import { Report, ReportDocument } from '../models/report.schema';

@Injectable()
export class DashboardReadService {
  private readonly logger = new Logger(DashboardReadService.name);

  constructor(
    @InjectModel(DashboardReadModel.name)
    private dashboardModel: Model<DashboardReadModelDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Report.name)
    private reportModel: Model<ReportDocument>,
  ) {}

  async getOrCreateDashboardReadModel(userId: string): Promise<any> {
    let dashboard = await this.dashboardModel.findOne({ userId });

    if (!dashboard) {
      dashboard = await this.createDashboardReadModel(userId);
      if (!dashboard) {
        throw new Error(
          `Failed to create dashboard read model for user ${userId}`,
        );
      }
    }

    return dashboard;
  }

  private async createDashboardReadModel(userId: string): Promise<any> {
    // Otimizado: Buscar dados do usuário e estatísticas em uma única aggregation
    const [userResult, statsResult] = await Promise.all([
      // Query otimizada para dados do usuário
      this.userModel.findById(userId).select('coins invitedFriends').lean(),

      // Aggregation pipeline para estatísticas do usuário
      this.reportModel.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            searchCount: { $sum: 1 },
            lastReportDate: { $max: '$createdAt' },
          },
        },
      ]),
    ]);

    if (!userResult) {
      throw new Error(`User ${userId} not found`);
    }

    const userStats = statsResult[0] || { searchCount: 0 };

    // Buscar métricas globais (cacheadas)
    const globalMetrics = await this.getGlobalMetrics();

    const dashboard = new this.dashboardModel({
      userId,
      coins: userResult.coins || 0,
      searchCount: userStats.searchCount,
      invitedFriendsCount: userResult.invitedFriends?.length || 0,
      activeCourses: [], // TODO: Implement when Course/Enrollment models are available
      lastUpdated: new Date(),
      totalUsers: globalMetrics.totalUsers,
      totalCourses: globalMetrics.totalCourses,
      totalSearches: globalMetrics.totalSearches,
    });

    return dashboard.save();
  }

  async updateUserCoins(userId: string, coins: number): Promise<void> {
    await this.dashboardModel.findOneAndUpdate(
      { userId },
      {
        coins,
        lastUpdated: new Date(),
      },
      { upsert: true },
    );
  }

  async incrementUserSearchCount(userId: string): Promise<void> {
    await this.dashboardModel.findOneAndUpdate(
      { userId },
      {
        $inc: { searchCount: 1 },
        lastUpdated: new Date(),
      },
      { upsert: true },
    );
  }

  async updateUserInvitedFriendsCount(
    userId: string,
    count: number,
  ): Promise<void> {
    await this.dashboardModel.findOneAndUpdate(
      { userId },
      {
        invitedFriendsCount: count,
        lastUpdated: new Date(),
      },
      { upsert: true },
    );
  }

  async updateGlobalMetrics(updates: {
    totalUsers?: number;
    totalCourses?: number;
    totalSearches?: number;
  }): Promise<void> {
    // Update all dashboard read models with new global metrics
    await this.dashboardModel.updateMany(
      {},
      {
        ...updates,
        lastUpdated: new Date(),
      },
    );
  }

  async getGlobalMetrics(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalSearches: number;
  }> {
    // Otimizado: Tentar cache primeiro, depois calcular em tempo real
    const cachedMetrics = await this.dashboardModel
      .findOne()
      .sort({ lastUpdated: -1 })
      .select('totalUsers totalCourses totalSearches totalSearches')
      .lean();

    if (cachedMetrics && cachedMetrics.lastUpdated) {
      // Verificar se o cache não está muito antigo (5 minutos)
      const cacheAge = Date.now() - cachedMetrics.lastUpdated.getTime();
      if (cacheAge < 5 * 60 * 1000) {
        return {
          totalUsers: cachedMetrics.totalUsers || 0,
          totalCourses: cachedMetrics.totalCourses || 0,
          totalSearches: cachedMetrics.totalSearches || 0,
        };
      }
    }

    // Fallback: Calcular métricas globais com queries otimizadas
    const [userCount, reportCount] = await Promise.all([
      this.userModel.countDocuments(),
      this.reportModel.countDocuments(),
    ]);

    const metrics = {
      totalUsers: userCount,
      totalCourses: 0, // TODO: Implement when Course model is available
      totalSearches: reportCount,
    };

    // Atualizar cache global
    await this.updateGlobalMetrics(metrics);

    return metrics;
  }

  async rebuildReadModel(userId: string): Promise<void> {
    this.logger.log(`Rebuilding dashboard read model for user ${userId}`);
    await this.createDashboardReadModel(userId);
  }

  async rebuildAllReadModels(): Promise<void> {
    this.logger.log('Rebuilding all dashboard read models');

    const users = await this.userModel.find().select('_id');
    const globalMetrics = await this.getGlobalMetrics();

    for (const user of users) {
      try {
        await this.createDashboardReadModel((user._id as any).toString());
      } catch (error) {
        this.logger.error(
          `Failed to rebuild read model for user ${user._id}`,
          error,
        );
      }
    }

    this.logger.log('Dashboard read models rebuild completed');
  }
}
