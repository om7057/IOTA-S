import express from 'express';
import {
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
  getLevelsByTopicId
} from '../controllers/levelController.js';

const router = express.Router();

router.post('/', createLevel);
router.get('/', getAllLevels);
router.get('/:id', getLevelById);
router.put('/:id', updateLevel);
router.delete('/:id', deleteLevel);
router.get('/topic/:topicId', getLevelsByTopicId); 


export default router;
