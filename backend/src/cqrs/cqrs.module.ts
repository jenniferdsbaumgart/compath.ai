import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  Report,
  ReportSchema,
  DashboardReadModel,
  DashboardReadModelSchema
} from '../models';

// Services
import { AiReportService } from '../services/ai-report.service';
import { UserService } from '../services/user.service';
import { DashboardReadService } from '../services/dashboard-read.service';

// Command handlers
import {
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  SpendCoinsCommandHandler,
  EarnCoinsCommandHandler,
  UpdateAvatarCommandHandler,
} from './handlers/user.command.handlers';

import {
  GenerateAiReportCommandHandler,
  SaveReportCommandHandler,
} from './handlers/report.command.handlers';

import {
  UpdateDashboardReadModelCommandHandler,
  UpdateGlobalMetricsCommandHandler,
} from './handlers/dashboard.command.handlers';

// Query handlers
import {
  GetUserByIdQueryHandler,
  GetUserCoinsQueryHandler,
  GetUserProfileQueryHandler,
} from './handlers/user.query.handlers';

import {
  GetReportByIdQueryHandler,
  GetUserReportsQueryHandler,
} from './handlers/report.query.handlers';

import {
  GetDashboardDataQueryHandler,
  GetGlobalMetricsQueryHandler,
} from './handlers/dashboard.query.handlers';

// Buses
import { CommandBus } from './commands/command.bus';
import { QueryBus } from './queries/query.bus';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
  ],
  providers: [
    // Services
    AiReportService,
    UserService,
    DashboardReadService,

    // Command handlers
    CreateUserCommandHandler,
    UpdateUserCommandHandler,
    SpendCoinsCommandHandler,
    EarnCoinsCommandHandler,
    UpdateAvatarCommandHandler,
    GenerateAiReportCommandHandler,
    SaveReportCommandHandler,
    UpdateDashboardReadModelCommandHandler,
    UpdateGlobalMetricsCommandHandler,

    // Query handlers
    GetUserByIdQueryHandler,
    GetUserCoinsQueryHandler,
    GetUserProfileQueryHandler,
    GetReportByIdQueryHandler,
    GetUserReportsQueryHandler,
    GetDashboardDataQueryHandler,
    GetGlobalMetricsQueryHandler,

    // Buses
    CommandBus,
    QueryBus,
  ],
  exports: [CommandBus, QueryBus],
})
export class CqrsModule implements OnModuleInit {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,

    // Command handlers
    private createUserHandler: CreateUserCommandHandler,
    private updateUserHandler: UpdateUserCommandHandler,
    private spendCoinsHandler: SpendCoinsCommandHandler,
    private earnCoinsHandler: EarnCoinsCommandHandler,
    private updateAvatarHandler: UpdateAvatarCommandHandler,
    private generateAiReportHandler: GenerateAiReportCommandHandler,
    private saveReportHandler: SaveReportCommandHandler,
    private updateDashboardHandler: UpdateDashboardReadModelCommandHandler,
    private updateGlobalMetricsHandler: UpdateGlobalMetricsCommandHandler,

    // Query handlers
    private getUserByIdHandler: GetUserByIdQueryHandler,
    private getUserCoinsHandler: GetUserCoinsQueryHandler,
    private getUserProfileHandler: GetUserProfileQueryHandler,
    private getReportByIdHandler: GetReportByIdQueryHandler,
    private getUserReportsHandler: GetUserReportsQueryHandler,
    private getDashboardDataHandler: GetDashboardDataQueryHandler,
    private getGlobalMetricsHandler: GetGlobalMetricsQueryHandler,
  ) {}

  onModuleInit() {
    // Register command handlers
    this.commandBus.registerHandler(
      'CreateUserCommand',
      CreateUserCommandHandler,
    );
    this.commandBus.registerHandler(
      'UpdateUserCommand',
      UpdateUserCommandHandler,
    );
    this.commandBus.registerHandler(
      'SpendCoinsCommand',
      SpendCoinsCommandHandler,
    );
    this.commandBus.registerHandler(
      'EarnCoinsCommand',
      EarnCoinsCommandHandler,
    );
    this.commandBus.registerHandler(
      'UpdateAvatarCommand',
      UpdateAvatarCommandHandler,
    );
    this.commandBus.registerHandler(
      'GenerateAiReportCommand',
      GenerateAiReportCommandHandler,
    );
    this.commandBus.registerHandler(
      'SaveReportCommand',
      SaveReportCommandHandler,
    );
    this.commandBus.registerHandler(
      'UpdateDashboardReadModelCommand',
      UpdateDashboardReadModelCommandHandler,
    );
    this.commandBus.registerHandler(
      'UpdateGlobalMetricsCommand',
      UpdateGlobalMetricsCommandHandler,
    );

    // Register query handlers
    this.queryBus.registerHandler('GetUserByIdQuery', GetUserByIdQueryHandler);
    this.queryBus.registerHandler(
      'GetUserCoinsQuery',
      GetUserCoinsQueryHandler,
    );
    this.queryBus.registerHandler(
      'GetUserProfileQuery',
      GetUserProfileQueryHandler,
    );
    this.queryBus.registerHandler(
      'GetReportByIdQuery',
      GetReportByIdQueryHandler,
    );
    this.queryBus.registerHandler(
      'GetUserReportsQuery',
      GetUserReportsQueryHandler,
    );
    this.queryBus.registerHandler(
      'GetDashboardDataQuery',
      GetDashboardDataQueryHandler,
    );
    this.queryBus.registerHandler(
      'GetGlobalMetricsQuery',
      GetGlobalMetricsQueryHandler,
    );
  }
}
