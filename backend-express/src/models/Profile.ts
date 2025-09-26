import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['Social', 'Analítico', 'Criativo', 'Comunicador', 'Técnico'] },
  niches: [{
    profile: String,
    niche: String,
    description: String,
    potential: String,
    investmentRange: String,
    timeCommitment: String,
    actionButton: String,
  }],
});

export default mongoose.model('Profile', profileSchema);