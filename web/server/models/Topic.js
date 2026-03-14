import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const Topic = sequelize.define('Topic', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  description: DataTypes.TEXT,
  imageUrl: DataTypes.STRING
}, {
  timestamps: true,
  tableName: 'topics'
});

export default Topic;
