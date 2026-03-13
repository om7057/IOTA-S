import { Topic } from '../models/Topic.js';

export const createTopic = async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
