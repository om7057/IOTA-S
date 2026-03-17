import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Lesson Model
 * Represents a lesson within a unit
 * Lessons are the individual learning modules within units
 */
export const Lesson = sequelize.define(
  'Lesson',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    unitId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'units',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Order of lesson within unit',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
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
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [10, 5000],
          msg: 'Content must be between 10 and 5000 characters',
        },
      },
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
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated time to complete lesson in minutes',
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    learningObjectives: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of learning objectives for this lesson',
    },
    resources: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of additional resources (links, documents, etc.)',
    },
    challengeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'lessons',
    timestamps: true,
    indexes: [
      { fields: ['unitId', 'sequence'] },
    ],
  }
);

export default Lesson;
