import { Story } from '../models/Story.js';
import { StoryLevel } from '../models/StoryLevel.js';

export const createStory = async (req, res) => {
  try {
    const { title, level, topic, scenes, description } = req.body;

    if (!title || !level || !topic || !Array.isArray(scenes)) {
      return res.status(400).json({ error: 'Missing required fields or scenes not an array' });
    }

    const levelDoc = await StoryLevel.findById(level);
    if (!levelDoc) return res.status(400).json({ error: 'Invalid level ID' });

    const story = await Story.create({
      title,
      description,
      level,
      topic,
      scenes
    });

    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().populate('level').populate('topic');
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('level').populate('topic');
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
