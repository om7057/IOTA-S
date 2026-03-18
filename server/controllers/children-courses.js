import {
  ChildrenCourse,
  ChildrenUnit,
  ChildrenLesson,
  ChildrenChallenge,
  ChildrenChallengeOption,
  ChildrenProgress,
  ChildrenChallengeProgress,
  NewsStory,
} from '../models/index.js';
import { Op } from 'sequelize';
import { logger } from '../utils/logger.js';

// ==================== COURSE MANAGEMENT ====================

export const getAllCourses = async (req, res) => {
  try {
    const courses = await ChildrenCourse.findAll({
      where: { isPublished: true },
      include: [
        {
          model: ChildrenUnit,
          as: 'units',
          attributes: ['id', 'title', 'order'],
        },
      ],
      order: [['order', 'ASC']],
    });

    res.json({ success: true, data: courses });
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Error fetching courses', error: error.message });
  }
};

// Get dashboard data with courses and latest news stories
export const getDashboardData = async (req, res) => {
  try {
    const courses = await ChildrenCourse.findAll({
      where: { isPublished: true },
      include: [
        {
          model: ChildrenUnit,
          as: 'units',
          attributes: ['id', 'title', 'order'],
        },
      ],
      order: [['order', 'ASC']],
    });

    const newsStories = await NewsStory.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
      limit: 6,
    });

    res.json({ 
      success: true, 
      data: {
        courses,
        latestStories: newsStories,
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard data', error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await ChildrenCourse.findByPk(courseId, {
      include: [
        {
          model: ChildrenUnit,
          as: 'units',
          include: [
            {
              model: ChildrenLesson,
              as: 'lessons',
              include: [
                {
                  model: ChildrenChallenge,
                  as: 'challenges',
                  include: [
                    {
                      model: ChildrenChallengeOption,
                      as: 'options',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    logger.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Error fetching course', error: error.message });
  }
};

export const getCoursesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const courses = await ChildrenCourse.findAll({
      where: { category, isPublished: true },
      include: [
        {
          model: ChildrenUnit,
          as: 'units',
          attributes: ['id', 'title', 'order'],
        },
      ],
      order: [['order', 'ASC']],
    });

    res.json({ success: true, data: courses });
  } catch (error) {
    logger.error('Error fetching courses by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, description, imageSrc, icon, ageGroup, category, difficulty } = req.body;

    const course = await ChildrenCourse.create({
      title,
      description,
      imageSrc,
      icon,
      ageGroup,
      category,
      difficulty,
      isPublished: false,
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Error creating course', error: error.message });
  }
};

// ==================== LESSON MANAGEMENT ====================

export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await ChildrenLesson.findByPk(lessonId, {
      include: [
        {
          model: ChildrenChallenge,
          as: 'challenges',
          include: [
            {
              model: ChildrenChallengeOption,
              as: 'options',
            },
          ],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.json({ success: true, data: lesson });
  } catch (error) {
    logger.error('Error fetching lesson:', error);
    res.status(500).json({ success: false, message: 'Error fetching lesson', error: error.message });
  }
};

export const getLessonProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { lessonId } = req.params;

    const challenges = await ChildrenChallenge.findAll({
      where: { lessonId, isPublished: true },
      attributes: ['id', 'order'],
      order: [['order', 'ASC']],
    });

    const challengeIds = challenges.map((c) => c.id);

    const completedProgress = challengeIds.length
      ? await ChildrenChallengeProgress.findAll({
          where: {
            userId,
            challengeId: { [Op.in]: challengeIds },
            completed: true,
          },
          attributes: ['challengeId'],
        })
      : [];

    const completedChallengeIds = completedProgress.map((p) => p.challengeId);
    const completedSet = new Set(completedChallengeIds);

    const resumeIndex = challenges.findIndex((challenge) => !completedSet.has(challenge.id));

    let progress = await ChildrenProgress.findOne({ where: { userId } });
    if (!progress) {
      progress = await ChildrenProgress.create({ userId, hearts: 5, points: 0 });
    }

    res.json({
      success: true,
      data: {
        hearts: progress.hearts,
        completedChallengeIds,
        resumeIndex: resumeIndex === -1 ? 0 : resumeIndex,
        allCompleted: challengeIds.length > 0 && completedChallengeIds.length === challengeIds.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lesson progress',
      error: error.message,
    });
  }
};

// ==================== CHALLENGE ATTEMPT ====================

export const submitChallenge = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { challengeId, selectedOptionId } = req.body;

    // Get challenge with options
    const challenge = await ChildrenChallenge.findByPk(challengeId, {
      include: [
        {
          model: ChildrenChallengeOption,
          as: 'options',
        },
      ],
    });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Find the selected option
    const selectedOption = challenge.options.find((opt) => opt.id === selectedOptionId);
    if (!selectedOption) {
      return res.status(400).json({ success: false, message: 'Invalid option' });
    }

    // Get or create challenge progress
    let progress = await ChildrenChallengeProgress.findOne({
      where: { userId, challengeId },
    });

    if (!progress) {
      progress = await ChildrenChallengeProgress.create({
        userId,
        challengeId,
        attempts: 0,
        completed: false,
      });
    }

    // Update progress
    progress.attempts = (progress.attempts || 0) + 1;
    progress.completed = selectedOption.correct;
    progress.correct = selectedOption.correct;
    await progress.save();

    res.json({
      success: true,
      data: {
        correct: selectedOption.correct,
        feedback: selectedOption.feedback,
        message: selectedOption.correct ? '✅ Correct!' : '❌ Try again',
        attempts: progress.attempts,
      },
    });
  } catch (error) {
    logger.error('Error submitting challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting challenge',
      error: error.message,
    });
  }
};

// ==================== PROGRESS TRACKING ====================

export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let progress = await ChildrenProgress.findOne({
      where: { userId },
      include: [
        {
          model: ChildrenCourse,
          as: 'activeCourse',
        },
      ],
    });

    if (!progress) {
      // Create default progress if doesn't exist
      progress = await ChildrenProgress.create({
        userId,
        hearts: 5,
        points: 0,
      });
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    logger.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message,
    });
  }
};

export const setActiveCourse = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { courseId } = req.body;

    let progress = await ChildrenProgress.findOne({ where: { userId } });
    if (!progress) {
      progress = await ChildrenProgress.create({ userId });
    }

    progress.activeCourseId = courseId;
    progress.hearts = 5; // Reset hearts when starting new course
    await progress.save();

    res.json({ success: true, data: progress });
  } catch (error) {
    logger.error('Error setting active course:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting active course',
      error: error.message,
    });
  }
};

export const updateHearts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { amount } = req.body; // Negative to lose hearts

    let progress = await ChildrenProgress.findOne({ where: { userId } });
    if (!progress) {
      progress = await ChildrenProgress.create({ userId });
    }

    progress.hearts = Math.max(0, progress.hearts + amount);
    await progress.save();

    res.json({
      success: true,
      data: { hearts: progress.hearts },
    });
  } catch (error) {
    logger.error('Error updating hearts:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating hearts',
      error: error.message,
    });
  }
};

export const addPoints = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { points } = req.body;

    let progress = await ChildrenProgress.findOne({ where: { userId } });
    if (!progress) {
      progress = await ChildrenProgress.create({ userId });
    }

    progress.points = (progress.points || 0) + points;
    progress.totalPoints = (progress.totalPoints || 0) + points;
    await progress.save();

    res.json({
      success: true,
      data: { points: progress.points, totalPoints: progress.totalPoints },
    });
  } catch (error) {
    logger.error('Error adding points:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding points',
      error: error.message,
    });
  }
};
