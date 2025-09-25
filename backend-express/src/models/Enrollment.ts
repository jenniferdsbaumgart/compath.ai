import mongoose, { Schema, Document } from 'mongoose';
import { ICourse } from './Course';

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId | ICourse;
  enrolledAt: Date;
}

const EnrollmentSchema: Schema<IEnrollment> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now() },
});

// Configure toJSON
EnrollmentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.courseId && typeof ret.courseId === 'object') {
      ret.courseId.id = ret.courseId._id?.toString();
      delete ret.courseId._id;
      delete ret.courseId.__v;
    }
    return ret;
  },
});

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);