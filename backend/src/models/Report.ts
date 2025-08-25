// models/Report.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyPlayer {
  name: string;
  marketShare: string;
}

export interface ICustomerSegment {
  name: string;
  percentage: number;
}

export interface IReportContent {
  marketSize: string;
  growthRate: string;
  competitionLevel: string;
  entryBarriers: string;

  targetAudience: string[];

  keyPlayers: IKeyPlayer[];

  opportunities: string[];
  challenges: string[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];

  customerSegments?: ICustomerSegment[];
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

const CustomerSegmentSchema = new Schema<ICustomerSegment>({
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
}, { _id: false });

const ReportContentSchema = new Schema<IReportContent>({
  marketSize: { type: String, required: true },
  growthRate: { type: String, required: true },
  competitionLevel: { type: String, required: true },
  entryBarriers: { type: String, required: true },

  targetAudience: { type: [String], required: true, default: [] },

  keyPlayers: { type: [KeyPlayerSchema], required: true, default: [] },

  opportunities: { type: [String], required: true, default: [] },
  challenges: { type: [String], required: true, default: [] },
  recommendations: { type: [String], required: true, default: [] },
  strengths: { type: [String], required: true, default: [] },
  weaknesses: { type: [String], required: true, default: [] },

  customerSegments: { type: [CustomerSegmentSchema], required: false, default: [] },
}, { _id: false });

const ReportSchema = new Schema<IReport>({
  userId: { type: String, required: true },
  searchQuery: { type: String, required: true },
  report: { type: ReportContentSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
