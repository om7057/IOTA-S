import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

const Thread = sequelize.define('Thread', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Groups',
      key: 'id',
    },
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Thread status
  status: {
    type: DataTypes.ENUM('open', 'closed', 'archived'),
    defaultValue: 'open',
  },
  // Pin thread to top
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Mark as resolved (for Q&A style threads)
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Category classification
  category: {
    type: DataTypes.ENUM(
      'discussion',
      'question',
      'announcement',
      'resource',
      'event',
      'other'
    ),
    defaultValue: 'discussion',
  },
  // Tags for searching
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  // Engagement metrics
  replyCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Last activity tracking
  lastActivityAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Thread;
