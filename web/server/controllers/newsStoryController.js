import NewsStory from "../models/NewsStory.js";
import mongoose from 'mongoose';


export const getAllNewsStories = async (req, res) => {
  try {
    const stories = await NewsStory.find()
      .populate('topic', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(stories);
  } catch (error) {
    console.error('Error fetching news stories:', error);
    res.status(500).json({ error: 'Failed to fetch news stories' });
  }
};

export const getNewsStoryById = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn('[WARN] Invalid Mongo ObjectId:', id);
      return res.status(400).json({ error: 'Invalid story ID format' });
    }
  
    try {
      console.log('[INFO] Fetching story with ID:', id);
  
      const story = await NewsStory.findById(id)
        .populate('topic', 'name')
        .populate('level', 'name');
  
      if (!story) {
        console.warn('[WARN] Story not found for ID:', id);
        return res.status(404).json({ error: 'News story not found' });
      }
  
      res.status(200).json(story);
    } catch (error) {
      console.error('[ERROR] Failed to fetch story by ID:', id);
      console.error(error);
      res.status(500).json({ error: 'Internal server error while fetching story' });
    }
  };
  
export const createNewsStory = async (req, res) => {
  try {
   const { title, description, level, topic, scenes } = req.body;
    
    if (!title || !description || !level || !topic || !scenes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newStory = new NewsStory({
      title,
      description,
      level,
      topic,
      scenes
    });
    
    const savedStory = await newStory.save();
    
    res.status(201).json(savedStory);
  } catch (error) {
    console.error('Error creating news story:', error);
    res.status(500).json({ error: 'Failed to create news story' });
  }
};

export const updateNewsStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedStory = await NewsStory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedStory) {
      return res.status(404).json({ error: 'News story not found' });
    }
    
    res.status(200).json(updatedStory);
  } catch (error) {
    console.error('Error updating news story:', error);
    res.status(500).json({ error: 'Failed to update news story' });
  }
};

export const deleteNewsStory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedStory = await NewsStory.findByIdAndDelete(id);
    
    if (!deletedStory) {
      return res.status(404).json({ error: 'News story not found' });
    }
    
    res.status(200).json({ message: 'News story deleted successfully' });
  } catch (error) {
    console.error('Error deleting news story:', error);
    res.status(500).json({ error: 'Failed to delete news story' });
  }
};