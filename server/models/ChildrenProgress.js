import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ChildrenProgress = sequelize.define(
  'ChildrenProgress',
  {
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
      onDelete: 'CASCADE',
    },
    activeCourseId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'children_courses',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    hearts: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: 'Lives/hearts - lose 1 for wrong answer',
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total points earned',
    },
    completedLessons: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of completed lesson IDs',
    },
    completedChallenges: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of completed challenge IDs',
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'children_progress',
    timestamps: true,
    paranoid: true,
  }
);

export default ChildrenProgress;
