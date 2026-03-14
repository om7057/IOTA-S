import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

export const Journal = sequelize.define('Journal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  title: DataTypes.STRING,
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mood: DataTypes.STRING,
  moodIntensity: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  timestamps: true,
  tableName: 'journal_entries'
});

export default Journal;
