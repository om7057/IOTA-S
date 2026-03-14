import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const ChallengeOption = sequelize.define('ChallengeOption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  challengeId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  correct: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  imageSrc: DataTypes.STRING,
  audioSrc: DataTypes.STRING
}, {
  timestamps: true,
  tableName: 'challenge_options'
});

export default ChallengeOption;
