import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const TeenTopic = sequelize.define('TeenTopic', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('mental-health', 'peer-support', 'safety', 'relationships', 'school', 'general'),
    defaultValue: 'general'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'teen_topics'
});

export default TeenTopic;
