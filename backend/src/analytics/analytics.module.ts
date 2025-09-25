import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { EventStoreService } from './event-store.service';
import { EventPublisherService } from './event-publisher.service';
import { EventStore, EventStoreSchema } from './event-store.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventStore.name, schema: EventStoreSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, EventStoreService, EventPublisherService],
  exports: [AnalyticsService, EventStoreService, EventPublisherService],
})
export class AnalyticsModule {}
