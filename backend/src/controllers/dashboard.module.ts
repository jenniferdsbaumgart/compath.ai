import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { CqrsModule } from '../cqrs/cqrs.module';
import { ABTestingModule } from '../ab-testing/ab-testing.module';

@Module({
  imports: [CqrsModule, ABTestingModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
