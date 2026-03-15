import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING, // URL to badge icon/image
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('challenge', 'quiz', 'mood', 'journal', 'streak', 'social', 'exploration'),
    defaultValue: 'challenge',
  },
  requirement: {
    type: DataTypes.JSONB, // Stores criteria for earning badge
    allowNull: false,
    comment: 'E.g., { type: "quiz_score", value: 80, count: 5 }',
  },
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
    defaultValue: 'common',
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Points awarded when badge is earned',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  },
}, {
  tableName: 'badges',
  timestamps: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['rarity'] },
  ],
});

export default Badge;
