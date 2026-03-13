import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },

  // Age and user type for children vs teenager experience
  age: { type: Number, min: 8, max: 19 },
  userType: { type: String, enum: ['child', 'teenager'], default: 'child' }, // child (8-12) or teenager (13-19)

  unlockedLevels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoryLevel' }],
  completedLevels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoryLevel' }],
  completedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
  currentStars: { type: Number, default: 0 }
});

export const User = mongoose.model('User', userSchema); 