import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Post = sequelize.define('Post', {
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
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'groups',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Anonymous posting - hides user identity but tracks for moderation
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Display name if anonymous (auto-generated like "Teen#1234")
  anonymousName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Media attachments (URLs)
  media: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  // Category/tags
  category: {
    type: DataTypes.ENUM(
      'advice',
      'story',
      'question',
      'achievement',
      'resource',
      'news',
      'other'
    ),
    defaultValue: 'other',
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
  commentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shareCount: {
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
  tableName: 'posts',
  timestamps: true,
});

export default Post;
