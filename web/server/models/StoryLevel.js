import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const StoryLevel = sequelize.define('StoryLevel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  chapter: DataTypes.INTEGER,
  title: DataTypes.STRING,
  description: DataTypes.TEXT
}, {
  timestamps: true,
  tableName: 'story_levels'
});

export default StoryLevel;
