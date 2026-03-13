import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  to: {
    type: Number,
    required: true
  }
});

const sceneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  options: [optionSchema]
});

const newsStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoryLevel',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  scenes: [sceneSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('NewsStory', newsStorySchema);