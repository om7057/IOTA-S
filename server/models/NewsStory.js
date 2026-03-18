import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * NewsStory Model
 * Stores stories generated from news articles using AI
 * Integrates with news fetcher service
 */
const NewsStory = sequelize.define(
  'NewsStory',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Full story content',
    },
    category: {
      type: DataTypes.ENUM('health', 'safety', 'education', 'discovery', 'general'),
      defaultValue: 'general',
    },
    topicId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Topics',
        key: 'id',
      },
      onDelete: 'SET NULL',
      index: true,
    },
    sourceArticleUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Original news article URL',
    },
    sourceArticleTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    storyJson: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'AI-generated story scenes and choices',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPublished: {
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
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'news_stories',
    paranoid: true,
    timestamps: true,
  }
);

export default NewsStory;
