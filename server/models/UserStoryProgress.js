import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * UserStoryProgress Model
 * Tracks user's progress through stories, units, lessons, challenges
 */
export const UserStoryProgress = sequelize.define(
  'UserStoryProgress',
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
    unitId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'units',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    challengeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'challenges',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('not-started', 'in-progress', 'completed'),
      allowNull: false,
      defaultValue: 'not-started',
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional progress data (answers, notes, etc.)',
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
    tableName: 'user_story_progresses',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'storyId'] },
      { fields: ['userId', 'status'] },
      { fields: ['completedAt'] },
    ],
  }
);

export default UserStoryProgress;
