import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const TeenDiscussion = sequelize.define('TeenDiscussion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  topicId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'teen_discussions'
});

export default TeenDiscussion;
