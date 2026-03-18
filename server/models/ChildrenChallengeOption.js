import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const ChildrenChallengeOption = sequelize.define(
  'ChildrenChallengeOption',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Option text',
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Is this the correct answer?',
    },
    imageSrc: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Option image (optional)',
    },
    audioSrc: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Option audio (optional)',
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Feedback shown after selection',
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    nextChallengeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'children_challenges',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Next story node to branch to (for interactive stories)',
    },
  },
  {
    tableName: 'children_challenge_options',
    timestamps: true,
    paranoid: true,
  }
);

export default ChildrenChallengeOption;
