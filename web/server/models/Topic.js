import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

export const Topic = mongoose.model('Topic', topicSchema);
