
import { QuizProgress } from '../models/QuizProgress.js';

export const saveQuizProgress = async (req, res) => {
  try {
    const { userId, story, score, totalQuestions, topic, level, answers } = req.body;

    const progress = new QuizProgress({
      user: userId,
      story,
      score,
      totalQuestions,
      topic,
      level,
      answers,
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getUserQuizProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const progressEntries = await QuizProgress.find({ user: userId })
      .populate('story')
      .populate('topic')
      .populate('level');

    // Extract unique stories and levels
    const completedStories = [
      ...new Set(progressEntries.map(p => p.story?._id?.toString()).filter(Boolean))
    ];
    const completedLevels = [
      ...new Set(progressEntries.map(p => p.level?._id?.toString()).filter(Boolean))
    ];

    const totalStars = progressEntries.reduce((sum, p) => sum + (p.score || 0), 0);

    res.json({
      currentStars: totalStars,
      completedStories,
      completedLevels
    });
  } catch (err) {
    console.error("❌ Error in getUserQuizProgress:", err);
    res.status(500).json({ error: err.message });
  }
};

