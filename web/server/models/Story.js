import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  to: { type: Number, required: true }  
}, { _id: false });

const sceneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  options: { type: [optionSchema], required: true }
}, { _id: false });

const storySchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'StoryLevel', required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  scenes: { type: [sceneSchema], required: true }
}, { timestamps: true });

export const Story = mongoose.model('Story', storySchema);