import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '../cqrs/commands/command.bus';
import { QueryBus } from '../cqrs/queries/query.bus';
import { JwtAuthGuard } from '../auth';
import { GetUser } from '../auth';
import {
  GenerateAiReportCommand,
  SaveReportCommand,
} from '../cqrs/commands/report.commands';
import {
  GetReportByIdQuery,
  GetUserReportsQuery,
} from '../cqrs/queries/report.queries';

@Controller('ai')
export class AiReportController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-report')
  async generateReport(
    @GetUser() user: any,
    @Body() body: { userInput: string },
  ) {
    const command = new GenerateAiReportCommand(
      `generate-${Date.now()}`,
      'GenerateAiReportCommand',
      {
        userId: user.id,
        userInput: body.userInput,
      },
    );

    return this.commandBus.execute(command);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reports')
  async saveReport(
    @GetUser() user: any,
    @Body() body: { searchQuery: string; report: any },
  ) {
    const command = new SaveReportCommand(
      `save-${Date.now()}`,
      'SaveReportCommand',
      {
        userId: user.id,
        searchQuery: body.searchQuery,
        report: body.report,
      },
    );

    const result = await this.commandBus.execute(command);

    return {
      success: true,
      message: 'Relatório salvo com sucesso',
      reportId: result.reportId,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports/:id')
  async getReportById(@Param('id') reportId: string) {
    const query = new GetReportByIdQuery(
      `report-${Date.now()}`,
      'GetReportByIdQuery',
      { reportId },
    );

    return this.queryBus.execute(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports')
  async getUserReports(
    @GetUser() user: any,
    @Body() body?: { limit?: number; offset?: number },
  ) {
    const query = new GetUserReportsQuery(
      `reports-${Date.now()}`,
      'GetUserReportsQuery',
      {
        userId: user.id,
        limit: body?.limit ?? 10,
        offset: body?.offset ?? 0,
      },
    );

    return this.queryBus.execute(query);
  }
}
