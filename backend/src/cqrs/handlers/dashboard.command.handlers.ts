import { Injectable } from '@nestjs/common';
import { DashboardReadService } from '../../services/dashboard-read.service';
import {
  UpdateDashboardReadModelCommand,
  UpdateGlobalMetricsCommand,
} from '../commands/dashboard.commands';
import { ICommandHandler } from '../commands/command.interface';

@Injectable()
export class UpdateDashboardReadModelCommandHandler implements ICommandHandler<UpdateDashboardReadModelCommand> {
  constructor(private dashboardReadService: DashboardReadService) {}

  async execute(command: UpdateDashboardReadModelCommand): Promise<void> {
    const { payload } = command;
    const { userId, updates } = payload;

    if (updates.coins !== undefined) {
      await this.dashboardReadService.updateUserCoins(userId, updates.coins);
    }

    if (updates.searchCount !== undefined) {
      // This would be handled by incrementing, not setting absolute value
      await this.dashboardReadService.incrementUserSearchCount(userId);
    }

    if (updates.invitedFriendsCount !== undefined) {
      await this.dashboardReadService.updateUserInvitedFriendsCount(userId, updates.invitedFriendsCount);
    }

    // TODO: Handle activeCourses updates when enrollment system is implemented
  }
}

@Injectable()
export class UpdateGlobalMetricsCommandHandler implements ICommandHandler<UpdateGlobalMetricsCommand> {
  constructor(private dashboardReadService: DashboardReadService) {}

  async execute(command: UpdateGlobalMetricsCommand): Promise<void> {
    const { payload } = command;
    await this.dashboardReadService.updateGlobalMetrics(payload);
  }
}
