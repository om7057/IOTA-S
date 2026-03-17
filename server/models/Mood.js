import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Mood Model
 * Stores user mood logs with emotion tracking and context
 * Used to monitor emotional patterns and provide analytics
 */
export const Mood = sequelize.define(
  'Mood',
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
    emotion: {
      type: DataTypes.ENUM('happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'neutral', 'confused', 'motivated', 'stressed']],
          msg: 'Emotion must be one of: happy, sad, angry, anxious, calm, excited, neutral, confused, motivated, stressed',
        },
      },
    },
    intensity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Intensity must be between 1 and 10',
        },
        max: {
          args: [10],
          msg: 'Intensity must be between 1 and 10',
        },
      },
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User-provided context about their mood (e.g., "Stressed about homework")',
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of tags for categorizing mood (e.g., ["school", "social", "family"])',
    },
    physicalState: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Optional physical state info (e.g., {"sleepQuality": "good", "hunger": "none", "energy": "high"})',
    },
    loggedAt: {
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
    tableName: 'moods',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'loggedAt'] },
      { fields: ['emotion'] },
      { fields: ['intensity'] },
    ],
  }
);

export default Mood;
