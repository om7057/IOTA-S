import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const TeenGroup = sequelize.define('TeenGroup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('support', 'interest', 'activity', 'skill-share'),
    defaultValue: 'support'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  memberCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'teen_groups'
});

export default TeenGroup;
