import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus } from '../cqrs/commands/command.bus';
import { QueryBus } from '../cqrs/queries/query.bus';
import { JwtAuthGuard } from '../auth';
import { GetUser } from '../auth';
import { ABTestingGuard } from '../ab-testing/ab-testing.guard';
import { ABTest, RecordABEvent } from '../ab-testing/ab-testing.decorator';
import { GetDashboardDataQuery } from '../cqrs/queries/dashboard.queries';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtAuthGuard, ABTestingGuard)
  @ABTest('507f1f77bcf86cd799439011', 'dashboard_layout') // Example test ID
  @RecordABEvent('interacted', { action: 'view_dashboard' })
  @Get(':userId')
  async getDashboard(@Param('userId') userId: string, @GetUser() user: any) {
    const query = new GetDashboardDataQuery(
      `dashboard-${Date.now()}`,
      'GetDashboardDataQuery',
      { userId },
    );

    const result = await this.queryBus.execute(query);

    // Check if user is in A/B test and modify response accordingly
    if (user && user.abTests && user.abTests['dashboard_layout']) {
      const abTestData = user.abTests['dashboard_layout'];

      // Apply variant-specific modifications
      if (abTestData.variantId === 'variant_a') {
        // Variant A: Show additional metrics
        result.variant = 'A';
        result.showExtraMetrics = true;
      } else if (abTestData.variantId === 'variant_b') {
        // Variant B: Different layout
        result.variant = 'B';
        result.compactLayout = true;
      } else {
        // Control: Default behavior
        result.variant = 'control';
      }

      result.abTestInfo = {
        testId: abTestData.testId,
        variantId: abTestData.variantId,
        isControl: abTestData.isControl,
      };
    }

    return result;
  }
}
