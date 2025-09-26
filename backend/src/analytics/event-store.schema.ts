import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventStoreDocument = EventStore & Document;

export enum EventType {
  USER_REGISTERED = 'user_registered',
  USER_LOGGED_IN = 'user_logged_in',
  USER_PROFILE_UPDATED = 'user_profile_updated',
  USER_COINS_SPENT = 'user_coins_spent',
  USER_COINS_EARNED = 'user_coins_earned',
  REPORT_GENERATED = 'report_generated',
  REPORT_VIEWED = 'report_viewed',
  REPORT_SHARED = 'report_shared',
  NOTIFICATION_SENT = 'notification_sent',
}

@Schema({ timestamps: true, collection: 'event_store' })
export class EventStore {
  @Prop({ required: true, enum: EventType })
  eventType: EventType;

  @Prop({ required: true })
  aggregateId: string; // userId, reportId, etc.

  @Prop({ required: true })
  aggregateType: string; // 'user', 'report', 'notification', etc.

  @Prop({ required: true, type: Object })
  eventData: Record<string, any>;

  @Prop({ required: true })
  version: number; // Para event sourcing versioning

  @Prop({ type: Object })
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    correlationId?: string;
  };

  @Prop()
  timestamp: Date;
}

export const EventStoreSchema = SchemaFactory.createForClass(EventStore);

// Índices para performance de queries analíticas
EventStoreSchema.index({ eventType: 1, timestamp: -1 });
EventStoreSchema.index({ aggregateId: 1, aggregateType: 1, timestamp: -1 });
EventStoreSchema.index({ 'eventData.userId': 1, timestamp: -1 });
EventStoreSchema.index({ timestamp: -1 });
EventStoreSchema.index({ aggregateType: 1, eventType: 1, timestamp: -1 });
