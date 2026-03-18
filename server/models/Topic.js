import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Topic Model
 * Represents content categories/topics for organizing stories
 * Similar to SPD_Emergency_26 implementation
 */
const Topic = sequelize.define(
  'Topic',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'Title must be between 3 and 100 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('learning', 'wellbeing', 'safety', 'emotions', 'news', 'general'),
      defaultValue: 'general',
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Emoji or icon for topic',
    },
    storyCount: {
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
    paranoid: true,
    timestamps: true,
  }
);

export default Topic;
