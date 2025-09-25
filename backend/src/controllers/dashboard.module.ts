import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { CqrsModule } from '../cqrs/cqrs.module';

@Module({
  imports: [CqrsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
