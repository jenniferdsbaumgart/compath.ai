import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyPlayer {
  name: string;
  marketShare: string;
}

export interface IReportContent {
  marketSize: string;
  growthRate: string;
  competitionLevel: string;
  entryBarriers: string;
  targetAudience: string;
  keyPlayers: IKeyPlayer[];
  opportunities: string[];
  challenges: string[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface IReport extends Document {
  userId: string;
  searchQuery: string;
  report: IReportContent;
  createdAt: Date;
}

const KeyPlayerSchema = new Schema<IKeyPlayer>({
  name: { type: String, required: true },
  marketShare: { type: String, required: true },
}, { _id: false });

const ReportContentSchema = new Schema<IReportContent>({
  marketSize: { type: String, required: true },
  growthRate: { type: String, required: true },
  competitionLevel: { type: String, required: true },
  entryBarriers: { type: String, required: true },
  targetAudience: { type: String, required: true },
  keyPlayers: { type: [KeyPlayerSchema], required: true },
  opportunities: { type: [String], required: true },
  challenges: { type: [String], required: true },
  recommendations: { type: [String], required: true },
  strengths: { type: [String], required: true },
  weaknesses: { type: [String], required: true },
}, { _id: false });

const ReportSchema = new Schema<IReport>({
  userId: { type: String, required: true },
  searchQuery: { type: String, required: true },
  report: { type: ReportContentSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReport>('Report', ReportSchema);
