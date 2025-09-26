import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  REPORT_GENERATED = 'report_generated',
  COINS_EARNED = 'coins_earned',
  COINS_SPENT = 'coins_spent',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  NEW_FEATURE = 'new_feature',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  data?: Record<string, any>;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: NotificationPriority.MEDIUM, enum: NotificationPriority })
  priority: NotificationPriority;

  @Prop()
  expiresAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índices para performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
