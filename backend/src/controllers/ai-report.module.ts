import { Module } from '@nestjs/common';
import { AiReportController } from './ai-report.controller';
import { CqrsModule } from '../cqrs/cqrs.module';

@Module({
  imports: [CqrsModule],
  controllers: [AiReportController],
})
export class AiReportModule {}
