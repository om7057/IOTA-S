import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ThreadReply = sequelize.define('ThreadReply', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  threadId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'threads',
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
  // Parent reply for nested threads
  parentReplyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'thread_replies',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Anonymous posting
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  anonymousName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Media attachments
  media: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  // Mark as best/helpful answer
  isMarked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  markedAs: {
    type: DataTypes.ENUM('best_answer', 'helpful', 'off_topic'),
    allowNull: true,
  },
  // Track sentiment
  sentiment: {
    type: DataTypes.ENUM('positive', 'neutral', 'negative'),
    defaultValue: 'neutral',
  },
  // Engagement
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
  tableName: 'thread_replies',
  timestamps: true,
});

export default ThreadReply;
