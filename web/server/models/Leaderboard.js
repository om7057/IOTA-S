import mongoose from 'mongoose';

const LeaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'StoryLevel', required: true },
  score: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);
