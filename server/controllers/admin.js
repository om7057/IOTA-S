import { Story, Unit, Lesson, Challenge, User } from '../models/index.js';

/**
 * story management endpoints
 */

// Create story
export const createStory = async (req, res) => {
  try {
    const { title, description, category, ageGroup, difficulty, coverImage, thumbEmoji } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required',
      });
    }

    const story = await Story.create({
      title,
      description,
      category,
      ageGroup: ageGroup || [],
      difficulty: difficulty || 'beginner',
      coverImage,
      thumbEmoji,
    });

    res.status(201).json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error('CreateStory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create story',
    });
  }
};

// Update story
export const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, ageGroup, difficulty, coverImage, thumbEmoji, isPublished } = req.body;

    const story = await Story.findByPk(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    if (title) story.title = title;
    if (description) story.description = description;
    if (category) story.category = category;
    if (ageGroup) story.ageGroup = ageGroup;
    if (difficulty) story.difficulty = difficulty;
    if (coverImage) story.coverImage = coverImage;
    if (thumbEmoji) story.thumbEmoji = thumbEmoji;
    if (typeof isPublished !== 'undefined') story.isPublished = isPublished;

    await story.save();

    res.json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error('UpdateStory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update story',
    });
  }
};

// Delete story
export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findByPk(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    await story.destroy();

    res.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    console.error('DeleteStory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete story',
    });
  }
};

/**
 * Unit management endpoints
 */

// Add unit to story
export const addUnitToStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { title, description, sequence, focusEmotion, pointsValue } = req.body;

    const story = await Story.findByPk(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    const unit = await Unit.create({
      storyId,
      title,
      description,
      sequence: sequence || 1,
      focusEmotion,
      pointsValue: pointsValue || 10,
    });

    res.status(201).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error('AddUnitToStory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add unit',
    });
  }
};

// Update unit
export const updateUnit = async (req, res) => {
  try {
    const { storyId, unitId } = req.params;
    const { title, description, sequence, focusEmotion, pointsValue } = req.body;

    const unit = await Unit.findByPk(unitId);
    if (!unit || unit.storyId !== storyId) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found',
      });
    }

    if (title) unit.title = title;
    if (description) unit.description = description;
    if (typeof sequence !== 'undefined') unit.sequence = sequence;
    if (focusEmotion) unit.focusEmotion = focusEmotion;
    if (pointsValue) unit.pointsValue = pointsValue;

    await unit.save();

    res.json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error('UpdateUnit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update unit',
    });
  }
};

// Delete unit
export const deleteUnit = async (req, res) => {
  try {
    const { storyId, unitId } = req.params;

    const unit = await Unit.findByPk(unitId);
    if (!unit || unit.storyId !== storyId) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found',
      });
    }

    await unit.destroy();

    res.json({
      success: true,
      message: 'Unit deleted successfully',
    });
  } catch (error) {
    console.error('DeleteUnit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete unit',
    });
  }
};

/**
 * Lesson management endpoints
 */

// Add lesson to unit
export const addLessonToUnit = async (req, res) => {
  try {
    const { storyId, unitId } = req.params;
    const { title, description, sequence, content, learningObjectives, emotionalObjectives, pointsValue } = req.body;

    const unit = await Unit.findByPk(unitId);
    if (!unit || unit.storyId !== storyId) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found',
      });
    }

    const lesson = await Lesson.create({
      unitId,
      title,
      description,
      sequence: sequence || 1,
      content,
      learningObjectives: learningObjectives || [],
      emotionalObjectives: emotionalObjectives || [],
      pointsValue: pointsValue || 10,
    });

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('AddLessonToUnit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add lesson',
    });
  }
};

// Update lesson
export const updateLesson = async (req, res) => {
  try {
    const { storyId, unitId, lessonId } = req.params;
    const { title, description, sequence, content, learningObjectives, emotionalObjectives, pointsValue } = req.body;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
    }

    const unit = await Unit.findByPk(unitId);
    if (!unit || unit.storyId !== storyId || lesson.unitId !== unitId) {
      return res.status(404).json({
        success: false,
        error: 'Invalid path',
      });
    }

    if (title) lesson.title = title;
    if (description) lesson.description = description;
    if (typeof sequence !== 'undefined') lesson.sequence = sequence;
    if (content) lesson.content = content;
    if (learningObjectives) lesson.learningObjectives = learningObjectives;
    if (emotionalObjectives) lesson.emotionalObjectives = emotionalObjectives;
    if (pointsValue) lesson.pointsValue = pointsValue;

    await lesson.save();

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('UpdateLesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lesson',
    });
  }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
  try {
    const { storyId, unitId, lessonId } = req.params;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
    }

    const unit = await Unit.findByPk(unitId);
    if (!unit || unit.storyId !== storyId || lesson.unitId !== unitId) {
      return res.status(404).json({
        success: false,
        error: 'Invalid path',
      });
    }

    await lesson.destroy();

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    console.error('DeleteLesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lesson',
    });
  }
};

/**
 * Challenge management endpoints
 */

// Add challenge to lesson
export const addChallengeToLesson = async (req, res) => {
  try {
    const { storyId, unitId, lessonId } = req.params;
    const { title, description, sequence, instructions, expectedResponses, emotionalComponents, pointsValue } = req.body;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
    }

    const unit = await Unit.findByPk(unitId);
    if (!unit || unit.storyId !== storyId || lesson.unitId !== unitId) {
      return res.status(404).json({
        success: false,
        error: 'Invalid path',
      });
    }

    const challenge = await Challenge.create({
      lessonId,
      title,
      description,
      sequence: sequence || 1,
      instructions,
      expectedResponses: expectedResponses || [],
      emotionalComponents: emotionalComponents || [],
      pointsValue: pointsValue || 10,
    });

    res.status(201).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error('AddChallengeToLesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add challenge',
    });
  }
};

// Update challenge
export const updateChallenge = async (req, res) => {
  try {
    const { storyId, unitId, lessonId, challengeId } = req.params;
    const { title, description, sequence, instructions, expectedResponses, emotionalComponents, pointsValue } = req.body;

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found',
      });
    }

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
    }

    const unit = await Unit.findByPk(unitId);
    if (!unit || unit.storyId !== storyId || lesson.unitId !== unitId || challenge.lessonId !== lessonId) {
      return res.status(404).json({
        success: false,
        error: 'Invalid path',
      });
    }

    if (title) challenge.title = title;
    if (description) challenge.description = description;
    if (typeof sequence !== 'undefined') challenge.sequence = sequence;
    if (instructions) challenge.instructions = instructions;
    if (expectedResponses) challenge.expectedResponses = expectedResponses;
    if (emotionalComponents) challenge.emotionalComponents = emotionalComponents;
    if (pointsValue) challenge.pointsValue = pointsValue;

    await challenge.save();

    res.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error('UpdateChallenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update challenge',
    });
  }
};

// Delete challenge
export const deleteChallenge = async (req, res) => {
  try {
    const { storyId, unitId, lessonId, challengeId } = req.params;

    const challenge = await Challenge.findByPk(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found',
      });
    }

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found',
      });
    }

    const unit = await Unit.findByPk(unitId);
    if (!unit || unit.storyId !== storyId || lesson.unitId !== unitId || challenge.lessonId !== lessonId) {
      return res.status(404).json({
        success: false,
        error: 'Invalid path',
      });
    }

    await challenge.destroy();

    res.json({
      success: true,
      message: 'Challenge deleted successfully',
    });
  } catch (error) {
    console.error('DeleteChallenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete challenge',
    });
  }
};

export default {
  createStory,
  updateStory,
  deleteStory,
  addUnitToStory,
  updateUnit,
  deleteUnit,
  addLessonToUnit,
  updateLesson,
  deleteLesson,
  addChallengeToLesson,
  updateChallenge,
  deleteChallenge,
};
