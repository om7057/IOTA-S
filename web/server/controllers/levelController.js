import { StoryLevel } from '../models/index.js';

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
    const levels = await StoryLevel.findAll({
      order: [['chapter', 'ASC']]
    });
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLevelById = async (req, res) => {
  try {
    const level = await StoryLevel.findByPk(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json(level);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLevel = async (req, res) => {
  try {
    const level = await StoryLevel.findByPk(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    await level.update(req.body);
    res.json(level);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLevel = async (req, res) => {
  try {
    const level = await StoryLevel.findByPk(req.params.id);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    await level.destroy();
    res.json({ message: 'Level deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLevelsByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;
    const levels = await StoryLevel.findAll({
      where: { topicId },
      order: [['chapter', 'ASC']]
    });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching levels by topic', error: error.message });
  }
};
