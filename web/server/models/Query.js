import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const Query = sequelize.define('Query', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('general', 'health', 'relationships', 'school', 'other'),
    defaultValue: 'general'
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  helpful: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});
