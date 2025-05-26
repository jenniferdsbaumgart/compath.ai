import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  result: { type: String }, // Pode ser JSON no futuro
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Search', searchSchema);
