import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Course', courseSchema);