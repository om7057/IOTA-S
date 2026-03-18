import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ChildrenLesson = sequelize.define(
  'ChildrenLesson',
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
        model: 'children_units',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Lesson title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Lesson educational content/story',
    },
    imageSrc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: '📝',
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: 'Lesson duration in minutes',
      defaultValue: 5,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'children_lessons',
    timestamps: true,
    paranoid: true,
  }
);

export default ChildrenLesson;
