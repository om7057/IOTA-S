import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

/**
 * QuizQuestion Model
 * Individual questions within a quiz
 */
export const QuizQuestion = sequelize.define(
  'QuizQuestion',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quizId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Order of question within quiz',
    },
    type: {
      type: DataTypes.ENUM('multiple-choice', 'true-false', 'short-answer', 'matching', 'fill-blank'),
      allowNull: false,
      defaultValue: 'multiple-choice',
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The question text',
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of options for multiple-choice/true-false/matching',
    },
    correctAnswer: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'The correct answer(s)',
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Explanation shown after answer',
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 100,
      },
    },
    hints: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
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
    tableName: 'QuizQuestions',
    timestamps: true,
    indexes: [
      { fields: ['quizId', 'sequence'] },
    ],
  }
);

export default QuizQuestion;
