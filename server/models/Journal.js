import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Journal Model
 * Stores user journal entries for self-reflection and emotional expression
 * Supports both free-form writing and guided prompts
 */
export const Journal = sequelize.define(
  'Journal',
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'Title must be less than 200 characters',
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [1, 5000],
          msg: 'Content must be between 1 and 5000 characters',
        },
      },
    },
    emotion: {
      type: DataTypes.ENUM('happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed']],
          msg: 'Emotion must be one of: happy, sad, angry, anxious, calm, excited, neutral, confused, motivated, stressed',
        },
      },
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of tags for categorizing journal entry (e.g., ["reflection", "gratitude", "goals"])',
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'The journal prompt (if any) that guided this entry',
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this journal entry is private or can be shared',
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of attachment objects (e.g., images, audio)',
    },
    entryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      index: true,
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
    tableName: 'journals',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'entryDate'] },
      { fields: ['emotion'] },
      { fields: ['isPrivate'] },
    ],
  }
);

export default Journal;
