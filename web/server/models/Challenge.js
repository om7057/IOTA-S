import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const Challenge = sequelize.define('Challenge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('SELECT', 'ASSIST'),
    defaultValue: 'SELECT',
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'challenges'
});

export default Challenge;
