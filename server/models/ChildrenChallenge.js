import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ChildrenChallenge = sequelize.define(
  'ChildrenChallenge',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lessonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'children_lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM('SELECT', 'ASSIST', 'MATCHING', 'TRUE_FALSE'),
      allowNull: false,
      defaultValue: 'SELECT',
      comment: 'Question type',
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Quiz question text',
    },
    hint: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageSrc: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Optional image for the question',
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'easy',
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isStoryNode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Is this an interactive story choice node?',
    },
    storyContextImage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Story narrative/context displayed above choices',
    },
  },
  {
    tableName: 'children_challenges',
    timestamps: true,
    paranoid: true,
  }
);

export default ChildrenChallenge;
