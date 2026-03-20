import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Story Model
 * Represents educational/therapeutic stories with hierarchical structure
 * Stories contain Units, which contain Lessons, which contain Challenges
 * Automatically sanitizes content to remove emoji/special characters
 */
export const Story = sequelize.define(
  'Story',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [3, 200],
          msg: 'Title must be between 3 and 200 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Description must be less than 1000 characters',
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Core narrative content of the story',
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Cover image must be a valid URL',
        },
      },
    },
    category: {
      type: DataTypes.ENUM('anxiety', 'depression', 'social', 'academic', 'family', 'health', 'identity', 'general'),
      allowNull: false,
      defaultValue: 'general',
      validate: {
        isIn: {
          args: [['anxiety', 'depression', 'social', 'academic', 'family', 'health', 'identity', 'general']],
          msg: 'Category must be one of: anxiety, depression, social, academic, family, health, identity, general',
        },
      },
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
      comment: 'Reference to Topic for organizing stories',
    },
    targetAgeMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 5,
        max: 19,
      },
    },
    targetAgeMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 5,
        max: 19,
      },
    },
    difficultyLevel: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'beginner',
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated time to complete in minutes',
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completionCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional metadata (author, source, keywords, etc.)',
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
    tableName: 'stories',
    timestamps: true,
    indexes: [
      { fields: ['category'] },
      { fields: ['isPublished'] },
      { fields: ['difficultyLevel'] },
      { fields: ['title'] },
    ],
  }
);

export default Story;
