import {
  ChildrenCourse,
  ChildrenUnit,
  ChildrenLesson,
  ChildrenChallenge,
  ChildrenChallengeOption,
  ChildrenProgress,
  ChildrenChallengeProgress,
  NewsStory,
  ParentalAccount,
} from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { logger } from '../utils/logger.js';
import { getMongoDb, isMongoPrimaryEnabled } from '../config/mongo.js';

const maybeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sortByOrder = (items) => items.sort((a, b) => maybeNumber(a.order, 0) - maybeNumber(b.order, 0));

const hydrateCourseTree = async (db, course) => {
  const units = await db
    .collection('children_units')
    .find({ courseId: course.id, deletedAt: null })
    .project({ _id: 0 })
    .toArray();

  const unitIds = units.map((unit) => unit.id);
  const lessons = unitIds.length
    ? await db
        .collection('children_lessons')
        .find({ unitId: { $in: unitIds }, deletedAt: null })
        .project({ _id: 0 })
        .toArray()
    : [];

  const lessonIds = lessons.map((lesson) => lesson.id);
  const challenges = lessonIds.length
    ? await db
        .collection('children_challenges')
        .find({ lessonId: { $in: lessonIds }, deletedAt: null })
        .project({ _id: 0 })
        .toArray()
    : [];

  const challengeIds = challenges.map((challenge) => challenge.id);
  const options = challengeIds.length
    ? await db
        .collection('children_challenge_options')
        .find({ challengeId: { $in: challengeIds }, deletedAt: null })
        .project({ _id: 0 })
        .toArray()
    : [];

  const optionsByChallengeId = new Map();
  for (const option of options) {
    const bucket = optionsByChallengeId.get(option.challengeId) || [];
    bucket.push(option);
    optionsByChallengeId.set(option.challengeId, bucket);
  }

  const challengesByLessonId = new Map();
  for (const challenge of challenges) {
    challenge.options = sortByOrder(optionsByChallengeId.get(challenge.id) || []);
    const bucket = challengesByLessonId.get(challenge.lessonId) || [];
    bucket.push(challenge);
    challengesByLessonId.set(challenge.lessonId, bucket);
  }

  const lessonsByUnitId = new Map();
  for (const lesson of lessons) {
    lesson.challenges = sortByOrder(challengesByLessonId.get(lesson.id) || []);
    const bucket = lessonsByUnitId.get(lesson.unitId) || [];
    bucket.push(lesson);
    lessonsByUnitId.set(lesson.unitId, bucket);
  }

  for (const unit of units) {
    unit.lessons = sortByOrder(lessonsByUnitId.get(unit.id) || []);
  }

  course.units = sortByOrder(units);
  return course;
};

// ==================== COURSE MANAGEMENT ====================

export const getAllCourses = async (req, res) => {
  try {
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const courses = await db
        .collection('children_courses')
        .find({ isPublished: true, deletedAt: null })
        .project({ _id: 0 })
        .sort({ order: 1 })
        .toArray();

      const courseIds = courses.map((course) => course.id);
      const units = courseIds.length
        ? await db
            .collection('children_units')
            .find({ courseId: { $in: courseIds }, deletedAt: null })
            .project({ _id: 0, id: 1, title: 1, order: 1, courseId: 1 })
            .toArray()
        : [];

      const unitsByCourseId = new Map();
      for (const unit of units) {
        const bucket = unitsByCourseId.get(unit.courseId) || [];
        bucket.push(unit);
        unitsByCourseId.set(unit.courseId, bucket);
      }

      for (const course of courses) {
        course.units = sortByOrder(unitsByCourseId.get(course.id) || []);
      }

      return res.json({ success: true, data: courses });
    }

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
    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const courses = await db
        .collection('children_courses')
        .find({ isPublished: true, deletedAt: null })
        .project({ _id: 0 })
        .sort({ order: 1 })
        .toArray();

      const courseIds = courses.map((course) => course.id);
      const units = courseIds.length
        ? await db
            .collection('children_units')
            .find({ courseId: { $in: courseIds }, deletedAt: null })
            .project({ _id: 0, id: 1, title: 1, order: 1, courseId: 1 })
            .toArray()
        : [];

      const unitsByCourseId = new Map();
      for (const unit of units) {
        const bucket = unitsByCourseId.get(unit.courseId) || [];
        bucket.push(unit);
        unitsByCourseId.set(unit.courseId, bucket);
      }

      for (const course of courses) {
        course.units = sortByOrder(unitsByCourseId.get(course.id) || []);
      }

      const newsStories = await db
        .collection('news_stories')
        .find({ isPublished: true, deletedAt: null })
        .project({ _id: 0 })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();

      return res.json({
        success: true,
        data: {
          courses,
          latestStories: newsStories,
        },
      });
    }

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const course = await db
        .collection('children_courses')
        .findOne({ id: courseId, deletedAt: null }, { projection: { _id: 0 } });

      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const hydratedCourse = await hydrateCourseTree(db, course);
      return res.json({ success: true, data: hydratedCourse });
    }

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const courses = await db
        .collection('children_courses')
        .find({ category, isPublished: true, deletedAt: null })
        .project({ _id: 0 })
        .sort({ order: 1 })
        .toArray();

      const courseIds = courses.map((course) => course.id);
      const units = courseIds.length
        ? await db
            .collection('children_units')
            .find({ courseId: { $in: courseIds }, deletedAt: null })
            .project({ _id: 0, id: 1, title: 1, order: 1, courseId: 1 })
            .toArray()
        : [];

      const unitsByCourseId = new Map();
      for (const unit of units) {
        const bucket = unitsByCourseId.get(unit.courseId) || [];
        bucket.push(unit);
        unitsByCourseId.set(unit.courseId, bucket);
      }

      for (const course of courses) {
        course.units = sortByOrder(unitsByCourseId.get(course.id) || []);
      }

      return res.json({ success: true, data: courses });
    }

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const lastCourse = await db
        .collection('children_courses')
        .find({})
        .sort({ order: -1 })
        .limit(1)
        .project({ _id: 0, order: 1 })
        .toArray();

      const course = {
        id: uuidv4(),
        title,
        description,
        imageSrc,
        icon,
        ageGroup,
        category,
        difficulty,
        isPublished: false,
        order: maybeNumber(lastCourse[0]?.order, 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      await db.collection('children_courses').insertOne(course);
      return res.status(201).json({ success: true, data: course });
    }

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const lesson = await db
        .collection('children_lessons')
        .findOne({ id: lessonId, deletedAt: null }, { projection: { _id: 0 } });

      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      const challenges = await db
        .collection('children_challenges')
        .find({ lessonId: lesson.id, deletedAt: null })
        .project({ _id: 0 })
        .sort({ order: 1 })
        .toArray();

      const challengeIds = challenges.map((challenge) => challenge.id);
      const options = challengeIds.length
        ? await db
            .collection('children_challenge_options')
            .find({ challengeId: { $in: challengeIds }, deletedAt: null })
            .project({ _id: 0 })
            .toArray()
        : [];

      const optionsByChallengeId = new Map();
      for (const option of options) {
        const bucket = optionsByChallengeId.get(option.challengeId) || [];
        bucket.push(option);
        optionsByChallengeId.set(option.challengeId, bucket);
      }

      for (const challenge of challenges) {
        challenge.options = sortByOrder(optionsByChallengeId.get(challenge.id) || []);
      }

      lesson.challenges = challenges;
      return res.json({ success: true, data: lesson });
    }

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      const challenges = await db
        .collection('children_challenges')
        .find({ lessonId, isPublished: true, deletedAt: null })
        .project({ _id: 0, id: 1, order: 1 })
        .sort({ order: 1 })
        .toArray();

      const challengeIds = challenges.map((challenge) => challenge.id);

      const completedProgress = challengeIds.length
        ? await db
            .collection('children_challenge_progress')
            .find({ userId, challengeId: { $in: challengeIds }, completed: true })
            .project({ _id: 0, challengeId: 1 })
            .toArray()
        : [];

      const completedChallengeIds = completedProgress.map((progress) => progress.challengeId);
      const completedSet = new Set(completedChallengeIds);
      const resumeIndex = challenges.findIndex((challenge) => !completedSet.has(challenge.id));

      let progress = await db.collection('children_progress').findOne({ userId }, { projection: { _id: 0 } });
      if (!progress) {
        progress = {
          id: uuidv4(),
          userId,
          hearts: 5,
          points: 0,
          totalPoints: 0,
          activeCourseId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        await db.collection('children_progress').insertOne(progress);
      }

      return res.json({
        success: true,
        data: {
          hearts: progress.hearts,
          completedChallengeIds,
          resumeIndex: resumeIndex === -1 ? 0 : resumeIndex,
          allCompleted: challengeIds.length > 0 && completedChallengeIds.length === challengeIds.length,
        },
      });
    }

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();

      const challenge = await db
        .collection('children_challenges')
        .findOne({ id: challengeId, deletedAt: null }, { projection: { _id: 0 } });

      if (!challenge) {
        return res.status(404).json({ success: false, message: 'Challenge not found' });
      }

      const options = await db
        .collection('children_challenge_options')
        .find({ challengeId, deletedAt: null })
        .project({ _id: 0 })
        .toArray();

      const selectedOption = options.find((option) => String(option.id) === String(selectedOptionId));
      if (!selectedOption) {
        return res.status(400).json({ success: false, message: 'Invalid option' });
      }

      let progress = await db
        .collection('children_challenge_progress')
        .findOne({ userId, challengeId }, { projection: { _id: 0 } });

      if (!progress) {
        progress = {
          id: uuidv4(),
          userId,
          challengeId,
          attempts: 0,
          completed: false,
          correct: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.collection('children_challenge_progress').insertOne(progress);
      }

      const nextAttempts = maybeNumber(progress.attempts, 0) + 1;
      const correctness = Boolean(selectedOption.correct);

      await db.collection('children_challenge_progress').updateOne(
        { id: progress.id },
        {
          $set: {
            attempts: nextAttempts,
            completed: correctness,
            correct: correctness,
            updatedAt: new Date(),
          },
        }
      );

      let alertTriggered = false;
      if (!correctness && nextAttempts === 3) {
        const parentLinks = await db
          .collection('parental_accounts')
          .find({ childUserId: userId, isActive: true, allowNotifications: true })
          .project({ _id: 0 })
          .toArray();

        const alert = {
          id: `parent_alert_${Date.now()}`,
          type: 'repeated_wrong_attempts',
          challengeId: challenge.id,
          challengeQuestion: challenge.question,
          attempts: nextAttempts,
          createdAt: new Date().toISOString(),
        };

        for (const link of parentLinks) {
          const metadata = link.metadata || {};
          const alerts = Array.isArray(metadata.alerts) ? metadata.alerts : [];
          const nextAlerts = [alert, ...alerts].slice(0, 50);

          await db.collection('parental_accounts').updateOne(
            { id: link.id },
            { $set: { metadata: { ...metadata, alerts: nextAlerts }, updatedAt: new Date() } }
          );

          if (global.notificationService) {
            global.notificationService.notifyUser(link.parentUserId, {
              type: 'child_learning_alert',
              title: 'Child learning support alert',
              message: 'Your child may need help with a challenge after multiple attempts.',
              action: `parental:child:${userId}`,
              childUserId: userId,
              challengeId: challenge.id,
            });
          }
        }

        alertTriggered = parentLinks.length > 0;
      }

      return res.json({
        success: true,
        data: {
          correct: correctness,
          feedback: selectedOption.feedback,
          message: correctness ? '✅ Correct!' : '❌ Try again',
          attempts: nextAttempts,
          alertTriggered,
        },
      });
    }

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

    let alertTriggered = false;

    // When a child repeatedly gets the same challenge wrong, notify linked parents.
    if (!selectedOption.correct && progress.attempts === 3) {
      const parentLinks = await ParentalAccount.findAll({
        where: {
          childUserId: userId,
          isActive: true,
          allowNotifications: true,
        },
      });

      const alert = {
        id: `parent_alert_${Date.now()}`,
        type: 'repeated_wrong_attempts',
        challengeId: challenge.id,
        challengeQuestion: challenge.question,
        attempts: progress.attempts,
        createdAt: new Date().toISOString(),
      };

      for (const link of parentLinks) {
        const metadata = link.metadata || {};
        const alerts = Array.isArray(metadata.alerts) ? metadata.alerts : [];
        const nextAlerts = [alert, ...alerts].slice(0, 50);

        await link.update({
          metadata: {
            ...metadata,
            alerts: nextAlerts,
          },
        });

        if (global.notificationService) {
          global.notificationService.notifyUser(link.parentUserId, {
            type: 'child_learning_alert',
            title: 'Child learning support alert',
            message: 'Your child may need help with a challenge after multiple attempts.',
            action: `parental:child:${userId}`,
            childUserId: userId,
            challengeId: challenge.id,
          });
        }
      }

      alertTriggered = parentLinks.length > 0;
    }

    res.json({
      success: true,
      data: {
        correct: selectedOption.correct,
        feedback: selectedOption.feedback,
        message: selectedOption.correct ? '✅ Correct!' : '❌ Try again',
        attempts: progress.attempts,
        alertTriggered,
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      let progress = await db.collection('children_progress').findOne({ userId }, { projection: { _id: 0 } });

      if (!progress) {
        progress = {
          id: uuidv4(),
          userId,
          hearts: 5,
          points: 0,
          totalPoints: 0,
          activeCourseId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        await db.collection('children_progress').insertOne(progress);
      }

      if (progress.activeCourseId) {
        const activeCourse = await db
          .collection('children_courses')
          .findOne({ id: progress.activeCourseId, deletedAt: null }, { projection: { _id: 0 } });
        progress.activeCourse = activeCourse || null;
      } else {
        progress.activeCourse = null;
      }

      return res.json({ success: true, data: progress });
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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      let progress = await db.collection('children_progress').findOne({ userId }, { projection: { _id: 0 } });

      if (!progress) {
        progress = {
          id: uuidv4(),
          userId,
          hearts: 5,
          points: 0,
          totalPoints: 0,
          activeCourseId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        await db.collection('children_progress').insertOne(progress);
      }

      await db.collection('children_progress').updateOne(
        { id: progress.id },
        { $set: { activeCourseId: courseId, hearts: 5, updatedAt: new Date() } }
      );

      const updated = await db.collection('children_progress').findOne({ id: progress.id }, { projection: { _id: 0 } });
      return res.json({ success: true, data: updated });
    }

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      let progress = await db.collection('children_progress').findOne({ userId }, { projection: { _id: 0 } });
      if (!progress) {
        progress = {
          id: crypto.randomUUID(),
          userId,
          hearts: 5,
          points: 0,
          totalPoints: 0,
          activeCourseId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        await db.collection('children_progress').insertOne(progress);
      }

      const nextHearts = Math.max(0, maybeNumber(progress.hearts, 5) + maybeNumber(amount, 0));
      await db.collection('children_progress').updateOne(
        { id: progress.id },
        { $set: { hearts: nextHearts, updatedAt: new Date() } }
      );

      return res.json({
        success: true,
        data: { hearts: nextHearts },
      });
    }

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

    if (isMongoPrimaryEnabled()) {
      const db = getMongoDb();
      let progress = await db.collection('children_progress').findOne({ userId }, { projection: { _id: 0 } });
      if (!progress) {
        progress = {
          id: crypto.randomUUID(),
          userId,
          hearts: 5,
          points: 0,
          totalPoints: 0,
          activeCourseId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        await db.collection('children_progress').insertOne(progress);
      }

      const nextPoints = maybeNumber(progress.points, 0) + maybeNumber(points, 0);
      const nextTotalPoints = maybeNumber(progress.totalPoints, 0) + maybeNumber(points, 0);

      await db.collection('children_progress').updateOne(
        { id: progress.id },
        { $set: { points: nextPoints, totalPoints: nextTotalPoints, updatedAt: new Date() } }
      );

      return res.json({
        success: true,
        data: { points: nextPoints, totalPoints: nextTotalPoints },
      });
    }

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
