import mongoose from 'mongoose';

const storyLevelSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  starsRequiredToUnlock: { type: Number, default: 0 },
  imageUrl: { type: String }
}, { timestamps: true });

storyLevelSchema.index({ levelNumber: 1, topic: 1 }, { unique: true });

export const StoryLevel = mongoose.model('StoryLevel', storyLevelSchema);
