import express from 'express';
import {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic
} from '../controllers/topicController.js';

const router = express.Router();

router.post('/', createTopic);
router.get('/', getAllTopics);
router.get('/:id', getTopicById);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

export default router;
