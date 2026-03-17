import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  badgeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'badges', key: 'id' },
    onDelete: 'CASCADE',
  },
  unlockedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When the achievement was earned',
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Current progress towards unlocking (0-100)',
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional data like completion details, context',
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
  tableName: 'user_achievements',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['badgeId'] },
    { fields: ['userId', 'badgeId'], unique: true }, // Prevent duplicate achievements
    { fields: ['isCompleted'] },
    { fields: ['unlockedAt'] },
  ],
});

export default UserAchievement;
