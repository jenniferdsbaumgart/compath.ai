import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus } from '../cqrs/commands/command.bus';
import { QueryBus } from '../cqrs/queries/query.bus';
import { JwtAuthGuard } from '../auth';
import { GetUser } from '../auth';
import { GetDashboardDataQuery } from '../cqrs/queries/dashboard.queries';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getDashboard(@Param('userId') userId: string) {
    const query = new GetDashboardDataQuery(
      `dashboard-${Date.now()}`,
      'GetDashboardDataQuery',
      { userId },
    );

    return this.queryBus.execute(query);
  }
}
