import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

/**
 * Unit Model
 * Represents a unit within a story
 * Stories are divided into Units, each containing multiple Lessons
 */
export const Unit = sequelize.define(
  'Unit',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    storyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'stories',
        key: 'id',
      },
      onDelete: 'CASCADE',
      index: true,
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Order of unit within story',
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
      comment: 'Estimated time to complete unit in minutes',
    },
    lessonCount: {
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
    tableName: 'units',
    timestamps: true,
    indexes: [
      { fields: ['storyId', 'sequence'] },
    ],
  }
);

export default Unit;
