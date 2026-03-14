import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const NewsStory = sequelize.define('NewsStory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  newsUrl: DataTypes.STRING,
  imageUrl: DataTypes.STRING,
 source: DataTypes.STRING,
  topic: DataTypes.STRING,
  publishedAt: DataTypes.DATE
}, {
  timestamps: true,
  tableName: 'news_stories'
});

export default NewsStory;
