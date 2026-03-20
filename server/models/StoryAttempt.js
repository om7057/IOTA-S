import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * StoryAttempt Model
 * Tracks each time a child attempts a story quiz/question
 * Stores answer, emotion at that moment, and AI recommendations
 * Used for parent dashboard analytics and personalized learning
 */
export const StoryAttempt = sequelize.define(
  'StoryAttempt',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    storyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stories',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    topicId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'topics',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    questionIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: 'Which question number in the story (0-indexed)',
    },
    userAnswer: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The answer the child provided',
    },
    correctAnswer: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The correct/expected answer',
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      index: true,
      comment: 'Whether the answer was correct',
    },
    scenarioContext: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Story context like which branches/choices were taken',
    },
    emotionDetected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Emotion detected from facial emotion detector at moment of answer',
    },
    emotionConfidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Confidence must be between 0 and 1' },
        max: { args: [1], msg: 'Confidence must be between 0 and 1' },
      },
      comment: 'Confidence score of emotion detection (0-1)',
    },
    emotionIntensity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [1], msg: 'Intensity must be between 1 and 10' },
        max: { args: [10], msg: 'Intensity must be between 1 and 10' },
      },
      comment: 'User-reported or detected emotion intensity (1-10)',
    },
    aiRecommendation: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Gemini recommendation response - topics to focus on, learning path suggestions',
    },
    weaknessTopics: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      comment: 'Array of topic IDs identified as areas needing more practice',
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
      comment: 'Time spent on this question in seconds',
    },
    attemptsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
      },
      comment: 'How many times child attempted this specific question',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional admin/parent notes about the attempt',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      index: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'story_attempts',
    timestamps: true,
    paranoid: false,
  }
);

export default StoryAttempt;
