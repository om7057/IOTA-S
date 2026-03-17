import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Leaderboard Model
 * Tracks user rankings and top performers
 */
export const Leaderboard = sequelize.define(
  'Leaderboard',
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
      unique: 'leaderboard_user_period',
    },
    period: {
      type: DataTypes.ENUM('all-time', 'monthly', 'weekly'),
      allowNull: false,
      defaultValue: 'all-time',
      unique: 'leaderboard_user_period',
      comment: 'Leaderboard period',
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quizzesCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    storiesCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    journalCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    moodLogsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Day streak of activity',
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    periodStartAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'leaderboards',
    timestamps: true,
    indexes: [
      { fields: ['period', 'rank'] },
      { fields: ['totalPoints'] },
      { fields: ['userId', 'period'] },
    ],
  }
);

export default Leaderboard;
