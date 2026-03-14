import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const Leaderboard = sequelize.define('Leaderboard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rank: DataTypes.INTEGER,
  badges: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'leaderboards'
});

export default Leaderboard;
