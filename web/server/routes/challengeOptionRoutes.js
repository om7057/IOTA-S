import express from 'express';
import { ChallengeOption } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create a challenge option (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { challengeId, text, correct, imageSrc, audioSrc, order } = req.body;
    
    const option = await ChallengeOption.create({
      challengeId,
      text,
      correct: correct || false,
      imageSrc: imageSrc || null,
      audioSrc: audioSrc || null
    });
    
    res.status(201).json(option);
  } catch (error) {
    console.error('Error creating challenge option:', error);
    res.status(500).json({ message: 'Error creating option' });
  }
});

// Update a challenge option (admin only)
router.patch('/:optionId', verifyToken, async (req, res) => {
  try {
    const { optionId } = req.params;
    const { text, correct, imageSrc, audioSrc } = req.body;
    
    const option = await ChallengeOption.findByPk(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }
    
    await option.update({ text, correct, imageSrc, audioSrc });
    res.json(option);
  } catch (error) {
    console.error('Error updating option:', error);
    res.status(500).json({ message: 'Error updating option' });
  }
});

// Delete a challenge option (admin only)
router.delete('/:optionId', verifyToken, async (req, res) => {
  try {
    const { optionId } = req.params;
    const option = await ChallengeOption.findByPk(optionId);
    
    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }
    
    await option.destroy();
    res.json({ message: 'Option deleted successfully' });
  } catch (error) {
    console.error('Error deleting option:', error);
    res.status(500).json({ message: 'Error deleting option' });
  }
});

export default router;
