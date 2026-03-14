import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const ChallengeProgress = sequelize.define('ChallengeProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  challengeId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  selectedOptionId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  timestamps: true,
  tableName: 'challenge_progress'
});

export default ChallengeProgress;
