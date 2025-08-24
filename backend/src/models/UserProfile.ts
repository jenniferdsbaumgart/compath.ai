import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    education: [String],
    areas: [String],
    investment: Number,
    time: Number,
    hobbies: [String],
    audience: [String],
  },
  { timestamps: true }
);

export default mongoose.model('UserProfile', UserProfileSchema);
