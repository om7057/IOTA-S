import { StoryLevel } from '../models/StoryLevel.js';

export const createLevel = async (req, res) => {
  try {
    const level = await StoryLevel.create(req.body);
    res.status(201).json(level);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllLevels = async (req, res) => {
  try {
    const levels = await StoryLevel.find().populate('topic');
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLevelById = async (req, res) => {
  try {
    const level = await StoryLevel.findById(req.params.id).populate('topic');
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json(level);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLevel = async (req, res) => {
  try {
    const level = await StoryLevel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(level);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLevel = async (req, res) => {
  try {
    await StoryLevel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Level deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLevelsByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;
    const levels = await StoryLevel.find({ topic: topicId }).populate('topic');
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching levels by topic', error: error.message });
  }
};
