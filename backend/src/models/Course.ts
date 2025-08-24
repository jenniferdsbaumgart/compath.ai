import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  coinCost?: number;
  duration?: string;
  category?: string;
  createdAt: Date;
}

const CourseSchema: Schema<ICourse> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coinCost: { type: Number, default: 0 },
  duration: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Configure toJSON
CourseSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<ICourse>('Course', CourseSchema);