import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ChildrenChallengeProgress = sequelize.define(
  'ChildrenChallengeProgress',
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
    challengeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'children_challenges',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'True if answered correctly',
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of attempts',
    },
  },
  {
    tableName: 'children_challenge_progress',
    timestamps: true,
    paranoid: false,
  }
);

export default ChildrenChallengeProgress;
