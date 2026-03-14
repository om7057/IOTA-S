import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const TeenJournal = sequelize.define('TeenJournal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mood: {
    type: DataTypes.ENUM('very-sad', 'sad', 'neutral', 'happy', 'very-happy'),
    allowNull: true
  },
  emotionTags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  suggestedGroupId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'teen_journals'
});

export default TeenJournal;
