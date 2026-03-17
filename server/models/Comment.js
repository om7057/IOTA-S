import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  // Parent comment for nested replies
  parentCommentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Anonymous commenting
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  anonymousName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Track sentiment
  sentiment: {
    type: DataTypes.ENUM('positive', 'neutral', 'negative'),
    defaultValue: 'neutral',
  },
  // Engagement metrics
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Content moderation
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isReported: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reportReasons: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
},
{
  tableName: 'comments',
  timestamps: true,
});

export default Comment;
