import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ _id: false })
export class KeyPlayer {
  @Prop({ required: true })
  name: string;

  @Prop()
  marketShare?: string;

  @Prop()
  url?: string;

  @Prop()
  address?: string;

  @Prop()
  visibilityIndex?: number;
}

@Schema({ _id: false })
export class SourceRef {
  @Prop({ required: true })
  name: string;

  @Prop()
  url?: string;

  @Prop()
  provider?: string;
}

@Schema({ _id: false })
export class ReportContent {
  @Prop()
  title?: string;

  @Prop({ required: true })
  marketSize: string;

  @Prop({ required: true })
  growthRate: string;

  @Prop({ required: true })
  competitionLevel: string;

  @Prop({ required: true })
  entryBarriers: string;

  @Prop({ required: true })
  targetAudience: string;

  @Prop({ type: [KeyPlayer], required: true, default: [] })
  keyPlayers: KeyPlayer[];

  @Prop({ type: [String], required: true, default: [] })
  opportunities: string[];

  @Prop({ type: [String], required: true, default: [] })
  challenges: string[];

  @Prop({ type: [String], required: true, default: [] })
  recommendations: string[];

  @Prop({ type: [String], required: true, default: [] })
  strengths: string[];

  @Prop({ type: [String], required: true, default: [] })
  weaknesses: string[];

  @Prop({ type: [SourceRef], default: [] })
  sources?: SourceRef[];

  @Prop({ enum: ['verified', 'no_evidence'], default: 'no_evidence' })
  dataQuality?: 'verified' | 'no_evidence' | 'demo';
}

@Schema({
  timestamps: true,
})
export class Report {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  searchQuery: string;

  @Prop({ type: ReportContent, required: true })
  report: ReportContent;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
export const KeyPlayerSchema = SchemaFactory.createForClass(KeyPlayer);
export const SourceRefSchema = SchemaFactory.createForClass(SourceRef);
export const ReportContentSchema = SchemaFactory.createForClass(ReportContent);
