import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  description: DataTypes.TEXT,
  levelId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  topicId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  scenes: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'stories'
});

export default Story;
