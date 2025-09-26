import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ABTestParticipationDocument = ABTestParticipation & Document;

export enum ParticipationEvent {
  ASSIGNED = 'assigned',
  EXPOSED = 'exposed',
  CONVERTED = 'converted',
  INTERACTED = 'interacted',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true, collection: 'ab_test_participations' })
export class ABTestParticipation {
  @Prop({ required: true })
  testId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  variantId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  event: ParticipationEvent;

  @Prop({ type: Object })
  context?: {
    page?: string;
    component?: string;
    action?: string;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };

  @Prop({ type: Object })
  metadata?: {
    goalValue?: number;
    customMetrics?: Record<string, any>;
    tags?: string[];
  };

  @Prop()
  timestamp: Date;
}

export const ABTestParticipationSchema = SchemaFactory.createForClass(ABTestParticipation);

// Índices para performance
ABTestParticipationSchema.index({ testId: 1, userId: 1 });
ABTestParticipationSchema.index({ testId: 1, variantId: 1, event: 1 });
ABTestParticipationSchema.index({ userId: 1, timestamp: -1 });
ABTestParticipationSchema.index({ testId: 1, timestamp: -1 });
ABTestParticipationSchema.index({ event: 1, timestamp: -1 });
