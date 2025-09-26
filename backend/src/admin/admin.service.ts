import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.schema';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private analyticsService: AnalyticsService,
  ) {}

  async getAdminStats() {
    try {
      // Get real-time metrics
      const realtimeMetrics = await this.analyticsService.getRealTimeMetrics();

      // Get user statistics
      const totalUsers = await this.userModel.countDocuments();
      const activeUsers = await this.userModel.countDocuments({
        lastLogin: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      });

      // Get admin users count
      const adminUsers = await this.userModel.countDocuments({
        role: 'admin',
      });

      // Get recent reports count (mock for now)
      const totalReports = 5432; // TODO: Get from analytics

      // System health check
      const systemHealth = await this.getSystemHealth();

      return {
        totalUsers,
        activeUsers,
        adminUsers,
        totalReports,
        systemHealth: systemHealth.status,
        lastBackup: new Date().toISOString(), // TODO: Implement backup tracking
        realtimeMetrics,
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Return fallback data
      return {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        totalReports: 0,
        systemHealth: 'unknown',
        lastBackup: new Date().toISOString(),
        realtimeMetrics: {
          activeUsers: 0,
          reportsGeneratedLastHour: 0,
          revenueLastHour: 0,
        },
      };
    }
  }

  async getSystemHealth() {
    try {
      // Basic health checks
      const dbHealth = await this.checkDatabaseHealth();
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      const isHealthy = dbHealth;

      return {
        status: isHealthy ? 'healthy' : 'error',
        uptime,
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        },
        database: dbHealth ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        status: 'error',
        uptime: process.uptime(),
        memoryUsage: null,
        database: 'unknown',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getUsersSummary() {
    try {
      const totalUsers = await this.userModel.countDocuments();

      const usersByRole = await this.userModel.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]);

      const usersByStatus = await this.userModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const recentUsers = await this.userModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt role status');

      return {
        totalUsers,
        usersByRole,
        usersByStatus,
        recentUsers,
      };
    } catch (error) {
      console.error('Error fetching users summary:', error);
      return {
        totalUsers: 0,
        usersByRole: [],
        usersByStatus: [],
        recentUsers: [],
      };
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Simple database health check
      await this.userModel.findOne().limit(1);
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}
