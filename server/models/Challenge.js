import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

/**
 * Challenge Model
 * Represents a challenge/activity/exercise within a lesson
 * Used for interactive learning and assessment
 */
export const Challenge = sequelize.define(
  'Challenge',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Order of challenge within lesson',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: {
          args: [3, 200],
          msg: 'Title must be between 3 and 200 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('multiple-choice', 'text', 'reflection', 'activity', 'quiz', 'matching', 'true-false', 'short-answer'),
      allowNull: false,
      defaultValue: 'reflection',
      validate: {
        isIn: {
          args: [['multiple-choice', 'text', 'reflection', 'activity', 'quiz', 'matching', 'true-false', 'short-answer']],
          msg: 'Type must be one of: multiple-choice, text, reflection, activity, quiz, matching, true-false, short-answer',
        },
      },
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The challenge prompt or question',
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of options (for multiple-choice, matching, etc.)',
    },
    correctAnswer: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Correct answer(s) for validation',
    },
    feedback: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Feedback for correct and incorrect answers',
    },
    hints: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of optional hints for the challenge',
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated time to complete in minutes',
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 1,
        max: 100,
      },
    },
    isOptional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'Challenges',
    timestamps: true,
    indexes: [
      { fields: ['lessonId', 'sequence'] },
      { fields: ['type'] },
    ],
  }
);

export default Challenge;
