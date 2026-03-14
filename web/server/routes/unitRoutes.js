import express from 'express';
import { Unit, Lesson } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all units for a topic
router.get('/topic/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const units = await Unit.findAll({
      where: { topicId },
      order: [['order', 'ASC']]
    });
    res.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Error fetching units' });
  }
});

// Get a specific unit with its lessons
router.get('/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const unit = await Unit.findByPk(unitId, {
      include: [{
        model: Lesson,
        order: [['order', 'ASC']]
      }]
    });
    
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    res.json(unit);
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({ message: 'Error fetching unit' });
  }
});

// Create a unit (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, topicId, order } = req.body;
    
    const unit = await Unit.create({
      title,
      description,
      topicId,
      order: order || 0
    });
    
    res.status(201).json(unit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Error creating unit' });
  }
});

// Update a unit (admin only)
router.patch('/:unitId', verifyToken, async (req, res) => {
  try {
    const { unitId } = req.params;
    const { title, description, order } = req.body;
    
    const unit = await Unit.findByPk(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    await unit.update({ title, description, order });
    res.json(unit);
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Error updating unit' });
  }
});

export default router;
