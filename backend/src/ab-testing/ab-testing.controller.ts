import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { ABTestingService } from './ab-testing.service';
import { ABTest, ABTestStatus, ABTestType, ABTestGoal } from './ab-test.schema';

class CreateABTestDto {
  name: string;
  description: string;
  type: ABTestType;
  goal: ABTestGoal;
  variants: {
    [key: string]: {
      name: string;
      description: string;
      weight: number;
      config: Record<string, any>;
    };
  };
  targetAudience: {
    userSegments?: string[];
    countries?: string[];
    userTypes?: string[];
    excludeUserIds?: string[];
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    minSampleSize?: number;
    statisticalSignificance?: number;
  };
  metadata?: {
    tags?: string[];
    priority?: 'low' | 'medium' | 'high' | 'critical';
    businessValue?: number;
    estimatedImpact?: string;
  };
}

@Controller('ab-testing')
@UseGuards(JwtAuthGuard)
export class ABTestingController {
  constructor(private readonly abTestingService: ABTestingService) {}

  @Post('tests')
  async createTest(
    @Body() testData: CreateABTestDto,
    @GetUser() user: any,
  ) {
    const test = await this.abTestingService.createTest({
      ...testData,
      createdBy: user._id || user.id,
    });

    return {
      success: true,
      data: test,
    };
  }

  @Get('tests')
  async getTests(
    @Query('status') status?: ABTestStatus,
    @Query('type') type?: ABTestType,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    // TODO: Implement proper pagination and filtering
    // For now, return active tests
    const tests = await this.abTestingService['abTestModel']
      .find(status ? { status } : {})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    return {
      success: true,
      data: tests,
      pagination: {
        page,
        limit,
        total: await this.abTestingService['abTestModel'].countDocuments(
          status ? { status } : {},
        ),
      },
    };
  }

  @Get('tests/:id')
  async getTest(@Param('id') testId: string) {
    const test = await this.abTestingService['abTestModel'].findById(testId);

    if (!test) {
      return {
        success: false,
        error: 'Test not found',
      };
    }

    return {
      success: true,
      data: test,
    };
  }

  @Put('tests/:id/start')
  async startTest(@Param('id') testId: string, @GetUser() user: any) {
    const success = await this.abTestingService.startTest(testId, user._id || user.id);

    return {
      success,
      message: success ? 'Test started successfully' : 'Failed to start test',
    };
  }

  @Put('tests/:id/stop')
  async stopTest(@Param('id') testId: string, @GetUser() user: any) {
    const success = await this.abTestingService.stopTest(testId, user._id || user.id);

    return {
      success,
      message: success ? 'Test stopped successfully' : 'Failed to stop test',
    };
  }

  @Get('tests/:id/results')
  async getTestResults(@Param('id') testId: string) {
    const results = await this.abTestingService.calculateResults(testId);

    if (!results) {
      return {
        success: false,
        error: 'Test not found or no results available',
      };
    }

    return {
      success: true,
      data: results,
    };
  }

  @Get('user/tests')
  async getUserActiveTests(@GetUser() user: any) {
    const tests = await this.abTestingService.getActiveTestsForUser(
      user._id || user.id,
    );

    return {
      success: true,
      data: tests,
    };
  }

  @Post('events')
  async recordEvent(
    @Body() eventData: {
      testId: string;
      event: string;
      context?: Record<string, any>;
      metadata?: Record<string, any>;
    },
    @GetUser() user: any,
  ) {
    await this.abTestingService.recordEvent(
      eventData.testId,
      user._id || user.id,
      eventData.event as any,
      eventData.context,
      eventData.metadata,
    );

    return {
      success: true,
      message: 'Event recorded successfully',
    };
  }

  @Get('analytics/overview')
  async getAnalyticsOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // TODO: Implement comprehensive analytics overview
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get basic stats
    const totalTests = await this.abTestingService['abTestModel'].countDocuments();
    const activeTests = await this.abTestingService['abTestModel'].countDocuments({
      status: ABTestStatus.ACTIVE,
    });
    const completedTests = await this.abTestingService['abTestModel'].countDocuments({
      status: ABTestStatus.COMPLETED,
    });

    // Get recent test results
    const recentTests = await this.abTestingService['abTestModel']
      .find({
        status: ABTestStatus.COMPLETED,
        'schedule.endDate': { $gte: start, $lte: end },
      })
      .sort({ 'schedule.endDate': -1 })
      .limit(5)
      .exec();

    return {
      success: true,
      data: {
        summary: {
          totalTests,
          activeTests,
          completedTests,
          period: { startDate: start, endDate: end },
        },
        recentCompletedTests: recentTests,
      },
    };
  }

  @Delete('tests/:id')
  async deleteTest(@Param('id') testId: string, @GetUser() user: any) {
    // Only allow deletion of draft tests
    const result = await this.abTestingService['abTestModel'].deleteOne({
      _id: testId,
      status: ABTestStatus.DRAFT,
      createdBy: user._id || user.id,
    });

    return {
      success: result.deletedCount > 0,
      message: result.deletedCount > 0
        ? 'Test deleted successfully'
        : 'Test not found or cannot be deleted',
    };
  }
}
