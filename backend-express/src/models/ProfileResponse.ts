import mongoose from 'mongoose';

const profileResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: String, required: true },
  response: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ProfileResponse', profileResponseSchema);