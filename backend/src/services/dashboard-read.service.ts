import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DashboardReadModel, DashboardReadModelDocument } from '../models/dashboard-read.model';
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
        throw new Error(`Failed to create dashboard read model for user ${userId}`);
      }
    }

    return dashboard;
  }

  private async createDashboardReadModel(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const searchCount = await this.reportModel.countDocuments({ userId });

    const dashboard = new this.dashboardModel({
      userId,
      coins: user.coins || 0,
      searchCount,
      invitedFriendsCount: user.invitedFriends?.length || 0,
      activeCourses: [], // TODO: Implement when Course/Enrollment models are available
      lastUpdated: new Date(),
      totalUsers: await this.userModel.countDocuments(),
      totalCourses: 0, // TODO: Implement when Course model is available
      totalSearches: await this.reportModel.countDocuments(),
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

  async updateUserInvitedFriendsCount(userId: string, count: number): Promise<void> {
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
    // Get the most recent global metrics from any dashboard read model
    const latest = await this.dashboardModel
      .findOne()
      .sort({ lastUpdated: -1 })
      .select('totalUsers totalCourses totalSearches');

    if (!latest) {
      // Fallback to real-time calculation
      return {
        totalUsers: await this.userModel.countDocuments(),
        totalCourses: 0, // TODO: Implement when Course model is available
        totalSearches: await this.reportModel.countDocuments(),
      };
    }

    return {
      totalUsers: latest.totalUsers || 0,
      totalCourses: latest.totalCourses || 0,
      totalSearches: latest.totalSearches || 0,
    };
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
        this.logger.error(`Failed to rebuild read model for user ${user._id}`, error);
      }
    }

    this.logger.log('Dashboard read models rebuild completed');
  }
}
