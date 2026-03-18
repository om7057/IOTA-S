import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ChildrenCourse = sequelize.define(
  'ChildrenCourse',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Course title (e.g., "Understanding Your Body")',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Course overview',
    },
    imageSrc: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Course cover image',
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '📚',
    },
    ageGroup: {
      type: DataTypes.ENUM('8-10', '11-13', '14-16', '17-19'),
      allowNull: false,
      defaultValue: '11-13',
      comment: 'Target age group',
    },
    category: {
      type: DataTypes.ENUM('puberty', 'periods', 'body-safety', 'boundaries', 'emotions', 'relationships', 'hygiene', 'general'),
      allowNull: false,
      defaultValue: 'general',
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner',
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'children_courses',
    timestamps: true,
    paranoid: true,
  }
);

export default ChildrenCourse;
