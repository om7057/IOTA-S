import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },

  unlockedLevels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoryLevel' }],
  completedLevels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoryLevel' }],
  completedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }], // ✅ NEW
  currentStars: { type: Number, default: 0 }
});

export const User = mongoose.model('User', userSchema); 