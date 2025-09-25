import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DashboardReadModelDocument = DashboardReadModel & Document;

@Schema({ collection: 'dashboard_read_models' })
export class DashboardReadModel {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ default: 0 })
  coins: number;

  @Prop({ default: 0 })
  searchCount: number;

  @Prop({ default: 0 })
  invitedFriendsCount: number;

  @Prop({
    type: [{
      id: String,
      title: String,
      description: String,
      coinCost: Number,
      duration: String,
      category: String,
    }],
    default: [],
  })
  activeCourses: Array<{
    id: string;
    title: string;
    description: string;
    coinCost: number;
    duration: string;
    category: string;
  }>;

  @Prop()
  lastUpdated: Date;

  // Global metrics (podem ser cacheados separadamente)
  @Prop({ default: 0 })
  totalUsers: number;

  @Prop({ default: 0 })
  totalCourses: number;

  @Prop({ default: 0 })
  totalSearches: number;
}

export const DashboardReadModelSchema = SchemaFactory.createForClass(DashboardReadModel);

// Índices para performance
DashboardReadModelSchema.index({ userId: 1 });
DashboardReadModelSchema.index({ lastUpdated: 1 });
