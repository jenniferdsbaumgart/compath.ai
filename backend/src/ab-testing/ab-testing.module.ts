import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ABTestingController } from './ab-testing.controller';
import { ABTestingService } from './ab-testing.service';
import { ABTest, ABTestSchema } from './ab-test.schema';
import {
  ABTestParticipation,
  ABTestParticipationSchema,
} from './ab-test-participation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ABTest.name, schema: ABTestSchema },
      { name: ABTestParticipation.name, schema: ABTestParticipationSchema },
    ]),
  ],
  controllers: [ABTestingController],
  providers: [ABTestingService],
  exports: [ABTestingService],
})
export class ABTestingModule {}
